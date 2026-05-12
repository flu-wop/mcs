// src/app/studio/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// STUDIO BOOKING PAGE — Updated with room descriptions, reordered sections,
// scrollToTop on step navigation, vocal mix pricing update, iCal note.
//
// STRIPE INTEGRATION:
//   OPTION A — Stripe Checkout (redirect):
//     POST /api/checkout → { url } → window.location.href = url
//   OPTION B — Stripe Payment Element (inline Apple Pay / Google Pay):
//     Wrap payment step in <Elements stripe={loadStripe(KEY)}><PaymentElement />
//
//   DISCOUNT CODES — server-side only:
//     if (code === "REGULAR30") amount = Math.round(amount * 0.7)
// ─────────────────────────────────────────────────────────────────────────────

"use client"

import { useState, useMemo, useRef } from "react"
import Link from "next/link"
import {
  Mic2, Headphones, Music2, Clock, DollarSign,
  ArrowLeft, ArrowRight, CheckCircle2, CreditCard,
  Apple, Star, Shield, Tag, Calendar, ChevronLeft,
  ChevronRight, AlertCircle, Check, Guitar, Drum,
} from "lucide-react"
import { Button }    from "@/components/ui/button"
import { Badge }     from "@/components/ui/badge"
import { Input }     from "@/components/ui/input"
import { Label }     from "@/components/ui/label"
import { Textarea }  from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn }        from "@/lib/utils"

/* ═══════════════════════════════════════════════════════════════════════════ */
/* DATA                                                                        */
/* ═══════════════════════════════════════════════════════════════════════════ */

const DISCOUNT_CODES: Record<string, number> = {
  REGULAR30: 0.30,
  STUDIO10:  0.10,
}

const RECORDING_RATES = [
  {
    id: "hourly", label: "Hourly", duration: "Per hour",
    price: 10000, perHour: 10000, badge: null,
    desc: "Perfect for short sessions, overdubs, or quick fixes. Minimum 2 hours.",
    includes: ["Full live room access", "In-house engineer", "Session files delivered"],
  },
  {
    id: "block-4", label: "4-Hour Block", duration: "Half day",
    price: 36000, perHour: 9000, badge: "Save $40",
    desc: "The sweet spot for a focused recording session. Vocals, overdubs, or tight tracking.",
    includes: ["Full live room + ISO booth", "Engineer on-site", "Rough mix included"],
  },
  {
    id: "block-8", label: "8-Hour Block", duration: "Full day",
    price: 64000, perHour: 8000, badge: "Best Value",
    desc: "A full day to track, experiment, and finish. Includes a break and a rough mix.",
    includes: ["Full live room + ISO booth", "Producer available by request", "Rough mix + session files", "Complimentary coffee"],
    popular: true,
  },
]

const MIXING_RATES = [
  {
    id: "mix-vocal", label: "Vocal Mix",
    price: 30000, badge: null,
    desc: "One lead vocal + two backing tracks mixed over your existing instrumental. Delivered in 3–5 business days.",
    includes: ["1 lead + 2 backing tracks", "2 rounds of revisions", "Stems delivered"],
  },
  {
    id: "mix-full", label: "Full Mix (up to 24 tracks)",
    price: 65000, badge: "Most Popular",
    desc: "Hollywood-grade multi-track mix from our experienced engineering team. Submit stems, receive a master.",
    includes: ["Up to 24 tracks", "3 rounds of revisions", "Stereo + stem delivery", "Delivery in 5–7 days"],
    popular: true,
  },
  {
    id: "mix-stem", label: "Stem Mixing",
    price: 95000, badge: "Premium",
    desc: "Full stem-based mix for maximum creative control. Ideal for complex productions.",
    includes: ["Unlimited tracks (stem groups)", "3 rounds of revisions", "Full stem + stereo delivery", "Delivery in 7–10 days"],
  },
  {
    id: "mix-atmos", label: "Dolby Atmos Mix",
    price: 85000, regularPrice: 59500, badge: "New",
    desc: "Immersive spatial audio mix delivered in Dolby Atmos. Required for Apple Music Spatial Audio.",
    includes: ["Full Atmos + stereo deliverables", "Apple Music / Tidal spatial ready", "3 rounds of revisions", "Delivery in 7–10 days"],
  },
  {
    id: "mix-bundle", label: "Full Mix + Dolby Atmos Bundle",
    price: 110000, regularPrice: 77000, badge: "Best Deal",
    desc: "Complete stereo + spatial audio package. Everything your release needs in one session.",
    includes: ["Full Mix (up to 24 tracks)", "Dolby Atmos mix included", "Stereo + Atmos + stem delivery", "3 rounds of revisions", "Delivery in 10–14 days"],
    popular: true,
  },
]

