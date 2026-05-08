// src/app/projects/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS PAGE  (route: /projects)
//
// Projects:
//   1. Streetbeats        — new landing page (coming soon)
//   2. Lil Squiggle       — links to lilsquiggle.vercel.app + merch
//   3. Time of My Life 40th — Dirty Dancing 40th anniversary campaign
//   4. Street Beat Documentary — Now Available
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata }  from "next"
import Link               from "next/link"
import {
  Music, Headphones, ExternalLink,
  ArrowRight, Mic2, ShoppingBag, Tv,
} from "lucide-react"
import { Button }    from "@/components/ui/button"
import { Badge }     from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title:       "Projects",
  description: "Current and recent projects from Mid City Sound Studios — Streetbeats, Lil Squiggle, Street Beat documentary, and the Time of My Life anniversary campaign.",
}

/* ─── Project data ────────────────────────────────────────────────────────── */
const PROJECTS = [
  /* ── 1. Streetbeats ── */
  {
    id:      "streetbeats",
    tag:     "Coming Soon",
    tagVariant: "secondary" as const,
    icon:    Headphones,
    title:   "Streetbeats",
    subtitle:"A New Orleans Beatmaking Platform",
    color:   "from-[#1a1a0a] to-[#111]",
    accent:  "#D4AF77",
    body: [
      "Streetbeats is the next creative frontier from Mid City Sound — a platform rooted in New Orleans street culture, designed for producers, beatmakers, and listeners who live and breathe the city's sonic identity.",
      "Launching soon. Get on the list.",
    ],
    features: [
      "Beat licensing & distribution",
      "New Orleans producer spotlight",
      "Sample packs rooted in NOLA culture",
      "Collaboration tools",
    ],
    cta:      { label: "Get Notified", href: "/contact?ref=streetbeats" },
    ctaAlt:   null,
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
    body: [
      "#DontDrinkAndDialDecades is a reggae-dub chibi Lego creative campaign centered on the character Lil Squiggle — one call, every era, same regret.",
      "The campaign spans music, merch, TikTok, and beyond. Original track by Pat Smith, produced at Mid City Sound Studios.",
    ],
    features: [
      "Original reggae-dub music",
      "Chibi Lego character universe",
      "Merch via Printful/Printify",
      "TikTok & YouTube campaign",
    ],
    cta:    { label: "Visit Site", href: "https://lilsquiggle.vercel.app", external: true },
    ctaAlt: { label: "Shop Merch", href: "https://store.lilsquiggle.com", external: true },
    handles: ["@lilsquigglemon (TikTok, YouTube, X)", "@lil.squiggle (Instagram)"],
  },

  /* ── 3. Time of My Life 40th ── */
  {
    id:      "toml",
    tag:     "Campaign",
    tagVariant: "outline" as const,
    icon:    Tv,
    title:   "Time of My Life — Anniversary",
    subtitle:"Celebrating an Academy Award-Winning Song",
    color:   "from-[#1a0a0a] to-[#111]",
    accent:  "#D85A30",
    body: [
      "The Academy Award-winning song \"(I've Had) The Time of My Life\" — produced by Donald Markowitz — remains one of the most iconic film songs ever recorded. This campaign brings that legacy back into the cultural conversation.",
      "Details and release timeline to be announced.",
    ],
    features: [
      "40th anniversary campaign materials",
      "Original recording stories",
      "Behind-the-scenes production story",
      "Anniversary edition content",
    ],
    cta:    { label: "Learn More", href: "/contact?ref=toml" },
    ctaAlt: null,
  },

  /* ── 4. Street Beat Documentary ── */
  {
    id:      "streetbeat",
    tag:     "Now Available",
    tagVariant: "default" as const,
    icon:    Mic2,
    title:   "Street Beat",
    subtitle:"Drumming Below Sea Level — Now Available",
    color:   "from-[#0a0a1a] to-[#111]",
    accent:  "#B5D4F4",
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
]

/* ─────────────────────────────────────────────────────────────────────────── */
export default function ProjectsPage() {
  return (
    <div className="pt-16 min-h-screen bg-studio-black">

      {/* ── Page header ── */}
      <section className="py-20 px-6 bg-studio-charcoal border-b border-studio-border">
        <div className="mx-auto max-w-5xl">
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
      </section>

      {/* ── Project cards ── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-5xl space-y-10">
          {PROJECTS.map(({
            id, tag, tagVariant, icon: Icon, title, subtitle,
            color, accent, body, features, cta, ctaAlt,
            handles,
          }) => (
            <div
              key={id}
              id={id}
              className={`rounded-sm border border-studio-border overflow-hidden bg-gradient-to-br ${color}`}
            >
              <div className="p-8 md:p-10 grid md:grid-cols-[1fr_280px] gap-8">

                {/* ── Left: content ── */}
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

                  {/* Social handles for Lil Squiggle */}
                  {handles && (
                    <div className="space-y-1">
                      {handles.map((h) => (
                        <p key={h} className="text-[11px] font-mono" style={{ color: accent }}>
                          {h}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* CTAs */}
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

                {/* ── Right: features list ── */}
                <div className="border border-studio-border/60 rounded-sm p-5 space-y-3 self-start">
                  <p
                    className="text-[10px] tracking-[0.15em] uppercase font-medium"
                    style={{ color: `${accent}80` }}
                  >
                    Highlights
                  </p>
                  <ul className="space-y-2.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-mist">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                          style={{ backgroundColor: `${accent}70` }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
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
