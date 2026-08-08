// src/app/admin/streetbeat/page.tsx
// Two sources merged into one view:
//   1. Live Stripe — real-time source of truth for anything sold through
//      the current checkout (see note below on the account-switch caveat)
//   2. legacy_purchases (Turso, shared with MCS's database) — everything
//      Stripe's live search can no longer see: the imported Squarespace-era
//      purchases, plus anything from before Streetbeat switched to its own
//      dedicated Stripe account (that old data still lives in the OLD
//      account, invisible to a search against the new one's key)
// Protected by src/middleware.ts (admin session cookie).

import Stripe from "stripe"
import { getDB, initDB } from "@/lib/db"

// Streetbeat sells through its own dedicated Stripe account, separate from
// MCS's. Live sales since that account split are invisible to a search
// against MCS's key — this MUST use STREETBEAT_STRIPE_SECRET_KEY. Falls
// back to the old MCS key (with a visible warning banner) so the page
// doesn't hard-crash if the new env var hasn't been set yet.
const usingFallbackKey = !process.env.STREETBEAT_STRIPE_SECRET_KEY

function getStripe() {
  const key = process.env.STREETBEAT_STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY!
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" })
}

export const dynamic = 'force-dynamic'

interface Sale {
  id: string
  email: string | null
  amount: number
  date: string
  source: "stripe" | "legacy"
}

async function getStripeSales(): Promise<Sale[]> {
  const stripe = getStripe()
  // Note: fetches the 100 most recent Checkout Sessions on the account and
  // filters by metadata client-side — Stripe's list API doesn't support
  // server-side metadata filtering. Fine at this volume; if Streetbeat sales
  // ever exceed 100 between MCS bookings/merch activity, this needs real
  // pagination (walk `has_more` with `starting_after`).
  const sessions = await stripe.checkout.sessions.list({ limit: 100 })

  return sessions.data
    .filter(s =>
      s.payment_status === "paid" &&
      (s.metadata?.source === "streetbeat-purchase" || s.success_url?.includes("streetbeat.video"))
    )
    .map(s => ({
      id:     s.id,
      email:  s.customer_details?.email ?? s.customer_email ?? null,
      amount: s.amount_total ?? 0,
      date:   new Date(s.created * 1000).toISOString(),
      source: "stripe" as const,
    }))
}

async function getLegacySales(): Promise<Sale[]> {
  await initDB()
  const result = await getDB().execute(
    `SELECT order_ref, email, amount_cents, purchased_at FROM legacy_purchases ORDER BY purchased_at DESC`
  )
  return result.rows.map(r => ({
    id:     `legacy-${r.order_ref}`,
    email:  r.email as string,
    amount: Number(r.amount_cents ?? 0),
    date:   new Date(r.purchased_at as string).toISOString(),
    source: "legacy" as const,
  }))
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export default async function AdminStreetbeatPage() {
  const [stripeSales, legacySales] = await Promise.all([getStripeSales(), getLegacySales()])

  // Dedupe: a legacy row whose order_ref happens to be a real Stripe session
  // ID already present in the live results (e.g. a purchase manually
  // recovered into legacy_purchases after an account switch, but still
  // findable live via MCS's own separate key) would otherwise double-count
  // the same real purchase. Prefer the live result, which has more complete
  // data straight from Stripe.
  const liveIds = new Set(stripeSales.map(s => s.id))
  const dedupedLegacy = legacySales.filter(s => !liveIds.has(s.id.replace(/^legacy-/, "")))

  const sales = [...stripeSales, ...dedupedLegacy].sort((a, b) => b.date.localeCompare(a.date))
  const total = sales.reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="min-h-screen bg-studio-black pt-20 px-6 pb-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] tracking-widest uppercase text-gold/60 mb-1">Admin</p>
        <h1 className="font-display text-4xl text-cream mb-2">Street Beat Sales</h1>
        <p className="text-mist/50 text-sm mb-10">
          Live Stripe + imported/legacy purchases combined. {sales.length} sale{sales.length === 1 ? "" : "s"} · {fmt(total)} total
        </p>

        {usingFallbackKey && (
          <div className="mb-8 border border-red-500/40 bg-red-500/10 rounded-sm px-4 py-3">
            <p className="text-red-400 text-xs leading-relaxed">
              <strong className="font-medium">STREETBEAT_STRIPE_SECRET_KEY is not set.</strong>{" "}
              Falling back to MCS&apos;s Stripe key — live Streetbeat sales made through Streetbeat&apos;s
              own dedicated Stripe account will NOT show up below. Set the env var in Vercel and redeploy.
            </p>
          </div>
        )}

        {sales.length === 0 ? (
          <p className="text-mist/40 text-sm">No Street Beat purchases yet.</p>
        ) : (
          <div className="space-y-2">
            {sales.map(s => (
              <div
                key={s.id}
                className="border border-studio-border rounded-sm bg-studio-charcoal px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-mist/60 text-[11px] whitespace-nowrap">
                      {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-sm border shrink-0 ${
                      s.source === "stripe" ? "border-green-500/30 text-green-400" : "border-mist/30 text-mist/60"
                    }`}>
                      {s.source === "stripe" ? "Live" : "Legacy"}
                    </span>
                  </div>
                  <p className="text-cream text-sm truncate">{s.email ?? "—"}</p>
                </div>
                <p className="text-gold text-sm font-medium shrink-0">{fmt(s.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
