// src/app/api/admin/delete-booking/route.ts
// Deletes a booking row entirely — for removing test sessions or bad data.
// Protected by src/middleware.ts (admin session cookie).

import { NextResponse } from "next/server"
import { getDB, initDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json()
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 })
    }

    await initDB()
    await getDB().execute({
      sql: `DELETE FROM bookings WHERE id = ?`,
      args: [bookingId],
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
