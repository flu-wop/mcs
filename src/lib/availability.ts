// src/lib/availability.ts
// Shared booking-conflict logic for the studio + engineer booking flows.
// A room can only hold one confirmed-or-pending booking per overlapping hour range.

import { getDB } from "@/lib/db"

export interface BookedRange {
  start_hour: number
  rate_hours: number
}

/** All pending/confirmed bookings for a room on a given date, as [start, end) hour ranges. */
export async function getBookedRanges(room: string, date: string): Promise<BookedRange[]> {
  const result = await getDB().execute({
    sql: `SELECT start_hour, rate_hours FROM bookings
          WHERE room = ? AND date = ? AND status IN ('pending', 'confirmed')`,
    args: [room, date],
  })
  return result.rows as unknown as BookedRange[]
}

/** True if [startHour, startHour + hours) overlaps any existing booked range. */
export function hasConflict(ranges: BookedRange[], startHour: number, hours: number): boolean {
  const newEnd = startHour + hours
  return ranges.some(r => startHour < r.start_hour + r.rate_hours && newEnd > r.start_hour)
}
