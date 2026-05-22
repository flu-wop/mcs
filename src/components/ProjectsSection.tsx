// src/components/ProjectsSection.tsx
// Drop into MCS src/app/page.tsx — import and render after the Streetbeat crosslink
//
// Usage in page.tsx:
//   import { ProjectsSection } from "@/components/ProjectsSection"
//   ...
//   <ProjectsSection />

import Link  from "next/link"
import Image from "next/image"
import { Film, Music2, ArrowRight } from "lucide-react"
import { Badge }     from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button }    from "@/components/ui/button"

export function ProjectsSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 bg-studio-black border-t border-studio-border/40">
      <div className="mx-auto max-w-6xl">

        <div className="mb-14">
          <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">
            Projects
          </Badge>
          <h2 className="font-display text-4xl md:text-5xl text-cream leading-tight">
            Beyond the Studio
          </h2>
          <p className="text-mist text-sm max-w-md leading-relaxed mt-4">
            Mid City Sound doesn&apos;t just record music — it produces it, films it, and
            brings it to the streets of New Orleans.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* ── Streetbeat ── */}
          <div className="group border border-studio-border rounded-sm overflow-hidden bg-studio-card flex flex-col">
            <div className="relative h-80 overflow-hidden">
              <Image
                src="/images/movie-poster.png"
                alt="Street Beat: Drumming Below Sea Level"
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-studio-black/80 via-transparent to-transparent" />
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-1.5 bg-studio-black/70 backdrop-blur-sm border border-studio-border px-3 py-1.5 rounded-sm">
                  <Film className="w-3 h-3 text-gold" />
                  <span className="text-[10px] tracking-widest uppercase text-cream">Documentary Film</span>
                </div>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-2">2025</p>
              <h3 className="font-display text-2xl text-cream leading-tight mb-3">
                Street Beat:<br />
                <span className="text-gold-gradient italic">Drumming Below Sea Level</span>
              </h3>
              <Separator className="w-10 bg-gold/40 mb-4" />
              <p className="text-mist text-sm leading-relaxed flex-1">
                A 54-minute documentary exploring the New Orleans drum sound — produced
                by Mid City Sound, Fire on the Bayou, and Doreja Productions, and hosted
                by Doug Belote.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <a href="https://streetbeat.video" target="_blank" rel="noopener noreferrer">
                    Watch the Film
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="https://donaldmarkowitz.com/credits">
                    Credits
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* ── Gumbeaux Juice ── */}
          <div className="group border border-studio-border rounded-sm overflow-hidden bg-studio-card flex flex-col">
            <div className="relative h-80 overflow-hidden">
              <Image
                src="/images/gumbeaux1.jpeg"
                alt="Gumbeaux Juice — French Quarter Festival"
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-studio-black/80 via-transparent to-transparent" />
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-1.5 bg-studio-black/70 backdrop-blur-sm border border-studio-border px-3 py-1.5 rounded-sm">
                  <Music2 className="w-3 h-3 text-gold" />
                  <span className="text-[10px] tracking-widest uppercase text-cream">Annual Event</span>
                </div>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-gold text-[10px] tracking-[0.25em] uppercase mb-2">French Quarter Fest · Annual</p>
              <h3 className="font-display text-2xl text-cream leading-tight mb-3">
                Gumbeaux Juice
              </h3>
              <Separator className="w-10 bg-gold/40 mb-4" />
              <p className="text-mist text-sm leading-relaxed flex-1">
                Donald Markowitz&apos;s annual French Quarter Festival showcase — a celebration
                of New Orleans&apos; emerging artists on the Jack Daniel&apos;s Stage at the
                Audubon Aquarium Plaza. Past performers include FreshXReckless, ODD The
                Artist, and La Reezy, with sounds by DJ PJ.
              </p>
              <div className="mt-6">
                <p className="text-mist/50 text-[10px] uppercase tracking-widest">
                  Presented in partnership with French Quarter Festival
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
