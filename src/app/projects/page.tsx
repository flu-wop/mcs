// src/app/projects/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS PAGE  (route: /projects)
//
// Projects:

//   2. Lil Squiggle       — links to lilsquiggle.vercel.app + merch
//   3. Time of My Life 40th — Dirty Dancing 40th anniversary campaign
//   4. Street Beat Documentary — Now Available
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata }  from "next"
import Link               from "next/link"
import Image              from "next/image"
import {
  Music, ExternalLink,
  ArrowRight, Mic2, ShoppingBag, Tv,
} from "lucide-react"
import { Button, Badge } from "@flu-wop/design-system"
import { Reveal, Parallax } from "@flu-wop/design-system/motion"
import { Separator } from "@/components/ui/separator"
import { NextStep } from "@/components/sections/NextStep"

export const metadata: Metadata = {
  alternates:  { canonical: "/projects" },
  title:       "Projects",
  description: "Current and active projects from Mid City Sound Studios — Lil Squiggle, the Time of My Life anniversary campaign, and the Street Beat documentary.",
}

/* ─── Project data ────────────────────────────────────────────────────────── */
const PROJECTS = [
  /* ── 1. Street Beat Documentary — first as requested ── */
  {
    id:      "streetbeat",
    tag:     "Now Available",
    tagVariant: "gold" as const,
    icon:    Mic2,
    title:   "Street Beat",
    subtitle:"Drumming Below Sea Level — Now Available",
    color:   "from-[#0a0a1a] to-[#111]",
    accent:  "#B5D4F4",
    image:   "/images/streetbeat-poster.png",
    body: [
      "A documentary film exploring the unique drum sound of New Orleans. Produced by Mid City Sound & Fire on the Bayou, hosted by Doug Belote.",
      "53 minutes. Now available to watch online.",
    ],
    features: [
      "53-minute documentary film",
      "New Orleans drumming culture",
      "Mid City Sound production",
      "Available to stream now",
    ],
    cta:    { label: "Watch Now", href: "https://streetbeat.video", external: true },
    ctaAlt: null,
  },

  /* ── 2. Lil Squiggle ── */
  {
    id:      "lil-squiggle",
    tag:     "Coming Soon",
    tagVariant: "neutral" as const,
    icon:    Music,
    title:   "Lil Squiggle",
    subtitle:"#DontDrinkAndDialDecades",
    color:   "from-[#0a1a10] to-[#111]",
    accent:  "#1D9E75",
    image:   "/images/lil-squiggle-character.png",
    body: [
      "#DontDrinkAndDialDecades is a reggae-dub chibi Lego creative campaign centered on the character Lil Squiggle — one call, every era, same regret.",
      "The campaign spans music, merch, TikTok, and beyond. Written by Russ Kunkel and Donald Markowitz, produced at Mid City Sound Studios.",
    ],
    features: [
      "Original reggae-dub music",
      "Chibi Lego character universe",
      "Official merch",
      "TikTok & YouTube campaign",
    ],
    cta:    { label: "Visit Site", href: "https://lilsquiggle.vercel.app", external: true },
    ctaAlt: { label: "Shop Merch", href: "/merch/brand/squiggle" },
    handles: ["@lilsquigglemon (TikTok, YouTube, X)", "@lil.squiggle (Instagram)"],
  },

  /* ── 3. Time of My Life — Anniversary ── */
  {
    id:      "time-of-my-life",
    tag:     "Campaign",
    tagVariant: "outline" as const,
    icon:    Tv,
    title:   "Time of My Life — Anniversary",
    subtitle:"Celebrating an Academy Award-Winning Song",
    color:   "from-[#1a0a0a] to-[#111]",
    accent:  "#D85A30",
    image:   "/images/dirty-dancing-poster.jpg",
    body: [
      "The Academy Award-winning song \"(I've Had) The Time of My Life\" — co-written by Donald Markowitz — remains one of the most iconic film songs ever recorded. This campaign brings that legacy back into the cultural conversation.",
      "Details and release timeline to be announced.",
    ],
    features: [
      "Anniversary campaign materials",
      "Original recording stories",
      "Behind-the-scenes production story",
      "Anniversary edition content",
    ],
    cta:    { label: "Learn More", href: "/contact?ref=toml" },
    ctaAlt: null,
  },
]

