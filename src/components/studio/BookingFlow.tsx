"use client"
// src/components/studio/BookingFlow.tsx
// The /studio four-step booking: session + room + package → date & time →
// details → review & pay. Prices shown here come from lib/studio-rates, and
// /api/booking-checkout prices the charge from the same table server-side.

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  Mic2, Music2, Headphones, Drum, Guitar, ArrowLeft, ArrowRight,
  CheckCircle2, CreditCard, Shield, Tag, Check, AlertCircle, Loader2,
} from "lucide-react"
import { Button, Badge, Input, Label } from "@flu-wop/design-system"
import { cn } from "@/lib/utils"
import { track, getSessionId } from "@/lib/analytics"
import { ROOMS, type RoomId } from "@/lib/rooms"
import {
  RECORDING_RATES, MIXING_RATES, HOURLY_MIN, quoteStudio, fmtUSD, localDateKey, type StudioRate,
} from "@/lib/studio-rates"
import { BookingCalendar } from "@/components/booking/BookingCalendar"
import { TimeSlots } from "@/components/booking/TimeSlots"
import { StepIndicator } from "@/components/booking/StepIndicator"
import { StepPanel } from "@/components/booking/StepPanel"
import { HourStepper } from "@/components/booking/HourStepper"
import { DiscountField } from "@/components/booking/DiscountField"
import { OrderSummary } from "@/components/booking/OrderSummary"
import { TotalBar } from "@/components/booking/TotalBar"
import { useAvailability, fmtHour } from "@/components/booking/useAvailability"
import { useScrollTo } from "@/components/booking/useScrollTo"

const STEPS = ["Session", "Date & Time", "Details", "Payment"]
const START_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18]
const ROOM_ICON = { A: Mic2, B: Drum, C: Guitar } as const
type SessionType = "recording" | "mixing"

export interface BookingFlowHandle { focusRoom: (id: RoomId) => void; scrollIntoView: () => void }

