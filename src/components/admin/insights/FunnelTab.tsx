"use client"
// Insights → Funnel: where people drop off, plus checkouts that never paid.
import type { Insights } from "@/lib/insights"
import { Funnel } from "../charts"
import { Card, CardTitle, Empty, C_STUDIO, C_MERCH } from "../ui"

export function FunnelTab({ data }: { data: Insights }) {
  const fmt = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <Card><CardTitle title="Studio booking" hint="Visitors → paid sessions" /><Funnel steps={data.funnels.booking} color={C_STUDIO} /></Card>
        <Card><CardTitle title="Merch" hint="Visitors → paid orders" /><Funnel steps={data.funnels.merch} color={C_MERCH} /></Card>
      </div>
      <Card pad={false}>
        <div className="p-4 sm:p-6 pb-0 sm:pb-0"><CardTitle title="Checkouts that didn't finish" hint="Started paying, no payment from the same visitor within 3 hours" /></div>
        {data.abandoned.length ? (
          <ul className="divide-y divide-studio-border border-t border-studio-border">
            {data.abandoned.map((a, i) => (
              <li key={i} className="flex items-center gap-3 px-4 sm:px-6 py-3 text-sm">
                <span className={`text-[10px] tracking-[0.16em] uppercase px-2 py-0.5 rounded-sm border shrink-0 ${a.kind === "booking" ? "border-gold/40 text-gold" : "border-[#7FA8C4]/40 text-[#9DBFD6]"}`}>{a.kind === "booking" ? "Studio" : "Merch"}</span>
                <span className="text-cream truncate flex-1">{a.detail || "—"}</span>
                <span className="text-[11px] text-mist/60 shrink-0 tabular-nums">{fmt(a.when)}</span>
              </li>
            ))}
          </ul>
        ) : <div className="px-4 sm:px-6 pb-4"><Empty>None in this range.</Empty></div>}
      </Card>
    </div>
  )
}
