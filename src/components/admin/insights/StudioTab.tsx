"use client"
// Insights → Studio: engineers and packages.
import type { Insights } from "@/lib/insights"
import { BarList } from "../charts"
import { Card, CardTitle, Empty, money, num } from "../ui"

export function StudioTab({ data }: { data: Insights }) {
  const eng = data.engineers.filter(e => e.sessions)
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <Card>
          <CardTitle title="Engineers" hint="Hours worked in this range, by session date" />
          {eng.length ? <BarList format="hours" rows={eng.map(e => ({ label: e.name, value: e.hours, note: `${num(e.sessions)} sessions · ${money(e.revenue)}` }))} /> : <Empty>No sessions in this range.</Empty>}
        </Card>
        <Card>
          <CardTitle title="Packages" hint="What people paid for, and how often each was picked" />
          {data.packages.length ? (
            <BarList format="money" rows={data.packages.map(p => ({ label: p.label, value: p.revenue, note: `${num(p.sessions)} sold${p.picks ? ` · picked ${num(p.picks)}×` : ""}` }))} />
          ) : <Empty>No packages sold in this range.</Empty>}
        </Card>
      </div>
      <Card>
        <CardTitle title="Rooms at a glance" hint="Revenue by room. Open the Room Map tab for when and how busy." />
        <BarList format="money" rows={data.rooms.map(r => ({ label: `${r.name} · ${r.role}`, value: r.revenue, note: `${num(r.hours)} hrs · ${Math.round(r.utilization * 100)}% booked` }))} />
      </Card>
    </div>
  )
}
