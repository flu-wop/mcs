// src/app/admin/bookings/page.tsx
// Admin dashboard — all studio bookings from Turso.
// Access at /admin/bookings — protected by src/middleware.ts (admin session cookie)

import { getDB, initDB }   from "@/lib/db"
import { Separator }    from "@/components/ui/separator"
import { Download } from "lucide-react"
import { BookingsFilterList } from "@/components/admin/BookingsFilterList"

interface Booking {
  id:           string
  room:         string
  rate_label:   string
  rate_hours:   number
  rate_price:   number
  date:         string
  start_hour:   number
  client_name:  string
  client_email: string
  client_notes: string
  status:       string
  stripe_session_id: string | null
  created_at:   string
}

// Force dynamic rendering — this page requires Turso at runtime
export const dynamic = 'force-dynamic'

export default async function AdminBookingsPage() {
  await initDB()

  const result = await getDB().execute(
    "SELECT * FROM bookings ORDER BY date DESC, start_hour DESC"
  )
  const bookings = result.rows as unknown as Booking[]

  const confirmed = bookings.filter(b => b.status === "confirmed").length
  const pending   = bookings.filter(b => b.status === "pending").length
  const revenue   = bookings
    .filter(b => b.status === "confirmed")
    .reduce((sum, b) => sum + b.rate_price, 0)

  return (
    <div className="pt-10 px-6 pb-20">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-cream">Studio Bookings</h1>
          </div>
          <a
            href="/api/calendar.ics"
            className="flex items-center gap-2 px-4 py-2 border border-studio-border text-mist text-xs hover:border-gold/40 hover:text-gold transition-all rounded-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Subscribe to iCal
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Bookings",  val: bookings.length },
            { label: "Confirmed",       val: confirmed },
            { label: "Revenue (Confirmed)", val: `$${(revenue / 100).toLocaleString()}` },
          ].map(({ label, val }) => (
            <div key={label} className="border border-studio-border rounded-sm p-5 bg-studio-charcoal">
              <p className="text-mist text-[10px] uppercase tracking-widest mb-1">{label}</p>
              <p className="font-display text-3xl text-gold">{val}</p>
            </div>
          ))}
        </div>

        <Separator className="mb-8 bg-studio-border/40" />

        <BookingsFilterList bookings={bookings} />
      </div>
    </div>
  )
}
