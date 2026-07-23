// src/app/api/admin/assign-engineer/route.ts
// Assigns an engineer to a generic /studio booking after the fact, for payout
// tracking. Generic bookings pay $30/hr (vs $40/hr for engineer-page bookings)
// since they weren't booked directly through the engineer's own page.
// Protected by src/middleware.ts (Basic Auth, matcher includes /api/admin/:path*)

import { NextResponse } from "next/server"
import { getDB, initDB } from "@/lib/db"
import { ENGINEERS, GENERIC_ASSIGNED_RATE_CENTS } from "@/lib/engineers"

export async function POST(req: Request) {
  try {
    const { bookingId, engineerSlug } = await req.json()
    if (!bookingId || !engineerSlug) {
      return NextResponse.json({ error: "bookingId and engineerSlug are required" }, { status: 400 })
    }
    if (!ENGINEERS.some(e => e.slug === engineerSlug)) {
      return NextResponse.json({ error: "Unknown engineer slug" }, { status: 400 })
    }

    await initDB()
    const result = await getDB().execute({
      sql: `SELECT rate_hours FROM bookings WHERE id = ?`,
      args: [bookingId],
    })
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }
    const rateHours = Number(result.rows[0].rate_hours)
    const payoutAmountCents = rateHours * GENERIC_ASSIGNED_RATE_CENTS

    await getDB().execute({
      sql: `UPDATE bookings
            SET engineer_slug = ?, payout_rate_cents = ?, payout_amount_cents = ?
            WHERE id = ?`,
      args: [engineerSlug, GENERIC_ASSIGNED_RATE_CENTS, payoutAmountCents, bookingId],
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
