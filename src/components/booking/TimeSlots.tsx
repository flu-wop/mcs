"use client"
import { cn } from "@/lib/utils"
import { fmtHour } from "./useAvailability"

export function TimeSlots({ hours, selected, onSelect, isTaken, loading, sessionHours }: {
  hours: number[]
  selected: number | null
  onSelect: (h: number) => void
  isTaken: (h: number) => boolean
  loading: boolean
  sessionHours: number
}) {
  return (
    <div>
      <div className={cn("grid grid-cols-3 sm:grid-cols-3 gap-2 transition-opacity", loading && "opacity-40 pointer-events-none")} aria-busy={loading}>
        {hours.map(h => {
          const taken = isTaken(h)
          const sel = selected === h
          return (
            <button key={h} type="button" onClick={() => onSelect(h)} disabled={taken} aria-pressed={sel}
              className={cn("h-11 border rounded-sm text-sm transition-all",
                taken ? "border-studio-border/30 text-mist/25 cursor-not-allowed line-through"
                  : sel ? "border-gold bg-gold/10 text-gold"
                  : "border-studio-border text-mist hover:border-gold/40 hover:text-cream")}>
              {fmtHour(h)}
            </button>
          )
        })}
      </div>
      <p className="text-[11px] text-mist/50 mt-3 leading-relaxed">
        {loading ? "Checking the room's calendar…"
          : sessionHours > 1 ? `Times shown fit your ${sessionHours}-hour session. Crossed-out times overlap another booking.`
          : "Crossed-out times are already booked."}
      </p>
    </div>
  )
}
