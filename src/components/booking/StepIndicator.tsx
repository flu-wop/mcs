"use client"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/** Numbered steps; completed steps are clickable to jump back. */
export function StepIndicator({ steps, step, onJump }: { steps: string[]; step: number; onJump?: (n: number) => void }) {
  return (
    <nav aria-label="Booking steps" className="w-full">
      <ol className="flex items-center justify-center">
        {steps.map((label, i) => {
          const n = i + 1, active = step === n, done = step > n
          return (
            <li key={label} className="flex items-center">
              <button type="button" disabled={!done || !onJump} onClick={() => onJump?.(n)}
                aria-current={active ? "step" : undefined}
                className="flex flex-col items-center gap-1 disabled:cursor-default group">
                <span className={cn("w-8 h-8 rounded-full border-2 grid place-items-center text-[11px] font-medium transition-all",
                  done ? "border-gold bg-gold text-studio-black group-hover:shadow-[0_0_14px_rgba(212,175,119,0.4)]"
                    : active ? "border-gold text-gold bg-gold/10" : "border-studio-border text-mist/50")}>
                  {done ? <Check className="w-3.5 h-3.5" /> : n}
                </span>
                <span className={cn("text-[9px] tracking-wide uppercase hidden sm:block",
                  active ? "text-gold" : done ? "text-gold/60" : "text-mist/30")}>{label}</span>
              </button>
              {i < steps.length - 1 && (
                <span aria-hidden className={cn("w-8 sm:w-14 h-px mx-1.5 sm:mb-4 transition-colors duration-500", done ? "bg-gold/50" : "bg-studio-border")} />
              )}
            </li>
          )
        })}
      </ol>
      <p className="sm:hidden text-center text-[11px] tracking-[0.2em] uppercase text-gold mt-3">
        Step {step} of {steps.length} · {steps[step - 1]}
      </p>
    </nav>
  )
}
