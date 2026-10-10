"use client"
import { Minus, Plus } from "lucide-react"
import { HOURLY_MAX, HOURLY_MIN, fmtUSD } from "@/lib/studio-rates"

export function HourStepper({ value, onChange, perHour }: { value: number; onChange: (n: number) => void; perHour: number }) {
  const btn = "w-10 h-10 border border-studio-border rounded-sm grid place-items-center text-mist hover:text-gold hover:border-gold/40 transition-all disabled:opacity-30 disabled:pointer-events-none"
  return (
    <div className="flex items-center justify-between gap-4 border border-gold/20 bg-gold/5 rounded-sm p-4">
      <div className="min-w-0">
        <p className="text-cream text-sm font-medium">How many hours?</p>
        <p className="text-mist text-xs">
          Minimum {HOURLY_MIN} · {fmtUSD(perHour)}/hr
          <span className="text-gold ml-2 whitespace-nowrap">= {fmtUSD(perHour * value)}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0" role="group" aria-label="Session hours">
        <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= HOURLY_MIN} aria-label="One hour less"><Minus className="w-4 h-4" /></button>
        <span className="font-display text-2xl text-gold w-8 text-center tabular-nums" aria-live="polite">{value}</span>
        <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= HOURLY_MAX} aria-label="One hour more"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
