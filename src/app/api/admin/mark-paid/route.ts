// src/app/api/admin/mark-paid/route.ts
// Marks a batch of bookings' payouts as paid — used from /admin/payouts when
// closing out a week for a given engineer.
// Protected by src/middleware.ts (Basic Auth, matcher includes /api/admin/:path*)

import { NextResponse } from "next/server"
import { getDB, initDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { bookingIds } = await req.json()
    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json({ error: "bookingIds must be a non-empty array" }, { status: 400 })
    }

    await initDB()
    const placeholders = bookingIds.map(() => "?").join(",")
    await getDB().execute({
      sql: `UPDATE bookings SET payout_status = 'paid' WHERE id IN (${placeholders})`,
      args: bookingIds,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
