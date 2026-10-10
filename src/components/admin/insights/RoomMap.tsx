"use client"
// src/components/admin/insights/RoomMap.tsx
// "Room Map": the three Mid City Sound rooms as a lit schematic plan.
//   glow     = the chosen metric (share of open hours, revenue, or interest)
//   REC      = a session is running in that room right now
//   strip    = a console channel strip for the selected room: a fader for
//              utilization and an LED meter for interest, plus the facts
//   heatmap  = when that room is busy, weekday × hour
// The plan is schematic, not the real floor layout. A list view carries the
// same numbers; all motion stops under prefers-reduced-motion.

import { useCallback, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Map as MapIcon, List } from "lucide-react"
import type { RoomStats } from "@/lib/insights"
import { hour12, longDate, money, num } from "../ui"

type Metric = "use" | "revenue" | "interest"
type Sel = RoomStats["id"] | "all"

const GOLD = "#D4AF77"
const GOLD_HI = "#F0D9A8"
const REC = "#E5484D"

// Schematic plan geometry (viewBox 600 × 360).
const PLAN: Record<RoomStats["id"], { x: number; y: number; w: number; h: number; lx: number; ly: number }> = {
  B: { x: 24,  y: 24,  w: 300, h: 312, lx: 44,  ly: 60 },
  A: { x: 344, y: 24,  w: 232, h: 196, lx: 362, ly: 60 },
  C: { x: 344, y: 240, w: 232, h: 96,  lx: 362, ly: 272 },
}

function metricValue(r: RoomStats, m: Metric) {
  return m === "use" ? r.utilization : m === "revenue" ? r.revenue : r.interest
}
function metricLabel(r: RoomStats, m: Metric) {
  return m === "use" ? `${Math.round(r.utilization * 100)}% booked` : m === "revenue" ? money(r.revenue) : `${num(r.interest)} picks`
}