/* ─────────────────────────────────────────────────────────────────────────── */
export default function ProjectsPage() {
  return (
    <div className="pt-16 min-h-screen bg-studio-black">

      {/* ── Header ── */}
      <section className="relative bg-studio-charcoal border-b border-studio-border overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full md:w-1/2">
          <Parallax speed={0.2} className="absolute inset-0 -top-[10%] h-[120%]">
            <Image src="/images/donny-hero.jpg" alt="" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-center opacity-40 md:opacity-100" />
          </Parallax>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-studio-charcoal via-studio-charcoal/60 md:via-studio-charcoal/40 to-transparent" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-studio-charcoal via-transparent to-transparent md:hidden" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="max-w-xl">
            <p className="mb-6 flex items-center gap-3 text-[11px] tracking-[0.25em] uppercase text-gold/80">
              <span className="inline-block h-px w-10 bg-gold/60" />Active projects
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-cream mb-6 font-light leading-[0.95]">
              What we&apos;re<br /><span className="text-gold-gradient italic">building</span>
            </h1>
            <p className="text-mist text-sm md:text-base max-w-md leading-relaxed">
              From street-level campaigns to Hollywood anniversary projects — Mid City Sound
              is always creating. Here&apos;s what&apos;s in the works.
            </p>
          </Reveal>
          {/* Chapter list */}
          <Reveal delay={0.15} as="div" className="mt-10">
            <ol className="flex flex-wrap gap-x-6 gap-y-2">
              {PROJECTS.map(({ id, title }, i) => (
                <li key={id}>
                  <a href={`#${id}`} className="group inline-flex items-baseline gap-2 text-sm text-mist hover:text-cream transition-colors">
                    <span className="font-mono text-[10px] text-gold/60">{String(i + 1).padStart(2, "0")}</span>
                    <span className="border-b border-transparent group-hover:border-gold/60 transition-colors">{title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ── Projects ── */}
      <section className="py-16 md:py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-8 md:space-y-12">
          {PROJECTS.map(({
            id, tag, tagVariant, icon: Icon, title, subtitle,
            color, accent, image, body, features, cta, ctaAlt,
            handles,
          }, idx) => (
            <Reveal as="article" key={id}>
              <div id={id} className={`scroll-mt-24 rounded-sm border border-studio-border overflow-hidden bg-gradient-to-br ${color} transition-colors hover:border-studio-border/90`}>
                {/* Phones: poster as a banner across the top */}
                <div className="relative aspect-[16/9] md:hidden border-b" style={{ borderColor: `${accent}25` }}>
                  <Image src={image} alt={title} fill sizes="100vw"
                    className={id === "lil-squiggle" ? "object-contain p-4" : "object-cover object-top"} />
                </div>
                <div className="p-6 sm:p-8 md:p-10 grid md:grid-cols-[220px_1fr] gap-8 items-start">
                  <div className="relative aspect-[2/3] rounded-sm overflow-hidden border self-start hidden md:block group" style={{ borderColor: `${accent}25` }}>
                    <Image src={image} alt={title} fill sizes="220px"
                      className={`transition-transform duration-[1.2s] ease-out group-hover:scale-105 ${id === "lil-squiggle" ? "object-contain p-2" : "object-cover object-top"}`} />
                  </div>

                  <div className="space-y-5 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant={tagVariant} className="text-[10px] tracking-wider">{tag}</Badge>
                      <span className="font-mono text-[10px] text-mist/40">{String(idx + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}</span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-sm border grid place-items-center shrink-0" style={{ borderColor: `${accent}40` }}>
                        <Icon className="w-5 h-5" style={{ color: accent }} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display text-3xl md:text-4xl text-cream leading-tight">{title}</h2>
                        <p className="text-mist text-sm">{subtitle}</p>
                      </div>
                    </div>

                    <Separator className="bg-studio-border" />

                    {body.map((para, i) => (
                      <p key={i} className="text-mist text-sm leading-relaxed">{para}</p>
                    ))}

                    {features && features.length > 0 && (
                      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                        {features.map((f: string) => (
                          <li key={f} className="flex items-start gap-2.5 text-xs text-cream/80">
                            <span className="w-1.5 h-1.5 mt-1.5 rounded-full shrink-0" style={{ background: accent, opacity: 0.6 }} />{f}
                          </li>
                        ))}
                      </ul>
                    )}

                    {handles && (
                      <div className="space-y-1">
                        {handles.map((h) => (
                          <p key={h} className="text-[11px] font-mono" style={{ color: accent }}>{h}</p>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3 flex-wrap pt-2">
                      <Button variant="outline" style={{ borderColor: `${accent}60`, color: accent }} className="hover:opacity-80" asChild>
                        <Link href={cta.href}
                          target={"external" in cta && cta.external ? "_blank" : undefined}
                          rel={"external" in cta && cta.external ? "noopener noreferrer" : undefined}>
                          {cta.label}
                          {"external" in cta && cta.external ? <ExternalLink className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </Link>
                      </Button>
                      {ctaAlt && (
                        <Button variant="ghost" className="text-mist hover:text-cream" asChild>
                          <Link href={ctaAlt.href}
                            target={"external" in ctaAlt ? "_blank" : undefined}
                            rel={"external" in ctaAlt ? "noopener noreferrer" : undefined}>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            {ctaAlt.label}
                            {"external" in ctaAlt && <ExternalLink className="w-3 h-3" />}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <NextStep line="Have a project in mind?" href="/contact" label="Get in touch"
        secondary={{ href: "/studio", label: "Or book studio time" }} />
      <p className="mx-auto max-w-6xl px-6 -mt-14 md:-mt-20 pb-20 text-mist/60 text-xs">
        We&apos;re selective about what we take on — but we love a good pitch.
      </p>
    </div>
  )
}
