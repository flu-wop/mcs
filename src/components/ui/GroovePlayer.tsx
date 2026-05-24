"use client"

// src/components/ui/GroovePlayer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Groove of the Week player
//   • Free: 30-second preview (groove-preview.mp3)
//   • $0.99: download full track (groove-full.mp3) via Stripe
//
// To activate:
//   1. Drop /public/audio/groove-preview.mp3  (30s clip)
//   2. Drop /public/audio/groove-full.mp3     (full track)
//   3. Wire up /app/api/groove-checkout/route.ts (Stripe, $0.99)
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useEffect } from "react"
import {
  Play, Pause, Download, Lock,
  ShieldCheck, CreditCard, Music2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function GroovePlayer() {
  const audioRef              = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)

  // Sync time display
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const tick = () => setCurrent(el.currentTime)
    el.addEventListener("timeupdate", tick)
    el.addEventListener("ended", () => { setPlaying(false); setCurrent(0) })
    return () => { el.removeEventListener("timeupdate", tick) }
  }, [])

  function togglePlay() {
    const el = audioRef.current
    if (!el) return
    if (playing) { el.pause(); setPlaying(false) }
    else         { el.play();  setPlaying(true)  }
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  const PREVIEW_DURATION = 30
  const progress = Math.min((current / PREVIEW_DURATION) * 100, 100)

  async function handlePurchase() {
    setLoading(true)
    // ── STRIPE: wire up when ready ────────────────────────────────────────
    // const res = await fetch("/api/groove-checkout", { method: "POST" })
    // const { url } = await res.json()
    // window.location.href = url
    // ─────────────────────────────────────────────────────────────────────
    setLoading(false)
    alert("Stripe checkout coming soon — $0.99 download not yet enabled.")
  }

  return (
    <div className="w-full max-w-md space-y-6">

      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="outline" className="text-[10px] tracking-widest uppercase">
          Groove of the Week
        </Badge>
        <h1 className="font-display text-4xl text-cream">
          This Week's Groove
        </h1>
        <p className="text-mist text-xs">
          Mid City Sound Studios · New Orleans
        </p>
      </div>

      {/* Player card */}
      <div
        className="border border-studio-border rounded-sm overflow-hidden"
        style={{ boxShadow: "0 0 40px rgba(212,175,119,0.05)" }}
      >
        {/* Waveform / visual */}
        <div className="bg-studio-dark px-6 py-8 flex flex-col items-center gap-4 border-b border-studio-border">
          <div
            className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${
              playing
                ? "border-gold bg-gold/10 scale-105"
                : "border-studio-border hover:border-gold/60 bg-studio-black"
            }`}
            onClick={togglePlay}
          >
            {playing
              ? <Pause className="w-8 h-8 text-gold" />
              : <Play  className="w-8 h-8 text-gold ml-1" />
            }
          </div>

          {/* Progress bar */}
          <div className="w-full space-y-1.5">
            <div className="h-1 bg-studio-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-mist/50">
              <span>{fmt(current)}</span>
              <span className="flex items-center gap-1">
                <Music2 className="w-3 h-3" />
                30s preview
              </span>
              <span>{fmt(PREVIEW_DURATION)}</span>
            </div>
          </div>
        </div>

        {/* Paywall */}
        <div className="p-6 space-y-5 bg-studio-card">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 border border-gold/30 rounded-sm flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-gold/60" />
            </div>
            <div>
              <p className="text-cream text-sm font-medium">Download the Full Track</p>
              <p className="text-mist text-xs mt-0.5">
                High-quality MP3 — yours to keep forever.
              </p>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full h-12 bg-gold text-studio-black text-[13px] font-bold tracking-widest uppercase rounded-sm hover:bg-gold-light transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-studio-black/30 border-t-studio-black rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download for $0.99
              </>
            )}
          </button>

          <div className="flex justify-center gap-5 text-mist/40 text-[11px]">
            {[
              { icon: ShieldCheck, text: "Secure" },
              { icon: CreditCard,  text: "Stripe" },
              { icon: Download,    text: "Instant download" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />{text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden audio element — preview only */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/audio/groove-preview.mp3" preload="metadata" />
    </div>
  )
}
