"use client"
// src/components/admin/BookingsFilterList.tsx
// Search + when/status filters over the bookings list from the server page,
// grouped under day headers. "Unpaid" = a checkout that was started more than
// 30 minutes ago and never paid; it no longer holds its slot (see
// lib/availability.ts) and is worth a follow-up, not a session.

import { useMemo, useState } from "react"
import { Calendar, Search, Mail, ExternalLink, Clock } from "lucide-react"
import { DeleteBookingButton } from "@/components/admin/DeleteBookingButton"
import { engineerName } from "@/lib/engineers"

export interface AdminBooking {
  id: string; room: string; rate_label: string; rate_hours: number; rate_price: number
  date: string; start_hour: number; client_name: string; client_email: string; client_notes: string
  status: string; stripe_session_id: string | null; created_at: string; engineer_slug: string | null
}

type Kind = "confirmed" | "paying" | "unpaid" | "cancelled"
export type StatusFilter = "all" | Kind
export type WhenFilter = "upcoming" | "past" | "all"

const KIND_STYLE: Record<Kind, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "border-gold/50 text-gold bg-gold/10" },
  paying:    { label: "Paying now", cls: "border-sky-400/40 text-sky-300" },
  unpaid:    { label: "Unpaid", cls: "border-red-500/40 text-red-300" },
  cancelled: { label: "Cancelled", cls: "border-studio-border text-mist/60" },
}

const parseTs = (s: string) => new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z")

function kindOf(b: AdminBooking): Kind {
  if (b.status === "confirmed") return "confirmed"
  if (b.status === "pending") return Date.now() - parseTs(b.created_at).getTime() < 30 * 60_000 ? "paying" : "unpaid"
  return "cancelled"
}

