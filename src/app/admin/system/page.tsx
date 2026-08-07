"use client"
// src/app/admin/system/page.tsx
// "Is everything actually working" — separate from /admin/orders and
// /admin/bookings, which are "here's my data." Protected by the same
// mcs_admin_session cookie via src/middleware.ts, so no password prompt
// here — if you're on this page, you're already authed.

import { useState, useEffect, useCallback } from "react"
import { RefreshCw } from "lucide-react"

type CheckResult = { status: "ok" | "warn" | "error"; detail: string }
type HealthData = {
  envVars: Record<string, CheckResult>
  webhookHealth: {
    stripe: CheckResult
    streetbeatStripe: CheckResult
    lastWebhook: CheckResult
    resend: CheckResult
    turso: CheckResult
    printify: CheckResult
  }
  apiUsage: CheckResult
  checkedAt: string
}

const STATUS_DOT = { ok: "bg-emerald-400", warn: "bg-gold", error: "bg-red-400" }
const STATUS_TEXT = { ok: "text-emerald-400", warn: "text-gold", error: "text-red-400" }

const WEBHOOK_LABELS: Record<keyof HealthData["webhookHealth"], string> = {
  stripe: "Stripe (MCS)",
  streetbeatStripe: "Stripe (Streetbeat)",
  lastWebhook: "Last webhook activity",
  resend: "Resend",
  turso: "Turso",
  printify: "Printify",
}

function Pill({ status }: { status: "ok" | "warn" | "error" }) {
  return <span className={`inline-block w-2 h-2 rounded-full mr-2 shrink-0 ${STATUS_DOT[status]}`} />
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-studio-border rounded-sm p-5 bg-studio-charcoal">
      <h3 className="font-display text-lg text-gold mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, r }: { label: string; r: CheckResult }) {
  return (
    <div className="flex items-start text-sm">
      <Pill status={r.status} />
      <div>
        <span className="text-cream">{label}</span>
        <span className={`ml-2 ${STATUS_TEXT[r.status]}`}>— {r.detail}</span>
      </div>
    </div>
  )
}

export default function SystemDashboard() {
  const [data, setData] = useState<HealthData | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchHealth = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/health")
      if (!res.ok) { setError("Health check failed to load"); return }
      setData(await res.json())
      setError("")
    } catch {
      setError("Health check failed to load")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 60_000)
    return () => clearInterval(interval)
  }, [fetchHealth])

  const errorCount = data
    ? Object.values(data.envVars).filter(r => r.status === "error").length +
      Object.values(data.webhookHealth).filter(r => r.status === "error").length
    : 0

  return (
    <div className="min-h-screen bg-studio-black pt-20 px-6 pb-20">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-gold/60 mb-1">Admin</p>
            <h1 className="font-display text-4xl text-cream">System Health</h1>
            {data && (
              <p className="text-mist text-[11px] mt-1">
                Last checked {new Date(data.checkedAt).toLocaleTimeString()} · refreshes every 60s
              </p>
            )}
          </div>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-mist hover:text-gold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats row — mirrors /admin/orders' summary-card pattern */}
        {data && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className={`border rounded-sm p-5 bg-studio-charcoal ${errorCount > 0 ? "border-red-500/50" : "border-studio-border"}`}>
              <p className="text-mist text-[10px] uppercase tracking-widest mb-1">Failing checks</p>
              <p className={`font-display text-3xl ${errorCount > 0 ? "text-red-400" : "text-gold"}`}>{errorCount}</p>
            </div>
            <div className="border border-studio-border rounded-sm p-5 bg-studio-charcoal">
              <p className="text-mist text-[10px] uppercase tracking-widest mb-1">Env vars set</p>
              <p className="font-display text-3xl text-gold">
                {Object.values(data.envVars).filter(r => r.status === "ok").length}/{Object.keys(data.envVars).length}
              </p>
            </div>
            <div className="border border-studio-border rounded-sm p-5 bg-studio-charcoal">
              <p className="text-mist text-[10px] uppercase tracking-widest mb-1">Usage (30d)</p>
              <p className="font-display text-sm text-cream mt-2 leading-tight">{data.apiUsage.detail}</p>
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-6">{error}</p>}

        {!data && !error && <p className="text-mist/50 text-sm">Loading…</p>}

        {data && (
          <div className="grid md:grid-cols-2 gap-5">
            <Card title="Env Vars">
              {Object.entries(data.envVars).map(([key, r]) => (
                <Row key={key} label={key} r={r} />
              ))}
            </Card>

            <Card title="Webhook Health">
              {(Object.keys(data.webhookHealth) as (keyof HealthData["webhookHealth"])[]).map(key => (
                <Row key={key} label={WEBHOOK_LABELS[key]} r={data.webhookHealth[key]} />
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
