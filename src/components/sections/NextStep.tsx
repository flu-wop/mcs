// A slim closing line + action, so every page ends with somewhere to go.
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@flu-wop/design-system"
import { Magnetic, Reveal } from "@flu-wop/design-system/motion"

export function NextStep({ line = "Ready when you are.", href = "/studio", label = "Book studio time", secondary }: {
  line?: React.ReactNode
  href?: string
  label?: string
  secondary?: { href: string; label: string }
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <Reveal className="flex flex-col items-start justify-between gap-8 border-t border-studio-border pt-12 md:flex-row md:items-center">
        <p className="font-display text-[clamp(2rem,4.5vw,3.6rem)] leading-[0.98] text-cream max-w-2xl">{line}</p>
        <div className="flex flex-wrap items-center gap-5 shrink-0">
          {secondary && (
            <Link href={secondary.href} className="text-sm text-mist underline decoration-mist/30 underline-offset-[6px] hover:text-cream hover:decoration-gold transition-colors">
              {secondary.label}
            </Link>
          )}
          <Magnetic strength={0.25}>
            <Button size="lg" asChild><Link href={href}>{label}<ArrowRight className="w-4 h-4" /></Link></Button>
          </Magnetic>
        </div>
      </Reveal>
    </section>
  )
}
