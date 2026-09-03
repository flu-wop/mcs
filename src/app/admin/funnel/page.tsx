"use client"
// src/app/admin/funnel/page.tsx
// Session-scoped drop-off counts per funnel stage, plus abandoned bookings
// and abandoned merch checkouts. Protected by the same mcs_admin_session
// cookie via src/middleware.ts, so no password prompt here.

import { useState, useEffect, useCallback } from "react"
import { RefreshCw } from "lucide-react"

type FunnelData = {
  stageCounts: { booking: Record<string, number>; merch: Record<string, number> }
  abandoned: {
    booking: { session_id: string; data: Record<string, unknown>; created_at: string }[]
    merch: { session_id: string; data: Record<string, unknown>; created_at: string }[]
  }
  checkedAt: string
}

const STAGE_LABELS: Record<string, string> = {
  view_item: "Viewed",
  add_to_cart: "Added to Cart",
  begin_checkout: "Checkout Started",
  purchase: "Purchased",
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-studio-border rounded-sm p-5 bg-studio-charcoal">
      <p className="text-mist text-[10px] uppercase tracking-widest mb-1">{label}</p>
      <p className="font-display text-3xl text-gold">{value}</p>
    </div>
  )
}

export default function FunnelDashboard() {
  const [data, setData] = useState<FunnelData | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchFunnel = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/funnel")
      if (!res.ok) { setError("Funnel data failed to load"); return }
      setData(await res.json())
      setError("")
    } catch {
      setError("Funnel data failed to load")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFunnel()
    const interval = setInterval(fetchFunnel, 60_000)
    return () => clearInterval(interval)
  }, [fetchFunnel])

  return (
    <div className="pt-10 px-6 pb-20">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl text-cream">Funnel Analytics</h1>
            {data && (
              <p className="text-mist text-[11px] mt-1">
                Last 30 days · checked {new Date(data.checkedAt).toLocaleTimeString()} · refreshes every 60s
              </p>
            )}
          </div>
          <button
            onClick={fetchFunnel}
            disabled={loading}
            className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-mist hover:text-gold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-6">{error}</p>}
        {!data && !error && <p className="text-mist/50 text-sm">Loading…</p>}

        {data && (["booking", "merch"] as const).map(funnel => (
          <div key={funnel} className="mb-12">
            <h2 className="font-display text-xl text-gold mb-4 capitalize">{funnel} Funnel</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(data.stageCounts[funnel]).map(([stage, count]) => (
                <StatCard key={stage} label={STAGE_LABELS[stage] ?? stage} value={count} />
              ))}
            </div>

            <div className="border border-studio-border rounded-sm bg-studio-charcoal overflow-hidden">
              <div className="px-5 py-3 border-b border-studio-border bg-studio-dark">
                <p className="text-[10px] tracking-widest uppercase text-gold/70">
                  Abandoned {funnel === "booking" ? "bookings" : "checkouts"} — {data.abandoned[funnel].length}
                </p>
              </div>
              <div className="divide-y divide-studio-border">
                {data.abandoned[funnel].length === 0 && (
                  <p className="px-5 py-4 text-mist/50 text-sm">None in the last 30 days.</p>
                )}
                {data.abandoned[funnel].map((row, i) => (
                  <div key={`${row.session_id}-${i}`} className="px-5 py-3 text-sm flex items-center justify-between gap-4">
                    <span className="text-mist text-[11px] font-mono shrink-0">
                      {new Date(row.created_at).toLocaleString()}
                    </span>
                    <span className="text-cream text-xs text-right truncate">
                      {Object.entries(row.data)
                        .filter(([k]) => k !== "funnel")
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
