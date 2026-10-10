"use client"
// src/app/admin/system/page.tsx
// "Is everything actually working" — separate from /admin/orders and
// /admin/bookings, which are "here's my data." Protected by the same
// mcs_admin_session cookie via src/middleware.ts, so no password prompt
// here — if you're on this page, you're already authed.

import { useState, useEffect, useCallback } from "react"
import { RefreshCw } from "lucide-react"
import { AdminPage, AdminPageHeader, Stat, Notice, adminBtn } from "@/components/admin/ui"

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
  analyticsPixels: Record<string, CheckResult>
  checkedAt: string
}

const STATUS_DOT = { ok: "bg-emerald-400", warn: "bg-gold", error: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]" }
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
  return <span aria-label={status} className={`inline-block w-2 h-2 rounded-full mr-3 mt-1.5 shrink-0 ${STATUS_DOT[status]}`} />
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-studio-border rounded-sm p-4 sm:p-6 bg-studio-charcoal min-w-0">
      <h3 className="font-display text-xl text-cream mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Row({ label, r }: { label: string; r: CheckResult }) {
  return (
    <div className="flex items-start text-sm min-w-0">
      <Pill status={r.status} />
      <div className="min-w-0">
        <p className="text-cream break-words">{label}</p>
        <p className={`text-xs break-words ${r.status === "ok" ? "text-mist/60" : STATUS_TEXT[r.status]}`}>{r.detail}</p>
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
    <AdminPage>
      <AdminPageHeader eyebrow="Admin" title="System"
        description={data ? `Checked ${new Date(data.checkedAt).toLocaleTimeString()} · refreshes every minute` : "Env vars, webhooks and integrations"}
        actions={
          <button onClick={fetchHealth} disabled={loading} className={adminBtn.secondary}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Check now
          </button>
        } />

      {error && <Notice tone="alert">{error}</Notice>}

      {data ? (
        <>
          <div className="grid grid-cols-3 gap-3 mb-8">
            <Stat label="Failing checks" value={errorCount} tone={errorCount ? "alert" : undefined} sub={errorCount ? "See red rows below" : "All good"} />
            <Stat label="Env vars set" value={`${Object.values(data.envVars).filter(r => r.status === "ok").length}/${Object.keys(data.envVars).length}`} />
            <Stat label="Usage (30d)" value={<span className="block whitespace-normal text-sm sm:text-base font-sans leading-snug">{data.apiUsage.detail}</span>} />
          </div>
          <div className="grid md:grid-cols-2 gap-4 items-start">
            <Card title="Webhooks & services">
              {(Object.keys(data.webhookHealth) as (keyof HealthData["webhookHealth"])[]).map(key => (
                <Row key={key} label={WEBHOOK_LABELS[key]} r={data.webhookHealth[key]} />
              ))}
            </Card>
            <Card title="Env vars">
              {Object.entries(data.envVars).map(([key, r]) => <Row key={key} label={key} r={r} />)}
            </Card>
            <Card title="Analytics pixels">
              {Object.entries(data.analyticsPixels).map(([key, r]) => <Row key={key} label={key} r={r} />)}
            </Card>
          </div>
        </>
      ) : !error && (
        <div className="grid grid-cols-3 gap-3" aria-busy>
          {[0, 1, 2].map(i => <div key={i} className="h-[104px] rounded-sm bg-studio-charcoal border border-studio-border animate-pulse" />)}
        </div>
      )}
    </AdminPage>
  )
}
