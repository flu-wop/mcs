"use client"
// Insights → Overview: money in, where it came from, and who visited.
import type { Insights } from "@/lib/insights"
import { ColumnChart, BarList, Legend } from "../charts"
import { Card, CardTitle, Empty, Stat, C_STUDIO, C_MERCH, C_VISITS, money, num, secs } from "../ui"

export function Overview({ data }: { data: Insights }) {
  const k = data.kpis
  const devices = Object.entries(data.devices).filter(([, v]) => v > 0)
  const devTotal = devices.reduce((s, [, v]) => s + v, 0)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Revenue" value={money(k.revenue)} cur={k.revenue} prev={k.revenuePrev} sub={`vs prior ${data.range.days}d`} />
        <Stat label="Studio hours" value={num(k.hours)} cur={k.hours} prev={k.hoursPrev} sub={`${num(k.bookings)} sessions`} />
        <Stat label="Merch orders" value={num(k.orders)} cur={k.orders} prev={k.ordersPrev} sub={money(k.merchRevenue)} />
        <Stat label="Visitors" value={num(k.visitors)} cur={k.visitorsPrev ? k.visitors : undefined} prev={k.visitorsPrev || undefined} />
      </div>

      <Card>
        <CardTitle title="Revenue" hint="Studio sessions are counted on the day they were paid for."
          right={<Legend items={[{ label: "Studio", color: C_STUDIO }, { label: "Merch", color: C_MERCH }]} />} />
        {k.revenue ? (
          <ColumnChart rows={data.daily} series={[{ key: "studio", label: "Studio", color: C_STUDIO }, { key: "merch", label: "Merch", color: C_MERCH }]} />
        ) : <Empty>No sales in this range yet.</Empty>}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <Card>
          <CardTitle title="Visitors" hint="People, not page loads. Counted without cookies." />
          {data.daily.some(d => d.visitors) ? (
            <ColumnChart rows={data.daily} series={[{ key: "visitors", label: "Visitors", color: C_VISITS }]} format="count" height={150} />
          ) : <Empty>Visitor counting starts as people browse the site.</Empty>}
        </Card>
        <Card>
          <CardTitle title="Top pages" hint="Views and average time on page" />
          {data.pages.length ? (
            <BarList rows={data.pages.slice(0, 7).map(p => ({ label: p.path === "/" ? "Home" : p.path, value: p.views, note: p.avgTime ? `${secs(p.avgTime)} avg` : undefined }))} color={C_VISITS} />
          ) : <Empty>No page views yet.</Empty>}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <Card>
          <CardTitle title="Where visitors came from" hint="Other sites that sent people here" />
          {data.referrers.length ? <BarList rows={data.referrers.map(r => ({ label: r.host, value: r.visits }))} /> : <Empty>Mostly direct visits so far.</Empty>}
        </Card>
        <Card>
          <CardTitle title="Devices" />
          {devTotal ? (
            <div className="space-y-4">
              <div className="flex h-3 rounded-full overflow-hidden bg-studio-dark">
                {devices.map(([d, v], i) => <div key={d} style={{ width: `${(v / devTotal) * 100}%`, background: [C_STUDIO, C_MERCH, C_VISITS][i % 3] }} />)}
              </div>
              <ul className="grid grid-cols-3 gap-2 text-sm">
                {devices.map(([d, v], i) => (
                  <li key={d}>
                    <span className="flex items-center gap-1.5 text-[11px] text-mist capitalize"><span className="w-2 h-2 rounded-[2px]" style={{ background: [C_STUDIO, C_MERCH, C_VISITS][i % 3] }} />{d}</span>
                    <span className="font-display text-xl text-cream">{Math.round((v / devTotal) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : <Empty>No visits yet.</Empty>}
        </Card>
      </div>
    </div>
  )
}
