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
import { Mic2, Headphones, Award, ArrowRight, ExternalLink } from "lucide-react"
import { Button, Badge } from "@flu-wop/design-system"
import { Reveal, Parallax, CountUp } from "@flu-wop/design-system/motion"
import { Separator }  from "@/components/ui/separator"
import { HomeHero } from "@/components/home/HomeHero"
import { SectionIntro } from "@/components/sections/SectionIntro"
import { NextStep } from "@/components/sections/NextStep"

export const metadata: Metadata = {
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
    href:  "/studio#rates",
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
    href:     "https://lilsquiggle.vercel.app",
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
      <HomeHero />

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section className="py-10 md:py-12 px-6 border-y border-studio-border bg-studio-charcoal">
        <div className="mx-auto max-w-4xl grid grid-cols-3 divide-x divide-studio-border">
          {STATS.map(({ value, label }, i) => (
            <Reveal key={label} delay={i * 0.08} className="px-3 sm:px-6 text-center">
              <p className="font-display text-3xl sm:text-4xl text-gold mb-1.5 tabular-nums"><CountUp value={value} /></p>
              <p className="text-mist text-[10px] sm:text-[11px] uppercase tracking-widest whitespace-pre-line leading-tight">{label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <div className="mx-auto max-w-6xl">
          <SectionIntro eyebrow="What we do" title="Studio services" />
          <div className="grid md:grid-cols-3 gap-5">
            {SERVICES.map(({ icon: Icon, title, body, href }, i) => (
              <Reveal key={title} delay={i * 0.08} className="h-full">
                <Link href={href}
                  className="group relative h-full p-7 border border-studio-border bg-studio-card rounded-sm hover:border-gold/40 transition-colors card-lift flex flex-col overflow-hidden">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                  <span className="w-11 h-11 border border-studio-border rounded-sm grid place-items-center mb-6 group-hover:border-gold/40 transition-colors">
                    <Icon className="w-5 h-5 text-gold/70 group-hover:text-gold transition-colors" />
                  </span>
                  <h3 className="font-display text-2xl text-cream mb-2">{title}</h3>
                  <p className="text-mist text-sm leading-relaxed flex-1">{body}</p>
                  <span className="flex items-center gap-1.5 mt-6 text-gold/70 text-xs group-hover:text-gold transition-colors">
                    Learn more<ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Legacy ────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-studio-charcoal border-y border-studio-border overflow-hidden">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <Reveal>
            <div className="relative aspect-[4/5] bg-studio-dark border border-studio-border rounded-sm overflow-hidden">
              <Parallax speed={-0.15} className="absolute inset-0 -top-[10%] h-[120%]">
                <Image src="/images/young-donny-guitar.JPG" alt="Donald Markowitz in his early years, with guitar" fill
                  className="object-cover object-top" sizes="(max-width: 768px) 100vw, 50vw" />
              </Parallax>
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-studio-black/50 to-transparent" />
              <div aria-hidden className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/50" />
              <div aria-hidden className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/50" />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="space-y-6">
            <Badge variant="outline" className="text-[10px] tracking-widest uppercase">The Legacy</Badge>
            <h2 className="font-display text-4xl md:text-6xl text-cream leading-[1.02]">
              40+ years of<br /><em className="text-gold-gradient not-italic">timeless craft</em>
            </h2>
            <Separator className="w-12 bg-gold/40" />
            <div className="space-y-4 text-mist text-sm md:text-base leading-relaxed max-w-lg">
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
              <Link href="/legacy">Full story<ArrowRight className="w-3.5 h-3.5" /></Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ── Projects ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <div className="mx-auto max-w-6xl">
          <SectionIntro eyebrow="Active projects" title="What we're building"
            aside={<Button variant="ghost" asChild><Link href="/projects" className="text-mist hover:text-gold">All projects <ArrowRight className="w-3.5 h-3.5" /></Link></Button>} />
          <div className="grid sm:grid-cols-3 gap-5">
            {PROJECT_CARDS.map(({ title, tag, desc, image, href, external, contain }, i) => (
              <Reveal key={title} delay={i * 0.08} className="h-full">
                <Link href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
                  className="group h-full border border-studio-border bg-studio-card rounded-sm hover:border-gold/40 transition-colors card-lift overflow-hidden flex flex-col">
                  <div className={`relative aspect-[3/4] overflow-hidden ${contain ? "bg-studio-charcoal" : "bg-studio-dark"}`}>
                    <Image src={image} alt={title} fill sizes="(max-width: 640px) 100vw, 33vw"
                      className={`transition-transform duration-[1.2s] ease-out group-hover:scale-105 ${contain ? "object-contain p-6" : "object-cover"}`} />
                    {external && (
                      <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-studio-black/70 backdrop-blur grid place-items-center text-cream/80 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1">
                    <Badge variant={tag === "Now Available" ? "gold" : "neutral"} className="mb-3 text-[10px]">{tag}</Badge>
                    <h3 className="font-display text-xl text-cream mb-1.5">{title}</h3>
                    <p className="text-mist text-xs leading-relaxed">{desc}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gumbeaux Juice ────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-studio-charcoal border-t border-studio-border">
        <div className="mx-auto max-w-6xl px-6">
          <SectionIntro eyebrow="French Quarter Fest" title="Gumbeaux Juice"
            lede="Our annual stage at French Quarter Festival — where New Orleans comes alive every spring."
            aside={
              <a href="https://gumbeauxjuice.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-gold/70 hover:text-gold text-xs transition-colors">
                gumbeauxjuice.com<ExternalLink className="w-3 h-3" />
              </a>
            } />
        </div>
        {/* Phones: a swipeable strip. Desktop: a five-up row. */}
        <div className="mx-auto max-w-6xl md:px-6">
          <ul className="flex md:grid md:grid-cols-5 gap-4 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory px-6 md:px-0 pb-2 no-scrollbar" data-lenis-prevent-horizontal>
            {GUMBEAUX_PHOTOS.map(({ file, alt }, i) => (
              <Reveal as="li" key={file} delay={i * 0.06} className="snap-start shrink-0 w-[62vw] sm:w-[40vw] md:w-auto">
                <div className="group relative aspect-[3/4] bg-studio-dark border border-studio-border rounded-sm overflow-hidden">
                  <Image src={`/images/${file}`} alt={alt} fill sizes="(max-width: 768px) 62vw, 20vw"
                    className="object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <NextStep line={<>Ready to make <span className="text-gold-gradient italic">something timeless?</span></>}
        href="/studio#booking-form" label="Book your session" secondary={{ href: "/contact", label: "Ask a question first" }} />
      <p className="mx-auto max-w-6xl px-6 -mt-14 md:-mt-20 pb-20 text-mist/60 text-xs">
        Sessions by appointment. Full payment secures your date, subject to studio manager approval.
      </p>
    </>
  )
}
