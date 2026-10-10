// Eyebrow + display heading (+ optional lede/aside) used at the top of sections.
import type { ReactNode } from "react"
import { Reveal } from "@flu-wop/design-system/motion"

export function SectionIntro({ eyebrow, title, lede, aside, center }: {
  eyebrow: string; title: ReactNode; lede?: ReactNode; aside?: ReactNode; center?: boolean
}) {
  return (
    <Reveal className={`mb-12 md:mb-14 ${center ? "text-center" : "flex flex-wrap items-end justify-between gap-6"}`}>
      <div className={center ? "mx-auto max-w-2xl" : "max-w-2xl"}>
        <p className={`mb-4 flex items-center gap-3 text-[11px] tracking-[0.25em] uppercase text-gold/80 ${center ? "justify-center" : ""}`}>
          <span className="inline-block h-px w-8 bg-gold/50" />{eyebrow}{center && <span className="inline-block h-px w-8 bg-gold/50" />}
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-cream leading-[1.02]">{title}</h2>
        {lede && <p className={`text-mist text-sm md:text-base mt-4 leading-relaxed ${center ? "mx-auto max-w-md" : "max-w-lg"}`}>{lede}</p>}
      </div>
      {aside && !center && <div className="shrink-0">{aside}</div>}
    </Reveal>
  )
}
