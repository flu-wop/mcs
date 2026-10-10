"use client"
// src/components/admin/charts.tsx — interactive admin charts (dark theme).
import { useMemo, useRef, useState } from "react"
import { compactMoney, money, num, shortDate } from "./ui"

type Series = { key: string; label: string; color: string }
type Row = { date: string } & Record<string, number | string>

function bucket(rows: Row[], keys: string[]) {
  const n = rows.length
  const size = n > 120 ? 30 : n > 45 ? 7 : 1
  const out: { label: string; range: string; values: Record<string, number> }[] = []
  for (let i = 0; i < n; i += size) {
    const slice = rows.slice(i, i + size)
    const values: Record<string, number> = {}
    for (const k of keys) values[k] = slice.reduce((s, r) => s + (Number(r[k]) || 0), 0)
    const a = slice[0].date, b = slice[slice.length - 1].date
    out.push({ label: shortDate(a), range: size === 1 ? shortDate(a) : `${shortDate(a)} – ${shortDate(b)}`, values })
  }
  return out
}

function niceMax(v: number) {
  if (v <= 0) return 1
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const m = v / p
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p
}

export function ColumnChart({ rows, series, format = "money", height = 180 }: {
  rows: Row[]; series: Series[]; format?: "money" | "count"; height?: number
}) {
  const data = useMemo(() => bucket(rows, series.map(s => s.key)), [rows, series])
  const totals = data.map(d => series.reduce((s, x) => s + d.values[x.key], 0))
  const max = niceMax(Math.max(0, ...totals))
  const [hover, setHover] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const fmt = (v: number) => (format === "money" ? money(v) : num(v))
  const tick = (v: number) => (format === "money" ? compactMoney(v) : num(Math.round(v)))
  const pick = (x: number) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    setHover(Math.max(0, Math.min(data.length - 1, Math.floor(((x - r.left) / r.width) * data.length))))
  }
  const every = Math.ceil(data.length / 6)

  return (
    <div className="relative select-none">
      <div className="flex gap-2">
        <div className="relative w-9 shrink-0 text-[10px] text-mist/50 tabular-nums" style={{ height }}>
          {[1, 0.5, 0].map(f => <span key={f} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - f) * 100}%` }}>{tick(max * f)}</span>)}
        </div>
        <div className="flex-1 min-w-0">
          <div ref={ref} className="relative flex items-end touch-pan-y" style={{ height, gap: data.length > 40 ? 1 : 2 }}
            onPointerMove={e => pick(e.clientX)} onPointerDown={e => pick(e.clientX)} onPointerLeave={() => setHover(null)}
            role="img" aria-label={`Chart of ${series.map(s => s.label).join(" and ")}`}>
            {[0, 0.5, 1].map(f => <div key={f} aria-hidden className="absolute inset-x-0 border-t border-studio-border/60" style={{ top: `${(1 - f) * 100}%` }} />)}
            {data.map((d, i) => (
              <div key={i} className="relative flex-1 h-full flex flex-col justify-end items-center min-w-0">
                <div className="w-full flex flex-col-reverse items-stretch" style={{ maxWidth: 24, gap: 2 }}>
                  {series.map((s, si) => {
                    const v = d.values[s.key]; if (!v) return null
                    const top = series.slice(si + 1).every(x => !d.values[x.key])
                    return <div key={s.key} style={{ height: Math.max(2, (v / max) * height - 2), background: s.color, opacity: hover === null || hover === i ? 1 : 0.4, borderRadius: top ? "3px 3px 0 0" : 0 }} />
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex mt-2 text-[10px] text-mist/50" style={{ gap: data.length > 40 ? 1 : 2 }}>
            {data.map((d, i) => <span key={i} className="flex-1 min-w-0 text-center whitespace-nowrap">{i % every === 0 ? d.label : ""}</span>)}
          </div>
        </div>
      </div>
      {hover !== null && data[hover] && (
        <div className="pointer-events-none absolute -top-2 z-10 bg-studio-black border border-gold/30 text-cream px-3 py-2 text-xs shadow-xl whitespace-nowrap rounded-sm"
          style={{
            left: `calc(2.75rem + (100% - 2.75rem) * ${(hover + 0.5) / data.length})`,
            transform: `translate(${(hover + 0.5) / data.length < 0.25 ? "-20%" : (hover + 0.5) / data.length > 0.75 ? "-80%" : "-50%"}, -100%)`,
          }}>
          <p className="text-[10px] text-mist/60 mb-1">{data[hover].range}</p>
          {series.map(s => (
            <p key={s.key} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-[2px]" style={{ background: s.color }} />{s.label}: <b className="font-medium">{fmt(data[hover].values[s.key])}</b>
            </p>
          ))}
          {series.length > 1 && <p className="mt-0.5 text-mist/70">Total {fmt(totals[hover])}</p>}
        </div>
      )}
    </div>
  )
}

export function BarList({ rows, color = "#D4AF77", format }: {
  rows: { label: string; value: number; note?: string }[]; color?: string; format?: "money" | "count" | "hours"
}) {
  const max = Math.max(1, ...rows.map(r => r.value))
  const f = (v: number) => format === "money" ? money(v) : format === "hours" ? `${num(Math.round(v * 10) / 10)} hrs` : num(v)
  return (
    <ul className="space-y-3">
      {rows.map(r => (
        <li key={r.label} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 text-sm mb-1.5">
            <span className="min-w-0">
              <span className="block text-cream truncate">{r.label}</span>
              {r.note && <span className="block text-[11px] text-mist/50 truncate">{r.note}</span>}
            </span>
            <span className="text-mist tabular-nums shrink-0">{f(r.value)}</span>
          </div>
          <div className="h-1.5 bg-studio-dark rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${(r.value / max) * 100}%`, background: color, minWidth: r.value ? 4 : 0 }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Funnel({ steps, color }: { steps: { label: string; value: number }[]; color: string }) {
  const top = Math.max(1, steps[0]?.value ?? 1)
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const prev = i ? steps[i - 1].value : null
        return (
          <li key={s.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm mb-1.5">
              <span className="text-cream min-w-0 truncate">{s.label}</span>
              <span className="tabular-nums text-cream shrink-0">
                {num(s.value)}{prev !== null && <span className="text-mist/50 text-xs ml-1.5">{prev ? `${Math.round((s.value / prev) * 100)}%` : "—"}</span>}
              </span>
            </div>
            <div className="h-2 bg-studio-dark rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(s.value / top) * 100}%`, background: color, minWidth: s.value ? 4 : 0 }} />
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map(i => (
        <span key={i.label} className="inline-flex items-center gap-1.5 text-[11px] text-mist">
          <span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: i.color }} aria-hidden />{i.label}
        </span>
      ))}
    </div>
  )
}
