// src/app/admin/page.tsx
// Admin landing page — links to /admin/orders and /admin/bookings.
// Protected by src/middleware.ts (HTTP Basic Auth), same as its children.

import Link from "next/link"
import { getDB, initDB } from "@/lib/db"
import { Package, Calendar, ArrowRight } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminHomePage() {
  await initDB()
  const db = getDB()

  const [ordersResult, bookingsResult] = await Promise.all([
    db.execute("SELECT COUNT(*) as count, COALESCE(SUM(total_paid), 0) as revenue FROM merch_orders"),
    db.execute("SELECT COUNT(*) as count FROM bookings"),
  ])

  const orderCount   = Number(ordersResult.rows[0].count)
  const orderRevenue = Number(ordersResult.rows[0].revenue) / 100
  const bookingCount = Number(bookingsResult.rows[0].count)

  const sections = [
    {
      href: "/admin/orders",
      icon: Package,
      label: "Merch Orders",
      stat: `${orderCount} order${orderCount === 1 ? '' : 's'} · $${orderRevenue.toFixed(2)}`,
    },
    {
      href: "/admin/bookings",
      icon: Calendar,
      label: "Studio Bookings",
      stat: `${bookingCount} booking${bookingCount === 1 ? '' : 's'}`,
    },
  ]

  return (
    <div className="min-h-screen bg-studio-black pt-20 px-6 pb-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] tracking-widest uppercase text-gold/60 mb-1">Admin</p>
        <h1 className="font-display text-4xl text-cream mb-10">Mid City Sound</h1>

        <div className="grid sm:grid-cols-2 gap-4">
          {sections.map(({ href, icon: Icon, label, stat }) => (
            <Link
              key={href}
              href={href}
              className="group border border-studio-border bg-studio-charcoal rounded-sm p-6
                hover:border-gold/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-6 h-6 text-gold/70" />
                <ArrowRight className="w-4 h-4 text-mist/30 group-hover:text-gold transition-colors" />
              </div>
              <p className="text-cream font-display text-xl mb-1">{label}</p>
              <p className="text-mist text-xs uppercase tracking-wide">{stat}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
