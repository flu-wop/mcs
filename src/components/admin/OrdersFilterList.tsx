"use client"
// src/components/admin/OrdersFilterList.tsx
// Search (name/email/item) + status filter + pagination over the full
// orders list handed down from the server component. Stats row on the
// page stays computed from the unfiltered set — this only affects the
// list below it.

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle, Search } from "lucide-react"
import { RetryPrintifyButton } from "@/components/admin/RetryPrintifyButton"
import { MarkResolvedButton } from "@/components/admin/MarkResolvedButton"

interface MerchOrderRow {
  id:                 string
  stripe_session_id:  string
  customer_name:      string
  customer_email:     string
  shipping_address:   string
  items:              string
  total_paid:         number
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

const PAGE_SIZE = 20

type StatusFilter = "all" | "failed" | "submitted"

export function OrdersFilterList({ orders }: { orders: MerchOrderRow[] }) {
  const [query, setQuery]   = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [page, setPage]     = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter(o => {
      const failedOrder = o.status === "printify_failed" || !!o.email_error
      if (status === "failed" && !failedOrder) return false
      if (status === "submitted" && failedOrder) return false
      if (!q) return true
      const items: OrderItem[] = (() => { try { return JSON.parse(o.items) } catch { return [] } })()
      const haystack = [
        o.customer_name, o.customer_email, o.discount_code,
        ...items.map(i => i.name),
      ].join(" ").toLowerCase()
      return haystack.includes(q)
    })
  }, [orders, query, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const pageItems = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  function updateQuery(v: string) { setQuery(v); setPage(1) }
  function updateStatus(v: StatusFilter) { setStatus(v); setPage(1) }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-mist/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => updateQuery(e.target.value)}
            placeholder="Search name, email, or item…"
            className="w-full bg-studio-charcoal border border-studio-border rounded-sm pl-9 pr-3 py-2
              text-xs text-cream placeholder:text-mist/30 focus:outline-none focus:border-gold/40"
          />
        </div>
        <div className="flex gap-1 shrink-0">
          {([
            { key: "all",       label: "All" },
            { key: "failed",    label: "Needs Attention" },
            { key: "submitted", label: "Submitted" },
          ] as { key: StatusFilter; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateStatus(key)}
              className={`px-3 py-2 rounded-sm text-[11px] uppercase tracking-wide whitespace-nowrap transition-colors border ${
                status === key
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-studio-border text-mist/50 hover:text-cream"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <Package className="w-10 h-10 text-mist/20 mx-auto mb-4" />
          <p className="text-mist/40 text-sm">No orders match.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {pageItems.map(o => {
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

                    <div className="text-xs text-mist space-y-0.5">
                      {items.map((item, i) => (
                        <div key={i}>
                          {item.name}{item.variantName ? ` — ${item.variantName}` : ''} × {item.quantity}
                        </div>
                      ))}
                    </div>

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
                        <div className="flex items-center gap-3 flex-wrap">
                          <RetryPrintifyButton orderId={o.id} />
                          <MarkResolvedButton orderId={o.id} />
                        </div>
                      </div>
                    )}
                    {emailFailed && (
                      <p className="text-red-400/80 text-xs italic border-t border-red-500/20 pt-2 mt-2">
                        Email: {o.email_error} — customer was NOT notified, follow up manually.
                      </p>
                    )}
                  </div>

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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 text-xs text-mist/50">
              <span>
                Page {pageSafe} of {totalPages} · {filtered.length} order{filtered.length === 1 ? "" : "s"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pageSafe === 1}
                  className="px-3 py-1.5 border border-studio-border rounded-sm hover:text-gold hover:border-gold/40 disabled:opacity-30 disabled:hover:text-mist/50 disabled:hover:border-studio-border transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={pageSafe === totalPages}
                  className="px-3 py-1.5 border border-studio-border rounded-sm hover:text-gold hover:border-gold/40 disabled:opacity-30 disabled:hover:text-mist/50 disabled:hover:border-studio-border transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
