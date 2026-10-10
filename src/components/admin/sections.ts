// src/components/admin/sections.ts
// The admin sections, shared by the client nav (AdminShell) and the server
// home page. Kept out of the "use client" shell file so server components
// can read it as plain data.
import { Home, Sparkles, Calendar, Package, DollarSign, Film, Activity } from "lucide-react"

export const ADMIN_SECTIONS = [
  { href: "/admin",            label: "Home",        icon: Home,       desc: "" },
  { href: "/admin/insights",   label: "Insights",    icon: Sparkles,   desc: "Sales, visitors, Room Map & content plan" },
  { href: "/admin/bookings",   label: "Bookings",    icon: Calendar,   desc: "Studio sessions & calendar feed" },
  { href: "/admin/orders",     label: "Orders",      icon: Package,    desc: "Merch orders & Printify status" },
  { href: "/admin/payouts",    label: "Payouts",     icon: DollarSign, desc: "What each engineer is owed" },
  { href: "/admin/streetbeat", label: "Street Beat", icon: Film,       desc: "Film sales, live + legacy" },
  { href: "/admin/system",     label: "System",      icon: Activity,   desc: "Env vars, webhooks, integrations" },
] as const
