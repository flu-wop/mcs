// src/app/legacy/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// LEGACY PAGE  (route: /legacy)
// Beautiful timeline of Donny Markowitz's career + bio + photo gallery.
// Swap placeholder text with real bio copy and photo paths.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata }  from "next"
import Link               from "next/link"
import Image              from "next/image"
import { Award, Music, Star, MapPin, ArrowRight, Film } from "lucide-react"
import { Button }         from "@/components/ui/button"
import { Badge }          from "@/components/ui/badge"
import { Separator }      from "@/components/ui/separator"

export const metadata: Metadata = {
  title:       "Legacy — Donny Markowitz",
  description: "The five-decade musical journey of Donny Markowitz — from New York session rooms to Oscar nominations to founding Mid City Sound Studios in New Orleans.",
}

/* ─── Timeline events ─────────────────────────────────────────────────────── */
const TIMELINE = [
  {
    year:  "1986",
    city:  "New York City",
    icon:  Music,
    title: "New York Session Era",
    body:  "Donny Markowitz breaks into the New York session circuit, arranging strings and conducting for some of the most sought-after recording projects of the decade. His uncanny ability to bridge jazz sensibility with pop accessibility made him a studio secret weapon.",
    tags:  ["Session Work", "Arrangements", "NYC"],
  },
  {
    year:  "1990s",
    city:  "Los Angeles, CA",
    icon:  Film,
    title: "Hollywood Calling",
    body:  "Donny relocates to Los Angeles and begins scoring for film and television. His lush, orchestral sensibility catches the ear of major studios. He earns multiple credits on platinum soundtracks and begins building the Hollywood relationships that define his career.",
    tags:  ["Film Scoring", "Hollywood", "Soundtracks"],
  },
  {
    year:  "1993",
    city:  "Academy Awards",
    icon:  Award,
    title: "First Oscar Nomination",
    body:  "Donny receives his first Academy Award nomination for Best Original Song. The ceremony is a milestone — his name appears among the industry's most celebrated composers. Two additional nominations follow in subsequent years.",
    tags:  ["Oscar®", "Nomination", "Original Song"],
  },
  {
    year:  "2000s",
    city:  "Los Angeles, CA",
    icon:  Star,
    title: "Platinum Decades",
    body:  "Through the 2000s, Donny racks up production and co-writing credits on platinum-certified records spanning R&B, Hip Hop, and adult contemporary. Artists seek him out specifically for his ability to elevate a track from good to unforgettable.",
    tags:  ["Production", "Platinum Records", "Hip Hop"],
  },
  {
    year:  "2015",
    city:  "New Orleans, LA",
    icon:  MapPin,
    title: "New Orleans & Mid City Sound",
    body:  "Drawn to New Orleans' unmatched musical DNA, Donny founds Mid City Sound Studios in the heart of Mid City. The studio becomes an immediate home for local legends, touring artists, and the next generation of creators — carrying four decades of craft into every session.",
    tags:  ["New Orleans", "Studio", "Mid City"],
  },
]

/* ─── Gallery placeholder items ─────────────────────────────────────────────── */
const GALLERY = [
  "At the board, 1992",
  "Oscar night, 1993",
  "Session in LA, 1998",
  "New York, 1988",
  "Mid City Sound grand opening",
  "With artists, New Orleans",
]

