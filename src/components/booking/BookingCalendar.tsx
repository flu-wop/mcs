"use client"
// Month calendar for picking a session date. Arrow keys move between days.
import { useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function BookingCalendar({ selected, onSelect, closedDays = [], note }: {
  selected: Date | null
  onSelect: (d: Date) => void
  /** Weekday numbers (0 = Sunday) that can't be booked. */
  closedDays?: number[]
  note?: string
}) {
  const today = useMemo(() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t }, [])
  const [view, setView] = useState(() => {
    const base = selected ?? today
    return { y: base.getFullYear(), m: base.getMonth() }
  })
  const grid = useRef<HTMLDivElement>(null)
  const first = new Date(view.y, view.m, 1).getDay()
  const days = new Date(view.y, view.m + 1, 0).getDate()
  const label = new Date(view.y, view.m).toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const atCurrentMonth = view.y === today.getFullYear() && view.m === today.getMonth()

  const shift = (n: number) => setView(v => {
    const d = new Date(v.y, v.m + n, 1)
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const disabled = (d: Date) => d < today || closedDays.includes(d.getDay())

  function onKey(e: React.KeyboardEvent<HTMLButtonElement>, day: number) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = day + step
    if (next < 1 || next > days) { shift(step > 0 ? 1 : -1); return }
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${next}"]`)?.focus()
  }

  return (
    <div className="border border-studio-border bg-studio-card rounded-sm p-4 sm:p-5 select-none">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => shift(-1)} disabled={atCurrentMonth} aria-label="Previous month"
          className="w-9 h-9 grid place-items-center text-mist hover:text-cream hover:bg-studio-dark rounded-sm transition-colors disabled:opacity-25 disabled:pointer-events-none">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="font-display text-lg text-cream" aria-live="polite">{label}</p>
        <button type="button" onClick={() => shift(1)} aria-label="Next month"
          className="w-9 h-9 grid place-items-center text-mist hover:text-cream hover:bg-studio-dark rounded-sm transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1" aria-hidden>
        {DOW.map(d => <div key={d} className="text-center text-[10px] text-mist/50 tracking-wide py-1">{d}</div>)}
      </div>
      <div ref={grid} className="grid grid-cols-7 gap-1" role="grid" aria-label={label}>
        {Array.from({ length: first }, (_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => i + 1).map(day => {
          const date = new Date(view.y, view.m, day)
          const off = disabled(date)
          const isSel = selected?.toDateString() === date.toDateString()
          const isToday = date.getTime() === today.getTime()
          return (
            <button key={day} type="button" data-day={day} disabled={off}
              onClick={() => onSelect(date)} onKeyDown={e => onKey(e, day)}
              aria-pressed={isSel}
              aria-label={date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) + (off ? " (unavailable)" : "")}
              className={cn(
                "h-10 sm:h-9 w-full text-sm sm:text-xs rounded-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
                off ? "text-mist/20 cursor-not-allowed"
                  : isSel ? "bg-gold text-studio-black font-semibold shadow-[0_0_18px_rgba(212,175,119,0.35)]"
                  : isToday ? "border border-gold/50 text-gold hover:bg-gold/10"
                  : "text-cream/80 hover:bg-studio-dark hover:text-cream",
              )}>
              {day}
            </button>
          )
        })}
      </div>
      {note && <p className="text-[11px] text-mist/50 text-center mt-3">{note}</p>}
    </div>
  )
}
