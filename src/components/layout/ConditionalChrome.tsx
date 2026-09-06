"use client"
// src/components/layout/ConditionalChrome.tsx
// The public Navbar/Footer were rendering on /admin/* too, stacking on
// top of AdminShell's own sticky nav — this hides them there instead of
// restructuring every route into a route group, which would touch every
// page file for a one-line fix.

import { usePathname } from "next/navigation"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

export function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) return <>{children}</>

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
