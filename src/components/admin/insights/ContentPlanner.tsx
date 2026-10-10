"use client"
// Weekly content plan. Each planned post carries its own clip checklist.
// Autosaves to Turso (/api/admin/content-plan) so it's the same on every device.
import { useCallback, useEffect, useRef, useState } from "react"
import { Check, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import { PILLARS, OFFER_ID, CLIP_CHECKLIST, DAYS, POST_TARGET } from "./content"
import { Card } from "../ui"

type Day = { pillar: number; note: string; checks: boolean[] }
type Plan = { days: Day[] }
const blank = (): Plan => ({ days: DAYS.map(() => ({ pillar: 0, note: "", checks: CLIP_CHECKLIST.map(() => false) })) })
const todayLocal = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date())
function mondayOf(day: string) { const d = new Date(day + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10) }
function shift(day: string, n: number) { const d = new Date(day + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
const md = (day: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(day + "T12:00:00Z"))

export function ContentPlanner() {
  const today = todayLocal()
  const [week, setWeek] = useState(() => mondayOf(today))
  const [plan, setPlan] = useState<Plan>(blank)
  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "saved" | "error">("loading")
  const [open, setOpen] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<{ week: string; plan: Plan } | null>(null)

  const flush = useCallback(async () => {
    const p = pending.current; if (!p) return
    pending.current = null
    setStatus("saving")
    try {
      const res = await fetch("/api/admin/content-plan", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) })
      setStatus(res.ok ? "saved" : "error")
    } catch { setStatus("error") }
  }, [])

  useEffect(() => {
    let cancelled = false
    setStatus("loading"); setOpen(null)
    fetch(`/api/admin/content-plan?week=${week}`, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => { if (!cancelled) { setPlan(d.plan); setStatus("idle") } })
      .catch(() => { if (!cancelled) { setPlan(blank()); setStatus("error") } })
    return () => { cancelled = true }
  }, [week])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); void flush() }, [flush])

  const update = (i: number, patch: Partial<Day>) => {
    setPlan(prev => {
      const next = { days: prev.days.map((d, j) => (j === i ? { ...d, ...patch } : d)) }
      pending.current = { week, plan: next }
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(flush, 700)
      return next
    })
    setStatus("saving")
  }
  const changeWeek = (n: number) => { if (timer.current) clearTimeout(timer.current); void flush(); setWeek(w => shift(w, n * 7)) }

  const planned = plan.days.filter(d => d.pillar > 0)
  const offers = planned.filter(d => d.pillar === OFFER_ID).length
  const ready = planned.filter(d => d.checks.every(Boolean)).length
  const warnOffers = planned.length > 0 && offers / planned.length > 0.2
  const warnMany = planned.length > POST_TARGET.max
  const navBtn = "w-10 h-10 grid place-items-center rounded-sm border border-studio-border text-mist hover:border-gold/50 hover:text-cream transition-colors"

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-3 mb-5">
          <button onClick={() => changeWeek(-1)} aria-label="Previous week" className={navBtn}><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-center min-w-0">
            <p className="text-[10px] tracking-[0.2em] uppercase text-mist/50">{week === mondayOf(today) ? "This week" : "Week of"}</p>
            <p className="font-display text-xl text-cream whitespace-nowrap">{md(week)} – {md(shift(week, 6))}</p>
          </div>
          <button onClick={() => changeWeek(1)} aria-label="Next week" className={navBtn}><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          {[
            { label: "Planned", value: planned.length, sub: `of ${POST_TARGET.min}–${POST_TARGET.max}` },
            { label: "Ready", value: ready, sub: `of ${planned.length}` },
            { label: "Offers", value: offers, sub: "1 in 5 max" },
          ].map(s => (
            <div key={s.label} className="bg-studio-dark rounded-sm px-3 py-2.5 min-w-0">
              <p className="text-[10px] tracking-[0.14em] uppercase text-mist/50 truncate">{s.label}</p>
              <p className="font-display text-xl text-cream leading-tight">{s.value} <span className="font-sans text-[11px] text-mist/50">{s.sub}</span></p>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-studio-dark rounded-full overflow-hidden" aria-hidden>
          <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${Math.min(100, (planned.length / POST_TARGET.max) * 100)}%` }} />
        </div>
        {(warnOffers || warnMany) && (
          <p className="mt-3 flex items-start gap-2 text-xs text-gold bg-gold/10 border border-gold/20 rounded-sm px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden />
            {warnOffers ? "Offers are over 1 in 5 this week. Swap one for a session or legacy post." : "Over 6 posts this week. Quality over volume."}
          </p>
        )}
        <p className={`text-[11px] text-mist/60 ${status === "idle" ? "sr-only" : "mt-3"}`} aria-live="polite">
          {status === "loading" ? "Loading…" : status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓ — synced across your devices" : status === "error" ? "Couldn't reach the database. Changes aren't saved." : ""}
        </p>
      </Card>

      <div className="bg-studio-charcoal border border-studio-border rounded-sm divide-y divide-studio-border">
        {plan.days.map((d, i) => {
          const date = shift(week, i), isToday = date === today
          const done = d.checks.filter(Boolean).length
          const expanded = open === i && d.pillar > 0
          return (
            <div key={i} className={isToday ? "bg-gold/[0.04]" : ""}>
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3">
                <div className="w-11 shrink-0">
                  <p className={`text-sm font-medium ${isToday ? "text-gold" : "text-cream"}`}>{DAYS[i]}</p>
                  <p className="text-[10px] text-mist/50">{isToday ? "Today" : md(date)}</p>
                </div>
                <label className="sr-only" htmlFor={`pillar-${i}`}>{DAYS[i]} post type</label>
                <select id={`pillar-${i}`} value={d.pillar} onChange={e => update(i, { pillar: Number(e.target.value) })}
                  className={`flex-1 min-w-0 h-10 px-3 rounded-sm border bg-studio-black focus:outline-none focus:border-gold/60 ${d.pillar === OFFER_ID ? "border-gold/40" : "border-studio-border"} ${d.pillar ? "text-cream" : "text-mist/60"}`}>
                  {PILLARS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                {d.pillar > 0 ? (
                  <button onClick={() => setOpen(expanded ? null : i)} aria-expanded={expanded}
                    aria-label={`${DAYS[i]} clip checklist, ${done} of ${CLIP_CHECKLIST.length} done`}
                    className={`h-10 px-2.5 flex items-center gap-1.5 rounded-sm border text-xs shrink-0 transition-colors ${done === CLIP_CHECKLIST.length ? "border-[var(--if-success)]/50 text-[var(--if-success)]" : "border-studio-border text-mist"}`}>
                    {done === CLIP_CHECKLIST.length ? <Check className="w-3.5 h-3.5" /> : <span className="tabular-nums">{done}/{CLIP_CHECKLIST.length}</span>}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                ) : <span className="w-[62px] shrink-0" aria-hidden />}
              </div>
              {expanded && (
                <div className="px-4 sm:px-5 pb-4 sm:pl-[76px]">
                  <label className="block text-[10px] tracking-[0.16em] uppercase text-mist/50 mb-1.5" htmlFor={`note-${i}`}>Idea / hook</label>
                  <input id={`note-${i}`} value={d.note} maxLength={200} onChange={e => update(i, { note: e.target.value })}
                    placeholder={PILLARS[d.pillar]?.tip ? `e.g. ${PILLARS[d.pillar].tip.toLowerCase()}` : "What's the clip?"}
                    className="w-full h-10 px-3 rounded-sm border border-studio-border bg-studio-black text-cream placeholder:text-mist/30 mb-3 focus:outline-none focus:border-gold/60" />
                  <ul className="space-y-0.5">
                    {CLIP_CHECKLIST.map((c, ci) => (
                      <li key={c}>
                        <label className="flex items-start gap-3 py-1.5 text-sm text-cream cursor-pointer">
                          <input type="checkbox" checked={d.checks[ci]} onChange={e => update(i, { checks: d.checks.map((v, k) => (k === ci ? e.target.checked : v)) })}
                            className="mt-0.5 w-4 h-4 accent-[#D4AF77] shrink-0" />
                          <span className={d.checks[ci] ? "text-mist/50 line-through" : ""}>{c}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!expanded && d.pillar > 0 && d.note && <p className="px-4 sm:px-5 -mt-1.5 pb-3 pl-[72px] sm:pl-[76px] text-xs text-mist/60 truncate">{d.note}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
