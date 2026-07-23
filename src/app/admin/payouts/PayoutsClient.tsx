"use client"
// src/app/admin/payouts/PayoutsClient.tsx

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ENGINEERS, engineerName } from "@/lib/engineers"
import type { PayoutBooking } from "./page"

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function PayoutsClient({ bookings }: { bookings: PayoutBooking[] }) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Record<string, string>>({})

  const needsAssignment = useMemo(
    () => bookings.filter(b => !b.engineer_slug),
    [bookings]
  )

  const byEngineer = useMemo(() => {
    const map = new Map<string, PayoutBooking[]>()
    for (const b of bookings) {
      if (!b.engineer_slug) continue
      const list = map.get(b.engineer_slug) ?? []
      list.push(b)
      map.set(b.engineer_slug, list)
    }
    return map
  }, [bookings])

  async function assignEngineer(bookingId: string) {
    const engineerSlug = selected[bookingId]
    if (!engineerSlug) return
    setBusyId(bookingId)
    try {
      const res = await fetch("/api/admin/assign-engineer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, engineerSlug }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to assign")
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to assign engineer")
    } finally {
      setBusyId(null)
    }
  }

  async function markPaid(bookingIds: string[]) {
    setBusyId(bookingIds[0])
    try {
      const res = await fetch("/api/admin/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingIds }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to mark paid")
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to mark paid")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-12">

      {/* ── Needs Assignment ── */}
      {needsAssignment.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-cream mb-1">Needs Assignment</h2>
          <p className="text-mist/50 text-xs mb-4">
            Generic /studio bookings — assign the engineer who worked the session to include it in payouts ($30/hr).
          </p>
          <div className="space-y-2">
            {needsAssignment.map(b => (
              <div key={b.id} className="border border-studio-border bg-studio-charcoal rounded-sm p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <p className="text-cream">{b.client_name} · Studio {b.room}</p>
                  <p className="text-mist/60 text-xs">{formatDate(b.date)} · {b.rate_label} · {b.rate_hours}hr</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="bg-studio-black border border-studio-border rounded-sm text-mist text-xs px-2 py-2"
                    value={selected[b.id] ?? ""}
                    onChange={e => setSelected(s => ({ ...s, [b.id]: e.target.value }))}
                  >
                    <option value="">Select engineer…</option>
                    {ENGINEERS.map(e => (
                      <option key={e.slug} value={e.slug}>{e.name}</option>
                    ))}
                  </select>
                  <Button
                    disabled={!selected[b.id] || busyId === b.id}
                    onClick={() => assignEngineer(b.id)}
                    className="text-xs"
                  >
                    {busyId === b.id ? "Assigning…" : "Assign"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-studio-border/40" />

      {/* ── Owed by Engineer ── */}
      <div>
        <h2 className="font-display text-xl text-cream mb-4">Payouts by Engineer</h2>
        {byEngineer.size === 0 ? (
          <p className="text-mist/40 text-sm">No engineer-attributed bookings yet.</p>
        ) : (
          <div className="space-y-6">
            {[...byEngineer.entries()].map(([slug, list]) => {
              const unpaid = list.filter(b => b.payout_status === "unpaid")
              const paidTotal = list.filter(b => b.payout_status === "paid")
                .reduce((sum, b) => sum + (b.payout_amount_cents ?? 0), 0)
              const unpaidTotal = unpaid.reduce((sum, b) => sum + (b.payout_amount_cents ?? 0), 0)

              return (
                <div key={slug} className="border border-studio-border bg-studio-charcoal rounded-sm p-5">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="text-cream font-display text-lg">{engineerName(slug)}</p>
                      <p className="text-mist/50 text-xs">Paid to date: {fmt(paidTotal)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-gold font-display text-2xl">{fmt(unpaidTotal)}</p>
                      {unpaid.length > 0 && (
                        <Button
                          disabled={busyId === unpaid[0].id}
                          onClick={() => markPaid(unpaid.map(b => b.id))}
                          className="text-xs"
                        >
                          {busyId === unpaid[0].id ? "Marking…" : `Mark ${unpaid.length} Paid`}
                        </Button>
                      )}
                    </div>
                  </div>
                  {unpaid.length > 0 && (
                    <div className="space-y-1 mt-3">
                      {unpaid.map(b => (
                        <div key={b.id} className="flex justify-between text-xs text-mist border-t border-studio-border/30 pt-2">
                          <span>{formatDate(b.date)} · Studio {b.room} · {b.rate_hours}hr</span>
                          <span className="text-gold">{fmt(b.payout_amount_cents ?? 0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
