// src/app/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE  (route: /)
// Sections:
//   1. Hero
//   2. Stats bar
//   3. Services
//   4. Legacy teaser
//   5. Projects teaser
//   6. Gumbeaux Juice
//   7. CTA band
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next"
import Link              from "next/link"
import Image             from "next/image"
import {
  Mic2, Headphones, Award, Calendar,
  ArrowRight, ChevronDown, ExternalLink,
} from "lucide-react"
import { Button }     from "@/components/ui/button"
import { Badge }      from "@/components/ui/badge"
import { Separator }  from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Mid City Sound Studios — a New Orleans recording studio built on decades of award-winning legacy. Book studio time, mixing, mastering, and more.",
}

const STATS = [
  { value: "40+",  label: "Years in Music" },
  { value: "1",    label: "Academy Award\nWinner" },
  { value: "NOLA", label: "Mid City, New Orleans" },
]

const SERVICES = [
  {
    icon:  Mic2,
    title: "Studio Recording",
    body:  "World-class tracking room with vintage and modern gear. Isolation booth, full live room, and experienced engineers at the board.",
    href:  "/studio",
  },
  {
    icon:  Headphones,
    title: "Mixing & Mastering",
    body:  "Hollywood-grade mixing from an Academy Award-winning production team. Your vision, refined to its fullest potential.",
    href:  "/studio#services",
  },
  {
    icon:  Award,
    title: "Artist Development",
    body:  "More than a room — a creative partnership. Our team helps emerging artists find and sharpen their sound.",
    href:  "/contact",
  },
]

const PROJECT_CARDS = [
  {
    title:    "Street Beat",
    tag:      "Now Available",
    desc:     "Drumming Below Sea Level — a documentary on the New Orleans percussion tradition.",
    image:    "/images/streetbeat-poster.png",
    href:     "https://streetbeat.video",
    external: true,
    contain:  false,
  },
  {
    title:    "Lil Squiggle",
    tag:      "Coming Soon",
    desc:     "#DontDrinkAndDialDecades — reggae-dub chibi Lego campaign.",
    image:    "/images/lil-squiggle-character.png",
    href:     "https://lilsquiggle.com",
    external: true,
    contain:  true,
  },
  {
    title:    "Time of My Life — 40th",
    tag:      "Campaign",
    desc:     "Celebrating 40 years of the iconic Academy Award-winning song.",
    image:    "/images/dirty-dancing-poster.jpg",
    href:     "/projects#time-of-my-life",
    external: false,
    contain:  false,
  },
]

const GUMBEAUX_PHOTOS = [
  { file: "gumbeaux1.jpg", alt: "Gumbeaux Juice at French Quarter Fest — FreshXReckless" },
  { file: "gumbeaux2.jpg", alt: "Gumbeaux Juice — Fifth Anniversary" },
  { file: "gumbeaux3.jpg", alt: "Gumbeaux Juice — 348 Brazy, Sleazy EZ" },
  { file: "gumbeaux4.jpg", alt: "Gumbeaux Juice — Kenneth Brother, KR3WCIAL" },
  { file: "gumbeaux5.jpg", alt: "Gumbeaux Juice — 504ICYGRL, The Adoni" },
]

