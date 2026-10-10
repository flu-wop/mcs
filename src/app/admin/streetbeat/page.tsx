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
import { AdminPage, AdminPageHeader, Card, CardTitle, Notice, Stat, money, num } from "@/components/admin/ui"
import { BarList } from "@/components/admin/charts"

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
  ).catch(err => { console.error("[admin/streetbeat] legacy_purchases:", err); return { rows: [] as never[] } })
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
  let stripeSales: Sale[] = []
  let stripeError: string | null = null
  try { stripeSales = await getStripeSales() } catch (err) {
    console.error("[admin/streetbeat] Stripe:", err)
    stripeError = "Couldn't reach Stripe, so only imported/legacy sales are shown."
  }
  const legacySales = await getLegacySales()

  // Dedupe: a legacy row whose order_ref is a real Stripe session ID already in
  // the live results would otherwise double-count the same purchase.
  const liveIds = new Set(stripeSales.map(s => s.id))
  const dedupedLegacy = legacySales.filter(s => !liveIds.has(s.id.replace(/^legacy-/, "")))
  const sales = [...stripeSales, ...dedupedLegacy].sort((a, b) => b.date.localeCompare(a.date))
  const total = sales.reduce((sum, s) => sum + s.amount, 0)
  const monthAgo = Date.now() - 30 * 86400_000
  const recent = sales.filter(s => new Date(s.date).getTime() >= monthAgo)

  // Last 6 months, newest first, for the bar list.
  const months: { key: string; label: string; cents: number; count: number }[] = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }), cents: 0, count: 0 })
  }
  for (const s of sales) {
    const d = new Date(s.date); const m = months.find(x => x.key === `${d.getFullYear()}-${d.getMonth()}`)
    if (m) { m.cents += s.amount; m.count++ }
  }

  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Film" title="Street Beat" description="Live Stripe sales plus imported and legacy purchases" />
      {usingFallbackKey && (
        <Notice tone="alert">
          <strong className="font-medium">STREETBEAT_STRIPE_SECRET_KEY is not set.</strong> Falling back to MCS&apos;s Stripe key, so live sales
          made through Street Beat&apos;s own Stripe account will NOT show below. Set the env var in Vercel and redeploy.
        </Notice>
      )}
      {stripeError && <Notice tone="alert">{stripeError}</Notice>}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Sales" value={num(sales.length)} />
        <Stat label="Revenue" value={money(total / 100)} />
        <Stat label="Last 30 days" value={num(recent.length)} sub={money(recent.reduce((s, x) => s + x.amount, 0) / 100)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr] items-start">
        <Card>
          <CardTitle title="By month" hint="Last six months" />
          <BarList format="money" rows={months.map(m => ({ label: m.label, value: m.cents / 100, note: `${m.count} sale${m.count === 1 ? "" : "s"}` }))} />
        </Card>
        <Card pad={false}>
          <div className="px-4 sm:px-6 pt-4 sm:pt-6"><CardTitle title="All sales" hint={`${num(sales.length)} purchases, newest first`} /></div>
          {sales.length === 0 ? (
            <p className="px-6 pb-6 text-mist/60 text-sm">No Street Beat purchases yet.</p>
          ) : (
            <ul className="divide-y divide-studio-border border-t border-studio-border max-h-[640px] overflow-y-auto">
              {sales.map(s => (
                <li key={s.id} className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-mist/60 text-[11px] whitespace-nowrap">
                        {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border shrink-0 ${
                        s.source === "stripe" ? "border-emerald-500/30 text-emerald-400" : "border-studio-border text-mist/60"
                      }`}>{s.source === "stripe" ? "Live" : "Legacy"}</span>
                    </div>
                    <p className="text-cream text-sm truncate">{s.email ?? "—"}</p>
                  </div>
                  <p className="text-gold text-sm tabular-nums shrink-0">{fmt(s.amount)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AdminPage>
  )
}
