// src/app/contact/page.tsx
// Contact page. The form is a client component (components/contact/ContactForm)
// posting to /api/contact (Resend, rate-limited); this file is server-rendered
// so the page has its own metadata.

import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MapPin, Instagram, ArrowUpRight } from "lucide-react"
import { Reveal } from "@flu-wop/design-system/motion"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/sections/PageHeader"
import { ContactForm } from "@/components/contact/ContactForm"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Mid City Sound Studios in New Orleans — studio bookings, mixing and mastering, artist development, press and project pitches.",
  alternates: { canonical: "/contact" },
}

const ADDRESS = "530 S Norman C Francis Pkwy, New Orleans, Louisiana"
const TEAM = [
  { name: "Donald Markowitz", role: "Founder",                             href: "/legacy" },
  { name: "Flu",              role: "Studio Manager / Head of Production", href: "/book/flu" },
  { name: "Irvin Mayfield",   role: "Musician",                            href: "/bio/irvin-mayfield" },
  { name: "Knox Ketchum",     role: "Sound Engineer",                      href: "/book/knox" },
  { name: "Jesse",            role: "Studio Engineer",                     href: "/book/jesse" },
  { name: "Rodja",            role: "Studio Engineer",                     href: "/book/rodja" },
  { name: "Rich Mayfield",    role: "Studio Musician",                     href: "/book/rich" },
]

export default function ContactPage() {
  return (
    <div className="bg-studio-black min-h-screen">
      <PageHeader compact eyebrow="Get in touch" title="Let's talk"
        lede="Whether you're ready to book, have a project pitch, or just want to say hello — we read every message." />

      <section className="py-16 md:py-20 px-6">
        <div className="mx-auto max-w-6xl grid md:grid-cols-[300px_1fr] gap-14 md:gap-20">
          <Reveal as="div" className="space-y-9 order-2 md:order-1">
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <span className="w-9 h-9 border border-studio-border rounded-sm grid place-items-center shrink-0"><MapPin className="w-4 h-4 text-gold/70" /></span>
                <span>
                  <span className="block text-[10px] uppercase tracking-widest text-mist mb-0.5">Studio location</span>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(ADDRESS)}`} target="_blank" rel="noopener noreferrer"
                    className="text-cream text-sm hover:text-gold transition-colors">530 S Norman C Francis Pkwy<br />New Orleans, Louisiana</a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-9 h-9 border border-studio-border rounded-sm grid place-items-center shrink-0"><Mail className="w-4 h-4 text-gold/70" /></span>
                <span>
                  <span className="block text-[10px] uppercase tracking-widest text-mist mb-0.5">General inquiries</span>
                  <a href="mailto:midcitysound1@gmail.com" className="text-cream text-sm hover:text-gold transition-colors break-all">midcitysound1@gmail.com</a>
                </span>
              </li>
            </ul>

            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-mist">Socials</p>
              <div className="flex items-center gap-3">
                {[
                  { Icon: Instagram, href: "https://www.instagram.com/midcitysoundnola/", label: "Instagram" },
                ].map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-10 h-10 border border-studio-border rounded-sm grid place-items-center text-mist hover:text-gold hover:border-gold/40 transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <Separator className="bg-studio-border/40" />

            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-mist mb-3">The team</p>
              <ul className="divide-y divide-studio-border/40">
                {TEAM.map(({ name, role, href }) => (
                  <li key={name}>
                    <Link href={href} className="group flex items-center justify-between gap-3 py-2.5">
                      <span>
                        <span className="block text-cream text-sm font-medium group-hover:text-gold transition-colors">{name}</span>
                        <span className="block text-mist text-[11px]">{role}</span>
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-mist/40 group-hover:text-gold transition-colors shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08} as="div" className="order-1 md:order-2">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </div>
  )
}