export const BookingFlow = forwardRef<BookingFlowHandle>(function BookingFlow(_, ref) {
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState<1 | -1>(1)
  const [types, setTypes] = useState<Set<SessionType>>(new Set())
  const [room, setRoom] = useState<RoomId | null>(null)
  const [rateId, setRateId] = useState<string | null>(null)
  const [hours, setHours] = useState(HOURLY_MIN)
  const [date, setDate] = useState<Date | null>(null)
  const [startHour, setStartHour] = useState<number | null>(null)
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" })
  const [touched, setTouched] = useState({ name: false, email: false })
  const [code, setCode] = useState("")
  const [discount, setDiscount] = useState<number | null>(null)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [inView, setInView] = useState(false)

  const sectionRef = useRef<HTMLElement>(null)
  const scrollTo = useScrollTo()
  const { loading: checking, isTaken } = useAvailability(room, date)

  useImperativeHandle(ref, () => ({
    focusRoom: (id) => { setRoom(id); go(1); scrollTo(sectionRef.current) },
    scrollIntoView: () => scrollTo(sectionRef.current),
  }))

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get("success") === "1") setSuccess(true)
    const r = p.get("room")?.toUpperCase()
    if (r === "A" || r === "B" || r === "C") setRoom(r)
    track("view_item", { funnel: "booking", item_category: "studio_booking" })
  }, [])

  // Only show the phone total bar while the booking section is on screen.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "-30% 0px -20% 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const rates: StudioRate[] = [
    ...(types.has("recording") ? RECORDING_RATES : []),
    ...(types.has("mixing") ? MIXING_RATES : []),
  ]
  const quote = rateId ? quoteStudio(rateId, hours) : null
  const subtotal = quote?.cents ?? 0
  const total = subtotal - (discount ? Math.round(subtotal * discount) : 0)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())

  const canProceed = useMemo(() => {
    if (step === 1) return types.size > 0 && !!rateId && !!room
    if (step === 2) return !!date && startHour !== null
    if (step === 3) return form.name.trim() !== "" && emailOk
    return true
  }, [step, types, rateId, room, date, startHour, form.name, emailOk])

  // Changing package length can make a picked time overlap a booking.
  useEffect(() => {
    if (startHour !== null && quote && isTaken(startHour, quote.hours)) setStartHour(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote?.hours, room, date])

  function go(n: number) {
    setDir(n > step ? 1 : -1)
    setStep(n)
    if (n !== step) requestAnimationFrame(() => scrollTo(sectionRef.current))
  }

  function toggleType(t: SessionType | "both") {
    setTypes(prev => {
      if (t === "both") return prev.size === 2 ? new Set() : new Set<SessionType>(["recording", "mixing"])
      const next = new Set(prev)
      next.has(t) ? next.delete(t) : next.add(t)
      return next
    })
    setRateId(null)
  }

  async function pay() {
    if (!quote || !room || !date || startHour === null) return
    setPaying(true); setPayError(null)
    track("begin_checkout", { funnel: "booking", service: quote.label, rate_cents: total })
    try {
      const res = await fetch("/api/booking-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room, rateId, rateHours: quote.hours,
          date: localDateKey(date), startHour,
          clientName: form.name.trim(), clientEmail: form.email.trim(),
          clientNotes: [form.notes.trim(), form.phone.trim() ? `Phone: ${form.phone.trim()}` : ""].filter(Boolean).join("\n"),
          discountCode: discount ? code.trim().toUpperCase() : "",
          funnelSessionId: getSessionId(),
        }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      setPayError(data.error || "Couldn't start checkout. Please try again.")
      if (res.status === 409) { setStartHour(null); go(2) }
    } catch {
      setPayError("Network error. Check your connection and try again.")
    }
    setPaying(false)
  }

  const roomName = ROOMS.find(r => r.id === room)?.name
  const dateLabel = date?.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })
  const barSummary = [quote?.label, roomName, dateLabel && startHour !== null ? `${dateLabel} · ${fmtHour(startHour)}` : null].filter(Boolean).join(" · ") || "Build your session"
  const nextLabel = ["", "Choose date", "Your details", "Review & pay"][step]

  if (success) {
    return (
      <section ref={sectionRef} id="booking-form" className="py-24 px-6 border-b border-studio-border/40 bg-studio-charcoal scroll-mt-20">
        <div className="mx-auto max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto border border-gold/40 rounded-full grid place-items-center"><CheckCircle2 className="w-8 h-8 text-gold" /></div>
          <h2 className="font-display text-4xl text-cream">Booking received</h2>
          <p className="text-mist text-sm leading-relaxed">Payment confirmed. The studio manager will approve your session within 24 hours, and your confirmation and calendar invite are on their way by email.</p>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" asChild><Link href="/">Back to home</Link></Button>
            <Button asChild><Link href="/projects">Explore projects</Link></Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} id="booking-form" className="py-16 sm:py-20 px-4 sm:px-6 border-b border-studio-border/40 bg-studio-charcoal scroll-mt-20">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">Reserve your time</Badge>
          <h2 className="font-display text-4xl md:text-5xl text-cream mb-3">Book the studio</h2>
          <p className="text-mist text-sm max-w-md mx-auto">Full payment reserves your date. Every booking is approved by the studio manager within 24 hours, or fully refunded.</p>
        </div>

        <div className="mb-10"><StepIndicator steps={STEPS} step={step} onJump={go} /></div>

        <StepPanel stepKey={step} dir={dir}>
          {/* ── 1. Session, room, package ─────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-10">
              <fieldset>
                <legend className="font-display text-2xl text-cream mb-4">What type of session?</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { t: "recording", label: "Recording", sub: "Live room tracking", Icon: Mic2 },
                    { t: "mixing", label: "Mixing", sub: "Submit stems remotely", Icon: Music2 },
                    { t: "both", label: "Recording + Mixing", sub: "Full production package", Icon: Headphones },
                  ] as const).map(({ t, label, sub, Icon }) => {
                    const on = t === "both" ? types.size === 2 : types.has(t)
                    return (
                      <button key={t} type="button" onClick={() => toggleType(t)} aria-pressed={on}
                        className={cn("flex items-center gap-3 p-4 border rounded-sm text-left transition-all min-h-[72px]",
                          on ? "border-gold bg-gold/5" : "border-studio-border bg-studio-card hover:border-gold/40")}>
                        <span className={cn("w-9 h-9 rounded-sm border grid place-items-center shrink-0 transition-colors", on ? "border-gold bg-gold/10" : "border-studio-border")}>
                          <Icon className={cn("w-4 h-4", on ? "text-gold" : "text-gold/60")} />
                        </span>
                        <span>
                          <span className="block text-cream text-sm font-medium">{label}</span>
                          <span className="block text-mist text-[11px]">{sub}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-display text-2xl text-cream mb-4">Which room?</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ROOMS.map(r => {
                    const Icon = ROOM_ICON[r.id]
                    const on = room === r.id
                    return (
                      <button key={r.id} type="button" onClick={() => setRoom(r.id)} aria-pressed={on}
                        className={cn("flex items-start gap-3 p-4 border rounded-sm text-left transition-all h-full",
                          on ? "border-gold bg-gold/5" : "border-studio-border bg-studio-card hover:border-gold/40")}>
                        <span className={cn("w-9 h-9 rounded-sm border grid place-items-center shrink-0", on ? "border-gold bg-gold/10" : "border-studio-border")}>
                          <Icon className={cn("w-4 h-4", on ? "text-gold" : "text-gold/60")} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-cream text-sm font-medium">{r.name}</span>
                          <span className="block text-gold/60 text-[10px] tracking-wide uppercase mb-1">{r.role}</span>
                          <span className="block text-mist text-[11px] leading-relaxed">{r.short}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-display text-2xl text-cream mb-4">Choose a package</legend>
                {rates.length === 0 ? (
                  <p className="text-mist text-sm border border-dashed border-studio-border rounded-sm p-6 text-center">Pick a session type above to see packages.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {rates.map(rate => (
                      <PackageCard key={rate.id} rate={rate} selected={rateId === rate.id}
                        onSelect={() => { setRateId(rate.id); if (rate.id !== "hourly") setHours(HOURLY_MIN) }} />
                    ))}
                  </div>
                )}
                {rateId === "hourly" && <div className="mt-4"><HourStepper value={hours} onChange={setHours} perHour={RECORDING_RATES[0].price} /></div>}
              </fieldset>

              <StepNav canNext={canProceed} nextLabel={nextLabel} onNext={() => go(2)}
                hint={!types.size ? "Choose a session type" : !room ? "Choose a room" : !rateId ? "Choose a package" : undefined} />
            </div>
          )}

          {/* ── 2. Date & time ────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-8">
              <h3 className="font-display text-2xl text-cream">Select a date & start time</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <Label className="mb-3 block">Date</Label>
                  <BookingCalendar selected={date} onSelect={d => { setDate(d); setStartHour(null) }} closedDays={[0]} note="Closed Sundays · Every booking is confirmed within 24 hours" />
                </div>
                <div>
                  <Label className="mb-3 block">Start time {roomName && <span className="text-mist/60 normal-case tracking-normal">· {roomName}</span>}</Label>
                  {date ? (
                    <TimeSlots hours={START_HOURS} selected={startHour} onSelect={setStartHour}
                      isTaken={h => isTaken(h, quote?.hours ?? 1)} loading={checking} sessionHours={quote?.hours ?? 1} />
                  ) : (
                    <p className="text-mist text-sm border border-dashed border-studio-border rounded-sm p-6 text-center">Pick a date to see open times.</p>
                  )}
                  {date && startHour !== null && (
                    <div className="mt-4 p-3 border border-gold/20 bg-gold/5 rounded-sm">
                      <p className="text-[10px] tracking-widest uppercase text-mist/60 mb-1">Your session</p>
                      <p className="text-cream text-sm">{date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} <span className="text-gold">· {fmtHour(startHour)}–{fmtHour(startHour + (quote?.hours ?? 1))}</span></p>
                    </div>
                  )}
                </div>
              </div>
              <StepNav onBack={() => go(1)} canNext={canProceed} nextLabel={nextLabel} onNext={() => go(3)}
                hint={!date ? "Pick a date" : startHour === null ? "Pick a start time" : undefined} />
            </div>
          )}

          {/* ── 3. Details ────────────────────────────────────────────── */}
          {step === 3 && (
            <form className="space-y-6" noValidate onSubmit={e => { e.preventDefault(); if (canProceed) go(4) }}>
              <h3 className="font-display text-2xl text-cream">Your information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full name *" id="name" autoComplete="name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  error={touched.name && !form.name.trim() ? "Add your name so we know who's coming in." : undefined} placeholder="Your name" />
                <Input label="Email *" id="email" type="email" autoComplete="email" inputMode="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  error={touched.email && !emailOk ? "Enter an email we can send your confirmation to." : undefined} placeholder="you@example.com" />
                <Input label="Phone" id="phone" type="tel" autoComplete="tel" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(504) 555-0100" />
              </div>
              <Input multiline label="Project notes" id="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Genre, number of tracks, special requirements — anything the engineer should know before you arrive." inputClassName="h-32" />
              <DiscountField code={code} onCode={setCode} applied={discount} onApplied={setDiscount} />
              <StepNav onBack={() => go(2)} canNext={canProceed} nextLabel={nextLabel} submit
                hint={!form.name.trim() ? "Add your name" : !emailOk ? "Add a valid email" : undefined} />
            </form>
          )}

          {/* ── 4. Review & pay ───────────────────────────────────────── */}
          {step === 4 && quote && (
            <div className="space-y-6">
              <h3 className="font-display text-2xl text-cream">Review & pay</h3>
              <div className="grid md:grid-cols-[1.2fr_1fr] gap-5 items-start">
                <OrderSummary subtotal={subtotal} discountPct={discount} rows={[
                  ["Session", quote.label + (rateId === "hourly" ? ` · ${quote.hours} hrs` : "")],
                  ["Room", `${roomName}`],
                  ["Date", date!.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })],
                  ["Time", `${fmtHour(startHour!)}–${fmtHour(startHour! + quote.hours)}`],
                  ["Name", form.name.trim()],
                  ["Email", form.email.trim()],
                ]} />
                <div className="border border-studio-border rounded-sm bg-studio-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-studio-border bg-studio-dark flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gold/50" />
                    <p className="text-[10px] tracking-widest uppercase text-gold/70">Secure payment · Stripe</p>
                  </div>
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-mist leading-relaxed"><strong className="text-cream">Payment reserves your spot.</strong> If we can't accommodate your date, you get a full refund right away.</p>
                    {payError && (
                      <div role="alert" className="border border-red-500/30 bg-red-500/5 rounded-sm p-3 flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-300 leading-relaxed">{payError}</p>
                      </div>
                    )}
                    <Button onClick={pay} disabled={paying} className="w-full" size="lg">
                      {paying ? <><Loader2 className="w-4 h-4 animate-spin" />Opening checkout…</> : <><CreditCard className="w-4 h-4" />Pay {fmtUSD(total)}</>}
                    </Button>
                    <p className="text-[11px] text-mist/50 text-center">Card, Apple Pay or Google Pay</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" onClick={() => go(3)} className="w-full sm:w-auto"><ArrowLeft className="w-4 h-4" /> Back</Button>
            </div>
          )}
        </StepPanel>
      </div>

      <TotalBar show={inView && step < 4} summary={barSummary} cents={total} cta={nextLabel || "Next"}
        disabled={!canProceed} onNext={() => (step === 3 ? canProceed && go(4) : go(step + 1))} />
      {/* keep the last controls clear of the pinned bar on phones */}
      <div className="h-20 md:hidden" aria-hidden />
    </section>
  )
})

