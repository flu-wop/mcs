// src/components/admin/ui.tsx
// Shared admin building blocks (server-safe: no hooks). The MCS dark/gold
// cut of the Epoch Skin admin system: one page frame, one header, one stat
// tile, one card, so every section lines up the same on phone and desktop.
import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

export function AdminPage({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <main className={`mx-auto ${wide ? "max-w-7xl" : "max-w-6xl"} px-4 sm:px-6 py-6 sm:py-10`}>{children}</main>
}

export function AdminPageHeader({ eyebrow = "Admin", title, description, actions }: {
  eyebrow?: string; title: ReactNode; description?: ReactNode; actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8">
      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.26em] uppercase text-gold/70 mb-1.5">{eyebrow}</p>
        <h1 className="font-display text-3xl sm:text-4xl text-cream leading-tight">{title}</h1>
        {description && <p className="text-sm text-mist/70 mt-1.5">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export const adminBtn = {
  primary: "inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-sm text-[11px] tracking-[0.16em] uppercase bg-gold text-studio-black hover:bg-gold-light transition-colors disabled:opacity-50",
  secondary: "inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-sm text-[11px] tracking-[0.16em] uppercase border border-studio-border bg-studio-charcoal text-mist hover:border-gold/50 hover:text-cream transition-colors disabled:opacity-50",
  ghost: "inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-sm text-xs text-mist hover:text-gold transition-colors",
}

export function Card({ children, className = "", pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return <div className={`bg-studio-charcoal border border-studio-border rounded-sm min-w-0 ${pad ? "p-4 sm:p-6" : ""} ${className}`}>{children}</div>
}

export function CardTitle({ title, hint, right }: { title: ReactNode; hint?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h2 className="font-display text-xl text-cream leading-tight">{title}</h2>
        {hint && <p className="text-xs text-mist/60 mt-1 leading-relaxed">{hint}</p>}
      </div>
      {right}
    </div>
  )
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-3">
      <h2 className="text-[11px] tracking-[0.2em] uppercase text-mist/60">{children}</h2>
      {right}
    </div>
  )
}

export function delta(cur: number, prev: number): { label: string; dir: "up" | "down" | "flat" } | null {
  if (!prev && !cur) return null
  if (!prev) return { label: "New", dir: "up" }
  const change = ((cur - prev) / prev) * 100
  if (Math.abs(change) < 1) return { label: "Flat", dir: "flat" }
  return { label: `${change > 0 ? "+" : ""}${Math.round(change)}%`, dir: change > 0 ? "up" : "down" }
}

export function Stat({ label, value, cur, prev, sub, tone, href }: {
  label: string; value: ReactNode; cur?: number; prev?: number; sub?: ReactNode; tone?: "alert"; href?: string
}) {
  const d = cur !== undefined && prev !== undefined ? delta(cur, prev) : null
  const Icon = d?.dir === "up" ? ArrowUpRight : d?.dir === "down" ? ArrowDownRight : Minus
  const body = (
    <>
      <p className="text-[10px] tracking-[0.18em] uppercase text-mist/60 mb-2 truncate">{label}</p>
      <p className={`font-display text-2xl sm:text-3xl leading-none truncate tabular-nums ${tone === "alert" ? "text-[var(--if-danger-text)]" : "text-cream"}`}>{value}</p>
      <div className="mt-2.5 flex items-center gap-2 text-[11px] min-h-[16px] flex-wrap">
        {d && (
          <span className={`inline-flex items-center gap-0.5 font-medium ${d.dir === "up" ? "text-[var(--if-success)]" : d.dir === "down" ? "text-[var(--if-danger-text)]" : "text-mist/60"}`}>
            <Icon className="w-3 h-3" strokeWidth={2} aria-hidden />{d.label}
          </span>
        )}
        {sub && <span className="text-mist/50 truncate">{sub}</span>}
      </div>
    </>
  )
  const cls = `block bg-studio-charcoal border rounded-sm p-4 sm:p-5 min-w-0 ${tone === "alert" ? "border-red-500/40" : "border-studio-border"}`
  return href ? <Link href={href} className={`${cls} hover:border-gold/50 transition-colors`}>{body}</Link> : <div className={cls}>{body}</div>
}

export function Empty({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="py-10 text-center">
      {title && <p className="font-display text-lg text-cream mb-1">{title}</p>}
      <p className="text-sm text-mist/60 leading-relaxed">{children}</p>
    </div>
  )
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "alert" }) {
  return (
    <p className={`mb-4 text-xs leading-relaxed px-4 py-3 rounded-sm border ${tone === "alert" ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-studio-border bg-studio-dark text-mist"}`}>
      {children}
    </p>
  )
}

/** Tab row that navigates by URL, so tabs survive refresh and share links. */
export function TabLinks({ tabs, active, base, keep }: {
  tabs: { id: string; label: string }[]; active: string; base: string
  /** Other query params to carry across tabs, e.g. { days: "90" }. */
  keep?: Record<string, string | undefined>
}) {
  const href = (id: string, first: boolean) => {
    const q = new URLSearchParams()
    if (!first) q.set("tab", id)
    for (const [k, v] of Object.entries(keep ?? {})) if (v) q.set(k, v)
    return q.size ? `${base}?${q}` : base
  }
  return (
    <div className="-mx-4 sm:mx-0 mb-6 border-b border-studio-border">
      <nav aria-label="Sections" className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar px-4 sm:px-0">
        {tabs.map((t, i) => {
          const on = t.id === active
          return (
            <Link key={t.id} href={href(t.id, i === 0)} scroll={false}
              aria-current={on ? "page" : undefined}
              className={`relative pb-3 pt-1 text-sm whitespace-nowrap shrink-0 transition-colors ${on ? "text-cream" : "text-mist/60 hover:text-cream"}`}>
              {t.label}
              {on && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-gold" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export const money = (n: number, cents = false) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })
export const compactMoney = (n: number) =>
  n >= 1000 ? "$" + (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K" : "$" + Math.round(n)
export const num = (n: number) => n.toLocaleString("en-US")
export const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—")
export const secs = (s: number) => { if (!s) return "—"; const r = Math.round(s); return r >= 60 ? `${Math.floor(r / 60)}m ${r % 60}s` : `${r}s` }
export const hour12 = (h: number) => `${((h + 11) % 12) + 1}${h < 12 || h === 24 ? "am" : "pm"}`
const shortFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
const longFmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })
export const shortDate = (d: string) => shortFmt.format(new Date(d.slice(0, 10) + "T12:00:00Z"))
export const longDate = (d: string) => longFmt.format(new Date(d.slice(0, 10) + "T12:00:00Z"))

/** Chart colors on the studio-dark surface: gold for studio, a cool steel for merch. */
export const C_STUDIO = "#D4AF77"
export const C_MERCH = "#7FA8C4"
export const C_VISITS = "#A89880"
