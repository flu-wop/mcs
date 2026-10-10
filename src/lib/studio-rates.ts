// src/lib/studio-rates.ts
// Single source of truth for studio pricing. The booking UIs render from it
// and the checkout routes price from it, so the amount charged is always the
// server's number, never whatever the browser sent.

export interface StudioRate {
  id: string
  label: string
  /** Billed hours; null for project-based mixing work. */
  hours: number | null
  /** Package price in cents (for "hourly", the price of ONE hour). */
  price: number
  perHour?: number
  regularPrice?: number
  duration?: string
  badge?: string | null
  popular?: boolean
  desc: string
  includes: string[]
}

export const HOURLY_MIN = 2
export const HOURLY_MAX = 12

export const RECORDING_RATES: StudioRate[] = [
  {
    id: "hourly", label: "Hourly", duration: "Per hour", hours: 1,
    price: 10000, perHour: 10000, badge: null,
    desc: "Perfect for short sessions, overdubs, or quick fixes. Minimum 2 hours.",
    includes: ["Full live room access", "In-house engineer", "Session files delivered"],
  },
  {
    id: "block-4", label: "4-Hour Block", duration: "Half day", hours: 4,
    price: 36000, perHour: 9000, badge: "Save $40",
    desc: "The sweet spot for a focused recording session. Vocals, overdubs, or tight tracking.",
    includes: ["Full live room + ISO booth", "Engineer on-site", "Rough mix included"],
  },
  {
    id: "block-8", label: "8-Hour Block", duration: "Full day", hours: 8,
    price: 64000, perHour: 8000, badge: "Best Value", popular: true,
    desc: "A full day to track, experiment, and finish. Includes a break and a rough mix.",
    includes: ["Full live room + ISO booth", "Producer available by request", "Rough mix + session files", "Complimentary coffee"],
  },
]

export const MIXING_RATES: StudioRate[] = [
  {
    id: "mix-vocal", label: "Vocal Mix", hours: null, price: 30000, badge: null,
    desc: "One lead vocal + two backing tracks mixed over your existing instrumental. Delivered in 3–5 business days.",
    includes: ["1 lead + 2 backing tracks", "2 rounds of revisions", "Stems delivered"],
  },
  {
    id: "mix-full", label: "Full Mix (up to 24 tracks)", hours: null, price: 65000, badge: "Most Popular", popular: true,
    desc: "Hollywood-grade multi-track mix from our experienced engineering team. Submit stems, receive a master.",
    includes: ["Up to 24 tracks", "3 rounds of revisions", "Stereo + stem delivery", "Delivery in 5–7 days"],
  },
  {
    id: "mix-stem", label: "Stem Mixing", hours: null, price: 95000, badge: "Premium",
    desc: "Full stem-based mix for maximum creative control. Ideal for complex productions.",
    includes: ["Unlimited tracks (stem groups)", "3 rounds of revisions", "Full stem + stereo delivery", "Delivery in 7–10 days"],
  },
  {
    id: "mix-atmos", label: "Dolby Atmos Mix", hours: null, price: 85000, regularPrice: 59500, badge: "New",
    desc: "Immersive spatial audio mix delivered in Dolby Atmos. Required for Apple Music Spatial Audio.",
    includes: ["Full Atmos + stereo deliverables", "Apple Music / Tidal spatial ready", "3 rounds of revisions", "Delivery in 7–10 days"],
  },
  {
    id: "mix-bundle", label: "Full Mix + Dolby Atmos Bundle", hours: null, price: 110000, regularPrice: 77000, badge: "Best Deal", popular: true,
    desc: "Complete stereo + spatial audio package. Everything your release needs in one session.",
    includes: ["Full Mix (up to 24 tracks)", "Dolby Atmos mix included", "Stereo + Atmos + stem delivery", "3 rounds of revisions", "Delivery in 10–14 days"],
  },
]

/** Rates offered on the individual engineer booking pages (/book/*). */
export const ENGINEER_RATES = [
  { id: "hourly", label: "Hourly",         hours: 1, price: 10000 },
  { id: "half",   label: "Half Day (4hr)", hours: 4, price: 36000 },
  { id: "full",   label: "Full Day (8hr)", hours: 8, price: 64000 },
]

export interface Quote { id: string; label: string; hours: number; cents: number }

function hourlyQty(n: unknown): number {
  const q = Math.round(Number(n))
  return Number.isFinite(q) ? Math.min(HOURLY_MAX, Math.max(HOURLY_MIN, q)) : HOURLY_MIN
}

/**
 * Server-side price for a /studio booking. Returns null for an unknown rate.
 * Mixing work is project-based; it holds a 1-hour slot on the calendar.
 */
export function quoteStudio(rateId: string, requestedHours?: unknown): Quote | null {
  const rate = [...RECORDING_RATES, ...MIXING_RATES].find(r => r.id === rateId)
  if (!rate) return null
  if (rate.id === "hourly") {
    const h = hourlyQty(requestedHours)
    return { id: rate.id, label: rate.label, hours: h, cents: rate.price * h }
  }
  return { id: rate.id, label: rate.label, hours: rate.hours ?? 1, cents: rate.price }
}

/** Server-side price for an engineer-page booking. */
export function quoteEngineer(rateId: string, requestedHours?: unknown): Quote | null {
  const rate = ENGINEER_RATES.find(r => r.id === rateId)
  if (!rate) return null
  const h = rate.id === "hourly" ? hourlyQty(requestedHours) : rate.hours
  return { id: rate.id, label: rate.label, hours: h, cents: rate.id === "hourly" ? rate.price * h : rate.price }
}

export function fmtUSD(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100)
}

/** YYYY-MM-DD in the visitor's own calendar (toISOString shifts to UTC and can land on the wrong day). */
export function localDateKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
