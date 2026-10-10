"use client"
// src/components/layout/ConditionalChrome.tsx
// Public chrome: Navbar/Footer plus the shared motion layer (Lenis smooth
// scroll, film grain, back-to-top). /admin/* gets none of it: AdminShell
// draws its own nav, and admin tables scroll natively.

import { usePathname } from "next/navigation"
import { SmoothScroll, GrainOverlay, ScrollToTop } from "@flu-wop/design-system/motion"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics"

export function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) return <>{children}</>

  return (
    <SmoothScroll>
      <Navbar />
      {children}
      <Footer />
      <ScrollToTop />
      <GrainOverlay opacity={0.04} glow={0.06} />
      <SiteAnalytics />
    </SmoothScroll>
  )
}
