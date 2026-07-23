// src/app/api/availability/route.ts
// Returns already-booked hour ranges for a room + date, so the booking UI
// can grey out slots that would otherwise double-book the room.
// GET /api/availability?room=A&date=2026-08-01

import { NextRequest, NextResponse } from "next/server"
import { initDB } from "@/lib/db"
import { getBookedRanges } from "@/lib/availability"

export async function GET(req: NextRequest) {
  try {
    const room = req.nextUrl.searchParams.get("room")
    const date = req.nextUrl.searchParams.get("date")
    if (!room || !date) {
      return NextResponse.json({ error: "room and date query params are required" }, { status: 400 })
    }

    await initDB()
    const booked = await getBookedRanges(room, date)
    return NextResponse.json({ booked })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
