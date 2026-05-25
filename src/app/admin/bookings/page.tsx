// src/app/admin/bookings/page.tsx
// Admin dashboard — all studio bookings from Turso.
// Access at /admin/bookings  (add auth middleware when ready)
//
// TODO: protect with middleware.ts + ADMIN_PASSWORD env var

import { getDB, initDB }   from "@/lib/db"
import { Badge }        from "@/components/ui/badge"
import { Separator }    from "@/components/ui/separator"
import Link             from "next/link"
import { Calendar, Download } from "lucide-react"

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

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  })
}

function formatTime(h: number) {
  if (h < 12) return `${h}:00 AM`
  if (h === 12) return "12:00 PM"
  return `${h - 12}:00 PM`
}

function statusColor(status: string) {
  if (status === "confirmed") return "default"
  if (status === "pending")   return "secondary"
  return "outline"
}

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
    <div className="min-h-screen bg-studio-black pt-20 px-6 pb-20">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-gold/60 mb-1">Admin</p>
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

        {bookings.length === 0 ? (
          <div className="text-center py-24">
            <Calendar className="w-10 h-10 text-mist/20 mx-auto mb-4" />
            <p className="text-mist/40 text-sm">No bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div
                key={b.id}
                className="border border-studio-border bg-studio-charcoal rounded-sm p-5 grid md:grid-cols-[1fr_auto] gap-4"
              >
                <div className="space-y-2">
                  {/* Client + status */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-cream font-medium text-sm">{b.client_name}</p>
                    <Badge variant={statusColor(b.status)} className="text-[10px] uppercase tracking-wide">
                      {b.status}
                    </Badge>
                    <span className="text-gold text-xs font-display">Studio {b.room}</span>
                  </div>

                  {/* Date + time + session */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-mist">
                    <span>{formatDate(b.date)}</span>
                    <span>{formatTime(b.start_hour)} — {formatTime(b.start_hour + b.rate_hours)}</span>
                    <span>{b.rate_label}</span>
                    <span className="text-gold">${(b.rate_price / 100).toFixed(0)}</span>
                  </div>

                  {/* Email + notes */}
                  <div className="text-xs text-mist/60 space-y-0.5">
                    <a href={`mailto:${b.client_email}`} className="hover:text-gold transition-colors">
                      {b.client_email}
                    </a>
                    {b.client_notes && (
                      <p className="text-mist/40 italic">"{b.client_notes}"</p>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="text-right text-[10px] text-mist/30 space-y-1">
                  <p>Booked {new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  {b.stripe_session_id && (
                    <a
                      href={`https://dashboard.stripe.com/payments/${b.stripe_session_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gold transition-colors font-mono"
                    >
                      {b.stripe_session_id.slice(0, 18)}…
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
