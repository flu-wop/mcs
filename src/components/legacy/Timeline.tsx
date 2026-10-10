"use client"
// Legacy timeline: the vertical rule fills with gold as you scroll through it.
import { useRef } from "react"
import { motion, useScroll, useSpring } from "framer-motion"
import { MapPin } from "lucide-react"
import type { ReactNode } from "react"
import { Badge } from "@flu-wop/design-system"
import { Reveal, usePrefersLessMotion } from "@flu-wop/design-system/motion"

/** `icon` is a rendered element: component functions can't cross from the server page into this client component. */
export interface TimelineEntry { year: string; city: string; icon: ReactNode; title: string; body: string; tags: string[] }

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const less = usePrefersLessMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <div ref={ref} className="relative">
      <div aria-hidden className="absolute left-7 top-0 bottom-0 w-px bg-studio-border" />
      <motion.div aria-hidden className="absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-gold/80 to-gold/40 origin-top"
        style={{ scaleY: less ? 1 : fill }} />
      <ol>
        {entries.map(({ year, city, icon, title, body, tags }) => (
          <Reveal as="li" key={year + title} className="relative flex gap-6 sm:gap-8 pb-14 last:pb-0">
            <div className="relative z-10 shrink-0">
              <div className="w-14 h-14 rounded-full border border-gold/40 bg-studio-dark grid place-items-center shadow-[0_0_0_6px_var(--if-surface)]">
                {icon}
              </div>
            </div>
            <div className="flex-1 pt-3 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className="font-display text-2xl text-gold">{year}</span>
                <span className="text-mist text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{city}</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl text-cream mb-3">{title}</h3>
              <p className="text-mist text-sm leading-relaxed mb-4">{body}</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => <Badge key={tag} variant="neutral" className="text-[10px]">{tag}</Badge>)}
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  )
}
