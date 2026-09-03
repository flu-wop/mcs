"use client"
// src/components/admin/AdminShell.tsx
// Persistent nav shell for every /admin/* page — sticky top bar with links
// to all 5 sections, a back-to-admin link, and logout. Wraps children via
// src/app/admin/layout.tsx. Skips its own chrome on /admin/login, which
// renders full-screen with no nav (it's the public, unauthenticated page).

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Package, Calendar, DollarSign, Film, Activity, BarChart3, ArrowLeft } from "lucide-react"
import { LogoutButton } from "./LogoutButton"

const SECTIONS = [
  { href: "/admin/orders",     icon: Package,    label: "Orders" },
  { href: "/admin/bookings",   icon: Calendar,   label: "Bookings" },
  { href: "/admin/payouts",    icon: DollarSign, label: "Payouts" },
  { href: "/admin/streetbeat", icon: Film,       label: "Street Beat" },
  { href: "/admin/funnel",     icon: BarChart3,  label: "Funnel" },
  { href: "/admin/system",     icon: Activity,   label: "System" },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/admin/login") return <>{children}</>

  const isHome = pathname === "/admin"

  return (
    <div className="min-h-screen bg-studio-black">
      <div className="sticky top-0 z-20 border-b border-studio-border bg-studio-black/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            {!isHome && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-mist/50 hover:text-gold text-xs shrink-0 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
            <nav className="flex items-center gap-1">
              {SECTIONS.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/")
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs tracking-wide whitespace-nowrap transition-colors ${
                      active ? "bg-gold/10 text-gold" : "text-mist/50 hover:text-cream"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  )
}
