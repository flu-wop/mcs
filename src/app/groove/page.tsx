// src/app/groove/page.tsx — Groove of the Week
// Audio files:
//   /public/audio/groove-preview.mp3  — 30-second clip (always plays free)
//   /public/audio/groove-full.mp3     — full track (unlocked after purchase)

import type { Metadata } from "next"
import { GroovePlayer } from "@/components/ui/GroovePlayer"

export const metadata: Metadata = {
  title: "Groove of the Week | Mid City Sound Studios",
  description: "A weekly groove from the Mid City Sound Studios vault — produced by Donald Markowitz in New Orleans. Stream the 30-second preview free, or download the full track for $0.99.",
}

export default function GroovePage() {
  return (
    <div className="pt-16 min-h-screen bg-studio-black flex flex-col items-center justify-center px-4 py-20">
      <GroovePlayer />
    </div>
  )
}