export default function HomePage() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO                                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Studio interior hero photo */}
        <Image
          src="/images/studio-interior.jpg"
          alt="Mid City Sound Studios interior"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay so text stays legible */}
        <div className="absolute inset-0 bg-studio-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_80%,rgba(212,175,119,0.07),transparent)]" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 border border-gold/30 rounded-sm mb-10"
            style={{ animation: "fade-up 0.6s ease-out 0.2s both" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-gold/80">
              New Orleans · Recording Studio
            </span>
          </div>

          <div
            className="flex justify-center mb-6"
            style={{ animation: "fade-up 0.7s ease-out 0.3s both" }}
          >
            <div className="relative w-[300px] sm:w-[400px] md:w-[480px] h-[210px] sm:h-[280px] md:h-[336px]">
              <Image
                src="/images/logo/mcs3-logo.png"
                alt="Mid City Sound Studios"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 300px, (max-width: 768px) 400px, 480px"
              />
            </div>
          </div>

          <p
            className="text-mist text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-10 font-light leading-relaxed"
            style={{ animation: "fade-up 0.7s ease-out 0.5s both" }}
          >
            Timeless music. Modern studio.
            <br />
            <em className="not-italic text-cream/70">Built on legacy.</em>
          </p>

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
              <Link href="/projects">Explore Projects</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/merch" className="text-mist hover:text-cream">
                Shop Merch
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-mist/40 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 2. STATS BAR                                                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-10 px-6 border-y border-studio-border bg-studio-charcoal">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-3 divide-x divide-studio-border">
            {STATS.map(({ value, label }) => (
              <div key={label} className="px-6 text-center first:pl-0 last:pr-0">
                <p className="font-display text-3xl text-gold mb-1">{value}</p>
                <p className="text-mist text-[11px] uppercase tracking-widest whitespace-pre-line leading-tight">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 3. SERVICES                                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <Badge variant="outline" className="mb-3 text-[10px] tracking-widest uppercase">
              What We Do
            </Badge>
            <h2 className="font-display text-4xl text-cream">Studio services</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {SERVICES.map(({ icon: Icon, title, body, href }) => (
              <Link
                key={title}
                href={href}
                className="group p-7 border border-studio-border bg-studio-card rounded-sm hover:border-gold/40 transition-all card-lift block"
              >
                <div className="w-10 h-10 border border-studio-border rounded-sm flex items-center justify-center mb-5 group-hover:border-gold/40 transition-colors">
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
      {/* 4. LEGACY TEASER                                                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-studio-charcoal border-y border-studio-border">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-14 items-center">

          {/* young-donny-guitar photo */}
          <div className="relative aspect-[4/5] bg-studio-dark border border-studio-border rounded-sm overflow-hidden">
            <Image
              src="/images/young-donny-guitar.JPG"
              alt="Donald Markowitz — early years"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/50" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/50" />
          </div>

          <div className="space-y-6">
            <Badge variant="outline" className="text-[10px] tracking-widest uppercase">
              The Legacy
            </Badge>
            <h2 className="font-display text-4xl md:text-5xl text-cream leading-tight">
              40+ Years of
              <br />
              <em className="text-gold-gradient not-italic">timeless craft</em>
            </h2>
            <Separator className="w-12 bg-gold/40" />
            <div className="space-y-4 text-mist text-sm leading-relaxed">
              <p>
                Donald Markowitz began his journey in New York's golden session era — crafting
                arrangements and productions for artists who would define American music. His path
                led through Hollywood to an Academy Award and a career spanning decades.
              </p>
              <p>
                Today, Donald channels all of that expertise into Mid City Sound Studios in
                New Orleans — a space where emerging artists meet real legacy.
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

          <div className="grid sm:grid-cols-3 gap-5">
            {PROJECT_CARDS.map(({ title, tag, desc, image, href, external, contain }) => (
              <Link
                key={title}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group border border-studio-border bg-studio-card rounded-sm hover:border-gold/40 transition-all card-lift overflow-hidden block"
              >
                <div className={`relative aspect-[3/4] overflow-hidden ${contain ? "bg-transparent" : "bg-studio-dark"}`}>
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className={`transition-transform duration-700 group-hover:scale-105 ${contain ? "object-contain p-4" : "object-cover"}`}
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <Badge
                    variant={tag === "Now Available" ? "default" : "secondary"}
                    className="mb-3 text-[10px]"
                  >
                    {tag}
                  </Badge>
                  <h3 className="font-display text-lg text-cream mb-1.5">{title}</h3>
                  <p className="text-mist text-xs leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 6. GUMBEAUX JUICE                                                  */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-studio-charcoal border-t border-studio-border">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14">
            <Badge variant="outline" className="mb-3 text-[10px] tracking-widest uppercase">
              French Quarter Fest
            </Badge>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <h2 className="font-display text-4xl text-cream">
                Gumbeaux Juice
              </h2>
              <a
                href="https://gumbeauxjuice.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gold/70 hover:text-gold text-xs transition-colors"
              >
                gumbeauxjuice.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-mist text-sm mt-3 max-w-md leading-relaxed">
              Our annual stage at French Quarter Festival — where New Orleans comes alive every spring.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {GUMBEAUX_PHOTOS.map(({ file, alt }, i) => (
              <div
                key={i}
                className="relative aspect-[3/4] bg-studio-dark border border-studio-border rounded-sm overflow-hidden group"
              >
                <Image
                  src={`/images/${file}`}
                  alt={alt}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 7. FINAL CTA BAND                                                  */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden border-t border-studio-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(212,175,119,0.06),transparent)]" />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="font-display text-5xl md:text-6xl text-cream mb-5">
            Ready to make
            <br />
            <span className="text-gold-gradient">something timeless?</span>
          </h2>
          <p className="text-mist mb-10 text-sm max-w-sm mx-auto">
            Studio sessions are available by appointment. Full upfront payment
            secures your date — subject to studio manager approval.
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
