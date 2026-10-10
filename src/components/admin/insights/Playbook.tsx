"use client"
// Insights → Playbook: the studio's answers-on-a-call sheet. Everything here
// reads from the same files the public site uses (rates, rooms, payouts), so
// it can't drift from what customers see.
import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { RECORDING_RATES, MIXING_RATES, ENGINEER_RATES, fmtUSD } from "@/lib/studio-rates"
import { ROOMS } from "@/lib/rooms"
import { ENGINEER_PAGE_RATE_CENTS, GENERIC_ASSIGNED_RATE_CENTS } from "@/lib/engineers"
import { PILLARS, POST_TARGET } from "./content"
import { Card, CardTitle } from "../ui"

const BRAND = [
  { name: "Studio black", hex: "#090909" }, { name: "Charcoal", hex: "#111111" },
  { name: "Gold", hex: "#D4AF77" }, { name: "Cream", hex: "#F5EDD8" }, { name: "Mist", hex: "#A89880" },
]

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = async (key: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(c => (c === key ? null : c)), 1600) } catch { /* blocked */ }
  }
  return { copied, copy }
}

export function Playbook() {
  const { copied, copy } = useCopy()
  const rows = (list: { id: string; label: string; price: number; perHour?: number }[]) => (
    <ul className="divide-y divide-studio-border">
      {list.map(r => (
        <li key={r.id} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
          <span className="text-cream">{r.label}</span>
          <span className="text-gold tabular-nums whitespace-nowrap">{fmtUSD(r.price)}{r.id === "hourly" ? "/hr" : ""}</span>
        </li>
      ))}
    </ul>
  )
  const policy = "Cancel 48+ hours ahead: full refund. Under 48 hours: 50% studio credit. Day-of or no show: non-refundable, contact us to reschedule."

  return (
    <div className="grid gap-4 lg:grid-cols-2 items-start">
      <Card>
        <CardTitle title="Studio rates" hint="What the booking page charges. Hourly has a 2-hour minimum." />
        <p className="text-[10px] tracking-[0.18em] uppercase text-mist/50 mb-1">Recording</p>
        {rows(RECORDING_RATES)}
        <p className="text-[10px] tracking-[0.18em] uppercase text-mist/50 mt-5 mb-1">Mixing</p>
        {rows(MIXING_RATES)}
      </Card>
      <div className="space-y-4">
        <Card>
          <CardTitle title="Engineer pages" hint="/book/flu, /book/jesse and the rest" />
          {rows(ENGINEER_RATES)}
          <p className="mt-4 text-xs text-mist leading-relaxed bg-studio-dark rounded-sm px-3 py-2.5">
            Payouts: {fmtUSD(ENGINEER_PAGE_RATE_CENTS)}/hr when booked through an engineer&apos;s page, {fmtUSD(GENERIC_ASSIGNED_RATE_CENTS)}/hr when assigned to a /studio booking.
          </p>
        </Card>
        <Card>
          <CardTitle title="Policies" right={
            <button onClick={() => copy("policy", policy)} className="inline-flex items-center gap-1.5 text-xs text-mist hover:text-gold">
              {copied === "policy" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied === "policy" ? "Copied" : "Copy"}
            </button>} />
          <ul className="space-y-2 text-sm text-cream/90">
            <li>48+ hours notice: full refund</li>
            <li>Under 48 hours: 50% studio credit</li>
            <li>Day-of or no show: non-refundable, reschedule</li>
            <li className="text-mist">Regulars and referrals: 30% off with their code</li>
            <li className="text-mist">Every booking approved within 24 hours, or refunded</li>
          </ul>
        </Card>
      </div>

      <Card>
        <CardTitle title="The rooms" hint="Same descriptions as the public site" />
        <ul className="space-y-4">
          {ROOMS.map(r => (
            <li key={r.id}>
              <p className="text-cream text-sm"><span className="font-display text-lg text-gold mr-2">{r.id}</span>{r.name} · <span className="text-mist">{r.role}</span></p>
              <p className="text-xs text-mist/70 mt-1 leading-relaxed">{r.gear.join(" · ")}</p>
            </li>
          ))}
        </ul>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardTitle title="Content pillars" hint={`Aim for ${POST_TARGET.min}–${POST_TARGET.max} posts a week. Offers no more than 1 in 5.`} />
          <ul className="divide-y divide-studio-border">
            {PILLARS.filter(p => p.id > 0).map(p => (
              <li key={p.id} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                <span className="text-cream shrink-0">{p.label}</span><span className="text-mist/60 text-xs text-right">{p.tip}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle title="Brand colors" hint="Tap to copy" />
          <div className="grid grid-cols-5 gap-2">
            {BRAND.map(c => (
              <button key={c.hex} onClick={() => copy(c.hex, c.hex)} className="text-left group">
                <span className="block aspect-square rounded-sm border border-studio-border group-hover:border-gold/60 transition-colors" style={{ background: c.hex }} />
                <span className="block text-[10px] text-mist mt-1.5 truncate">{c.name}</span>
                <span className="block text-[10px] text-mist/50 font-mono">{copied === c.hex ? "Copied" : c.hex}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
