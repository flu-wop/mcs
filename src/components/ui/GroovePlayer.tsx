"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react"

const GROOVE_TRACK = "/audio/groove.mp3"
const GROOVE_MONTH = new Date().toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase()

export function GroovePlayer() {
  const audioRef              = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted,   setMuted]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = new Audio(GROOVE_TRACK)
    audio.preload = "metadata"
    audioRef.current = audio
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration))
    audio.addEventListener("ended", () => { setPlaying(false); setProgress(0) })
    audio.addEventListener("timeupdate", () => setProgress(audio.currentTime))
    return () => { audio.pause(); audio.src = "" }
  }, [])

  function togglePlay() {
    const a = audioRef.current; if (!a) return
    if (a.paused) { a.play(); setPlaying(true) }
    else          { a.pause(); setPlaying(false) }
  }
  function toggleMute() {
    const a = audioRef.current; if (!a) return
    a.muted = !a.muted; setMuted(a.muted)
  }
  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const a = audioRef.current; if (!a) return
    a.currentTime = Number(e.target.value); setProgress(Number(e.target.value))
  }
  function fmt(s: number) {
    if (!s || isNaN(s)) return "0:00"
    return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`
  }

  return (
    <div className="w-full max-w-lg border border-gold/25 rounded-sm overflow-hidden" style={{ boxShadow: "0 0 60px rgba(212,175,119,0.08)" }}>

      {/* Header */}
      <div className="bg-studio-charcoal px-8 pt-10 pb-8 flex flex-col items-center gap-4 border-b border-studio-border/40">
        <div className="w-20 h-20 border border-gold/30 rounded-full flex items-center justify-center bg-studio-black/60">
          <Music className="w-8 h-8 text-gold/50" />
        </div>
        <div className="text-center">
          <p className="font-display text-2xl text-cream">Groove of the Day</p>
          <p className="text-mist text-sm mt-1">Donald Markowitz</p>
          <p className="text-mist/40 italic text-xs mt-1">From the Mid City Sound Studios vault.</p>
          <p className="text-gold/50 text-[10px] tracking-widest uppercase mt-3">{GROOVE_MONTH}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-studio-dark space-y-5">
        <div className="flex items-center gap-3 text-xs text-mist/50">
          <span className="w-8 text-right">{fmt(progress)}</span>
          <input
            type="range" min={0} max={duration || 100} value={progress}
            onChange={seek}
            className="flex-1 accent-gold h-1 cursor-pointer"
          />
          <span className="w-8">{fmt(duration)}</span>
        </div>
        <div className="flex items-center justify-center gap-6">
          <button onClick={toggleMute} className="text-mist hover:text-gold transition-colors">
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-gold text-studio-black rounded-full flex items-center justify-center hover:bg-gold/90 active:scale-95 transition-all duration-200"
          >
            {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
          </button>
          <div className="w-5" />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-studio-border/30 bg-studio-black text-center">
        <p className="text-mist/30 text-[10px]">
          To update: swap the file in <code className="text-gold/40">/public/audio/groove.mp3</code>
        </p>
      </div>
    </div>
  )
}
