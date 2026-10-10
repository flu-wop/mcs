"use client"
// Insights → Merch: sales by brand and the best sellers.
import type { Insights } from "@/lib/insights"
import { BarList } from "../charts"
import { Card, CardTitle, Empty, C_MERCH, money, num } from "../ui"

export function MerchTab({ data }: { data: Insights }) {
  const any = data.brands.some(b => b.revenue)
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardTitle title="By brand" hint="One Printify store, four brands" />
        {any ? <BarList format="money" color={C_MERCH} rows={data.brands.map(b => ({ label: b.label, value: b.revenue, note: `${num(b.units)} items` }))} /> : <Empty>No merch sold in this range.</Empty>}
      </Card>
      <Card>
        <CardTitle title="Best sellers" />
        {data.products.length ? <BarList format="money" color={C_MERCH} rows={data.products.map(p => ({ label: p.name, value: p.revenue, note: `${num(p.units)} sold` }))} /> : <Empty>Best sellers show up after the first orders.</Empty>}
      </Card>
    </div>
  )
}
