// src/app/api/calendar.ics/route.ts
// Live iCal feed for all confirmed studio bookings.
// Subscribe in Google Calendar / Apple Calendar:
//   webcal://midcitysound.com/api/calendar.ics
// Or use the HTTPS URL directly.

import { NextResponse } from "next/server"
import { db, initDB }   from "@/lib/db"

function pad(n: number, len = 2) { return String(n).padStart(len, "0") }

function toIcsDate(dateStr: string, hour: number) {
  // dateStr = "YYYY-MM-DD", returns "YYYYMMDDTHHmmss"
  const [y, m, d] = dateStr.split("-")
  return `${y}${m}${d}T${pad(hour)}0000`
}

function escape(s: string) {
  return s.replace(/[\\,;]/g, c => `\\${c}`).replace(/\n/g, "\\n")
}

export async function GET() {
  try {
    await initDB()
    const result = await db.execute(
      "SELECT * FROM bookings WHERE status = 'confirmed' ORDER BY date ASC, start_hour ASC"
    )

    const rows = result.rows as Array<{
      id: string; room: string; rate_label: string; rate_hours: number
      date: string; start_hour: number; client_name: string; status: string
    }>

    const isoNow = new Date().toISOString()
    const now = isoNow.replace(/[^0-9T]/g, "").slice(0, 15)

    const events = rows.map(b => {
      const start = toIcsDate(b.date, b.start_hour)
      const end   = toIcsDate(b.date, b.start_hour + b.rate_hours)
      return [
        "BEGIN:VEVENT",
        `UID:mcs-booking-${b.id}@midcitysound.com`,
        `DTSTAMP:${now}Z`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escape(`Studio ${b.room} — ${b.rate_label}`)}`,
        `DESCRIPTION:${escape(`Client: ${b.client_name}\nRoom: Studio ${b.room}\nSession: ${b.rate_label}`)}`,
        "LOCATION:530 S Norman C Francis Pkwy\\, New Orleans\\, LA",
        "STATUS:CONFIRMED",
        "END:VEVENT",
      ].join("\r\n")
    })

    const cal = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Mid City Sound Studios//Booking Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:MCS Studio Bookings",
      "X-WR-CALDESC:Confirmed studio bookings at Mid City Sound Studios",
      "X-WR-TIMEZONE:America/Chicago",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n")

    return new NextResponse(cal, {
      headers: {
        "Content-Type":        "text/calendar; charset=utf-8",
        "Content-Disposition": "attachment; filename=mcs-bookings.ics",
        "Cache-Control":       "no-store, must-revalidate",
      },
    })
  } catch (err) {
    console.error("[/api/calendar.ics]", err)
    return NextResponse.json({ error: "Failed to generate calendar" }, { status: 500 })
  }
}
