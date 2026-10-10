// src/app/not-found.tsx
// 404 — on brand, with somewhere useful to go next.
import Link from "next/link"
import { Button } from "@flu-wop/design-system"

const LINKS = [
  { href: "/studio", label: "Book the studio" },
  { href: "/legacy", label: "The legacy" },
  { href: "/projects", label: "Projects" },
  { href: "/merch", label: "Merch" },
]

export default function NotFound() {
  return (
    <div className="relative min-h-[100svh] bg-studio-black flex items-center justify-center px-6 overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(212,175,119,0.08),transparent)]" />
      <div className="relative text-center max-w-lg">
        <p className="font-display text-[clamp(7rem,28vw,14rem)] leading-none text-gold-gradient font-light select-none">404</p>
        <h1 className="font-display text-3xl md:text-4xl text-cream -mt-2">This track skipped</h1>
        <p className="text-mist text-sm mt-4">The page you&apos;re after doesn&apos;t exist — but the music does.</p>
        <div className="flex flex-wrap gap-3 justify-center mt-9">
          <Button asChild><Link href="/">Back home</Link></Button>
          <Button variant="outline" asChild><Link href="/studio#booking-form">Book a session</Link></Button>
        </div>
        <ul className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-mist">
          {LINKS.map(l => <li key={l.href}><Link href={l.href} className="hover:text-gold underline-offset-4 hover:underline">{l.label}</Link></li>)}
        </ul>
      </div>
    </div>
  )
}
