"use client"
// src/components/admin/BookingsFilterList.tsx
// Search (client name/email) + status filter + upcoming/past split +
// pagination over the full bookings list handed down from the server
// component. Stats row on the page stays computed from the unfiltered set.

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search } from "lucide-react"
import { DeleteBookingButton } from "@/components/admin/DeleteBookingButton"

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

const PAGE_SIZE = 20
type StatusFilter = "all" | "confirmed" | "pending" | "cancelled"
type WhenFilter = "all" | "upcoming" | "past"

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function BookingsFilterList({ bookings }: { bookings: Booking[] }) {
  const [query, setQuery]   = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [when, setWhen]     = useState<WhenFilter>("all")
  const [page, setPage]     = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const today = todayStr()
    return bookings.filter(b => {
      if (status !== "all" && b.status !== status) return false
      if (when === "upcoming" && b.date < today) return false
      if (when === "past" && b.date >= today) return false
      if (!q) return true
      const haystack = `${b.client_name} ${b.client_email} ${b.room}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [bookings, query, status, when])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const pageItems = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  function updateQuery(v: string) { setQuery(v); setPage(1) }
  function updateStatus(v: StatusFilter) { setStatus(v); setPage(1) }
  function updateWhen(v: WhenFilter) { setWhen(v); setPage(1) }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-mist/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={e => updateQuery(e.target.value)}
              placeholder="Search client name or email…"
              className="w-full bg-studio-charcoal border border-studio-border rounded-sm pl-9 pr-3 py-2
                text-xs text-cream placeholder:text-mist/30 focus:outline-none focus:border-gold/40"
            />
          </div>
          <div className="flex gap-1 shrink-0">
            {([
              { key: "all",      label: "All" },
              { key: "upcoming", label: "Upcoming" },
              { key: "past",     label: "Past" },
            ] as { key: WhenFilter; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => updateWhen(key)}
                className={`px-3 py-2 rounded-sm text-[11px] uppercase tracking-wide whitespace-nowrap transition-colors border ${
                  when === key
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-studio-border text-mist/50 hover:text-cream"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {([
            { key: "all",       label: "All Statuses" },
            { key: "confirmed", label: "Confirmed" },
            { key: "pending",   label: "Pending" },
            { key: "cancelled", label: "Cancelled" },
          ] as { key: StatusFilter; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateStatus(key)}
              className={`px-3 py-1.5 rounded-sm text-[11px] uppercase tracking-wide whitespace-nowrap transition-colors border ${
                status === key
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-studio-border text-mist/50 hover:text-cream"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <Calendar className="w-10 h-10 text-mist/20 mx-auto mb-4" />
          <p className="text-mist/40 text-sm">No bookings match.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {pageItems.map(b => (
              <div
                key={b.id}
                className="border border-studio-border bg-studio-charcoal rounded-sm p-5 grid md:grid-cols-[1fr_auto] gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-cream font-medium text-sm">{b.client_name}</p>
                    <Badge variant={statusColor(b.status)} className="text-[10px] uppercase tracking-wide">
                      {b.status}
                    </Badge>
                    <span className="text-gold text-xs font-display">Studio {b.room}</span>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-mist">
                    <span>{formatDate(b.date)}</span>
                    <span>{formatTime(b.start_hour)} — {formatTime(b.start_hour + b.rate_hours)}</span>
                    <span>{b.rate_label}</span>
                    <span className="text-gold">${(b.rate_price / 100).toFixed(0)}</span>
                  </div>

                  <div className="text-xs text-mist/60 space-y-0.5">
                    <a href={`mailto:${b.client_email}`} className="hover:text-gold transition-colors">
                      {b.client_email}
                    </a>
                    {b.client_notes && (
                      <p className="text-mist/40 italic">"{b.client_notes}"</p>
                    )}
                  </div>
                </div>

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
                  <div className="pt-1 flex justify-end">
                    <DeleteBookingButton bookingId={b.id} clientName={b.client_name} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 text-xs text-mist/50">
              <span>
                Page {pageSafe} of {totalPages} · {filtered.length} booking{filtered.length === 1 ? "" : "s"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pageSafe === 1}
                  className="px-3 py-1.5 border border-studio-border rounded-sm hover:text-gold hover:border-gold/40 disabled:opacity-30 disabled:hover:text-mist/50 disabled:hover:border-studio-border transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={pageSafe === totalPages}
                  className="px-3 py-1.5 border border-studio-border rounded-sm hover:text-gold hover:border-gold/40 disabled:opacity-30 disabled:hover:text-mist/50 disabled:hover:border-studio-border transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
