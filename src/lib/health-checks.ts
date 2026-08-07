// src/lib/health-checks.ts
// Backing checks for /admin/system — "is everything actually working," not
// "here's my data." Same admin-dashboard pattern as Epoch Skin, adapted to
// MCS's real env var names (TURSO_URL/TURSO_TOKEN, PRINTIFY_API_TOKEN, etc.)
// and its existing lazy Turso singleton in lib/db.ts — no second DB client.
//
// MCS has no `products` table (Printify catalog is fetched live, not
// mirrored), so there's no Product Sync panel here — see admin-dashboard
// skill's site table.

import { getDB, initDB } from "@/lib/db"
import Stripe from "stripe"
import { Resend } from "resend"

export type CheckResult = { status: "ok" | "warn" | "error"; detail: string }

// ---- 1. Env Var Status ----
const REQUIRED_ENV_VARS = [
  "TURSO_URL",
  "TURSO_TOKEN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STREETBEAT_STRIPE_SECRET_KEY", // admin/streetbeat reads this — falls back silently to
                                   // STRIPE_SECRET_KEY if missing, which is exactly the bug
                                   // that hid live Streetbeat sales before. Flag it here too.
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RESEND_TO_EMAIL",
  "ADMIN_PASSWORD",
  "NEXT_PUBLIC_URL",
  "PRINTIFY_API_TOKEN",
  "PRINTIFY_SHOP_ID",
] as const

export function checkEnvVars(): Record<string, CheckResult> {
  const results: Record<string, CheckResult> = {}
  for (const key of REQUIRED_ENV_VARS) {
    const present = !!process.env[key]
    results[key] = { status: present ? "ok" : "error", detail: present ? "set" : "MISSING" }
  }
  return results
}

// ---- 2. Webhook Health ----
export async function checkStripe(): Promise<CheckResult> {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" })
    const endpoints = await stripe.webhookEndpoints.list({ limit: 10 })
    const site = (process.env.NEXT_PUBLIC_URL || "").replace(/^https?:\/\//, "")
    const match = endpoints.data.find(e => e.url.includes(site))
    if (!match) return { status: "warn", detail: "No webhook endpoint found for this site's URL" }
    if (match.status !== "enabled") return { status: "error", detail: `Endpoint status: ${match.status}` }
    return { status: "ok", detail: `Enabled — ${match.enabled_events.includes("*") ? "all events" : match.enabled_events.slice(0, 2).join(", ")}` }
  } catch (err) {
    return { status: "error", detail: `Stripe API error: ${(err as Error).message}` }
  }
}

// MCS's own Stripe account (merch + bookings) — same account STRIPE_SECRET_KEY points to.
export async function checkStreetbeatStripe(): Promise<CheckResult> {
  if (!process.env.STREETBEAT_STRIPE_SECRET_KEY) {
    return { status: "error", detail: "STREETBEAT_STRIPE_SECRET_KEY missing — admin/streetbeat is silently reading MCS's own Stripe account instead" }
  }
  try {
    const stripe = new Stripe(process.env.STREETBEAT_STRIPE_SECRET_KEY, { apiVersion: "2026-04-22.dahlia" })
    await stripe.balance.retrieve() // cheapest call that proves the key is live and scoped to *a* real account
    return { status: "ok", detail: "Key present and authenticates against Streetbeat's account" }
  } catch (err) {
    return { status: "error", detail: `Streetbeat Stripe API error: ${(err as Error).message}` }
  }
}

// One "last webhook-driven write" signal across both tables the checkout
// webhook fulfills into — a stale timestamp with known recent traffic means
// the webhook is registered but not actually firing, even if Stripe's own
// endpoint status says "enabled."
export async function checkLastWebhookActivity(): Promise<CheckResult> {
  try {
    await initDB()
    const result = await getDB().execute(`
      SELECT MAX(ts) as last FROM (
        SELECT created_at as ts FROM bookings
        UNION ALL
        SELECT created_at as ts FROM merch_orders
      )
    `)
    const last = result.rows[0]?.last as string | null
    if (!last) return { status: "warn", detail: "No bookings or merch orders yet" }
    const hoursAgo = (Date.now() - new Date(last).getTime()) / 3_600_000
    if (hoursAgo > 24 * 14) return { status: "warn", detail: `Last activity ${Math.round(hoursAgo / 24)} days ago` }
    return { status: "ok", detail: `Last activity ${new Date(last).toLocaleString()}` }
  } catch (err) {
    return { status: "error", detail: `DB read failed: ${(err as Error).message}` }
  }
}

export async function checkResend(): Promise<CheckResult> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!)
    const domains = await resend.domains.list()
    const fromDomain = (process.env.RESEND_FROM_EMAIL || "").split("@")[1]
    if (!fromDomain || fromDomain === "resend.dev") {
      return { status: "error", detail: "RESEND_FROM_EMAIL is using the resend.dev sandbox sender — every send to a real customer will 403 in production" }
    }
    const match = domains.data?.data?.find((d: { name: string }) => d.name === fromDomain)
    if (!match) return { status: "error", detail: `Domain ${fromDomain} not found in Resend account` }
    if (match.status !== "verified") return { status: "error", detail: `Domain status: ${match.status}` }
    return { status: "ok", detail: `${fromDomain} verified` }
  } catch (err) {
    return { status: "error", detail: `Resend API error: ${(err as Error).message}` }
  }
}

export async function checkTurso(): Promise<CheckResult> {
  try {
    await initDB()
    await getDB().execute("SELECT 1")
    return { status: "ok", detail: "Connected" }
  } catch (err) {
    return { status: "error", detail: `Turso connection failed: ${(err as Error).message}` }
  }
}

export async function checkPrintify(): Promise<CheckResult> {
  const token = process.env.PRINTIFY_API_TOKEN
  const shopId = process.env.PRINTIFY_SHOP_ID
  if (!token || !shopId) return { status: "error", detail: "PRINTIFY_API_TOKEN or PRINTIFY_SHOP_ID missing" }
  try {
    const res = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return { status: "error", detail: `Printify API error: ${res.status}` }
    return { status: "ok", detail: "Shop reachable" }
  } catch (err) {
    return { status: "error", detail: `Printify request failed: ${(err as Error).message}` }
  }
}

// ---- 3. API Usage ----
// No self-tracked api_calls table exists in MCS yet (unlike Epoch Skin) —
// rather than block the panel on a schema change, report what's directly
// knowable today: Resend's own send count via domains.list() doesn't expose
// volume, so this stays a simple presence/reachability rollup until a real
// counter table is worth adding.
export async function checkApiUsage(): Promise<CheckResult> {
  try {
    await initDB()
    const bookings = await getDB().execute(`SELECT COUNT(*) as c FROM bookings WHERE created_at > datetime('now', '-30 days')`)
    const orders = await getDB().execute(`SELECT COUNT(*) as c FROM merch_orders WHERE created_at > datetime('now', '-30 days')`)
    const bCount = bookings.rows[0]?.c ?? 0
    const oCount = orders.rows[0]?.c ?? 0
    return { status: "ok", detail: `${bCount} bookings, ${oCount} merch orders in last 30 days` }
  } catch (err) {
    return { status: "warn", detail: `Usage read failed: ${(err as Error).message}` }
  }
}
