// src/app/admin/payouts/page.tsx
// Engineer payout tracker. Confirmed engineer-page bookings are payout-ready
// automatically ($40/hr). Confirmed /studio bookings wait under "Needs an
// engineer" until someone assigns who worked it ($30/hr once assigned).
// Protected by src/middleware.ts.

import { getDB, initDB } from "@/lib/db"
import { PayoutsClient } from "./PayoutsClient"
import { AdminPage, AdminPageHeader, Stat, money, num } from "@/components/admin/ui"

export interface PayoutBooking {
  id: string; room: string; rate_label: string; rate_hours: number; date: string; start_hour: number
  client_name: string; engineer_slug: string | null; payout_rate_cents: number | null
  payout_amount_cents: number | null; payout_status: string; created_at: string
}

export const dynamic = "force-dynamic"

export default async function AdminPayoutsPage() {
  await initDB()
  const result = await getDB().execute(
    `SELECT id, room, rate_label, rate_hours, date, start_hour, client_name,
            engineer_slug, payout_rate_cents, payout_amount_cents, payout_status, created_at
     FROM bookings WHERE status = 'confirmed' ORDER BY date DESC, start_hour DESC`
  )
  const bookings = result.rows.map(r => ({ ...r })) as unknown as PayoutBooking[]
  const owed = bookings.filter(b => b.engineer_slug && b.payout_status === "unpaid").reduce((s, b) => s + Number(b.payout_amount_cents ?? 0), 0) / 100
  const paid = bookings.filter(b => b.payout_status === "paid").reduce((s, b) => s + Number(b.payout_amount_cents ?? 0), 0) / 100
  const unassigned = bookings.filter(b => !b.engineer_slug).length

  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Team" title="Payouts" description="What each engineer is owed for confirmed sessions" />
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Stat label="Owed now" value={money(owed)} />
        <Stat label="Needs an engineer" value={num(unassigned)} sub={unassigned ? "Assign below" : "All assigned"} />
        <Stat label="Paid to date" value={money(paid)} />
      </div>
      <PayoutsClient bookings={bookings} />
    </AdminPage>
  )
}