function PackageCard({ rate, selected, onSelect }: { rate: StudioRate; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected}
      className={cn("relative text-left w-full h-full p-5 border rounded-sm transition-all",
        selected ? "border-gold bg-gold/5 shadow-[0_0_24px_rgba(212,175,119,0.12)]" : "border-studio-border bg-studio-card hover:border-gold/40")}>
      {rate.badge && <Badge variant={rate.popular ? "gold" : "outline"} className="absolute top-3 right-3 text-[9px] leading-[1.6]">{rate.badge}</Badge>}
      <span className={cn("absolute top-3.5 left-3.5 w-4 h-4 rounded-full border-2 grid place-items-center transition-all", selected ? "border-gold bg-gold" : "border-studio-border")}>
        {selected && <Check className="w-2.5 h-2.5 text-studio-black" />}
      </span>
      <span className="block mt-6">
        <span className="block text-[10px] tracking-[0.15em] uppercase text-mist/60 mb-1">{rate.duration ?? "Mixing"}</span>
        <span className="block font-display text-xl text-cream mb-2">{rate.label}</span>
        <span className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-3">
          <span className="font-display text-3xl text-gold">{fmtUSD(rate.price)}{rate.id === "hourly" && <span className="text-base text-gold/70">/hr</span>}</span>
          {rate.perHour && rate.id !== "hourly" && <span className="text-mist text-xs">{fmtUSD(rate.perHour)}/hr</span>}
          {rate.regularPrice && <span className="inline-flex items-center gap-1 text-mist text-xs"><Tag className="w-3 h-3 text-gold/40" />{fmtUSD(rate.regularPrice)} for regulars</span>}
        </span>
        <span className="block text-mist text-xs leading-relaxed mb-4">{rate.desc}</span>
        <span className="block space-y-1.5">
          {rate.includes.map(inc => (
            <span key={inc} className="flex items-center gap-2 text-xs text-mist/80"><span className="w-1.5 h-1.5 rounded-full bg-gold/50 shrink-0" />{inc}</span>
          ))}
        </span>
      </span>
    </button>
  )
}

function StepNav({ onBack, canNext, nextLabel, onNext, submit, hint }: {
  onBack?: () => void; canNext: boolean; nextLabel: string; onNext?: () => void; submit?: boolean; hint?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {onBack ? <Button type="button" variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4" /> Back</Button> : <span />}
      {/* phones advance from the pinned total bar */}
      <div className="hidden md:flex items-center gap-4">
        {!canNext && hint && <span className="text-xs text-mist/60">{hint}</span>}
        <Button type={submit ? "submit" : "button"} onClick={submit ? undefined : onNext} disabled={!canNext}>
          {nextLabel} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
