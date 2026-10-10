// src/app/admin/bookings/page.tsx
// Studio bookings from Turso. Protected by src/middleware.ts.
// ?status=unpaid|confirmed|paying|cancelled and ?when=past|all pre-set the filters
// (the admin home links here with ?status=unpaid).

import { Download } from "lucide-react"
import { getDB, initDB } from "@/lib/db"
import { todayLocal } from "@/lib/admin-time"
import { BookingsFilterList, type AdminBooking, type StatusFilter, type WhenFilter } from "@/components/admin/BookingsFilterList"
import { AdminPage, AdminPageHeader, Stat, adminBtn, money, num } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

const STATUSES: StatusFilter[] = ["all", "confirmed", "paying", "unpaid", "cancelled"]
const WHENS: WhenFilter[] = ["upcoming", "past", "all"]

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ status?: string; when?: string }> }) {
  const sp = await searchParams
  await initDB()
  const result = await getDB().execute(
    `SELECT id, room, rate_label, rate_hours, rate_price, date, start_hour, client_name, client_email,
            client_notes, status, stripe_session_id, created_at, engineer_slug
     FROM bookings ORDER BY date DESC, start_hour DESC`
  )
  const bookings = result.rows.map(r => ({ ...r })) as unknown as AdminBooking[]
  const today = todayLocal()
  const confirmed = bookings.filter(b => b.status === "confirmed")
  const upcoming = confirmed.filter(b => b.date >= today)
  const revenue = confirmed.reduce((s, b) => s + Number(b.rate_price), 0) / 100
  const hoursAhead = upcoming.reduce((s, b) => s + Number(b.rate_hours), 0)

  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Studio" title="Bookings" description="Every studio and engineer-page session"
        actions={<a href="/api/calendar.ics" className={adminBtn.secondary}><Download className="w-3.5 h-3.5" />Calendar feed</a>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Stat label="Upcoming" value={num(upcoming.length)} sub={`${num(hoursAhead)} hrs booked`} />
        <Stat label="Confirmed" value={num(confirmed.length)} sub="all time" />
        <Stat label="Revenue" value={money(revenue)} sub="all time" />
        <Stat label="Bookings" value={num(bookings.length)} sub="incl. unpaid & cancelled" />
      </div>
      <BookingsFilterList bookings={bookings}
        initialStatus={STATUSES.includes(sp.status as StatusFilter) ? sp.status as StatusFilter : "all"}
        initialWhen={WHENS.includes(sp.when as WhenFilter) ? sp.when as WhenFilter : "upcoming"} />
    </AdminPage>
  )
}
