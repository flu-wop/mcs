// src/app/admin/page.tsx
// Admin home: a 30-day read, anything that needs a human, the next sessions,
// and a way into every section. Server-rendered; protected by middleware.ts.

import Link from "next/link"
import { ArrowRight, AlertTriangle, Radio } from "lucide-react"
import { getInsights } from "@/lib/insights"
import { greeting, todayLocal, addDays } from "@/lib/admin-time"
import { ADMIN_SECTIONS } from "@/components/admin/sections"
import { AdminPage, Card, SectionLabel, Stat, money, num, longDate, hour12, adminBtn } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

export default async function AdminHomePage() {
  const data = await getInsights(30).catch(err => { console.error("[admin home] insights failed:", err); return null })
  const today = todayLocal()
  const tomorrow = addDays(today, 1)
  const k = data?.kpis
  const a = data?.attention
  const live = data?.rooms.filter(r => r.live) ?? []
  const todo = a ? [
    a.unpaidHolds > 0 && { href: "/admin/bookings?status=unpaid", text: `${a.unpaidHolds} booking${a.unpaidHolds === 1 ? "" : "s"} started checkout but never paid`, sub: "Worth a follow-up email" },
    a.failedOrders > 0 && { href: "/admin/orders?status=failed", text: `${a.failedOrders} merch order${a.failedOrders === 1 ? " needs" : "s need"} attention`, sub: "Printify or email failed" },
    a.unassigned > 0 && { href: "/admin/payouts", text: `${a.unassigned} session${a.unassigned === 1 ? "" : "s"} without an engineer`, sub: "Assign so payouts are right" },
    a.owed > 0 && { href: "/admin/payouts", text: `${money(a.owed)} owed to engineers`, sub: "Mark paid after you send it" },
  ].filter(Boolean) as { href: string; text: string; sub: string }[] : []

  return (
    <AdminPage>
      <div className="mb-6 sm:mb-8">
        <p className="text-[10px] tracking-[0.26em] uppercase text-gold/70 mb-1.5">{longDate(today)}</p>
        <h1 className="font-display text-3xl sm:text-4xl text-cream leading-tight">{greeting()}</h1>
      </div>

      {live.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 border border-red-500/30 bg-red-500/[0.06] rounded-sm px-4 py-3">
          {live.map(r => (
            <p key={r.id} className="flex items-center gap-2 text-sm text-cream">
              <span className="relative flex w-2.5 h-2.5"><span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60 motion-safe:animate-ping" /><span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-red-500" /></span>
              <span><span className="text-[10px] tracking-[0.2em] uppercase text-red-300 mr-2">Recording</span>{r.name} · {r.live!.client} until {hour12(r.live!.until)}</span>
            </p>
          ))}
        </div>
      )}

      <section aria-label="Last 30 days" className="mb-8">
        <SectionLabel right={<Link href="/admin/insights" className="text-xs text-gold/80 hover:text-gold inline-flex items-center gap-1">All insights <ArrowRight className="w-3 h-3" /></Link>}>
          Last 30 days
        </SectionLabel>
        {k ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Revenue" value={money(k.revenue)} cur={k.revenue} prev={k.revenuePrev} sub="vs prior 30d" />
            <Stat label="Sessions booked" value={num(k.bookings)} cur={k.bookings} prev={k.bookingsPrev} sub={money(k.studioRevenue)} />
            <Stat label="Merch orders" value={num(k.orders)} cur={k.orders} prev={k.ordersPrev} sub={money(k.merchRevenue)} />
            <Stat label="Visitors" value={num(k.visitors)} cur={k.visitorsPrev ? k.visitors : undefined} prev={k.visitorsPrev || undefined}
              sub={data?.trackingSince ? undefined : "Counting from today"} />
          </div>
        ) : (
          <Card><p className="text-sm text-mist">Couldn&apos;t load numbers right now. The sections below still work.</p></Card>
        )}
      </section>

      <div className="grid gap-8 lg:gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-8 min-w-0">
          {todo.length > 0 && (
            <section aria-label="Needs attention">
              <SectionLabel>Needs attention</SectionLabel>
              <ul className="border border-studio-border rounded-sm bg-studio-charcoal divide-y divide-studio-border">
                {todo.map(t => (
                  <li key={t.text}>
                    <Link href={t.href} className="group flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-studio-dark transition-colors">
                      <AlertTriangle className="w-4 h-4 text-gold shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-cream">{t.text}</span>
                        <span className="block text-[11px] text-mist/60">{t.sub}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-mist/40 group-hover:text-gold transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-label="Upcoming sessions">
            <SectionLabel right={<a href="/api/calendar.ics" className="text-xs text-gold/80 hover:text-gold">Calendar feed</a>}>Coming up</SectionLabel>
            <div className="border border-studio-border rounded-sm bg-studio-charcoal">
              {!data?.upcoming.length ? (
                <div className="p-6 text-center">
                  <p className="font-display text-lg text-cream mb-1">Nothing on the books yet</p>
                  <p className="text-sm text-mist/60">Confirmed sessions will show up here.</p>
                </div>
              ) : (
                <ul className="divide-y divide-studio-border">
                  {data.upcoming.map(b => {
                    const when = b.date === today ? "Today" : b.date === tomorrow ? "Tomorrow" : longDate(b.date).split(",")[0]
                    return (
                      <li key={b.id} className="flex gap-4 px-4 sm:px-5 py-3.5">
                        <div className="w-[76px] shrink-0">
                          <p className={`text-[10px] tracking-[0.14em] uppercase ${b.date === today ? "text-gold font-medium" : "text-mist/60"}`}>{when}</p>
                          <p className="text-sm text-cream tabular-nums whitespace-nowrap">{hour12(b.start)}–{hour12(b.start + b.hours)}</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-cream font-medium truncate">{b.client}</p>
                          <p className="text-xs text-mist truncate">Studio {b.room} · {b.label}{b.engineer ? ` · ${b.engineer}` : ""}</p>
                          <p className="text-[11px] text-mist/50 truncate">{b.date !== today && b.date !== tomorrow ? `${longDate(b.date)} · ` : ""}{money(b.price)}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
              <Link href="/admin/bookings" className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-studio-border text-xs text-mist hover:text-cream">
                All bookings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        </div>

        <section aria-label="Sections">
          <SectionLabel>Go to</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {ADMIN_SECTIONS.filter(s => s.href !== "/admin").map(({ href, label, icon: Icon, desc }) => {
              const hero = href === "/admin/insights"
              return (
                <Link key={href} href={href}
                  className={`group border rounded-sm p-4 transition-colors min-w-0 ${hero
                    ? "col-span-2 border-gold/40 bg-[radial-gradient(ellipse_80%_120%_at_0%_0%,rgba(212,175,119,0.16),transparent)] hover:border-gold"
                    : "bg-studio-charcoal border-studio-border hover:border-gold/50"}`}>
                  <div className="flex items-start justify-between">
                    <Icon className="w-4 h-4 mb-3 text-gold" strokeWidth={1.6} />
                    {hero && <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.18em] uppercase text-gold/80"><Radio className="w-3 h-3" />Room Map</span>}
                  </div>
                  <p className="font-display text-lg leading-tight text-cream">{label}</p>
                  <p className="text-xs mt-1 leading-snug text-mist/60">{desc}</p>
                </Link>
              )
            })}
          </div>
          <Link href="/studio" className={`${adminBtn.secondary} w-full mt-3`}>Open the booking page</Link>
        </section>
      </div>
    </AdminPage>
  )
}
