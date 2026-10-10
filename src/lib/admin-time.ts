// src/lib/admin-time.ts
// Day math for admin dashboards, in New Orleans time. SQLite datetime('now')
// stores "YYYY-MM-DD HH:MM:SS" in UTC; site events store ISO with a Z.

export const TZ = "America/Chicago"
const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" })
const hourFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hourCycle: "h23" })

export function toDate(ts: unknown): Date | null {
  if (!ts) return null
  const s = String(ts)
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z")
  return Number.isNaN(d.getTime()) ? null : d
}

export const localDay = (d: Date) => dayFmt.format(d)
export const localHour = (d: Date) => Number(hourFmt.format(d))
export const todayLocal = () => localDay(new Date())

export function addDays(day: string, n: number): string {
  const d = new Date(day + "T12:00:00Z")
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** 0 = Monday … 6 = Sunday for a YYYY-MM-DD day. */
export function weekdayMon0(day: string): number {
  return (new Date(day + "T12:00:00Z").getUTCDay() + 6) % 7
}

export function greeting(): string {
  const h = localHour(new Date())
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
}
