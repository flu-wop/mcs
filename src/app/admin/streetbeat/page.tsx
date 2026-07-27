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

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" })
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

        {sales.length === 0 ? (
          <p className="text-mist/40 text-sm">No Street Beat purchases yet.</p>
        ) : (
          <div className="border border-studio-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-studio-border bg-studio-charcoal text-mist/60 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-normal">Date</th>
                  <th className="text-left px-4 py-3 font-normal">Email</th>
                  <th className="text-left px-4 py-3 font-normal">Source</th>
                  <th className="text-right px-4 py-3 font-normal">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id} className="border-b border-studio-border/40 last:border-0 text-mist">
                    <td className="px-4 py-3">
                      {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">{s.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-sm border ${
                        s.source === "stripe" ? "border-green-500/30 text-green-400" : "border-mist/30 text-mist/60"
                      }`}>
                        {s.source === "stripe" ? "Live" : "Legacy"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gold">{fmt(s.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
