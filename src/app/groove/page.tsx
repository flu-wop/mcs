// src/app/groove/page.tsx
"use client"

import { useState, useRef } from "react"
import { Shield, Download, Music2, CreditCard, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

// ── Update this each week ──────────────────────────────────────────────────
const GROOVE = {
  songName:   "Groove of the Week",   // e.g. "Second Line Strut"
  artistName: "Donald Markowitz",
}
// ──────────────────────────────────────────────────────────────────────────

export default function GroovePage() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const audioRef              = useRef<HTMLAudioElement>(null)

  // Hard-stop preview at 30 seconds
  function handleTimeUpdate() {
    const audio = audioRef.current
    if (audio && audio.currentTime >= 30) {
      audio.pause()
      audio.currentTime = 0
    }
  }

  async function handlePurchase() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch("/api/groove-checkout", { method: "POST" })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed")
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="bg-studio-black min-h-screen">

      {/* ── Hero ── */}
      <section className="relative py-24 px-6 text-center border-b border-studio-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(212,175,119,0.06),transparent)]" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-[10px] tracking-widest uppercase text-gold/60 mb-4">
            Mid City Sound Studios · New Orleans
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-cream mb-4 italic">
            Groove of the Week
          </h1>
          <p className="text-mist text-sm">
            A weekly groove from the vault — produced by Donald Markowitz.
          </p>
        </div>
      </section>

      {/* ── Player + Purchase ── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-xl space-y-6">

          {/* Preview player */}
          <div className="border border-studio-border rounded-sm bg-studio-card overflow-hidden">
            <div className="px-6 py-4 border-b border-studio-border bg-studio-dark">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-cream text-sm font-medium">{GROOVE.songName}</p>
                  <p className="text-gold/60 text-[10px] tracking-wide uppercase mt-0.5">{GROOVE.artistName}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  <Music2 className="w-3 h-3 text-gold/50" />
                  <p className="text-[10px] tracking-widest uppercase text-gold/50">Preview</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <audio
                ref={audioRef}
                controls
                onTimeUpdate={handleTimeUpdate}
                controlsList="nodownload"
                className="w-full accent-[#D4AF77]"
                preload="metadata"
              >
                <source src="/audio/groove-preview.mp3" type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <p className="text-mist/40 text-[11px] mt-3 text-center">
                30-second preview · Full track download below
              </p>
            </div>
          </div>

          {/* Purchase card */}
          <div className="border border-studio-border rounded-sm bg-studio-card overflow-hidden">
            <div className="px-6 py-4 border-b border-studio-border bg-studio-dark flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold/50" />
              <p className="text-[10px] tracking-widest uppercase text-gold/70">
                Download the Full Track
              </p>
            </div>
            <div className="p-6 space-y-5">
              <div className="text-center space-y-1">
                <p className="font-display text-5xl text-gold">$0.99</p>
                <p className="text-mist text-sm">High-quality MP3 — yours to keep forever.</p>
              </div>

              {error && (
                <div className="border border-red-500/30 bg-red-500/5 rounded-sm p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              <Button onClick={handlePurchase} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-studio-black/30 border-t-studio-black rounded-full animate-spin" />
                    Redirecting to checkout…
                  </span>
                ) : (
                  <><Download className="w-4 h-4" />Download for $0.99</>
                )}
              </Button>

              <p className="text-mist/30 text-[11px] text-center flex items-center justify-center gap-1.5">
                <CreditCard className="w-3 h-3" />Powered by Stripe · Secure checkout
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
