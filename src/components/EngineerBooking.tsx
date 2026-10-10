"use client"
// src/components/EngineerBooking.tsx
// Booking flow for the individual engineer pages (/book/*). Shares the
// calendar, time slots, discount field and summary with /studio. Prices come
// from lib/studio-rates ENGINEER_RATES; /api/engineer-checkout re-prices the
// charge from the same table server-side.

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CreditCard, AlertCircle, Loader2, Check, ExternalLink, Shield } from "lucide-react"
import { Button, Input, Label } from "@flu-wop/design-system"
import { cn } from "@/lib/utils"
import { track, getSessionId } from "@/lib/analytics"
import { beacon } from "@/lib/beacon"
import { ROOMS, type RoomId } from "@/lib/rooms"
import { ENGINEER_RATES, HOURLY_MIN, quoteEngineer, fmtUSD, localDateKey } from "@/lib/studio-rates"
import { PageHeader } from "@/components/sections/PageHeader"
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

export interface EngineerConfig {
  name:       string
  slug:       string
  role:       string
  bio:        string
  room:       RoomId
  allowRoomSwitch: boolean
  /** Kept for compatibility with the page files; pricing always comes from ENGINEER_RATES. */
  rates?: { id: string; label: string; hours: number; price: number }[]
  linktreeUrl?: string
  photoFile?:  string
}

const STEPS = ["Package", "Date & Time", "Your Info", "Confirm"]
const START_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

