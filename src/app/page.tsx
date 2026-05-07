// src/app/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE  (route: /)
// Sections:
//   1. Hero          — full-screen background + overlay text + CTAs
//   2. Stats bar     — quick credibility numbers
//   3. Services       — three-column teaser cards
//   4. Legacy teaser — Donny intro + link to /legacy
//   5. Projects teaser — grid preview
//   6. Testimonials  — pull-quotes from artists
//   7. CTA band      — final booking call-to-action
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next"
import Link              from "next/link"
import Image             from "next/image"
import {
  Mic2, Headphones, Award, Calendar,
  ArrowRight, Star, ChevronDown,
} from "lucide-react"
import { Button }     from "@/components/ui/button"
import { Badge }      from "@/components/ui/badge"
import { Separator }  from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Mid City Sound Studios — a New Orleans recording studio built on Grammy-winning legacy. Book studio time, mixing, mastering, and more.",
}

/* ─── Stat items shown in the bar below the hero ── */
const STATS = [
  { value: "40+",  label: "Years in Music" },
  { value: "3",    label: "Oscar Nominations" },
  { value: "500+", label: "Sessions Recorded" },
  { value: "NOLA", label: "Mid City, New Orleans" },
]

/* ─── Services teaser data ── */
const SERVICES = [
  {
    icon:  Mic2,
    title: "Studio Recording",
    body:  "World-class tracking room with vintage and modern gear. Isolation booth, full live room, and Donny's legendary ears at the board.",
    href:  "/studio",
  },
  {
    icon:  Headphones,
    title: "Mixing & Mastering",
    body:  "Hollywood-grade mixing from the man who shaped platinum records. Your vision, refined to its fullest potential.",
    href:  "/studio#services",
  },
  {
    icon:  Award,
    title: "Artist Development",
    body:  "More than a room — a creative partnership. Donny helps emerging artists find and sharpen their sound.",
    href:  "/contact",
  },
]

/* ─── Pull-quote testimonials ── */
const TESTIMONIALS = [
  {
    quote:  "Walking into Mid City Sound feels like stepping into music history. Donny's ear is unmatched.",
    author: "— Session artist (placeholder)",
    stars:  5,
  },
  {
    quote:  "The room has a sound. And Donny knows exactly how to use it. Best studio experience I've had in New Orleans.",
    author: "— Producer, New Orleans (placeholder)",
    stars:  5,
  },
  {
    quote:  "We flew in from LA just to track here. Worth every mile.",
    author: "— Recording artist (placeholder)",
    stars:  5,
  },
]