/* ─────────────────────────────────────────────────────────────────────────── */
export default function LegacyPage() {
  return (
    <div className="pt-16 min-h-screen bg-studio-black">

      {/* ── Page hero ── */}
      <section className="relative py-24 px-6 bg-studio-charcoal border-b border-studio-border overflow-hidden">
        {/* Decorative gold glow */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_60%_60%_at_80%_40%,rgba(212,175,119,0.06),transparent)]" />

        <div className="relative mx-auto max-w-5xl grid md:grid-cols-2 gap-14 items-center">
          {/* Photo placeholder */}
          <div className="relative aspect-[3/4] bg-studio-dark border border-studio-border rounded-sm overflow-hidden order-2 md:order-1">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-mist/30 gap-4 px-8">
              <div className="relative w-[100px] h-[62px] opacity-20">
                <Image src="/images/logo/wave-moon.jpg" alt="" fill className="object-contain" sizes="100px" />
              </div>
              <span className="text-xs tracking-widest uppercase text-center leading-relaxed">
                Donny Markowitz<br />
                <span className="text-[10px] text-mist/20 normal-case tracking-normal">Replace with portrait photo</span>
              </span>
            </div>
            {/* Gold frame accents */}
            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-gold/40" />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-gold/40" />
          </div>

          {/* Bio intro */}
          <div className="space-y-6 order-1 md:order-2">
            <Badge variant="outline" className="text-[10px] tracking-widest uppercase">
              The Legacy of Donny Markowitz
            </Badge>
            <h1 className="font-display text-5xl md:text-6xl text-cream leading-tight">
              Five decades
              <br />
              <span className="text-gold-gradient italic">of timeless craft</span>
            </h1>
            <Separator className="w-12 bg-gold/40" />
            <p className="text-mist text-sm leading-relaxed">
              From New York's golden session era to Hollywood's biggest stages — through
              Oscar nominations and platinum records — Donny Markowitz has spent five
              decades shaping the sound of American music.
            </p>
            <p className="text-mist text-sm leading-relaxed">
              Today he brings all of that to New Orleans, where Mid City Sound Studios
              stands as both a working studio and a living piece of music history.
            </p>

            {/* Highlight stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { val: "3×",   label: "Oscar® Nominations" },
                { val: "40+",  label: "Years in Music" },
                { val: "500+", label: "Credits" },
              ].map(({ val, label }) => (
                <div key={label} className="border border-studio-border rounded-sm p-3 text-center">
                  <p className="font-display text-2xl text-gold">{val}</p>
                  <p className="text-mist text-[10px] mt-1 leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-3 text-[10px] tracking-widest uppercase">
              The Journey
            </Badge>
            <h2 className="font-display text-4xl text-cream">A life in music</h2>
          </div>

          {/* Timeline items */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-7 top-0 bottom-0 w-px bg-studio-border" />

            <div className="space-y-0">
              {TIMELINE.map(({ year, city, icon: Icon, title, body, tags }, i) => (
                <div key={year} className="relative flex gap-8 pb-14 last:pb-0">
                  {/* Icon node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-14 h-14 rounded-full border border-gold/40 bg-studio-dark flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-3">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-display text-2xl text-gold">{year}</span>
                      <span className="text-mist text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {city}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-cream mb-3">{title}</h3>
                    <p className="text-mist text-sm leading-relaxed mb-4">{body}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo gallery ── */}
      <section className="py-24 px-6 bg-studio-charcoal border-t border-studio-border">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 text-[10px] tracking-widest uppercase">
              Photo Archive
            </Badge>
            <h2 className="font-display text-4xl text-cream">Through the decades</h2>
            <p className="text-mist text-xs mt-2">
              Replace placeholders with real photos in <code className="text-gold/70">public/images/</code>
            </p>
          </div>

          {/* Gallery grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY.map((caption, i) => (
              <div
                key={i}
                className="relative aspect-square bg-studio-dark border border-studio-border rounded-sm overflow-hidden group"
              >
                {/* Photo placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-mist/20 gap-2 p-4 text-center">
                  <Music className="w-8 h-8" />
                  <span className="text-[10px] leading-snug">{caption}</span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors flex items-end">
                  <p className="w-full text-[11px] text-mist/70 p-3 bg-studio-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    {caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote / pull statement ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(212,175,119,0.04),transparent)]" />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="font-display text-3xl md:text-4xl text-cream/90 leading-relaxed italic">
            &ldquo;Every session is a conversation between where music has been
            and where it needs to go.&rdquo;
          </p>
          <p className="text-gold mt-6 text-sm">— Donny Markowitz</p>
          <Separator className="w-8 bg-gold/30 mx-auto mt-8 mb-8" />
          <Button asChild>
            <Link href="/studio">
              Book a Session
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
