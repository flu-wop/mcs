// src/app/bio/irvin-mayfield/page.tsx

import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, ArrowLeft } from "lucide-react"
import { Button, Badge } from "@flu-wop/design-system"
import { Reveal } from "@flu-wop/design-system/motion"
import { PageHeader } from "@/components/sections/PageHeader"
import { NextStep } from "@/components/sections/NextStep"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Irvin Mayfield | Mid City Sound Studios",
  description: "Grammy Award-winning trumpeter, composer, and New Orleans cultural ambassador Irvin Mayfield — resident musician at Mid City Sound Studios.",
}

export default function IrvinMayfieldBioPage() {
  return (
    <div className="bg-studio-black min-h-screen">
      <PageHeader compact eyebrow="Resident musician · Studio C" title="Irvin Mayfield"
        lede="Grammy Award-winning trumpeter · composer · New Orleans cultural ambassador">
        <Link href="/contact" className="inline-flex items-center gap-2 text-mist hover:text-gold text-xs transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to the team
        </Link>
      </PageHeader>

      <section className="py-16 md:py-24 px-6">
        <Reveal className="mx-auto max-w-3xl space-y-6">
          <Separator className="w-10 bg-gold/40" />
          <div className="space-y-5 text-mist text-base leading-relaxed">
            <p>
              Irvin Mayfield is one of New Orleans' most celebrated musicians — a Grammy
              Award-winning trumpeter, composer, bandleader, and the official Cultural
              Ambassador of the City of New Orleans and the State of Louisiana, a title
              he has held since 2003.
            </p>
            <p>
              Born and raised in New Orleans, Mayfield began his musical journey with the
              Algiers Brass Band and went on to graduate from the New Orleans Center for
              Creative Arts (NOCCA). He co-founded the Afro-Cuban jazz group Los Hombres
              Calientes in 1998, whose debut album won Billboard's Contemporary Latin Jazz
              Album of the Year in 2000.
            </p>
            <p>
              In 2002, Mayfield founded the New Orleans Jazz Orchestra (NOJO), which made
              its debut in 2003. He has performed at the White House, Carnegie Hall, and
              jazz festivals across the world, bringing the sound of New Orleans to every
              stage he has touched.
            </p>
            <p>
              At Mid City Sound Studios, Irvin occupies Studio C — his private creative
              office and workspace. His presence at the studio reflects the deep connection
              between Mid City Sound and the living tradition of New Orleans music.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <a href="https://irvinmayfield.com" target="_blank" rel="noopener noreferrer">
                Visit irvinmayfield.com<ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </Reveal>
      </section>

      <NextStep line={<>Sessions in <span className="text-gold-gradient italic">Studio C</span> are by arrangement.</>}
        href="/studio?room=C#booking-form" label="Request Studio C" />
    </div>
  )
}