/* ─────────────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION                                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/*
          ── Hero background ──
          Swap the gradient below with a real full-bleed studio photo:
            <Image src="/images/hero-studio.jpg" fill objectFit="cover" priority alt="..." />
          Then add a dark overlay div on top (z-10).
          For now we use a rich dark gradient that reads beautifully.
        */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#090909] via-[#111111] to-[#1a160d]" />

        {/* Decorative gold glow — replace with photo after adding hero image */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_80%,rgba(212,175,119,0.07),transparent)]" />

        {/* Subtle noise grain overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E\")",
          }}
        />

        {/* ── Hero content ── */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Eyebrow badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 border border-gold/30 rounded-sm mb-10"
            style={{ animation: "fade-up 0.6s ease-out 0.2s both" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-gold/80">
              New Orleans · Recording Studio
            </span>
          </div>

          {/* Full logo lockup — stacked-bridge.jpg (bridge + MCS + MID CITY SOUND)
              This is the premium hero statement version.
              Pure black bg matches the hero gradient perfectly.
              Swap with transparent PNG for zero-edge version when ready. */}
          <div
            className="flex justify-center mb-6"
            style={{ animation: "fade-up 0.7s ease-out 0.3s both" }}
          >
            <div className="relative w-[300px] sm:w-[400px] md:w-[480px] h-[210px] sm:h-[280px] md:h-[336px]">
              <Image
                src="/images/logo/stacked-bridge.jpg"
                alt="Mid City Sound Studios"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 300px, (max-width: 768px) 400px, 480px"
              />
            </div>
          </div>

          {/* Tagline */}
          <p
            className="text-mist text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-10 font-light leading-relaxed"
            style={{ animation: "fade-up 0.7s ease-out 0.5s both" }}
          >
            Timeless music. Modern studio.
            <br />
            <em className="not-italic text-cream/70">Built on legacy.</em>
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            style={{ animation: "fade-up 0.7s ease-out 0.65s both" }}
          >
            <Button size="lg" asChild>
              <Link href="/studio">
                <Calendar className="w-4 h-4" />
                Book Studio Time
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/projects">
                Explore Projects
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link
                href="https://lilsquiggle.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mist hover:text-cream"
              >
                Shop Lil Squiggle
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-mist/40 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 2. STATS BAR                                                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-studio-border bg-studio-charcoal py-8">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-3xl md:text-4xl text-gold-gradient">
                  {value}
                </p>
                <p className="text-mist text-xs mt-1 tracking-wide uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 3. SERVICES TEASER                                                 */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Section heading */}
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
              Studio Services
            </Badge>
            <h2 className="font-display text-4xl md:text-5xl text-cream mb-4">
              Everything your sound needs
            </h2>
            <p className="text-mist max-w-sm mx-auto text-sm">
              From raw tracking to final master — a full creative home in the heart of New Orleans.
            </p>
          </div>

          {/* Service cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, body, href }) => (
              <Link
                key={title}
                href={href}
                className="group block p-7 border border-studio-border bg-studio-card rounded-sm hover:border-gold/50 transition-all card-lift"
              >
                <div className="w-10 h-10 border border-studio-border rounded-sm flex items-center justify-center mb-5 group-hover:border-gold/50 transition-colors">
                  <Icon className="w-5 h-5 text-gold/70 group-hover:text-gold transition-colors" />
                </div>
                <h3 className="font-display text-xl text-cream mb-2">{title}</h3>
                <p className="text-mist text-sm leading-relaxed">{body}</p>
                <div className="flex items-center gap-1 mt-5 text-gold/70 text-xs group-hover:text-gold transition-colors">
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 4. LEGACY TEASER — Donny intro                                     */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-studio-charcoal border-y border-studio-border">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-14 items-center">

          {/* Photo placeholder — swap with Donny's real photo */}
          <div className="relative aspect-[4/5] bg-studio-dark border border-studio-border rounded-sm overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-mist/30 gap-4 px-8">
              <div className="relative w-[120px] h-[74px] opacity-20">
                <Image src="/images/logo/wave-moon.jpg" alt="" fill className="object-contain" sizes="120px" />
              </div>
              <span className="text-xs tracking-widest uppercase text-center leading-relaxed">
                Donny Markowitz<br />
                <span className="text-[10px] text-mist/20 normal-case tracking-normal">Replace with photo</span>
              </span>
            </div>
            {/* Gold corner accent */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/50" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/50" />
          </div>

          {/* Text content */}
          <div className="space-y-6">
            <Badge variant="outline" className="text-[10px] tracking-widest uppercase">
              The Legacy
            </Badge>
            <h2 className="font-display text-4xl md:text-5xl text-cream leading-tight">
              Five decades of
              <br />
              <em className="text-gold-gradient not-italic">timeless craft</em>
            </h2>
            <Separator className="w-12 bg-gold/40" />
            <div className="space-y-4 text-mist text-sm leading-relaxed">
              <p>
                Donny Markowitz began his journey in New York's golden session era — crafting
                arrangements for artists who would define American music. His path led through
                Hollywood, three Oscar nominations, and decades of platinum records.
              </p>
              <p>
                Today, Donny channels all of that expertise into Mid City Sound Studios in
                New Orleans — a space where emerging artists meet living legend.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/legacy">
                Full Story
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 5. PROJECTS TEASER                                                 */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <Badge variant="outline" className="mb-3 text-[10px] tracking-widest uppercase">
                Active Projects
              </Badge>
              <h2 className="font-display text-4xl text-cream">What we're building</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/projects" className="text-mist hover:text-gold">
                All projects <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          {/* Project cards — mirrors the full /projects page */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title:  "Streetbeats",
                tag:    "Coming Soon",
                desc:   "A new beatmaking platform rooted in New Orleans street culture.",
              },
              {
                title:  "Lil Squiggle",
                tag:    "Live",
                desc:   "#DontDrinkAndDialDecades — reggae-dub chibi Lego campaign.",
              },
              {
                title:  "Time of My Life 40th",
                tag:    "Campaign",
                desc:   "Celebrating 40 years of the iconic Dirty Dancing soundtrack.",
              },
              {
                title:  "Do It Again",
                tag:    "Studio",
                desc:   "Curren$y & Wiz Khalifa — tracked live at Mid City Sound.",
              },
            ].map(({ title, tag, desc }) => (
              <Link
                key={title}
                href="/projects"
                className="group p-5 border border-studio-border bg-studio-card rounded-sm hover:border-gold/40 transition-all card-lift block"
              >
                <Badge
                  variant={tag === "Live" ? "default" : "secondary"}
                  className="mb-4 text-[10px]"
                >
                  {tag}
                </Badge>
                <h3 className="font-display text-lg text-cream mb-1.5">{title}</h3>
                <p className="text-mist text-xs leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 6. TESTIMONIALS                                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 border-t border-studio-border bg-studio-charcoal">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 text-[10px] tracking-widest uppercase">
              Artist Voices
            </Badge>
            <h2 className="font-display text-4xl text-cream">What artists say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, author, stars }) => (
              <div
                key={author}
                className="p-6 border border-studio-border bg-studio-card rounded-sm"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-cream/80 text-sm italic leading-relaxed mb-4">
                  &ldquo;{quote}&rdquo;
                </p>
                <p className="text-mist text-xs">{author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 7. FINAL CTA BAND                                                  */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(212,175,119,0.06),transparent)]" />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="font-display text-5xl md:text-6xl text-cream mb-5">
            Ready to make
            <br />
            <span className="text-gold-gradient">something timeless?</span>
          </h2>
          <p className="text-mist mb-10 text-sm max-w-sm mx-auto">
            Studio sessions are available by appointment. Full upfront payment
            secures your date — subject to Donny & Flu's approval.
          </p>
          <Button size="lg" asChild>
            <Link href="/studio">
              <Calendar className="w-4 h-4" />
              Book Your Session
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
