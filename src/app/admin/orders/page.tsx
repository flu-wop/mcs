// src/app/admin/orders/page.tsx
// Admin dashboard — all merch orders from Turso.
// Access at /admin/orders — protected by src/middleware.ts (admin session cookie)

import { getDB, initDB } from "@/lib/db"
import { Separator }     from "@/components/ui/separator"
import { OrdersFilterList } from "@/components/admin/OrdersFilterList"

interface MerchOrderRow {
  id:                 string
  stripe_session_id:  string
  customer_name:      string
  customer_email:     string
  shipping_address:   string  // JSON
  items:              string  // JSON
  total_paid:         number  // cents
  discount_code:      string
  status:             string
  printify_order_id:  string | null
  printify_error:     string | null
  email_error:        string | null
  created_at:         string
}

// Force dynamic rendering — this page requires Turso at runtime
export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  await initDB()

  const result = await getDB().execute(
    "SELECT * FROM merch_orders ORDER BY created_at DESC"
  )
  const orders = result.rows as unknown as MerchOrderRow[]

  const failed  = orders.filter(o => o.status === "printify_failed" || o.email_error).length
  const revenue = orders.reduce((sum, o) => sum + o.total_paid, 0)

  return (
    <div className="pt-10 px-6 pb-20">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-cream">Merch Orders</h1>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Orders",  val: orders.length },
            { label: "Needs Attention", val: failed, alert: failed > 0 },
            { label: "Revenue",       val: `$${(revenue / 100).toFixed(2)}` },
          ].map(({ label, val, alert }) => (
            <div
              key={label}
              className={`border rounded-sm p-5 bg-studio-charcoal ${alert ? 'border-red-500/50' : 'border-studio-border'}`}
            >
              <p className="text-mist text-[10px] uppercase tracking-widest mb-1">{label}</p>
              <p className={`font-display text-3xl ${alert ? 'text-red-400' : 'text-gold'}`}>{val}</p>
            </div>
          ))}
        </div>

        <Separator className="mb-8 bg-studio-border/40" />

        <OrdersFilterList orders={orders} />
      </div>
    </div>
  )
}
