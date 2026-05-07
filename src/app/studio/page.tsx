// src/app/studio/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// STUDIO BOOKING PAGE  (route: /studio)
//
// Flow:
//   Step 1 — Choose a service
//   Step 2 — Choose a date + time
//   Step 3 — Enter contact info
//   Step 4 — Payment (Stripe placeholder — see STRIPE NOTE below)
//   Step 5 — Success screen
//
// STRIPE NOTE:
//   To activate real payments:
//   1. npm install @stripe/stripe-js stripe
//   2. Create /app/api/checkout/route.ts (Stripe Checkout Session)
//   3. Replace the handlePayment() function below with a real Stripe redirect
//   4. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local
//   5. Set STRIPE_SECRET_KEY in .env.local (server only)
// ─────────────────────────────────────────────────────────────────────────────

"use client"

import { useState }   from "react"
import Link           from "next/link"
import {
  Mic2, Music, Headphones, CheckCircle2,
  ArrowLeft, ArrowRight, CreditCard, Clock, DollarSign,
} from "lucide-react"
import { Button }    from "@/components/ui/button"
import { Badge }     from "@/components/ui/badge"
import { Input }     from "@/components/ui/input"
import { Label }     from "@/components/ui/label"
import { Textarea }  from "@/components/ui/textarea"
import { cn }        from "@/lib/utils"

/* ─── Service catalog ─────────────────────────────────────────────────────── */
const SERVICES = [
  {
    id:       "studio-half",
    icon:     Mic2,
    title:    "Studio Session — Half Day",
    subtitle: "4 hours",
    price:    40000, // cents → $400
    desc:     "4-hour block in our main tracking room. Ideal for vocals, overdubs, or a tight recording session.",
    includes: ["Live room access", "Donny available by request", "Rough mix included"],
  },
  {
    id:       "studio-full",
    icon:     Mic2,
    title:    "Studio Session — Full Day",
    subtitle: "8 hours",
    price:    70000,
    desc:     "8-hour deep dive. Full day in the room to track, experiment, and finish.",
    includes: ["Live room + ISO booth", "Engineer on-site", "Rough mix + session files"],
    popular:  true,
  },
  {
    id:       "mixing",
    icon:     Music,
    title:    "Mixing",
    subtitle: "Per song",
    price:    25000,
    desc:     "Donny's Hollywood-grade mix on your track. Submit stems, receive a polished stereo master.",
    includes: ["Up to 48 tracks", "2 rounds of revisions", "Delivery in 5–7 business days"],
  },
  {
    id:       "mastering",
    icon:     Headphones,
    title:    "Mastering",
    subtitle: "Per song",
    price:    10000,
    desc:     "Final-stage mastering optimized for streaming, vinyl, or CD. Clean, loud, and ready for release.",
    includes: ["Streaming + CD-ready files", "ISRC tagging", "1 revision"],
  },
]

/* ─── Available time slots ─────────────────────────────────────────────────── */
const TIME_SLOTS = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"]

/* ─── Utility ─────────────────────────────────────────────────────────────── */
function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100)
}

type Step = 1 | 2 | 3 | 4 | 5

