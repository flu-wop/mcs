// src/app/admin/orders/page.tsx
// Merch orders from Turso. Protected by src/middleware.ts.
// ?status=failed opens on the orders that need a human (linked from admin home).

import { getDB, initDB } from "@/lib/db"
import { OrdersFilterList } from "@/components/admin/OrdersFilterList"
import { AdminPage, AdminPageHeader, Stat, money, num } from "@/components/admin/ui"

interface MerchOrderRow {
  id: string; stripe_session_id: string; customer_name: string; customer_email: string
  shipping_address: string; items: string; total_paid: number; discount_code: string; status: string
  printify_order_id: string | null; printify_error: string | null; email_error: string | null; created_at: string
}

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams
  await initDB()
  const result = await getDB().execute("SELECT * FROM merch_orders ORDER BY created_at DESC")
  const orders = result.rows.map(r => ({ ...r })) as unknown as MerchOrderRow[]
  const failed = orders.filter(o => o.status === "printify_failed" || o.email_error).length
  const revenue = orders.reduce((s, o) => s + Number(o.total_paid), 0) / 100
  const monthAgo = Date.now() - 30 * 86400_000
  const recent = orders.filter(o => new Date(String(o.created_at).replace(" ", "T") + "Z").getTime() >= monthAgo)

  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Merch" title="Orders" description="Paid orders across MCS, Donald Markowitz, Street Beat and Lil Squiggle" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Stat label="Needs attention" value={num(failed)} tone={failed ? "alert" : undefined} sub={failed ? "Printify or email failed" : "All clear"} />
        <Stat label="Last 30 days" value={num(recent.length)} sub={money(recent.reduce((s, o) => s + Number(o.total_paid), 0) / 100)} />
        <Stat label="Orders" value={num(orders.length)} sub="all time" />
        <Stat label="Revenue" value={money(revenue, true)} sub="all time" />
      </div>
      <OrdersFilterList orders={orders} initialStatus={sp.status === "failed" ? "failed" : sp.status === "submitted" ? "submitted" : "all"} />
    </AdminPage>
  )
}
