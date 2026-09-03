"use client"
// src/components/EngineerBooking.tsx

import { useState, useMemo, useEffect } from "react"
import Link  from "next/link"
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  CreditCard, AlertCircle, Check,
} from "lucide-react"
import { Button }    from "@/components/ui/button"
import { Badge }     from "@/components/ui/badge"
import { Input }     from "@/components/ui/input"
import { Label }     from "@/components/ui/label"
import { cn }        from "@/lib/utils"
import { track, getSessionId } from "@/lib/analytics"

const DISCOUNT_CODES: Record<string, number> = {
  REGULAR30: 0.30,
  STUDIO10:  0.10,
}

export interface EngineerConfig {
  name:       string
  slug:       string
  role:       string
  bio:        string
  room:       "A" | "B" | "C"
  allowRoomSwitch: boolean
  rates: { id: string; label: string; hours: number; price: number }[]
  linktreeUrl?: string
  photoFile?:  string
}

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"]
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

function getDaysInMonth(y: number, m: number) { return new Date(y, m+1, 0).getDate() }
function getFirstDay(y: number, m: number)    { return new Date(y, m, 1).getDay() }

export function EngineerBooking({ config }: { config: EngineerConfig }) {
  const today = new Date()
  const [step,      setStep]      = useState(1)
  const [room,      setRoom]      = useState<"A"|"B"|"C">(config.room)
  const [rateId,    setRateId]    = useState<string|null>(null)
  const [hourlyQty, setHourlyQty] = useState(2)           // min 2 hours for hourly
  const [calYear,   setCalYear]   = useState(today.getFullYear())
  const [calMonth,  setCalMonth]  = useState(today.getMonth())
  const [selDate,   setSelDate]   = useState<Date|null>(null)
  const [selHour,   setSelHour]   = useState<number|null>(null)
  const [bookedRanges, setBookedRanges] = useState<{start_hour:number; rate_hours:number}[]>([])
  const [clientInfo,setClientInfo]= useState({ name:"", email:"", notes:"" })
  const [loading,   setLoading]   = useState(false)
  const [payError,  setPayError]  = useState<string|null>(null)
  const [discountCode,    setDiscountCode]    = useState("")
  const [discountApplied, setDiscountApplied] = useState<number|null>(null)
  const [discountError,   setDiscountError]   = useState<string|null>(null)

  const selectedRate   = config.rates.find(r => r.id === rateId)
  // For hourly rate: multiply by hourlyQty; otherwise use fixed price
  const effectivePrice = selectedRate
    ? (selectedRate.id === "hourly" ? selectedRate.price * hourlyQty : selectedRate.price)
    : 0
  const effectiveHours = selectedRate
    ? (selectedRate.id === "hourly" ? hourlyQty : selectedRate.hours)
    : 0
  const discountAmt    = discountApplied ? Math.round(effectivePrice * discountApplied) : 0
  const finalPrice     = effectivePrice - discountAmt

  function applyCode() {
    const code = discountCode.trim().toUpperCase()
    if (DISCOUNT_CODES[code] !== undefined) {
      setDiscountApplied(DISCOUNT_CODES[code]); setDiscountError(null)
    } else {
      setDiscountApplied(null)
      setDiscountError("Code not recognised. Reach out if you're a regular client.")
    }
  }

  const canProceed = useMemo(() => {
    if (step===1) return rateId !== null
    if (step===2) return selDate !== null && selHour !== null
    if (step===3) return clientInfo.name.trim() !== "" && clientInfo.email.trim() !== ""
    return false
  }, [step, rateId, selDate, selHour, clientInfo])

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay    = getFirstDay(calYear, calMonth)
  const prevMonth   = () => { if (calMonth===0) { setCalYear(y=>y-1); setCalMonth(11) } else setCalMonth(m=>m-1) }
  const nextMonth   = () => { if (calMonth===11) { setCalYear(y=>y+1); setCalMonth(0) } else setCalMonth(m=>m+1) }
  const isPast      = (d: number) => new Date(calYear, calMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const isSelected  = (d: number) => selDate?.getFullYear()===calYear && selDate?.getMonth()===calMonth && selDate?.getDate()===d

  const HOURS = [9,10,11,12,13,14,15,16,17,18,19,20]

  useEffect(() => {
    if (!selDate) { setBookedRanges([]); return }
    const dateStr = selDate.toISOString().slice(0, 10)
    fetch(`/api/availability?room=${room}&date=${dateStr}`)
      .then(res => res.json())
      .then(data => setBookedRanges(data.booked ?? []))
      .catch(() => setBookedRanges([]))
  }, [selDate, room])

  useEffect(() => {
    track("view_item", { funnel: "booking", item_category: "engineer_booking", engineer_slug: config.slug })
  }, [config.slug])

  function isSlotBooked(startHour: number) {
    const hours = effectiveHours || 1
    const end = startHour + hours
    return bookedRanges.some(r => startHour < r.start_hour + r.rate_hours && end > r.start_hour)
  }

  async function handleSubmit() {
    setLoading(true)
    setPayError(null)
    track("begin_checkout", {
      funnel: "booking",
      service: selectedRate?.label ?? "",
      rate_cents: finalPrice,
      engineer_slug: config.slug,
    })
    try {
      const res = await fetch("/api/engineer-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engineerName: config.name,
          engineerSlug: config.slug,
          room,
          rateId:       rateId ?? "",
          rateLabel:    selectedRate?.label ?? "",
          rateHours:    effectiveHours,
          ratePrice:    effectivePrice,   // pre-discount; server recalculates
          date:         selDate?.toISOString().split("T")[0] ?? "",
          startHour:    selHour ?? 0,
          clientName:   clientInfo.name,
          clientEmail:  clientInfo.email,
          clientNotes:  clientInfo.notes,
          discountCode: discountCode.trim().toUpperCase(),
          funnelSessionId: getSessionId(),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed")
      window.location.href = data.url
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const STEP_LABELS = ["Package", "Date & Time", "Your Info", "Confirm"]

  return (
    <div className="pt-16 min-h-screen bg-studio-black">

      {/* Header */}
      <section className="py-14 px-6 bg-studio-charcoal border-b border-studio-border">
        <div className="mx-auto max-w-3xl">
          <Link href="/studio" className="flex items-center gap-2 text-mist hover:text-gold text-xs mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
          </Link>
          <Badge variant="outline" className="mb-3 text-[10px] tracking-widest uppercase">Book a Session</Badge>
          <h1 className="font-display text-4xl text-cream mb-1">
            Book with <span className="text-gold-gradient">{config.name}</span>
          </h1>
          <p className="text-mist text-sm">{config.role} · Studio {room}</p>
          {config.bio && (
            <p className="text-mist/70 text-sm mt-4 max-w-xl leading-relaxed">{config.bio}</p>
          )}
        </div>
      </section>

      {/* Step indicator */}
      <div className="border-b border-studio-border bg-studio-dark px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center gap-2">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1; const done = step > n; const active = step === n
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={cn("w-6 h-6 rounded-full border text-[10px] flex items-center justify-center font-medium transition-all",
                  done   ? "border-gold bg-gold text-studio-black" :
                  active ? "border-gold text-gold" : "border-studio-border text-mist/40"
                )}>
                  {done ? <Check className="w-3 h-3" /> : n}
                </div>
                <span className={cn("text-[11px] hidden sm:inline", active ? "text-cream" : "text-mist/40")}>{label}</span>
                {i < STEP_LABELS.length - 1 && <div className="flex-1 h-px bg-studio-border mx-1 w-4 sm:w-8" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">

        {/* ── STEP 1: Package ── */}
        {step===1 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-cream">Choose your package</h2>

            {config.allowRoomSwitch && (
              <div className="space-y-3">
                <p className="text-mist text-sm">Room</p>
                <div className="flex gap-3">
                  {(["A","B","C"] as const).map(r => (
                    <button key={r} onClick={() => setRoom(r)}
                      className={cn("px-5 py-2 border rounded-sm text-sm transition-all",
                        room===r ? "border-gold text-gold bg-gold/5" : "border-studio-border text-mist hover:border-gold/40"
                      )}>
                      Studio {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {config.rates.map(rate => (
                <button key={rate.id} onClick={() => { setRateId(rate.id); if (rate.id !== "hourly") setHourlyQty(2) }}
                  className={cn("w-full flex items-center justify-between p-4 border rounded-sm text-left transition-all",
                    rateId===rate.id ? "border-gold bg-gold/5" : "border-studio-border bg-studio-card hover:border-gold/40"
                  )}>
                  <div>
                    <p className="text-cream text-sm font-medium">{rate.label}</p>
                    <p className="text-mist text-xs">
                      {rate.id === "hourly" ? "Minimum 2 hours" : `${rate.hours} hours`}
                    </p>
                  </div>
                  <p className="font-display text-xl text-gold">
                    ${(rate.price/100).toFixed(0)}{rate.id === "hourly" ? "/hr" : ""}
                  </p>
                </button>
              ))}
            </div>

            {/* Hourly hour selector — shows only when hourly is selected */}
            {rateId === "hourly" && (
              <div className="flex items-center justify-between border border-gold/20 bg-gold/5 rounded-sm p-4">
                <div>
                  <p className="text-cream text-sm font-medium">How many hours?</p>
                  <p className="text-mist text-xs">
                    Minimum 2 hours · ${((config.rates.find(r=>r.id==="hourly")?.price ?? 10000)/100).toFixed(0)}/hr
                    <span className="text-gold ml-2">= ${(((config.rates.find(r=>r.id==="hourly")?.price ?? 10000) * hourlyQty)/100).toFixed(0)} total</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setHourlyQty(q => Math.max(2, q-1))}
                    className="w-9 h-9 border border-studio-border rounded-sm flex items-center justify-center text-mist hover:text-gold hover:border-gold/40 transition-all text-lg">
                    −
                  </button>
                  <span className="font-display text-2xl text-gold w-8 text-center">{hourlyQty}</span>
                  <button type="button" onClick={() => setHourlyQty(q => Math.min(12, q+1))}
                    className="w-9 h-9 border border-studio-border rounded-sm flex items-center justify-center text-mist hover:text-gold hover:border-gold/40 transition-all text-lg">
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Date & Time ── */}
        {step===2 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-cream">Pick a date & time</h2>
            <div className="border border-studio-border rounded-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-studio-dark border-b border-studio-border">
                <button onClick={prevMonth} className="text-mist hover:text-gold p-1"><ChevronLeft className="w-4 h-4"/></button>
                <p className="text-cream text-sm font-medium">{MONTHS[calMonth]} {calYear}</p>
                <button onClick={nextMonth} className="text-mist hover:text-gold p-1"><ChevronRight className="w-4 h-4"/></button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map(d => <p key={d} className="text-center text-[10px] text-mist/40 py-1">{d}</p>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array(firstDay).fill(null).map((_,i) => <div key={`e${i}`}/>)}
                  {Array(daysInMonth).fill(null).map((_,i) => {
                    const d = i+1; const past = isPast(d); const sel = isSelected(d)
                    return (
                      <button key={d} disabled={past}
                        onClick={() => { setSelDate(new Date(calYear,calMonth,d)); setSelHour(null) }}
                        className={cn("aspect-square rounded-sm text-sm flex items-center justify-center transition-all",
                          past ? "text-mist/20 cursor-not-allowed" :
                          sel  ? "bg-gold text-studio-black font-bold" :
                          "text-mist hover:bg-studio-border hover:text-cream"
                        )}>{d}</button>
                    )
                  })}
                </div>
              </div>
            </div>
            {selDate && (
              <div className="space-y-3">
                <p className="text-mist text-sm">Start time</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {HOURS.map(h => {
                    const booked = isSlotBooked(h)
                    return (
                      <button key={h} onClick={() => !booked && setSelHour(h)} disabled={booked}
                        className={cn("py-2 border rounded-sm text-xs transition-all",
                          booked ? "border-studio-border/30 text-mist/20 cursor-not-allowed line-through" :
                          selHour===h ? "border-gold bg-gold/5 text-gold" : "border-studio-border text-mist hover:border-gold/40"
                        )}>
                        {h < 12 ? `${h}am` : h===12 ? "12pm" : `${h-12}pm`}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Client Info ── */}
        {step===3 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-cream">Your information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={clientInfo.name} onChange={e=>setClientInfo(p=>({...p,name:e.target.value}))} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={clientInfo.email} onChange={e=>setClientInfo(p=>({...p,email:e.target.value}))} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={clientInfo.notes} onChange={e=>setClientInfo(p=>({...p,notes:e.target.value}))} placeholder="What are you working on? Any special requirements?" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Confirm & Pay ── */}
        {step===4 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-cream">Confirm your booking</h2>

            <div className="border border-studio-border rounded-sm divide-y divide-studio-border">
              <div className="px-6 py-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-mist">Engineer</span><span className="text-cream">{config.name}</span></div>
                <div className="flex justify-between"><span className="text-mist">Room</span><span className="text-cream">Studio {room}</span></div>
                <div className="flex justify-between">
                  <span className="text-mist">Session</span>
                  <span className="text-cream">
                    {selectedRate?.label}{selectedRate?.id === "hourly" ? ` · ${hourlyQty} hours` : ""}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-mist">Date</span><span className="text-cream">{selDate?.toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric"})}</span></div>
                <div className="flex justify-between"><span className="text-mist">Time</span><span className="text-cream">{selHour}:00 — {(selHour||0)+effectiveHours}:00</span></div>
              </div>

              <div className="px-6 py-4 space-y-3">
                <div className="flex gap-2">
                  <input value={discountCode}
                    onChange={e => { setDiscountCode(e.target.value); setDiscountError(null); setDiscountApplied(null) }}
                    onKeyDown={e => e.key==="Enter" && applyCode()}
                    placeholder="Discount code"
                    className="flex-1 h-9 px-3 text-xs font-mono uppercase bg-studio-dark border border-studio-border rounded-sm text-cream placeholder:text-mist/30 focus:outline-none focus:border-gold/50"
                  />
                  <button onClick={applyCode}
                    className="px-4 h-9 text-xs border border-studio-border text-mist hover:border-gold/40 hover:text-gold rounded-sm transition-all">
                    Apply
                  </button>
                </div>
                {discountApplied && <p className="text-[11px] text-green-400">✓ {Math.round(discountApplied*100)}% discount applied</p>}
                {discountError  && <p className="text-[11px] text-red-400">{discountError}</p>}
              </div>

              <div className="px-6 py-4 space-y-1">
                {discountApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-mist">Subtotal</span>
                    <span className="text-mist line-through">${(effectivePrice/100).toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-display text-xl">
                  <span className="text-mist text-sm self-center">Total</span>
                  <span className="text-gold">${(finalPrice/100).toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div className="border border-studio-border/40 rounded-sm p-4 flex gap-3">
              <AlertCircle className="w-4 h-4 text-gold/50 shrink-0 mt-0.5" />
              <p className="text-mist text-xs leading-relaxed">
                Full payment required to secure your date. Bookings are subject to studio manager approval within 24 hours.
                A calendar invite (.ics) will be emailed to you on confirmation.
              </p>
            </div>

            {payError && (
              <div className="border border-red-500/30 bg-red-500/5 rounded-sm p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-relaxed">{payError}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full h-14 bg-gold text-studio-black text-sm font-bold tracking-widest uppercase rounded-sm hover:bg-gold-light transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-studio-black/30 border-t-studio-black rounded-full animate-spin"/>
                  Redirecting to checkout…
                </span>
              ) : (
                <><CreditCard className="w-5 h-5"/>Pay ${(finalPrice/100).toFixed(0)} & Reserve</>
              )}
            </button>
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(s=>s-1)}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/studio"><ArrowLeft className="w-4 h-4" /> Studio</Link>
            </Button>
          )}
          {step < 4 && (
            <Button onClick={() => setStep(s=>s+1)} disabled={!canProceed}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
