"use client"
// Photo grid with a keyboard-friendly lightbox. Captions show on hover on
// desktop and always on phones (there's no hover on touch).
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useLenis } from "lenis/react"
import { Reveal } from "@flu-wop/design-system/motion"

export interface ArchivePhoto { src: string; alt: string; caption?: string }

export function PhotoArchive({ photos }: { photos: ArchivePhoto[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const lenis = useLenis()
  const close = useCallback(() => setOpen(null), [])
  const step = useCallback((d: number) => setOpen(i => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length])

  useEffect(() => {
    if (open === null) return
    lenis?.stop()
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowRight") step(1)
      if (e.key === "ArrowLeft") step(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; lenis?.start() }
  }, [open, close, step, lenis])

  const cur = open === null ? null : photos[open]

  return (
    <>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {photos.map((p, i) => (
          <Reveal as="li" key={p.src} delay={(i % 3) * 0.06}>
            <button type="button" onClick={() => setOpen(i)} aria-label={`Open photo: ${p.caption ?? p.alt}`}
              className="group relative block w-full aspect-square bg-studio-dark border border-studio-border rounded-sm overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
              <Image src={p.src} alt={p.alt} fill sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
              {p.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-studio-black/85 to-transparent p-3 pt-10 text-left text-cream text-[11px] tracking-wide md:opacity-0 md:group-hover:opacity-100 md:translate-y-1 md:group-hover:translate-y-0 transition-all duration-300">
                  {p.caption}
                </span>
              )}
            </button>
          </Reveal>
        ))}
      </ul>

      <AnimatePresence>
        {cur && (
          <motion.div role="dialog" aria-modal="true" aria-label={cur.caption ?? cur.alt}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-studio-black/95 backdrop-blur-sm flex flex-col" onClick={close}>
            <div className="flex items-center justify-between px-5 h-16 shrink-0 text-mist">
              <span className="text-xs tabular-nums">{open! + 1} / {photos.length}</span>
              <button type="button" onClick={close} aria-label="Close" autoFocus className="w-10 h-10 grid place-items-center hover:text-cream"><X className="w-5 h-5" /></button>
            </div>
            <div className="relative flex-1 mx-4 sm:mx-16" onClick={e => e.stopPropagation()}>
              <motion.div key={cur.src} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                <Image src={cur.src} alt={cur.alt} fill sizes="100vw" className="object-contain" />
              </motion.div>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-5 shrink-0" onClick={e => e.stopPropagation()}>
              <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="w-11 h-11 grid place-items-center border border-studio-border rounded-full text-mist hover:text-gold hover:border-gold/50"><ChevronLeft className="w-5 h-5" /></button>
              <p className="text-cream text-sm text-center">{cur.caption ?? cur.alt}</p>
              <button type="button" onClick={() => step(1)} aria-label="Next photo" className="w-11 h-11 grid place-items-center border border-studio-border rounded-full text-mist hover:text-gold hover:border-gold/50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
