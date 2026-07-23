// src/app/admin/payouts/page.tsx
// Weekly engineer payout tracker. Confirmed engineer-page bookings are payout-ready
// automatically ($40/hr). Confirmed generic /studio bookings show up under "Needs
// Assignment" until an admin attributes them to the engineer who worked the session
// ($30/hr once assigned). Protected by src/middleware.ts (Basic Auth).

import { getDB, initDB } from "@/lib/db"
import { PayoutsClient } from "./PayoutsClient"

export interface PayoutBooking {
  id:                   string
  room:                 string
  rate_label:           string
  rate_hours:           number
  date:                 string
  start_hour:           number
  client_name:          string
  engineer_slug:        string | null
  payout_rate_cents:    number | null
  payout_amount_cents:  number | null
  payout_status:        string
  created_at:           string
}

export const dynamic = 'force-dynamic'

export default async function AdminPayoutsPage() {
  await initDB()
  const result = await getDB().execute(
    `SELECT id, room, rate_label, rate_hours, date, start_hour, client_name,
            engineer_slug, payout_rate_cents, payout_amount_cents, payout_status, created_at
     FROM bookings
     WHERE status = 'confirmed'
     ORDER BY date DESC, start_hour DESC`
  )
  const bookings = result.rows as unknown as PayoutBooking[]

  return (
    <div className="min-h-screen bg-studio-black pt-20 px-6 pb-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] tracking-widest uppercase text-gold/60 mb-1">Admin</p>
        <h1 className="font-display text-4xl text-cream mb-10">Engineer Payouts</h1>
        <PayoutsClient bookings={bookings} />
      </div>
    </div>
  )
}