/* ─────────────────────────────────────────────────────────────────────────── */
export default function StudioPage() {
  const [step,        setStep]       = useState<Step>(1)
  const [service,     setService]    = useState<typeof SERVICES[0] | null>(null)
  const [date,        setDate]       = useState("")
  const [time,        setTime]       = useState("")
  const [form,        setForm]       = useState({ name: "", email: "", phone: "", notes: "" })
  const [loading,     setLoading]    = useState(false)

  /* ── Payment handler (Stripe placeholder) ── */
  async function handlePayment() {
    setLoading(true)
    /*
      ─── STRIPE INTEGRATION POINT ─────────────────────────────────────────
      Replace this setTimeout with a real Stripe Checkout:

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceId: service?.id, date, time, ...form }),
        })
        const { url } = await res.json()
        window.location.href = url  // redirect to Stripe Hosted Checkout

      After payment succeeds, Stripe redirects to /studio?success=1
      and you show the success screen (step 5).
      ─────────────────────────────────────────────────────────────────────
    */
    await new Promise((r) => setTimeout(r, 1500)) // simulate network delay
    setLoading(false)
    setStep(5)
  }

  /* ── Step progress indicator ── */
  function StepDot({ n }: { n: number }) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium border transition-all",
          step === n
            ? "border-gold bg-gold text-studio-black"
            : step > n
            ? "border-gold/50 bg-gold/20 text-gold"
            : "border-studio-border text-mist"
        )}>
          {step > n ? "✓" : n}
        </div>
        {n < 4 && <div className={cn("w-8 h-px", step > n ? "bg-gold/40" : "bg-studio-border")} />}
      </div>
    )
  }

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="pt-16 min-h-screen bg-studio-black">
      {/* ── Page header ── */}
      <div className="border-b border-studio-border bg-studio-charcoal py-12 px-6">
        <div className="mx-auto max-w-3xl">
          <Badge variant="outline" className="mb-3 text-[10px] tracking-widest uppercase">
            Studio Booking
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl text-cream mb-3">
            Book Your Session
          </h1>
          <p className="text-mist text-sm max-w-md">
            Secure your studio time below. Full upfront payment required.
            All bookings are subject to Donny & Flu approval — we'll confirm within 24 hours.
          </p>
        </div>
      </div>

      {/* ── Step progress bar ── */}
      {step < 5 && (
        <div className="border-b border-studio-border bg-studio-charcoal py-4 px-6">
          <div className="mx-auto max-w-3xl flex items-center">
            {[1, 2, 3, 4].map((n) => <StepDot key={n} n={n} />)}
            <div className="ml-4 text-mist text-xs">
              {["Choose Service", "Date & Time", "Your Info", "Payment"][step - 1]}
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="mx-auto max-w-3xl px-6 py-12">

        {/* ══ STEP 1: Service selection ══════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-cream">Select a service</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {SERVICES.map((svc) => {
                const Icon     = svc.icon
                const selected = service?.id === svc.id
                return (
                  <button
                    key={svc.id}
                    onClick={() => setService(svc)}
                    className={cn(
                      "relative text-left p-5 border rounded-sm transition-all",
                      selected
                        ? "border-gold bg-gold/5"
                        : "border-studio-border bg-studio-card hover:border-gold/40"
                    )}
                  >
                    {svc.popular && (
                      <Badge className="absolute top-3 right-3 text-[9px]">Popular</Badge>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      <Icon className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-cream text-sm">{svc.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3 text-mist" />
                          <span className="text-mist text-xs">{svc.subtitle}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-mist text-xs leading-relaxed mb-3">{svc.desc}</p>
                    <ul className="space-y-1 mb-4">
                      {svc.includes.map((item) => (
                        <li key={item} className="text-xs text-mist/70 flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-gold/50 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="font-display text-xl text-gold">{fmt(svc.price)}</p>
                  </button>
                )
              })}
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep(2)} disabled={!service}>
                Next: Choose Date
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ══ STEP 2: Date & time ════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-8">
            <h2 className="font-display text-2xl text-cream">Choose a date & time</h2>

            {/* Date input */}
            <div className="space-y-2">
              <Label>Preferred Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="max-w-xs"
              />
              <p className="text-mist/60 text-xs">
                Availability subject to confirmation. We'll reach out within 24 hours.
              </p>
            </div>

            {/* Time slots */}
            <div className="space-y-3">
              <Label>Start Time</Label>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={cn(
                      "px-4 py-2 border text-sm rounded-sm transition-all",
                      time === slot
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-studio-border text-mist hover:border-gold/40 hover:text-cream"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!date || !time}>
                Next: Your Info <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ══ STEP 3: Contact info ═══════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-cream">Your information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Session Notes (optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Tell us about your project, what you're recording, any special requests..."
                className="h-28"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!form.name || !form.email}
              >
                Review & Pay <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ══ STEP 4: Payment review ══════════════════════════════════════ */}
        {step === 4 && service && (
          <div className="space-y-8">
            <h2 className="font-display text-2xl text-cream">Review & Payment</h2>

            {/* Booking summary card */}
            <div className="border border-studio-border rounded-sm bg-studio-card p-6 space-y-4">
              <p className="text-[11px] tracking-widest uppercase text-gold/70">Booking Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-mist">Service</span>
                  <span className="text-cream">{service.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mist">Date</span>
                  <span className="text-cream">{date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mist">Time</span>
                  <span className="text-cream">{time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mist">Name</span>
                  <span className="text-cream">{form.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mist">Email</span>
                  <span className="text-cream">{form.email}</span>
                </div>
              </div>
              <div className="border-t border-studio-border pt-4 flex justify-between items-center">
                <span className="text-mist text-sm">Total due today</span>
                <span className="font-display text-2xl text-gold">{fmt(service.price)}</span>
              </div>
            </div>

            {/* Admin note for Flu */}
            {/*
              ADMIN NOTE (for Flu):
              Every booking submission triggers an email to midcitysound@gmail.com.
              To wire this up: create /app/api/notify/route.ts using Resend or SendGrid
              and call it inside handlePayment() before/after the Stripe checkout.
              Booking data: { service, date, time, ...form }
            */}

            {/* Stripe payment placeholder */}
            <div className="border border-dashed border-gold/30 rounded-sm p-6 space-y-4">
              <div className="flex items-center gap-2 text-gold/70">
                <CreditCard className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase">Payment (Stripe)</span>
              </div>
              <p className="text-mist text-xs leading-relaxed">
                <strong className="text-cream">Dev placeholder:</strong> In production,
                clicking &quot;Pay Now&quot; opens a Stripe Checkout session. Full payment
                is collected upfront. Booking is confirmed pending Donny & Flu approval.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Card Number</Label>
                  <Input placeholder="4242 4242 4242 4242" disabled className="opacity-40" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>Expiry</Label>
                    <Input placeholder="MM / YY" disabled className="opacity-40" />
                  </div>
                  <div className="space-y-1">
                    <Label>CVC</Label>
                    <Input placeholder="123" disabled className="opacity-40" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(3)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-studio-black/30 border-t-studio-black rounded-full animate-spin" />
                    Processing…
                  </span>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Pay {fmt(service.price)} — Confirm Booking
                  </>
                )}
              </Button>
            </div>

            <p className="text-mist/50 text-[11px] text-center">
              Payments are processed securely via Stripe. This booking is subject to
              final approval from Mid City Sound Studios within 24 hours.
            </p>
          </div>
        )}

        {/* ══ STEP 5: Success ════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="text-center space-y-6 py-12">
            <div className="w-16 h-16 mx-auto border border-gold/50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-gold" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-4xl text-cream">Booking Received</h2>
              <p className="text-gold text-sm font-medium">Payment confirmed</p>
            </div>
            <p className="text-mist text-sm max-w-sm mx-auto leading-relaxed">
              Your session request has been submitted. <strong className="text-cream">
              This booking is subject to approval by Donny & Flu</strong> — we'll reach
              out at <span className="text-gold">{form.email}</span> within 24 hours to confirm.
            </p>
            <div className="border border-studio-border rounded-sm p-4 max-w-xs mx-auto text-left space-y-1 text-sm">
              <p><span className="text-mist">Service:</span> <span className="text-cream">{service?.title}</span></p>
              <p><span className="text-mist">Date:</span> <span className="text-cream">{date}</span></p>
              <p><span className="text-mist">Time:</span> <span className="text-cream">{time}</span></p>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
              <Button asChild>
                <Link href="/projects">Explore Projects</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Services info strip ── */}
      {step === 1 && (
        <div className="border-t border-studio-border bg-studio-charcoal py-10 px-6">
          <div className="mx-auto max-w-3xl grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Clock,       label: "Flexible Hours",   sub: "10 AM – 10 PM daily" },
              { icon: DollarSign,  label: "Full Payment",     sub: "Secures your date" },
              { icon: CheckCircle2,label: "24h Confirmation", sub: "Donny & Flu review" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="w-5 h-5 text-gold/60" />
                <p className="text-cream text-sm font-medium">{label}</p>
                <p className="text-mist text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
