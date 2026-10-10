"use client"
// Tall cinematic intro band for sub-pages: eyebrow, big display title,
// optional lede and actions, over an optional parallax photo. The MCS cut of
// Fire on the Bayou's PageHeader, in gold instead of ember.
import Image from "next/image"
import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { Parallax, EASE_CINEMATIC } from "@flu-wop/design-system/motion"

export function PageHeader({ eyebrow, title, lede, image, imageAlt = "", actions, children, compact }: {
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
  image?: string
  imageAlt?: string
  actions?: ReactNode
  children?: ReactNode
  compact?: boolean
}) {
  return (
    <header className={`relative overflow-hidden border-b border-studio-border/50 ${compact ? "pt-32 pb-14 md:pt-40 md:pb-20" : "pt-36 pb-16 md:pt-48 md:pb-24"}`}>
      {image ? (
        <>
          <Parallax speed={0.25} className="absolute inset-0 -top-[12%] h-[124%]">
            <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover object-center" />
          </Parallax>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-studio-black via-studio-black/80 to-studio-black/55" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-studio-black/80 via-transparent to-transparent" />
        </>
      ) : (
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[820px] -translate-x-1/2 opacity-70"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(212,175,119,0.12) 0%, transparent 70%)" }} />
      )}
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE_CINEMATIC }}
          className="mb-6 flex items-center gap-3 text-[11px] tracking-[0.25em] uppercase text-gold/80">
          <span className="inline-block h-px w-10 bg-gold/60" />{eyebrow}
        </motion.p>
        <h1 className="max-w-4xl font-display text-[clamp(2.8rem,8vw,6.5rem)] font-light leading-[0.92] tracking-tight text-cream">
          <motion.span className="block" initial={{ opacity: 0, y: 28, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.08, ease: EASE_CINEMATIC }}>{title}</motion.span>
        </h1>
        {lede && (
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.22, ease: EASE_CINEMATIC }}
            className="mt-7 max-w-xl text-base md:text-lg leading-relaxed text-mist font-light">{lede}</motion.p>
        )}
        {(actions || children) && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.34, ease: EASE_CINEMATIC }} className="mt-9">
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            {children}
          </motion.div>
        )}
      </div>
    </header>
  )
}
