// src/app/admin/streetbeat/page.tsx
// Streetbeat has no database of its own — purchases are verified against
// Stripe directly and never persisted (see flu-wop/streetbeat's access.ts).
// Since Streetbeat shares this same Stripe account, we can pull real sales
// straight from Stripe's API instead of building a whole new data pipeline.
// Sessions are tagged with metadata.source = "streetbeat-purchase" at
// checkout time so they don't get mixed in with MCS's own bookings/merch
// activity on the same account.
// Protected by src/middleware.ts (admin session cookie).

import Stripe from "stripe"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" })
}

export const dynamic = 'force-dynamic'

interface Sale {
  id: string
  email: string | null
  amount: number
  date: string
}

async function getStreetbeatSales(): Promise<Sale[]> {
  const stripe = getStripe()
  // Note: fetches the 100 most recent Checkout Sessions on the account and
  // filters by metadata client-side — Stripe's list API doesn't support
  // server-side metadata filtering. Fine at this volume; if Streetbeat sales
  // ever exceed 100 between MCS bookings/merch activity, this needs real
  // pagination (walk `has_more` with `starting_after`).
  const sessions = await stripe.checkout.sessions.list({ limit: 100 })

  return sessions.data
    .filter(s => s.metadata?.source === "streetbeat-purchase" && s.payment_status === "paid")
    .map(s => ({
      id:     s.id,
      email:  s.customer_details?.email ?? s.customer_email ?? null,
      amount: s.amount_total ?? 0,
      date:   new Date(s.created * 1000).toISOString(),
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export default async function AdminStreetbeatPage() {
  const sales = await getStreetbeatSales()
  const total = sales.reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="min-h-screen bg-studio-black pt-20 px-6 pb-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] tracking-widest uppercase text-gold/60 mb-1">Admin</p>
        <h1 className="font-display text-4xl text-cream mb-2">Street Beat Sales</h1>
        <p className="text-mist/50 text-sm mb-10">
          Pulled live from Stripe — Street Beat has no database of its own, so this list is the
          source of truth. {sales.length} sale{sales.length === 1 ? "" : "s"} · {fmt(total)} total
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
