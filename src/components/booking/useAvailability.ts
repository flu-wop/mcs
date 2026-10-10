"use client"
import { useEffect, useState } from "react"
import { localDateKey } from "@/lib/studio-rates"

export type BookedRange = { start_hour: number; rate_hours: number }

/** Booked ranges for a room on a date, with a loading flag for the slot grid. */
export function useAvailability(room: string | null, date: Date | null) {
  const [booked, setBooked] = useState<BookedRange[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!room || !date) { setBooked([]); return }
    const ctrl = new AbortController()
    setLoading(true)
    fetch(`/api/availability?room=${room}&date=${localDateKey(date)}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setBooked(d.booked ?? []))
      .catch(e => { if (e.name !== "AbortError") setBooked([]) })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [room, date])

  function isTaken(startHour: number, hours: number) {
    const end = startHour + (hours || 1)
    return booked.some(r => startHour < r.start_hour + r.rate_hours && end > r.start_hour)
  }
  return { booked, loading, isTaken }
}

export function fmtHour(h: number) {
  const hr = ((h + 11) % 12) + 1
  return `${hr}${h < 12 ? "am" : "pm"}`
}
