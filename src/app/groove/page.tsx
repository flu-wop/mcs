// src/app/groove/page.tsx — Groove of the Day
// Drop an audio file at /public/audio/groove.mp3 to activate.

import type { Metadata } from "next"
import { GroovePlayer } from "@/components/ui/GroovePlayer"

export const metadata: Metadata = {
  title: "Groove of the Day | Mid City Sound Studios",
  description: "A daily groove from the Mid City Sound Studios vault — produced by Donald Markowitz in New Orleans.",
}

export default function GroovePage() {
  return (
    <div className="pt-16 min-h-screen bg-studio-black flex flex-col items-center justify-center px-4 py-20">
      <GroovePlayer />
    </div>
  )
}