export function EngineerBooking({ config }: { config: EngineerConfig }) {
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState<1 | -1>(1)
  const [room, setRoom] = useState<RoomId>(config.room)
  const [rateId, setRateId] = useState<string | null>(null)
  const [hours, setHours] = useState(HOURLY_MIN)
  const [date, setDate] = useState<Date | null>(null)
  const [startHour, setStartHour] = useState<number | null>(null)
  const [info, setInfo] = useState({ name: "", email: "", notes: "" })
  const [touched, setTouched] = useState({ name: false, email: false })
  const [code, setCode] = useState("")
  const [discount, setDiscount] = useState<number | null>(null)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const flowRef = useRef<HTMLDivElement>(null)
  const scrollTo = useScrollTo()
  const { loading: checking, isTaken } = useAvailability(room, date)

  const quote = rateId ? quoteEngineer(rateId, hours) : null
  const subtotal = quote?.cents ?? 0
  const total = subtotal - (discount ? Math.round(subtotal * discount) : 0)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email.trim())
  const linktree = config.linktreeUrl && config.linktreeUrl !== "#" ? config.linktreeUrl : null
  const homeRoom = ROOMS.find(r => r.id === config.room)

  useEffect(() => {
    track("view_item", { funnel: "booking", item_category: "engineer_booking", engineer_slug: config.slug })
  }, [config.slug])

  useEffect(() => {
    if (startHour !== null && quote && isTaken(startHour, quote.hours)) setStartHour(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote?.hours, room, date])

  const canProceed = useMemo(() => {
    if (step === 1) return !!rateId
    if (step === 2) return !!date && startHour !== null
    if (step === 3) return info.name.trim() !== "" && emailOk
    return true
  }, [step, rateId, date, startHour, info.name, emailOk])

  function go(n: number) {
    setDir(n > step ? 1 : -1)
    setStep(n)
    requestAnimationFrame(() => scrollTo(flowRef.current))
  }

  async function pay() {
    if (!quote || !date || startHour === null) return
    setPaying(true); setPayError(null)
    track("begin_checkout", { funnel: "booking", service: quote.label, rate_cents: total, engineer_slug: config.slug })
    try {
      const res = await fetch("/api/engineer-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engineerSlug: config.slug, room, rateId, rateHours: quote.hours,
          date: localDateKey(date), startHour,
          clientName: info.name.trim(), clientEmail: info.email.trim(), clientNotes: info.notes.trim(),
          discountCode: discount ? code.trim().toUpperCase() : "",
          funnelSessionId: getSessionId(),
        }),
      })
      const data = await res.json()
      if (res.ok && data.url) { window.location.href = data.url; return }
      setPayError(data.error ?? "Couldn't start checkout. Please try again.")
      if (res.status === 409) { setStartHour(null); go(2) }
    } catch {
      setPayError("Network error. Check your connection and try again.")
    }
    setPaying(false)
  }

  const roomName = ROOMS.find(r => r.id === room)?.name ?? `Studio ${room}`
  const dateLabel = date?.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })
  const nextLabel = ["", "Choose date", "Your info", "Review"][step]

  return (
    <div className="bg-studio-black min-h-screen">
      <PageHeader
        compact
        eyebrow="Book a session"
        title={<>Book with <span className="text-gold-gradient">{config.name}</span></>}
        lede={config.bio}
        image={homeRoom?.image}
        imageAlt={homeRoom?.imageAlt}
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-mist">
          <span className="text-gold/80 tracking-[0.18em] uppercase text-[11px]">{config.role}</span>
          <span className="hidden sm:inline text-mist/30">·</span>
          <span>Home room: {homeRoom?.name}</span>
          {linktree && (
            <a href={linktree} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold/80 hover:text-gold">
              Links <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Link href="/studio" className="inline-flex items-center gap-1 hover:text-cream"><ArrowLeft className="w-3 h-3" />All studio options</Link>
        </div>
      </PageHeader>

      <div ref={flowRef} className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 scroll-mt-20">
        <div className="mb-10"><StepIndicator steps={STEPS} step={step} onJump={go} /></div>

        <StepPanel stepKey={step} dir={dir}>
          {step === 1 && (
            <div className="space-y-8">
              {config.allowRoomSwitch && (
                <fieldset>
                  <legend className="font-display text-2xl text-cream mb-4">Room</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {ROOMS.map(r => (
                      <button key={r.id} type="button" onClick={() => { setRoom(r.id); beacon("room_select", { item: r.id }) }} aria-pressed={room === r.id}
                        className={cn("p-3 border rounded-sm text-left transition-all min-w-0",
                          room === r.id ? "border-gold bg-gold/5" : "border-studio-border bg-studio-card hover:border-gold/40")}>
                        <span className="block text-sm text-cream">{r.name}</span>
                        <span className="hidden sm:block text-[10px] tracking-wide uppercase text-gold/60 mt-0.5 truncate">{r.role}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              <fieldset>
                <legend className="font-display text-2xl text-cream mb-4">Choose your package</legend>
                <div className="space-y-3">
                  {ENGINEER_RATES.map(rate => {
                    const on = rateId === rate.id
                    return (
                      <button key={rate.id} type="button" aria-pressed={on}
                        onClick={() => { setRateId(rate.id); if (rate.id !== "hourly") setHours(HOURLY_MIN) }}
                        className={cn("w-full flex items-center justify-between gap-4 p-4 border rounded-sm text-left transition-all",
                          on ? "border-gold bg-gold/5" : "border-studio-border bg-studio-card hover:border-gold/40")}>
                        <span className="flex items-center gap-3">
                          <span className={cn("w-4 h-4 rounded-full border-2 grid place-items-center shrink-0", on ? "border-gold bg-gold" : "border-studio-border")}>
                            {on && <Check className="w-2.5 h-2.5 text-studio-black" />}
                          </span>
                          <span>
                            <span className="block text-cream text-sm font-medium">{rate.label}</span>
                            <span className="block text-mist text-xs">{rate.id === "hourly" ? `Minimum ${HOURLY_MIN} hours` : `${rate.hours} hours`}</span>
                          </span>
                        </span>
                        <span className="font-display text-2xl text-gold whitespace-nowrap">{fmtUSD(rate.price)}{rate.id === "hourly" && <span className="text-sm text-gold/70">/hr</span>}</span>
                      </button>
                    )
                  })}
                </div>
                {rateId === "hourly" && <div className="mt-4"><HourStepper value={hours} onChange={setHours} perHour={ENGINEER_RATES[0].price} /></div>}
              </fieldset>
              <Nav canNext={canProceed} nextLabel={nextLabel} onNext={() => go(2)} hint="Choose a package" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <h2 className="font-display text-2xl text-cream">Pick a date & start time</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <Label className="mb-3 block">Date</Label>
                  <BookingCalendar selected={date} onSelect={d => { setDate(d); setStartHour(null) }} note="Every booking is confirmed within 24 hours" />
                </div>
                <div>
                  <Label className="mb-3 block">Start time <span className="text-mist/60 normal-case tracking-normal">· {roomName}</span></Label>
                  {date ? (
                    <TimeSlots hours={START_HOURS} selected={startHour} onSelect={setStartHour}
                      isTaken={h => isTaken(h, quote?.hours ?? 1)} loading={checking} sessionHours={quote?.hours ?? 1} />
                  ) : (
                    <p className="text-mist text-sm border border-dashed border-studio-border rounded-sm p-6 text-center">Pick a date to see open times.</p>
                  )}
                </div>
              </div>
              <Nav onBack={() => go(1)} canNext={canProceed} nextLabel={nextLabel} onNext={() => go(3)} hint={!date ? "Pick a date" : "Pick a start time"} />
            </div>
          )}

          {step === 3 && (
            <form className="space-y-5" noValidate onSubmit={e => { e.preventDefault(); if (canProceed) go(4) }}>
              <h2 className="font-display text-2xl text-cream">Your information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Name *" id="name" autoComplete="name" value={info.name}
                  onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  error={touched.name && !info.name.trim() ? "Add your name so we know who's coming in." : undefined} placeholder="Your name" />
                <Input label="Email *" id="email" type="email" inputMode="email" autoComplete="email" value={info.email}
                  onChange={e => setInfo(p => ({ ...p, email: e.target.value }))} onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  error={touched.email && !emailOk ? "Enter an email we can send your confirmation to." : undefined} placeholder="you@example.com" />
              </div>
              <Input multiline label="Notes" id="notes" value={info.notes} inputClassName="h-28"
                onChange={e => setInfo(p => ({ ...p, notes: e.target.value }))} placeholder={`What are you working on with ${config.name}? Anything they should know?`} />
              <DiscountField code={code} onCode={setCode} applied={discount} onApplied={setDiscount} />
              <Nav onBack={() => go(2)} canNext={canProceed} nextLabel={nextLabel} submit hint={!info.name.trim() ? "Add your name" : "Add a valid email"} />
            </form>
          )}

          {step === 4 && quote && date && startHour !== null && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-cream">Confirm your booking</h2>
              <OrderSummary subtotal={subtotal} discountPct={discount} rows={[
                ["Engineer", config.name],
                ["Room", roomName],
                ["Session", quote.label + (rateId === "hourly" ? ` · ${quote.hours} hrs` : "")],
                ["Date", dateLabel ?? ""],
                ["Time", `${fmtHour(startHour)}–${fmtHour(startHour + quote.hours)}`],
              ]} />
              <div className="border border-studio-border/50 rounded-sm p-4 flex gap-3">
                <Shield className="w-4 h-4 text-gold/50 shrink-0 mt-0.5" />
                <p className="text-mist text-xs leading-relaxed">Full payment secures your date. The studio manager approves every booking within 24 hours, and a calendar invite (.ics) is emailed on confirmation.</p>
              </div>
              {payError && (
                <div role="alert" className="border border-red-500/30 bg-red-500/5 rounded-sm p-4 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 leading-relaxed">{payError}</p>
                </div>
              )}
              <Button onClick={pay} disabled={paying} size="lg" className="w-full">
                {paying ? <><Loader2 className="w-4 h-4 animate-spin" />Opening checkout…</> : <><CreditCard className="w-4 h-4" />Pay {fmtUSD(total)} & reserve</>}
              </Button>
              <Button variant="ghost" onClick={() => go(3)}><ArrowLeft className="w-4 h-4" /> Back</Button>
            </div>
          )}
        </StepPanel>
      </div>

      <TotalBar show={step < 4} cents={total} cta={nextLabel || "Next"} disabled={!canProceed}
        summary={[quote?.label, roomName, dateLabel && startHour !== null ? `${dateLabel} · ${fmtHour(startHour)}` : null].filter(Boolean).join(" · ")}
        onNext={() => { if (canProceed) go(step + 1) }} />
      <div className="h-20 md:hidden" aria-hidden />
    </div>
  )
}

function Nav({ onBack, canNext, nextLabel, onNext, submit, hint }: {
  onBack?: () => void; canNext: boolean; nextLabel: string; onNext?: () => void; submit?: boolean; hint?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {onBack ? <Button type="button" variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4" /> Back</Button>
        : <Button variant="ghost" asChild><Link href="/studio"><ArrowLeft className="w-4 h-4" /> Studio</Link></Button>}
      <div className="hidden md:flex items-center gap-4">
        {!canNext && hint && <span className="text-xs text-mist/60">{hint}</span>}
        <Button type={submit ? "submit" : "button"} onClick={submit ? undefined : onNext} disabled={!canNext}>
          {nextLabel}<ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
