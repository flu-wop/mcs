"use client"
// Lenis-aware scroll-to-element: native scrollIntoView fights Lenis's own
// scroll position, so route through Lenis when it's running.
import { useCallback } from "react"
import { useLenis } from "lenis/react"

export function useScrollTo(offset = -88) {
  const lenis = useLenis()
  return useCallback((el: HTMLElement | null) => {
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (lenis && !reduce) lenis.scrollTo(el, { offset, duration: 1.1 })
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduce ? "auto" : "smooth" })
  }, [lenis, offset])
}