export function RoomMap({ rooms, days, openLabel }: { rooms: RoomStats[]; days: number; openLabel: string }) {
  const [metric, setMetric] = useState<Metric>("use")
  const [view, setView] = useState<"map" | "list">("map")
  const [sel, setSel] = useState<Sel>(() => [...rooms].sort((a, b) => b.hours - a.hours)[0]?.id ?? "B")
  const [hoverRoom, setHoverRoom] = useState<RoomStats["id"] | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  const max = Math.max(...rooms.map(r => metricValue(r, metric)), metric === "use" ? 0.25 : 1)
  const byId = useMemo(() => Object.fromEntries(rooms.map(r => [r.id, r])) as Record<RoomStats["id"], RoomStats>, [rooms])
  const focus = sel === "all" ? null : byId[sel]

  // Pointer depth: the blueprint grid drifts a touch behind the rooms.
  const onMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2, y = ((e.clientY - r.top) / r.height - 0.5) * 2
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      root.current?.style.setProperty("--px", x.toFixed(3))
      root.current?.style.setProperty("--py", y.toFixed(3))
    })
  }, [])
  const onLeave = () => { root.current?.style.setProperty("--px", "0"); root.current?.style.setProperty("--py", "0") }

  const order: RoomStats["id"][] = ["B", "A", "C"]
  const onKey = (e: React.KeyboardEvent, id: RoomStats["id"]) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(id); return }
    const i = order.indexOf(id)
    const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? order[(i + 1) % 3] : e.key === "ArrowLeft" || e.key === "ArrowUp" ? order[(i + 2) % 3] : null
    if (next) { e.preventDefault(); (root.current?.querySelector(`[data-room="${next}"]`) as SVGGElement | null)?.focus() }
  }

  const totalHours = rooms.reduce((s, r) => s + r.hours, 0)

  return (
    <div ref={root} className="rm-root relative overflow-hidden rounded-sm border border-studio-border bg-[#060606] text-cream"
      style={{ ["--px" as string]: 0, ["--py" as string]: 0 }}>
      {/* Blueprint grid + warm wash, on a slower layer */}
      <div aria-hidden className="rm-depth pointer-events-none absolute -inset-8 opacity-[0.35]"
        style={{
          ["--d" as string]: 10,
          backgroundImage: "linear-gradient(rgba(212,175,119,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,119,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_30%,rgba(212,175,119,0.10),transparent)]" />

      {/* Controls */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 pt-4 sm:pt-5">
        <div>
          <p className="text-[10px] tracking-[0.26em] uppercase text-gold/70">Room Map · last {days} days</p>
          <p className="text-xs text-mist/60 mt-0.5">{num(totalHours)} hours on the books · open {openLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Seg label="Glow shows" value={metric} onChange={setMetric}
            options={[{ v: "use", l: "Use" }, { v: "revenue", l: "Revenue" }, { v: "interest", l: "Interest" }]} />
          <Seg label="View" value={view} onChange={setView}
            options={[{ v: "map", l: <MapIcon className="w-3.5 h-3.5" aria-label="Map" /> }, { v: "list", l: <List className="w-3.5 h-3.5" aria-label="List" /> }]} />
        </div>
      </div>

      {view === "map" ? (
        <div className="relative grid lg:grid-cols-[1fr_300px] gap-0">
          {/* Plan */}
          <div className="relative px-2 sm:px-6 pt-3 pb-2 sm:pb-6" onPointerMove={onMove} onPointerLeave={onLeave}>
            <svg viewBox="0 0 600 360" className="rm-depth w-full h-auto" style={{ ["--d" as string]: 4 }} role="group" aria-label="Schematic plan of the three studio rooms">
              <defs>
                <filter id="rm-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14" /></filter>
                <pattern id="rm-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke={GOLD} strokeOpacity="0.12" strokeWidth="1" />
                </pattern>
              </defs>
              {/* building outline */}
              <rect x="12" y="12" width="576" height="336" fill="none" stroke={GOLD} strokeOpacity="0.18" strokeDasharray="2 6" />
              {order.map(id => {
                const r = byId[id]; if (!r) return null
                const g = PLAN[id]
                const intensity = Math.max(0, Math.min(1, metricValue(r, metric) / max))
                const on = sel === id || sel === "all"
                const hov = hoverRoom === id
                return (
                  <g key={id} data-room={id} role="button" tabIndex={0} aria-pressed={sel === id}
                    aria-label={`${r.name}, ${r.role}: ${metricLabel(r, metric)}${r.live ? ", recording now" : ""}`}
                    onClick={() => setSel(sel === id ? "all" : id)} onKeyDown={e => onKey(e, id)}
                    onPointerEnter={() => setHoverRoom(id)} onPointerLeave={() => setHoverRoom(null)}
                    className="cursor-pointer outline-none rm-room">
                    {/* glow */}
                    <g className="rm-breathe" style={{ animationDelay: `${id.charCodeAt(0) % 3}s` }}>
                      <rect x={g.x + 18} y={g.y + 18} width={g.w - 36} height={g.h - 36} fill={GOLD}
                        opacity={0.08 + intensity * 0.55} filter="url(#rm-glow)" className="transition-opacity duration-700" />
                    </g>
                    {/* room */}
                    <rect x={g.x} y={g.y} width={g.w} height={g.h} rx="2"
                      fill={intensity > 0 ? GOLD : "url(#rm-hatch)"} fillOpacity={intensity > 0 ? 0.04 + intensity * 0.16 : 1}
                      stroke={sel === id ? GOLD_HI : GOLD} strokeOpacity={sel === id ? 1 : hov ? 0.8 : on ? 0.5 : 0.25}
                      strokeWidth={sel === id ? 2 : 1.2} className="transition-all duration-500" />
                    <RoomGlyph id={id} g={g} dim={!on} />
                    {/* label */}
                    <text x={g.lx} y={g.ly - 12} fill={GOLD} fillOpacity="0.7" fontSize="11" letterSpacing="3" style={{ textTransform: "uppercase" }}>{r.role}</text>
                    <text x={g.lx} y={g.ly + 18} fill="#F5EDD8" fontSize={id === "C" ? 22 : 30} fontFamily="var(--font-display), Georgia, serif">Studio {id}</text>
                    <text x={g.lx} y={g.ly + (id === "C" ? 40 : 46)} fill={GOLD_HI} fontSize="14" className="tabular-nums">{metricLabel(r, metric)}</text>
                    {r.live && (
                      <g transform={`translate(${g.x + g.w - 64}, ${g.y + 16})`}>
                        <rect width="50" height="20" rx="10" fill={REC} fillOpacity="0.16" stroke={REC} strokeOpacity="0.6" />
                        <circle cx="12" cy="10" r="4" fill={REC} className="rm-rec" />
                        <text x="21" y="14" fill="#FFB4B4" fontSize="10" letterSpacing="1.5">REC</text>
                      </g>
                    )}
                    {/* focus ring */}
                    <rect x={g.x - 5} y={g.y - 5} width={g.w + 10} height={g.h + 10} rx="4" fill="none" stroke={GOLD_HI} strokeWidth="1.5" className="rm-focus" />
                  </g>
                )
              })}
              <text x="588" y="356" textAnchor="end" fill={GOLD} fillOpacity="0.35" fontSize="9" letterSpacing="2">SCHEMATIC · NOT TO SCALE</text>
            </svg>
            <p className="sm:hidden text-[11px] text-mist/50 text-center mt-1">Tap a room to focus it</p>
          </div>

          {/* Channel strip */}
          <ChannelStrip room={focus} rooms={rooms} metric={metric} onClear={() => setSel("all")} />
        </div>
      ) : (
        <div className="relative px-4 sm:px-6 py-5 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-[10px] tracking-[0.18em] uppercase text-mist/50 text-left">
                <th className="font-normal pb-3">Room</th><th className="font-normal pb-3 text-right">Booked</th><th className="font-normal pb-3 text-right">Hours</th>
                <th className="font-normal pb-3 text-right">Sessions</th><th className="font-normal pb-3 text-right">Revenue</th><th className="font-normal pb-3 text-right">Picks</th><th className="font-normal pb-3 pl-4">Next</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {rooms.map(r => (
                <tr key={r.id}>
                  <td className="py-3"><span className="text-cream">{r.name}</span><span className="block text-[11px] text-mist/50">{r.role}</span></td>
                  <td className="py-3 text-right tabular-nums text-gold">{Math.round(r.utilization * 100)}%</td>
                  <td className="py-3 text-right tabular-nums">{num(r.hours)}</td>
                  <td className="py-3 text-right tabular-nums">{num(r.bookings)}</td>
                  <td className="py-3 text-right tabular-nums">{money(r.revenue)}</td>
                  <td className="py-3 text-right tabular-nums">{num(r.interest)}</td>
                  <td className="py-3 pl-4 text-xs text-mist">{r.live ? <span className="text-red-300">Recording now</span> : r.next ? `${longDate(r.next.date)} ${hour12(r.next.start)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Heatmap */}
      <Heatmap rooms={rooms} sel={sel} onSel={setSel} />

      <style>{`
        .rm-depth { transform: translate3d(calc(var(--px) * var(--d) * -1px), calc(var(--py) * var(--d) * -1px), 0); transition: transform .6s cubic-bezier(.22,1,.36,1); }
        .rm-room .rm-focus { opacity: 0; transition: opacity .2s; }
        .rm-room:focus-visible .rm-focus { opacity: 1; }
        @keyframes rm-breathe { 0%,100% { opacity: 1; } 50% { opacity: .72; } }
        .rm-breathe { animation: rm-breathe 5s ease-in-out infinite; }
        @keyframes rm-rec { 0%,100% { opacity: 1 } 50% { opacity: .25 } }
        .rm-rec { animation: rm-rec 1.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .rm-breathe, .rm-rec { animation: none } .rm-depth { transform: none } }
      `}</style>
    </div>
  )
}

/* Line-art furniture so each room reads at a glance. */
function RoomGlyph({ id, g, dim }: { id: RoomStats["id"]; g: { x: number; y: number; w: number; h: number }; dim: boolean }) {
  const s = { stroke: GOLD, strokeOpacity: dim ? 0.18 : 0.45, fill: "none", strokeWidth: 1.2 }
  if (id === "B") {
    const cx = g.x + 200, cy = g.y + 190
    return (
      <g {...s} aria-hidden>
        {/* drum kit */}
        <circle cx={cx} cy={cy} r="26" /><circle cx={cx - 46} cy={cy - 18} r="15" /><circle cx={cx + 44} cy={cy - 22} r="13" />
        <circle cx={cx - 40} cy={cy + 34} r="17" /><circle cx={cx + 52} cy={cy + 26} r="11" />
        <line x1={cx - 70} y1={cy - 50} x2={cx - 58} y2={cy - 34} /><circle cx={cx - 74} cy={cy - 56} r="10" />
        {/* upright piano */}
        <rect x={g.x + 26} y={g.y + 232} width="92" height="34" /><line x1={g.x + 26} y1={g.y + 252} x2={g.x + 118} y2={g.y + 252} />
        {/* amps */}
        <rect x={g.x + 240} y={g.y + 262} width="34" height="28" /><rect x={g.x + 200} y={g.y + 262} width="30" height="28" />
      </g>
    )
  }
  if (id === "A") {
    return (
      <g {...s} aria-hidden>
        {/* desk + monitors */}
        <path d={`M${g.x + 22} ${g.y + 168} h120 v-26 h-120 z`} />
        <rect x={g.x + 36} y={g.y + 128} width="22" height="12" /><rect x={g.x + 104} y={g.y + 128} width="22" height="12" />
        <line x1={g.x + 66} y1={g.y + 136} x2={g.x + 96} y2={g.y + 136} />
        {/* vocal booth with mic */}
        <rect x={g.x + g.w - 74} y={g.y + 96} width="58" height="86" strokeDasharray="4 3" />
        <circle cx={g.x + g.w - 45} cy={g.y + 132} r="6" /><line x1={g.x + g.w - 45} y1={g.y + 138} x2={g.x + g.w - 45} y2={g.y + 164} />
        {/* guitars on the wall */}
        {[0, 1, 2].map(i => <line key={i} x1={g.x + 150 + i * 10} y1={g.y + 98} x2={g.x + 150 + i * 10} y2={g.y + 122} strokeLinecap="round" />)}
      </g>
    )
  }
  return (
    <g {...s} aria-hidden>
      <rect x={g.x + g.w - 120} y={g.y + 46} width="80" height="30" />
      {[0, 1].map(i => <line key={i} x1={g.x + g.w - 18 - i * 8} y1={g.y + 48} x2={g.x + g.w - 18 - i * 8} y2={g.y + 74} strokeLinecap="round" />)}
    </g>
  )
}

function ChannelStrip({ room, rooms, metric, onClear }: { room: RoomStats | null; rooms: RoomStats[]; metric: Metric; onClear: () => void }) {
  const agg = room ?? {
    id: "all" as const, name: "All rooms", role: "Mid City Sound",
    bookings: rooms.reduce((s, r) => s + r.bookings, 0), hours: rooms.reduce((s, r) => s + r.hours, 0),
    revenue: rooms.reduce((s, r) => s + r.revenue, 0), utilization: rooms.reduce((s, r) => s + r.utilization, 0) / Math.max(1, rooms.length),
    avgSession: 0, interest: rooms.reduce((s, r) => s + r.interest, 0), topEngineer: null, busiestWeekday: null, heat: [], live: null,
    next: [...rooms].map(r => r.next).filter(Boolean).sort((a, b) => (a!.date + String(a!.start).padStart(2, "0")).localeCompare(b!.date + String(b!.start).padStart(2, "0")))[0] ?? null,
  }
  const maxInterest = Math.max(1, ...rooms.map(r => r.interest))
  const leds = 12
  const lit = Math.round((agg.interest / (room ? maxInterest : rooms.reduce((s, r) => s + r.interest, 0) || 1)) * leds)
  const util = Math.round(agg.utilization * 100)

  return (
    <aside aria-label="Selected room" className="relative border-t lg:border-t-0 lg:border-l border-studio-border/70 bg-black/30 px-4 sm:px-6 py-5">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-gold/70">{agg.role}</p>
          <p className="font-display text-2xl text-cream leading-tight">{agg.name}</p>
        </div>
        {room && <button onClick={onClear} className="text-[11px] text-mist hover:text-gold underline-offset-4 hover:underline">All rooms</button>}
      </div>

      <div className="flex flex-wrap gap-5">
        {/* Fader: share of open hours booked */}
        <div className="flex flex-col items-center gap-2" aria-label={`${util}% of open hours booked`}>
          <div className="relative h-40 w-9 rounded-sm bg-studio-dark border border-studio-border">
            {[0, 25, 50, 75, 100].map(t => (
              <span key={t} aria-hidden className="absolute -left-1.5 w-1 h-px bg-mist/30" style={{ bottom: `${t}%` }} />
            ))}
            <div aria-hidden className="absolute left-1/2 -translate-x-1/2 bottom-1 top-1 w-[3px] rounded-full bg-black/60" />
            <div aria-hidden className="absolute left-1/2 -translate-x-1/2 bottom-1 w-[3px] rounded-full bg-gold/70 transition-[height] duration-700" style={{ height: `calc(${util}% - 2px)` }} />
            <div aria-hidden className="absolute left-1/2 -translate-x-1/2 w-7 h-3.5 rounded-[2px] bg-gradient-to-b from-[#E8E2D3] to-[#9C968A] shadow-[0_2px_6px_rgba(0,0,0,.6)] transition-[bottom] duration-700"
              style={{ bottom: `calc(${util}% - 7px)` }}>
              <span className="absolute inset-x-1 top-1/2 h-px bg-black/50" />
            </div>
          </div>
          <span className="font-display text-xl text-gold tabular-nums leading-none">{util}%</span>
          <span className="text-[9px] tracking-[0.18em] uppercase text-mist/50">Booked</span>
        </div>

        {/* LED meter: interest */}
        <div className="flex flex-col items-center gap-2" aria-label={`${agg.interest} times picked in booking`}>
          <div className="flex flex-col-reverse gap-[3px] h-40 justify-start py-1">
            {Array.from({ length: leds }).map((_, i) => {
              const on = i < lit
              const c = i >= leds - 2 ? REC : i >= leds - 5 ? GOLD_HI : GOLD
              return <span key={i} aria-hidden className="w-5 h-[9px] rounded-[1px] transition-opacity duration-500" style={{ background: c, opacity: on ? 0.95 : 0.1, boxShadow: on ? `0 0 6px ${c}` : "none" }} />
            })}
          </div>
          <span className="font-display text-xl text-gold tabular-nums leading-none">{num(agg.interest)}</span>
          <span className="text-[9px] tracking-[0.18em] uppercase text-mist/50">Picks</span>
        </div>

        {/* Facts */}
        <dl className="grow basis-[180px] min-w-0 space-y-2.5 text-sm">
          <Fact k="Sessions" v={num(agg.bookings)} />
          <Fact k="Hours" v={num(agg.hours)} />
          <Fact k="Revenue" v={money(agg.revenue)} hi={metric === "revenue"} />
          {room && <Fact k="Avg session" v={agg.avgSession ? `${(Math.round(agg.avgSession * 10) / 10)} hrs` : "—"} />}
          {room && <Fact k="Top engineer" v={agg.topEngineer ? `${agg.topEngineer.name} (${agg.topEngineer.sessions})` : "—"} />}
          {room && <Fact k="Busiest day" v={agg.busiestWeekday ?? "—"} />}
        </dl>
      </div>

      <div className="mt-5 pt-4 border-t border-studio-border/70 text-xs">
        {agg.live ? (
          <p className="text-red-300 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 rm-rec" />Recording now · {agg.live.client} until {hour12(agg.live.until)}</p>
        ) : agg.next ? (
          <p className="text-mist"><span className="text-[10px] tracking-[0.18em] uppercase text-mist/50 mr-2">Next</span>
            <span className="text-cream">{longDate(agg.next.date)} · {hour12(agg.next.start)}–{hour12(agg.next.start + agg.next.hours)}</span> · {agg.next.client}</p>
        ) : (
          <p className="text-mist/60">Nothing booked ahead. <Link href="/studio" className="text-gold/80 hover:text-gold">Open the booking page</Link></p>
        )}
      </div>
    </aside>
  )
}

function Fact({ k, v, hi }: { k: string; v: string; hi?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 min-w-0">
      <dt className="text-[11px] text-mist/60 shrink-0">{k}</dt>
      <dd className={`tabular-nums truncate text-right ${hi ? "text-gold" : "text-cream"}`}>{v}</dd>
    </div>
  )
}

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function Heatmap({ rooms, sel, onSel }: { rooms: RoomStats[]; sel: Sel; onSel: (s: Sel) => void }) {
  const grid = useMemo(() => {
    const src = sel === "all" ? rooms : rooms.filter(r => r.id === sel)
    const g = DOW.map((_, d) => (src[0]?.heat[d] ?? []).map((_, h) => src.reduce((s, r) => s + (r.heat[d]?.[h] ?? 0), 0)))
    return g
  }, [rooms, sel])
  const max = Math.max(1, ...grid.flat())
  const hours = grid[0]?.length ?? 12
  const [tip, setTip] = useState<{ d: number; h: number } | null>(null)
  const busiest = useMemo(() => {
    let best = { d: -1, h: -1, v: 0 }
    grid.forEach((row, d) => row.forEach((v, h) => { if (v > best.v) best = { d, h, v } }))
    return best.v ? best : null
  }, [grid])

  return (
    <div className="relative border-t border-studio-border/70 px-4 sm:px-6 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <div>
          <p className="font-display text-lg text-cream">When {sel === "all" ? "the rooms are" : `Studio ${sel} is`} busy</p>
          <p className="text-xs text-mist/60">{busiest ? `Peak: ${DOW[busiest.d]}s around ${hour12(9 + busiest.h)}` : "No sessions in this range yet."}</p>
        </div>
        <div className="flex gap-1" role="radiogroup" aria-label="Heatmap room">
          {(["all", "A", "B", "C"] as Sel[]).map(s => (
            <button key={s} role="radio" aria-checked={sel === s} onClick={() => onSel(s)}
              className={`h-8 min-w-[40px] px-2.5 text-xs rounded-sm border transition-colors ${sel === s ? "border-gold bg-gold/15 text-gold" : "border-studio-border text-mist hover:text-cream"}`}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>
      <div className="relative" onPointerLeave={() => setTip(null)}>
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: `34px repeat(${hours}, minmax(0,1fr))` }} role="grid" aria-label="Booked hours by weekday and hour">
          <span />
          {Array.from({ length: hours }).map((_, h) => (
            <span key={h} className="text-[9px] text-mist/40 text-center tabular-nums">{h % 2 === 0 ? hour12(9 + h).replace("m", "") : ""}</span>
          ))}
          {grid.map((row, d) => (
            <div key={d} className="contents" role="row">
              <span className="text-[10px] text-mist/60 self-center">{DOW[d]}</span>
              {row.map((v, h) => {
                const t = v / max
                return (
                  <button key={h} type="button" role="gridcell"
                    aria-label={`${DOW[d]} ${hour12(9 + h)}: ${v} booked hour${v === 1 ? "" : "s"}`}
                    onPointerEnter={() => setTip({ d, h })} onFocus={() => setTip({ d, h })} onClick={() => setTip({ d, h })}
                    className="h-6 sm:h-7 rounded-[2px] border border-white/[0.03] transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold"
                    style={{ background: v ? `rgba(212,175,119,${0.12 + t * 0.85})` : "rgba(255,255,255,0.025)", boxShadow: t > 0.7 ? "0 0 10px rgba(212,175,119,0.35)" : "none" }} />
                )
              })}
            </div>
          ))}
        </div>
        {tip && (
          <p className="mt-3 text-xs text-mist" aria-live="polite">
            <span className="text-cream">{DOW[tip.d]} · {hour12(9 + tip.h)}–{hour12(10 + tip.h)}</span> — {grid[tip.d][tip.h]} booked hour{grid[tip.d][tip.h] === 1 ? "" : "s"} in this range
          </p>
        )}
      </div>
    </div>
  )
}

function Seg<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { v: T; l: React.ReactNode }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex p-0.5 border border-white/15 bg-white/[0.04] backdrop-blur-md rounded-sm">
      {options.map(o => (
        <button key={o.v} role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)}
          className={`px-3 min-h-[32px] text-xs tracking-wide rounded-[1px] inline-flex items-center transition-colors ${value === o.v ? "bg-gold text-studio-black" : "text-cream/70 hover:text-cream"}`}>
          {o.l}
        </button>
      ))}
    </div>
  )
}
