// src/app/projects/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS PAGE  (route: /projects)
//
// Projects:

//   2. Lil Squiggle       — links to lilsquiggle.com + merch
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
import { Button }    from "@/components/ui/button"
import { Badge }     from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title:       "Projects",
  description: "Current and active projects from Mid City Sound Studios — Lil Squiggle, the Time of My Life anniversary campaign, and the Street Beat documentary.",
}

/* ─── Project data ────────────────────────────────────────────────────────── */
const PROJECTS = [
  /* ── 1. Street Beat Documentary — first as requested ── */
  {
    id:      "streetbeat",
    tag:     "Now Available",
    tagVariant: "default" as const,
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
    tagVariant: "secondary" as const,
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
      "Merch via Printify",
      "TikTok & YouTube campaign",
    ],
    cta:    { label: "Visit Site", href: "https://lilsquiggle.com", external: true },
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

      {/* ── Page header ── */}
      <section className="py-20 px-6 bg-studio-charcoal border-b border-studio-border overflow-hidden">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-0 items-center">

          {/* Left: text */}
          <div className="relative z-10 py-4">
            <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
              Active Projects
            </Badge>
            <h1 className="font-display text-5xl md:text-6xl text-cream mb-4">
              What we're
              <br />
              <span className="text-gold-gradient italic">building</span>
            </h1>
            <p className="text-mist text-sm max-w-md leading-relaxed">
              From street-level campaigns to Hollywood anniversary projects — Mid City Sound
              is always creating. Here's what's in the works.
            </p>
          </div>

          {/* Right: Donny photo fading left toward awards */}
          <div className="relative h-[340px] hidden md:block">
            <Image
              src="/images/donny-hero.jpg"
              alt="Donald Markowitz"
              fill
              className="object-cover object-center"
              sizes="50vw"
              priority
            />
            {/* Fade from left (awards side) to transparent on the right */}
            <div className="absolute inset-0 bg-gradient-to-r from-studio-charcoal via-studio-charcoal/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Project cards ── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-5xl space-y-10">
          {PROJECTS.map(({
            id, tag, tagVariant, icon: Icon, title, subtitle,
            color, accent, image, body, features, cta, ctaAlt,
            handles,
          }) => (
            <div
              key={id}
              id={id}
              className={`rounded-sm border border-studio-border overflow-hidden bg-gradient-to-br ${color}`}
            >
              <div className="p-8 md:p-10 grid md:grid-cols-[220px_1fr] gap-8 items-start">

                {/* ── Left: poster image ── */}
                <div className="relative aspect-[2/3] rounded-sm overflow-hidden border self-start hidden md:block" style={{ borderColor: `${accent}25` }}>
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className={id === "lil-squiggle" ? "object-contain p-2" : "object-cover object-top"}
                    sizes="220px"
                  />
                </div>

                {/* ── Right: content ── */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={tagVariant} className="text-[10px] tracking-wider">
                      {tag}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-sm border flex items-center justify-center shrink-0"
                      style={{ borderColor: `${accent}40` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: accent }} />
                    </div>
                    <div>
                      <h2 className="font-display text-3xl text-cream">{title}</h2>
                      <p className="text-mist text-sm">{subtitle}</p>
                    </div>
                  </div>

                  <Separator className="bg-studio-border" />

                  {body.map((para, i) => (
                    <p key={i} className="text-mist text-sm leading-relaxed">{para}</p>
                  ))}

                  {handles && (
                    <div className="space-y-1">
                      {handles.map((h) => (
                        <p key={h} className="text-[11px] font-mono" style={{ color: accent }}>
                          {h}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap pt-2">
                    <Button
                      variant="outline"
                      style={{ borderColor: `${accent}60`, color: accent }}
                      className="hover:opacity-80"
                      asChild
                    >
                      <Link
                        href={cta.href}
                        target={"external" in cta && cta.external ? "_blank" : undefined}
                        rel="noopener noreferrer"
                      >
                        {cta.label}
                        {"external" in cta && cta.external && <ExternalLink className="w-3.5 h-3.5" />}
                        {!("external" in cta && cta.external) && <ArrowRight className="w-3.5 h-3.5" />}
                      </Link>
                    </Button>

                    {ctaAlt && (
                      <Button variant="ghost" className="text-mist hover:text-cream" asChild>
                        <Link
                          href={ctaAlt.href}
                          target={"external" in ctaAlt ? "_blank" : undefined}
                          rel="noopener noreferrer"
                        >
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
          ))}
        </div>
      </section>

      {/* ── Pitch CTA ── */}
      <section className="py-20 px-6 border-t border-studio-border">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl text-cream mb-4">
            Have a project in mind?
          </h2>
          <p className="text-mist text-sm mb-8">
            We're selective about what we take on — but we love a good pitch.
            Reach out and let's see if we're the right fit.
          </p>
          <Button asChild>
            <Link href="/contact">
              Get in Touch
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
