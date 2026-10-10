"use client"
// Running total pinned to the bottom of the screen on phones while booking,
// so the price and the next step are always one thumb away.
import { ArrowRight } from "lucide-react"
import { fmtUSD } from "@/lib/studio-rates"

export function TotalBar({ show, summary, cents, cta, disabled, onNext }: {
  show: boolean; summary: string; cents: number; cta: string; disabled: boolean; onNext: () => void
}) {
  return (
    <div className={`md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-studio-border bg-studio-black/95 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-500 ${show ? "translate-y-0" : "translate-y-full"}`}
      aria-hidden={!show}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-widest uppercase text-mist/60 truncate">{summary}</p>
          <p className="font-display text-2xl text-gold leading-none mt-0.5 tabular-nums">{cents > 0 ? fmtUSD(cents) : "—"}</p>
        </div>
        <button type="button" onClick={onNext} disabled={disabled} tabIndex={show ? 0 : -1}
          className="h-12 px-5 rounded-sm bg-gold text-studio-black text-xs font-semibold tracking-[0.14em] uppercase inline-flex items-center gap-2 disabled:opacity-40 transition-opacity">
          {cta}<ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
