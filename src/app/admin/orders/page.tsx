// src/app/admin/orders/page.tsx
// Admin dashboard — all merch orders from Turso.
// Access at /admin/orders — protected by src/middleware.ts (admin session cookie)

import { getDB, initDB } from "@/lib/db"
import { Badge }         from "@/components/ui/badge"
import { Separator }     from "@/components/ui/separator"
import { Package, AlertTriangle } from "lucide-react"
import { RetryPrintifyButton } from "@/components/admin/RetryPrintifyButton"

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

interface ShippingAddress {
  line1: string; line2?: string; city: string; region: string; zip: string; country: string
}
interface OrderItem {
  name: string; variantName: string; quantity: number; price: number
}

function statusColor(status: string) {
  return status === "submitted" ? "default" : "outline"
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
    <div className="min-h-screen bg-studio-black pt-20 px-6 pb-20">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-gold/60 mb-1">Admin</p>
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

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <Package className="w-10 h-10 text-mist/20 mx-auto mb-4" />
            <p className="text-mist/40 text-sm">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => {
              const address: ShippingAddress = JSON.parse(o.shipping_address)
              const items: OrderItem[] = JSON.parse(o.items)
              const printifyFailed = o.status === "printify_failed"
              const emailFailed    = !!o.email_error
              const failedOrder    = printifyFailed || emailFailed

              return (
                <div
                  key={o.id}
                  className={`border bg-studio-charcoal rounded-sm p-5 grid md:grid-cols-[1fr_auto] gap-4
                    ${failedOrder ? 'border-red-500/40' : 'border-studio-border'}`}
                >
                  <div className="space-y-2">
                    {/* Customer + status */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-cream font-medium text-sm">{o.customer_name}</p>
                      <Badge
                        variant={statusColor(o.status)}
                        className={`text-[10px] uppercase tracking-wide ${failedOrder ? 'border-red-500 text-red-400' : ''}`}
                      >
                        {failedOrder ? (
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {printifyFailed && emailFailed
                              ? 'Printify + Email Failed'
                              : printifyFailed ? 'Printify Failed' : 'Email Failed'}
                          </span>
                        ) : 'Submitted'}
                      </Badge>
                      <span className="text-gold text-xs font-display">
                        ${(o.total_paid / 100).toFixed(2)}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="text-xs text-mist space-y-0.5">
                      {items.map((item, i) => (
                        <div key={i}>
                          {item.name}{item.variantName ? ` — ${item.variantName}` : ''} × {item.quantity}
                        </div>
                      ))}
                    </div>

                    {/* Email + address */}
                    <div className="text-xs text-mist/60 space-y-0.5">
                      <a href={`mailto:${o.customer_email}`} className="hover:text-gold transition-colors">
                        {o.customer_email}
                      </a>
                      <p className="text-mist/40">
                        {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.region} {address.zip}
                      </p>
                      {o.discount_code && (
                        <p className="text-mist/40">Discount: {o.discount_code}</p>
                      )}
                    </div>

                    {printifyFailed && o.printify_error && (
                      <div className="border-t border-red-500/20 pt-2 mt-2 space-y-1.5">
                        <p className="text-red-400/80 text-xs italic">
                          Printify: {o.printify_error} — create this order manually in Printify.
                        </p>
                        <RetryPrintifyButton orderId={o.id} />
                      </div>
                    )}
                    {emailFailed && (
                      <p className="text-red-400/80 text-xs italic border-t border-red-500/20 pt-2 mt-2">
                        Email: {o.email_error} — customer was NOT notified, follow up manually.
                      </p>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="text-right text-[10px] text-mist/30 space-y-1">
                    <p>{new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    <a
                      href={`https://dashboard.stripe.com/payments/${o.stripe_session_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gold transition-colors font-mono block"
                    >
                      Stripe →
                    </a>
                    {o.printify_order_id && (
                      <a
                        href="https://printify.com/app/orders"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gold transition-colors font-mono block"
                      >
                        Printify →
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