const TIME_SLOTS = ["10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"]

const TESTIMONIALS = [
  { quote: "Walking into Mid City Sound feels like stepping into music history. The sound is unmatched.", author: "Session artist, New Orleans" },
  { quote: "The room has a sound. And the engineers here know exactly how to use it. Best studio experience in NOLA.", author: "Producer, Mid City" },
  { quote: "We flew in from LA just to track here. Worth every mile.", author: "Recording artist" },
]

const LEGACY_CREDITS = ["Academy Award — Time of My Life", "Grammy Nominated", "Van Morrison", "Dr. John", "Art Neville", "Taj Mahal"]

/* ═══════════════════════════════════════════════════════════════════════════ */
/* UTILS                                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100)
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* MINI CALENDAR                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

function MiniCalendar({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const monthLabel  = new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })
  function prev() { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1) } else setViewMonth(m => m-1) }
  function next() { if (viewMonth === 11) { setViewMonth(0);  setViewYear(y => y+1) } else setViewMonth(m => m+1) }
  return (
    <div className="border border-studio-border bg-studio-card rounded-sm p-5 select-none">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-1.5 text-mist hover:text-cream transition-colors rounded-sm hover:bg-studio-dark"><ChevronLeft className="w-4 h-4" /></button>
        <p className="font-display text-base text-cream">{monthLabel}</p>
        <button onClick={next} className="p-1.5 text-mist hover:text-cream transition-colors rounded-sm hover:bg-studio-dark"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} className="text-center text-[10px] text-mist/50 tracking-wide py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }, (_,i) => <div key={`b-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_,i) => i+1).map(day => {
          const date = new Date(viewYear, viewMonth, day)
          const isPast  = date < today
          const isToday = date.toDateString() === today.toDateString()
          const isSel   = selected?.toDateString() === date.toDateString()
          const isSun   = date.getDay() === 0
          return (
            <button key={day} disabled={isPast || isSun} onClick={() => onSelect(date)}
              className={cn("h-8 w-full text-xs rounded-sm transition-all",
                isPast||isSun ? "text-mist/25 cursor-not-allowed"
                : isSel  ? "bg-gold text-studio-black font-semibold"
                : isToday? "border border-gold/50 text-gold hover:bg-gold/10"
                :          "text-cream/80 hover:bg-studio-dark hover:text-cream"
              )}>{day}</button>
          )
        })}
      </div>
      <p className="text-[10px] text-mist/40 text-center mt-3">Sundays unavailable · Subject to confirmation</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* PRICING CARD                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

function PricingCard({ item, selected, onSelect, showPerHour = false }: {
  item: typeof RECORDING_RATES[0]; selected: boolean; onSelect: () => void; showPerHour?: boolean
}) {
  return (
    <button onClick={onSelect} className={cn(
      "relative text-left w-full p-5 border rounded-sm transition-all",
      selected ? "border-gold bg-gold/5 shadow-[0_0_20px_rgba(212,175,119,0.1)]" : "border-studio-border bg-studio-card hover:border-gold/40"
    )}>
      {"popular" in item && item.popular && <Badge className="absolute top-3 right-3 text-[9px]">Most Popular</Badge>}
      {item.badge && !("popular" in item && item.popular) && <Badge variant="outline" className="absolute top-3 right-3 text-[9px]">{item.badge}</Badge>}
      <div className={cn("absolute top-3 left-3 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center", selected ? "border-gold bg-gold" : "border-studio-border")}>
        {selected && <Check className="w-2.5 h-2.5 text-studio-black" />}
      </div>
      <div className="mt-5">
        <p className="text-[10px] tracking-[0.15em] uppercase text-mist/60 mb-1">{"duration" in item ? item.duration : "Mixing"}</p>
        <p className="font-display text-xl text-cream mb-3">{item.label}</p>
        <div className="flex items-baseline gap-2 mb-3">
          <p className="font-display text-3xl text-gold">{fmt(item.price)}</p>
          {showPerHour && "perHour" in item && <p className="text-mist text-xs">{fmt(item.perHour)}/hr</p>}
          {"regularPrice" in item && (item as any).regularPrice && (
            <div className="flex items-center gap-1"><Tag className="w-3 h-3 text-gold/40" /><span className="text-mist text-xs">{fmt((item as any).regularPrice)} w/ regular discount</span></div>
          )}
        </div>
        <p className="text-mist text-xs leading-relaxed mb-4">{item.desc}</p>
        <ul className="space-y-1.5">
          {item.includes.map(inc => (
            <li key={inc} className="flex items-center gap-2 text-xs text-mist/80">
              <div className="w-1.5 h-1.5 rounded-full bg-gold/50 shrink-0" />{inc}
            </li>
          ))}
        </ul>
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* STEP INDICATOR                                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

const STEP_LABELS = ["Session", "Date & Time", "Details", "Payment"]

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const n = i+1; const isActive = step===n; const isComplete = step>n
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn("w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-medium transition-all",
                isComplete ? "border-gold bg-gold text-studio-black" : isActive ? "border-gold text-gold bg-gold/10" : "border-studio-border text-mist/50"
              )}>
                {isComplete ? <Check className="w-3.5 h-3.5" /> : n}
              </div>
              <p className={cn("text-[9px] tracking-wide uppercase mt-1 hidden sm:block", isActive ? "text-gold" : isComplete ? "text-gold/60" : "text-mist/30")}>{label}</p>
            </div>
            {i < STEP_LABELS.length-1 && <div className={cn("w-10 sm:w-16 h-px mx-1 mb-4 sm:mb-0 transition-all", step>n ? "bg-gold/50" : "bg-studio-border")} />}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* MAIN PAGE                                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function StudioPage() {
  const [step,            setStep]            = useState(1)
  const [sessionType,     setSessionType]     = useState<"recording"|"mixing"|"both"|null>(null)
  const [rateId,          setRateId]          = useState<string|null>(null)
  const [date,            setDate]            = useState<Date|null>(null)
  const [timeSlot,        setTimeSlot]        = useState<string|null>(null)
  const [projectNotes,    setProjectNotes]    = useState("")
  const [discountCode,    setDiscountCode]    = useState("")
  const [discountApplied, setDiscountApplied] = useState<number|null>(null)
  const [discountError,   setDiscountError]   = useState<string|null>(null)
  const [form, setForm] = useState({ name:"", email:"", phone:"" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Ref for scrolling to booking form top on step change
  const bookingRef = useRef<HTMLDivElement>(null)

  function goToStep(n: number) {
    setStep(n)
    // Scroll to top of booking section on mobile
    setTimeout(() => {
      bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  const selectedRate = useMemo(() => {
    const all: typeof RECORDING_RATES = [...RECORDING_RATES, ...MIXING_RATES as any]
    return all.find(r => r.id === rateId) ?? null
  }, [rateId])

  const basePrice     = selectedRate?.price ?? 0
  const discountAmt   = useMemo(() => discountApplied ? Math.round(basePrice * discountApplied) : 0, [basePrice, discountApplied])
  const finalPrice    = basePrice - discountAmt

  function applyCode() {
    const code = discountCode.trim().toUpperCase()
    if (DISCOUNT_CODES[code] !== undefined) { setDiscountApplied(DISCOUNT_CODES[code]); setDiscountError(null) }
    else { setDiscountApplied(null); setDiscountError("Code not recognised. Reach out to us if you're a regular client.") }
  }

  const canProceed = useMemo(() => {
    if (step===1) return sessionType!==null && rateId!==null
    if (step===2) return date!==null && timeSlot!==null
    if (step===3) return form.name.trim()!=="" && form.email.trim()!==""
    return true
  }, [step, sessionType, rateId, date, timeSlot, form])

  async function handlePayment() {
    setLoading(true)
    /*
    ── STRIPE OPTION A ────────────────────────────────────────────────────────
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rateId, sessionType, date: date?.toISOString(),
        timeSlot, projectNotes, discountCode: discountApplied ? discountCode.toUpperCase() : null,
        finalPrice, ...form }),
    })
    const { url } = await res.json()
    window.location.href = url
    ──────────────────────────────────────────────────────────────────────────
    */
    await new Promise(r => setTimeout(r, 1600))
    setLoading(false)
    setSuccess(true)
  }

  const ratesForSession: any[] = sessionType==="recording" ? RECORDING_RATES
    : sessionType==="mixing" ? MIXING_RATES
    : sessionType==="both"   ? [...RECORDING_RATES.slice(0,2), ...MIXING_RATES]
    : []

  return (
    <div className="pt-16 min-h-screen bg-studio-black">

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO                                                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-studio-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0d0c0a] to-[#111008]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_30%,rgba(212,175,119,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_15%_80%,rgba(212,175,119,0.04),transparent)]" />
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")` }} />

        {/* Legacy credits strip */}
        <div className="absolute top-0 left-0 right-0 border-b border-studio-border/30 py-2 px-6 bg-studio-charcoal/60 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl flex items-center justify-center gap-6 flex-wrap">
            {LEGACY_CREDITS.map(credit => <span key={credit} className="text-[10px] tracking-[0.18em] uppercase text-gold/60">{credit}</span>)}
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl mt-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-gold/60" />
                <span className="text-[11px] tracking-[0.25em] uppercase text-gold/80 font-sans">Mid City Sound Studios · New Orleans</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-cream leading-[0.92] mb-5">
                Book the<br /><span className="text-gold-gradient italic">Studio</span>
              </h1>
              <p className="text-mist text-base md:text-lg max-w-sm leading-relaxed mb-8 font-light">
                New Orleans' premier recording experience. Award-winning production in the heart of Mid City.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                {[
                  { icon: Clock,        text: "Sessions from $100/hr" },
                  { icon: Mic2,         text: "Studio A + Studio B" },
                  { icon: CheckCircle2, text: "24-hr approval" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-mist"><Icon className="w-4 h-4 text-gold/60" /><span className="text-xs">{text}</span></div>
                ))}
              </div>
            </div>

            {/* Studio photo placeholder */}
            <div className="relative aspect-[4/3] border border-studio-border rounded-sm overflow-hidden bg-studio-dark hidden md:block">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-mist/20 gap-3">
                <Mic2 className="w-16 h-16" />
                <p className="text-xs tracking-widest uppercase">Studio Interior</p>
                <p className="text-[10px] text-mist/15">Add photo: /public/images/studio-interior.jpg</p>
              </div>
              <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/30" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/30" />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 2. STUDIO ROOMS                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 border-b border-studio-border/40 bg-studio-charcoal">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">The Rooms</Badge>
            <h2 className="font-display text-4xl md:text-5xl text-cream">Two rooms. One sound.</h2>
            <p className="text-mist text-sm mt-3 max-w-md mx-auto">
              Mid City Sound features two purpose-built recording environments — each with professional gear and its own character.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Studio A */}
            <div className="border border-gold/20 bg-studio-card rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-studio-border bg-studio-dark flex items-center gap-3">
                <div className="w-8 h-8 border border-gold/30 rounded-sm flex items-center justify-center">
                  <Mic2 className="w-4 h-4 text-gold/70" />
                </div>
                <div>
                  <p className="text-cream font-medium text-sm">Studio A</p>
                  <p className="text-[10px] tracking-widest uppercase text-gold/60">Control / Vocal Room</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-mist text-sm leading-relaxed">
                  A dedicated vocal booth environment built for precision tracking and control. Donald's personal guitar collection lines the walls — decades of instruments, each with its own story.
                </p>
                <ul className="space-y-2">
                  {[
                    "Dedicated vocal booth",
                    "Universal Audio Apollo interface",
                    "Neumann U87 microphone",
                    "Mac Pro workstation",
                    "MIDI piano / controller (main desk)",
                    "Donald's personal guitar collection",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-xs text-cream/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold/50 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Studio B */}
            <div className="border border-studio-border bg-studio-card rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-studio-border bg-studio-dark flex items-center gap-3">
                <div className="w-8 h-8 border border-studio-border rounded-sm flex items-center justify-center">
                  <Drum className="w-4 h-4 text-gold/60" />
                </div>
                <div>
                  <p className="text-cream font-medium text-sm">Studio B</p>
                  <p className="text-[10px] tracking-widest uppercase text-mist/60">Live Room</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-mist text-sm leading-relaxed">
                  A cozy, warm live room built for ensemble tracking. Drums and piano are professionally miked and ready. All signals run through the Apollo for a consistent, high-quality signal chain.
                </p>
                <ul className="space-y-2">
                  {[
                    "Full drum kit — professionally miked",
                    "Upright piano — professionally miked",
                    "Guitar pedal rack",
                    "Bass & electric guitar amplifiers",
                    "Shure digital vocal microphone",
                    "Tascam mixer → Universal Audio Apollo (4 inputs)",
                    "MIDI controller",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-xs text-cream/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold/40 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* iCal / Availability note */}
          <div className="mt-6 border border-studio-border/40 bg-studio-dark rounded-sm p-4 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-gold/50 shrink-0 mt-0.5" />
            <div>
              <p className="text-cream text-sm font-medium">Real-time availability</p>
              <p className="text-mist text-xs leading-relaxed mt-0.5">
                Live calendar sync powered by iCloud Calendar — coming soon. For now, request your preferred date in the booking form below and we'll confirm within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 3. RATES & PACKAGES                                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="rates" className="py-20 px-6 border-b border-studio-border/40 bg-studio-black">
        <div className="mx-auto max-w-6xl">

          {/* Discount banner */}
          <div className="mb-12 border border-gold/30 bg-gold/5 rounded-sm p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-cream font-medium text-sm">Regular client discounts available</p>
                <p className="text-mist text-xs mt-0.5">
                  Returning clients and referrals receive 30% off all sessions.
                  Enter your discount code at checkout — ask us how to qualify.
                </p>
              </div>
            </div>
            <button onClick={() => bookingRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="shrink-0 text-[11px] font-medium tracking-widest uppercase px-4 py-2 border border-gold/50 text-gold hover:bg-gold hover:text-studio-black transition-all rounded-sm">
              Book Now
            </button>
          </div>

          {/* Recording rates */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <Mic2 className="w-4 h-4 text-gold/60" />
              <h2 className="font-display text-3xl text-cream">Recording Sessions</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {RECORDING_RATES.map(rate => (
                <div key={rate.id} className={cn("relative border rounded-sm bg-studio-card p-6 transition-all",
                  "popular" in rate && rate.popular ? "border-gold/30 shadow-[0_0_30px_rgba(212,175,119,0.06)]" : "border-studio-border"
                )}>
                  {"popular" in rate && rate.popular && <Badge className="absolute top-4 right-4 text-[9px]">Most Popular</Badge>}
                  {rate.badge && !("popular" in rate && rate.popular) && <Badge variant="outline" className="absolute top-4 right-4 text-[9px]">{rate.badge}</Badge>}
                  <p className="text-[10px] tracking-widest uppercase text-mist/50 mb-1">{rate.duration}</p>
                  <p className="font-display text-xl text-cream mb-2">{rate.label}</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="font-display text-3xl text-gold">{fmt(rate.price)}</p>
                    <p className="text-mist text-xs">{fmt(rate.perHour)}/hr</p>
                  </div>
                  <p className="text-mist text-xs leading-relaxed mb-4">{rate.desc}</p>
                  <Separator className="mb-4" />
                  <ul className="space-y-1.5">
                    {rate.includes.map(inc => (
                      <li key={inc} className="flex items-center gap-2 text-xs text-mist/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold/40 shrink-0" />{inc}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Mixing rates */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Music2 className="w-4 h-4 text-gold/60" />
              <h2 className="font-display text-3xl text-cream">Mixing Services</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {MIXING_RATES.slice(0,3).map(rate => (
                <div key={rate.id} className={cn("relative border rounded-sm bg-studio-card p-6",
                  "popular" in rate && rate.popular ? "border-gold/30 shadow-[0_0_30px_rgba(212,175,119,0.06)]" : "border-studio-border"
                )}>
                  {"popular" in rate && rate.popular && <Badge className="absolute top-4 right-4 text-[9px]">Most Popular</Badge>}
                  {rate.badge && !("popular" in rate && rate.popular) && <Badge variant="outline" className="absolute top-4 right-4 text-[9px]">{rate.badge}</Badge>}
                  <p className="text-[10px] tracking-widest uppercase text-mist/50 mb-1">Mixing</p>
                  <p className="font-display text-xl text-cream mb-2">{rate.label}</p>
                  <p className="font-display text-3xl text-gold mb-4">{fmt(rate.price)}</p>
                  <p className="text-mist text-xs leading-relaxed mb-4">{rate.desc}</p>
                  <Separator className="mb-4" />
                  <ul className="space-y-1.5">
                    {rate.includes.map(inc => (
                      <li key={inc} className="flex items-center gap-2 text-xs text-mist/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold/40 shrink-0" />{inc}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {MIXING_RATES.slice(3).map(rate => (
                <div key={rate.id} className={cn("relative border rounded-sm bg-studio-card p-6",
                  "popular" in rate && rate.popular ? "border-gold/30 shadow-[0_0_30px_rgba(212,175,119,0.06)]" : "border-studio-border"
                )}>
                  {"popular" in rate && rate.popular && <Badge className="absolute top-4 right-4 text-[9px]">Best Deal</Badge>}
                  {rate.badge && !("popular" in rate && rate.popular) && <Badge variant="outline" className="absolute top-4 right-4 text-[9px]">{rate.badge}</Badge>}
                  <p className="text-[10px] tracking-widest uppercase text-mist/50 mb-1">
                    {"id" in rate && rate.id === "mix-atmos" ? "Spatial Audio" : "Bundle"}
                  </p>
                  <p className="font-display text-xl text-cream mb-2">{rate.label}</p>
                  <div className="flex items-baseline gap-3 mb-2">
                    <p className="font-display text-3xl text-gold">{fmt(rate.price)}</p>
                    {"regularPrice" in rate && rate.regularPrice && (
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-gold/50" />
                        <span className="text-mist text-xs"><span className="text-gold/80 font-medium">{fmt(rate.regularPrice)}</span>{" "}with regular client discount</span>
                      </div>
                    )}
                  </div>
                  <p className="text-mist text-xs leading-relaxed mb-4">{rate.desc}</p>
                  <Separator className="mb-4" />
                  <ul className="space-y-1.5">
                    {rate.includes.map(inc => (
                      <li key={inc} className="flex items-center gap-2 text-xs text-mist/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold/40 shrink-0" />{inc}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 4. BOOKING FORM — multi-step (appears AFTER rates per brief)         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="booking-form" className="py-20 px-6 border-b border-studio-border/40 bg-studio-charcoal" ref={bookingRef}>
        <div className="mx-auto max-w-4xl">

          {success ? (
            <div className="text-center space-y-6 py-16">
              <div className="w-16 h-16 mx-auto border border-gold/40 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-display text-4xl text-cream">Booking Received</h2>
              <p className="text-gold text-sm font-medium">Payment confirmed · Pending studio approval</p>
              <div className="border border-studio-border rounded-sm p-6 max-w-sm mx-auto text-left space-y-2 text-sm">
                <p><span className="text-mist">Session:</span> <span className="text-cream">{selectedRate?.label}</span></p>
                <p><span className="text-mist">Date:</span> <span className="text-cream">{date?.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</span></p>
                <p><span className="text-mist">Time:</span> <span className="text-cream">{timeSlot}</span></p>
                <p><span className="text-mist">Total:</span> <span className="font-display text-lg text-gold">{fmt(finalPrice)}</span></p>
                <p><span className="text-mist">Confirmation to:</span> <span className="text-cream">{form.email}</span></p>
              </div>
              <div className="border border-studio-border/40 bg-studio-card rounded-sm p-4 max-w-sm mx-auto">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-gold/60 shrink-0 mt-0.5" />
                  <p className="text-xs text-mist leading-relaxed">
                    Your booking is <strong className="text-cream">subject to approval</strong> by the studio manager within 24 hours.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" asChild><Link href="/">Back to Home</Link></Button>
                <Button asChild><Link href="/projects">Explore Projects</Link></Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">Reserve Your Time</Badge>
                <h2 className="font-display text-4xl md:text-5xl text-cream mb-3">Book the studio</h2>
                <p className="text-mist text-sm max-w-md mx-auto">
                  Full payment required to reserve your date. All bookings subject to 24-hour approval.
                </p>
              </div>

              <div className="flex justify-center mb-10">
                <StepIndicator step={step} />
              </div>

              {/* ── STEP 1: Session Type + Package ── */}
              {step===1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-display text-2xl text-cream mb-4">What type of session?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(["recording","mixing","both"] as const).map(type => (
                        <button key={type} onClick={() => { setSessionType(type); setRateId(null) }}
                          className={cn("flex items-center gap-3 p-4 border rounded-sm text-left transition-all min-h-[72px]",
                            sessionType===type ? "border-gold bg-gold/5" : "border-studio-border bg-studio-card hover:border-gold/40"
                          )}>
                          <div className={cn("w-8 h-8 rounded-sm border flex items-center justify-center shrink-0",
                            sessionType===type ? "border-gold bg-gold/10" : "border-studio-border"
                          )}>
                            {type==="recording" ? <Mic2 className="w-4 h-4 text-gold/70" />
                              : type==="mixing"  ? <Music2 className="w-4 h-4 text-gold/70" />
                              :                   <Headphones className="w-4 h-4 text-gold/70" />}
                          </div>
                          <div>
                            <p className="text-cream text-sm font-medium capitalize">{type==="both" ? "Recording + Mixing" : type}</p>
                            <p className="text-mist text-[10px]">{type==="recording" ? "Live room tracking" : type==="mixing" ? "Submit stems remotely" : "Full production package"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {sessionType && (
                    <div>
                      <h3 className="font-display text-2xl text-cream mb-4">Choose a package</h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {ratesForSession.map((rate: any) => (
                          <PricingCard key={rate.id} item={rate} selected={rateId===rate.id} onSelect={() => setRateId(rate.id)} showPerHour={"perHour" in rate} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end pt-2">
                    <Button onClick={() => goToStep(2)} disabled={!canProceed} className="w-full sm:w-auto">
                      Next: Choose Date <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Date & Time ── */}
              {step===2 && (
                <div className="space-y-8">
                  <h3 className="font-display text-2xl text-cream">Select a date & time</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <Label className="mb-3 block">Preferred Date</Label>
                      <MiniCalendar selected={date} onSelect={setDate} />
                    </div>
                    <div>
                      <Label className="mb-3 block">Start Time</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {TIME_SLOTS.map(slot => (
                          <button key={slot} onClick={() => setTimeSlot(slot)}
                            className={cn("p-3 border text-sm rounded-sm transition-all text-left",
                              timeSlot===slot ? "border-gold bg-gold/10 text-gold" : "border-studio-border text-mist hover:border-gold/40 hover:text-cream"
                            )}>{slot}</button>
                        ))}
                      </div>
                      {date && (
                        <div className="mt-4 p-3 border border-studio-border/40 bg-studio-card rounded-sm">
                          <p className="text-[10px] tracking-widest uppercase text-mist/50 mb-1">Selected</p>
                          <p className="text-cream text-sm">
                            {date.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
                            {timeSlot && <span className="text-gold"> · {timeSlot}</span>}
                          </p>
                        </div>
                      )}
                      <p className="text-mist/40 text-[10px] mt-3 leading-relaxed">Availability subject to confirmation. We'll reach out within 24 hours.</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <Button variant="ghost" onClick={() => goToStep(1)} className="w-full sm:w-auto"><ArrowLeft className="w-4 h-4" /> Back</Button>
                    <Button onClick={() => goToStep(3)} disabled={!canProceed} className="w-full sm:w-auto">Next: Your Details <ArrowRight className="w-4 h-4" /></Button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Details + Discount ── */}
              {step===3 && (
                <div className="space-y-6">
                  <h3 className="font-display text-2xl text-cream">Your information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="name">Full Name *</Label><Input id="name" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Your name" /></div>
                    <div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="you@example.com" /></div>
                    <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="+1 (555) 000-0000" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Project Notes</Label>
                    <Textarea id="notes" value={projectNotes} onChange={e => setProjectNotes(e.target.value)}
                      placeholder="Tell us about your project — genre, number of tracks, special requirements, anything the engineer should know before you arrive..." className="h-32" />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Code (for regulars)</Label>
                    <div className="flex gap-2 max-w-sm">
                      <Input value={discountCode} onChange={e => { setDiscountCode(e.target.value); setDiscountError(null); setDiscountApplied(null) }}
                        placeholder="Enter your regular client code" className="font-mono uppercase" onKeyDown={e => e.key==="Enter" && applyCode()} />
                      <Button variant="outline" onClick={applyCode} className="shrink-0">Apply</Button>
                    </div>
                    {discountApplied!==null && (
                      <p className="text-xs flex items-center gap-1.5 mt-1" style={{color:"#1D9E75"}}>
                        <Check className="w-3.5 h-3.5" />{Math.round(discountApplied*100)}% discount applied!
                      </p>
                    )}
                    {discountError && <p className="text-red-400 text-xs flex items-center gap-1.5 mt-1"><AlertCircle className="w-3.5 h-3.5" />{discountError}</p>}
                    {!discountApplied && !discountError && <p className="text-mist/50 text-[11px] mt-1.5">Regular clients receive 30% off. Reach out to us for your personal code.</p>}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <Button variant="ghost" onClick={() => goToStep(2)} className="w-full sm:w-auto"><ArrowLeft className="w-4 h-4" /> Back</Button>
                    <Button onClick={() => goToStep(4)} disabled={!canProceed} className="w-full sm:w-auto">Review & Pay <ArrowRight className="w-4 h-4" /></Button>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Payment ── */}
              {step===4 && (
                <div className="space-y-6">
                  <h3 className="font-display text-2xl text-cream">Payment & confirmation</h3>

                  {/* Order summary */}
                  <div className="border border-studio-border rounded-sm bg-studio-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-studio-border bg-studio-dark">
                      <p className="text-[10px] tracking-widest uppercase text-gold/70">Order Summary</p>
                    </div>
                    <div className="p-6 space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-mist">Session</span><span className="text-cream">{selectedRate?.label}</span></div>
                      <div className="flex justify-between"><span className="text-mist">Date</span><span className="text-cream">{date?.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span></div>
                      <div className="flex justify-between"><span className="text-mist">Time</span><span className="text-cream">{timeSlot}</span></div>
                      <div className="flex justify-between"><span className="text-mist">Client</span><span className="text-cream">{form.name}</span></div>
                      <Separator />
                      <div className="flex justify-between"><span className="text-mist">Subtotal</span><span className="text-cream">{fmt(basePrice)}</span></div>
                      {discountApplied!==null && discountAmt>0 && (
                        <div className="flex justify-between" style={{color:"#1D9E75"}}>
                          <span>Discount ({Math.round(discountApplied*100)}%)</span><span>−{fmt(discountAmt)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-mist font-medium">Total due today</span>
                        <span className="font-display text-3xl text-gold">{fmt(finalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="border border-studio-border rounded-sm bg-studio-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-studio-border bg-studio-dark flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gold/50" />
                      <p className="text-[10px] tracking-widest uppercase text-gold/70">Secure Payment · Powered by Stripe</p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <button onClick={handlePayment} className="h-12 bg-studio-black border border-studio-border rounded-sm flex items-center justify-center gap-2 text-cream hover:border-gold/40 transition-all text-sm font-medium">
                          <Apple className="w-5 h-5" /> Apple Pay
                        </button>
                        <button onClick={handlePayment} className="h-12 bg-studio-black border border-studio-border rounded-sm flex items-center justify-center gap-2 text-cream hover:border-gold/40 transition-all text-sm font-medium">
                          <span className="text-base">G</span> Google Pay
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-mist/40">
                        <div className="flex-1 h-px bg-studio-border" /><span className="text-[11px]">or pay with card</span><div className="flex-1 h-px bg-studio-border" />
                      </div>
                      <div className="border border-dashed border-studio-border/50 rounded-sm p-4 space-y-3">
                        <div className="space-y-1"><Label>Card Number</Label><Input placeholder="4242 4242 4242 4242" disabled className="opacity-40 cursor-not-allowed" /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1"><Label>Expiry</Label><Input placeholder="MM / YY" disabled className="opacity-40 cursor-not-allowed" /></div>
                          <div className="space-y-1"><Label>CVC</Label><Input placeholder="123" disabled className="opacity-40 cursor-not-allowed" /></div>
                        </div>
                        <p className="text-mist/40 text-[10px] text-center">Wire up Stripe Elements — see comments in page.tsx</p>
                      </div>
                      <div className="border border-gold/20 bg-gold/5 rounded-sm p-4 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-gold/60 shrink-0 mt-0.5" />
                        <p className="text-xs text-mist leading-relaxed">
                          <strong className="text-cream">Payment reserves your spot.</strong> All bookings require final approval within 24 hours. If we can't accommodate your date, you'll receive a full refund immediately.
                        </p>
                      </div>
                      <Button onClick={handlePayment} disabled={loading} className="w-full" size="lg">
                        {loading ? (
                          <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-studio-black/30 border-t-studio-black rounded-full animate-spin" />Processing payment…</span>
                        ) : (
                          <><CreditCard className="w-4 h-4" />Pay {fmt(finalPrice)} — Reserve Studio Time</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => goToStep(3)} className="w-full sm:w-auto"><ArrowLeft className="w-4 h-4" /> Back</Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 5. TESTIMONIALS                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 border-b border-studio-border/40 bg-studio-black">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">The Studio's Work</Badge>
            <h2 className="font-display text-3xl text-cream mb-6">Featured on</h2>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {LEGACY_CREDITS.map(credit => (
                <div key={credit} className="px-5 py-2.5 border border-studio-border bg-studio-card rounded-sm">
                  <p className="text-cream text-sm font-sans">{credit}</p>
                </div>
              ))}
            </div>
          </div>
          <Separator className="mb-12" />
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, author }) => (
              <div key={author} className="p-6 border border-studio-border bg-studio-card rounded-sm">
                <div className="flex gap-0.5 mb-4">{[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-gold text-gold" />)}</div>
                <p className="text-cream/80 text-sm italic leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
                <p className="text-mist text-xs">— {author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 6. CANCELLATION POLICY                                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6 border-b border-studio-border/40 bg-studio-charcoal">
        <div className="mx-auto max-w-3xl">
          <div className="border border-studio-border/40 rounded-sm p-6 grid sm:grid-cols-3 gap-6">
            <div><p className="text-[10px] tracking-widest uppercase text-gold/60 mb-2">Cancellation</p><p className="text-cream text-sm font-medium mb-1">48+ hours notice</p><p className="text-mist text-xs leading-relaxed">Full refund, no questions asked.</p></div>
            <div><p className="text-[10px] tracking-widest uppercase text-gold/60 mb-2">Late Cancel</p><p className="text-cream text-sm font-medium mb-1">Under 48 hours</p><p className="text-mist text-xs leading-relaxed">50% studio credit toward your next session.</p></div>
            <div><p className="text-[10px] tracking-widest uppercase text-gold/60 mb-2">No Show</p><p className="text-cream text-sm font-medium mb-1">Day-of cancellation</p><p className="text-mist text-xs leading-relaxed">Non-refundable. Contact us to reschedule.</p></div>
          </div>
          <p className="text-mist/40 text-[11px] text-center mt-4">Questions? Email us at midcitysound@gmail.com</p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 7. FINAL CTA                                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 relative overflow-hidden bg-studio-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(212,175,119,0.04),transparent)]" />
        <div className="relative mx-auto max-w-xl text-center">
          <h2 className="font-display text-4xl text-cream mb-4">Ready to make<br /><span className="text-gold-gradient italic">something timeless?</span></h2>
          <p className="text-mist text-sm mb-8">Returning clients receive 30% off. Enter your discount code at checkout.</p>
          <Button size="lg" onClick={() => bookingRef.current?.scrollIntoView({ behavior: "smooth" })}>
            <Calendar className="w-4 h-4" />Book Your Session
          </Button>
        </div>
      </section>
    </div>
  )
}