const h12 = (h: number) => `${((h + 11) % 12) + 1}${h < 12 || h === 24 ? "am" : "pm"}`
function localKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` }
function dayLabel(date: string, today: string, tomorrow: string) {
  if (date === today) return "Today"
  if (date === tomorrow) return "Tomorrow"
  const [y, m, d] = date.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: y === new Date().getFullYear() ? undefined : "numeric" })
}

const PAGE_SIZE = 25

export function BookingsFilterList({ bookings, initialStatus = "all", initialWhen = "upcoming" }: {
  bookings: AdminBooking[]; initialStatus?: StatusFilter; initialWhen?: WhenFilter
}) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>(initialStatus)
  const [when, setWhen] = useState<WhenFilter>(initialStatus === "unpaid" ? "all" : initialWhen)
  const [page, setPage] = useState(1)

  const now = new Date()
  const today = localKey(now)
  const tomorrow = localKey(new Date(now.getTime() + 86400_000))

  const withKind = useMemo(() => bookings.map(b => ({ ...b, kind: kindOf(b) })), [bookings])
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: withKind.length }
    for (const b of withKind) c[b.kind] = (c[b.kind] ?? 0) + 1
    return c
  }, [withKind])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = withKind.filter(b => {
      if (status !== "all" && b.kind !== status) return false
      if (when === "upcoming" && b.date < today) return false
      if (when === "past" && b.date >= today) return false
      return !q || `${b.client_name} ${b.client_email} studio ${b.room} ${b.rate_label}`.toLowerCase().includes(q)
    })
    // Upcoming reads soonest-first; everything else newest-first.
    return when === "upcoming"
      ? list.sort((a, b) => a.date.localeCompare(b.date) || a.start_hour - b.start_hour)
      : list.sort((a, b) => b.date.localeCompare(a.date) || b.start_hour - a.start_hour)
  }, [withKind, query, status, when, today])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const items = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)
  const groups: { date: string; rows: typeof items }[] = []
  for (const b of items) {
    const last = groups[groups.length - 1]
    if (last?.date === b.date) last.rows.push(b); else groups.push({ date: b.date, rows: [b] })
  }

  const chip = (on: boolean) => `h-9 px-3 rounded-sm text-xs whitespace-nowrap shrink-0 transition-colors border ${on ? "border-gold/50 bg-gold/10 text-gold" : "border-studio-border text-mist hover:text-cream"}`

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="relative flex-1">
            <span className="sr-only">Search bookings</span>
            <Search className="w-4 h-4 text-mist/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="Search name, email, room or package"
              className="w-full h-10 bg-studio-charcoal border border-studio-border rounded-sm pl-9 pr-3 text-cream placeholder:text-mist/30 focus:outline-none focus:border-gold/50" />
          </label>
          <div role="radiogroup" aria-label="When" className="flex gap-1 shrink-0">
            {(["upcoming", "past", "all"] as WhenFilter[]).map(k => (
              <button key={k} role="radio" aria-checked={when === k} onClick={() => { setWhen(k); setPage(1) }} className={chip(when === k)}>
                {k === "upcoming" ? "Upcoming" : k === "past" ? "Past" : "All dates"}
              </button>
            ))}
          </div>
        </div>
        <div role="radiogroup" aria-label="Status" className="flex gap-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {(["all", "confirmed", "paying", "unpaid", "cancelled"] as StatusFilter[]).map(k => (
            <button key={k} role="radio" aria-checked={status === k} onClick={() => { setStatus(k); setPage(1) }} className={chip(status === k)}>
              {k === "all" ? "All statuses" : KIND_STYLE[k].label}<span className="ml-1.5 text-mist/50 tabular-nums">{counts[k] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-studio-border rounded-sm">
          <Calendar className="w-9 h-9 text-mist/20 mx-auto mb-3" />
          <p className="text-cream text-sm mb-1">{when === "upcoming" && status === "all" && !query ? "Nothing on the books ahead" : "No bookings match"}</p>
          <p className="text-mist/50 text-xs">{query || status !== "all" ? "Try clearing the search or filters." : "New sessions show up here as soon as they're paid."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(g => (
            <section key={g.date + g.rows[0].id}>
              <h3 className={`text-[11px] tracking-[0.18em] uppercase mb-2 ${g.date === today ? "text-gold" : "text-mist/60"}`}>{dayLabel(g.date, today, tomorrow)}</h3>
              <ul className="space-y-2">
                {g.rows.map(b => {
                  const st = KIND_STYLE[b.kind]
                  const pkg = b.rate_label.split(" · ")[0]
                  const eng = b.engineer_slug ? engineerName(b.engineer_slug) : null
                  return (
                    <li key={b.id} className={`border rounded-sm bg-studio-charcoal p-4 sm:p-5 ${b.kind === "unpaid" ? "border-red-500/25" : "border-studio-border"}`}>
                      <div className="flex gap-4">
                        <div className="w-16 sm:w-20 shrink-0">
                          <p className="font-display text-xl text-cream leading-none tabular-nums">{h12(b.start_hour)}</p>
                          <p className="text-[11px] text-mist/60 mt-1 tabular-nums">to {h12(b.start_hour + b.rate_hours)}</p>
                          <p className="text-[10px] tracking-[0.16em] uppercase text-gold/80 mt-2">Studio {b.room}</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-cream font-medium truncate">{b.client_name}</p>
                            <span className={`shrink-0 text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-sm border ${st.cls}`}>{st.label}</span>
                          </div>
                          <p className="text-xs text-mist mt-0.5">{pkg} · {b.rate_hours} hr{b.rate_hours === 1 ? "" : "s"}{eng ? ` · ${eng}` : ""} · <span className="text-gold">${(b.rate_price / 100).toLocaleString()}</span></p>
                          {b.client_notes && <p className="text-xs text-mist/60 mt-2 whitespace-pre-line line-clamp-3">{b.client_notes}</p>}
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-mist/60">
                            <a href={`mailto:${b.client_email}${b.kind === "unpaid" ? `?subject=${encodeURIComponent("Your Mid City Sound booking")}` : ""}`} className="inline-flex items-center gap-1 hover:text-gold transition-colors min-w-0">
                              <Mail className="w-3 h-3 shrink-0" /><span className="truncate">{b.client_email}</span>
                            </a>
                            {b.stripe_session_id && b.kind === "confirmed" && (
                              <a href={`https://dashboard.stripe.com/search?query=${encodeURIComponent(b.stripe_session_id)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-gold transition-colors">
                                Stripe <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />Booked {parseTs(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            <span className="ml-auto"><DeleteBookingButton bookingId={b.id} clientName={b.client_name} /></span>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 text-xs text-mist/60">
          <span>Page {pageSafe} of {totalPages} · {filtered.length} booking{filtered.length === 1 ? "" : "s"}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pageSafe === 1} className="h-9 px-3 border border-studio-border rounded-sm hover:text-gold hover:border-gold/40 disabled:opacity-30 transition-colors">Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={pageSafe === totalPages} className="h-9 px-3 border border-studio-border rounded-sm hover:text-gold hover:border-gold/40 disabled:opacity-30 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
