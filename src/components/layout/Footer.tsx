// src/components/layout/Footer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// LOGO USAGE IN FOOTER:
//   secondary.jpg — bridge + "MID CITY SOUND" horizontal lockup (pure black bg)
//   Matches footer bg-studio-charcoal seamlessly since both are near-black.
// ─────────────────────────────────────────────────────────────────────────────

import Link  from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Youtube, Mail, MapPin } from "lucide-react";

const FOOTER_LINKS = {
  Studio: [
    { label: "Book Time",   href: "/studio" },
    { label: "Services",    href: "/studio#services" },
    { label: "Rates",       href: "/studio#rates" },
  ],
  Explore: [
    { label: "Legacy",      href: "/legacy" },
    { label: "Projects",    href: "/projects" },
    { label: "Merch",       href: "/merch" },
    { label: "Contact",     href: "/contact" },
  ],
  Projects: [
    { label: "Lil Squiggle",         href: "https://lilsquiggle.vercel.app", external: true },
    { label: "Time of My Life",       href: "/projects#time-of-my-life" },
    { label: "Street Beat",          href: "/projects#streetbeat" },
  ],
};

const SOCIALS = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter,   href: "https://twitter.com",   label: "Twitter / X" },
  { icon: Youtube,   href: "https://youtube.com",   label: "YouTube" },
  { icon: Mail,      href: "mailto:midcitysound@gmail.com", label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-studio-border bg-studio-charcoal">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* ── Brand column ── */}
        <div className="lg:col-span-2 space-y-5">
          <Link href="/" className="block">
            {/*
              secondary.jpg: bridge + waveform + "MID CITY SOUND" wordmark.
              Pure black bg blends into footer charcoal at this size.
              Swap with a transparent PNG when available for pixel-perfect edge.
            */}
            <div className="relative w-[220px] h-[72px]">
              <Image
                src="/images/logo/secondary.jpg"
                alt="Mid City Sound Studios"
                fill
                className="object-contain object-left"
                sizes="220px"
              />
            </div>
          </Link>

          <p className="text-mist text-sm leading-relaxed max-w-xs">
            A New Orleans recording studio built on decades of award-winning
            expertise. Where legacy meets craft.
          </p>

          <div className="flex items-start gap-2 text-mist text-sm">
            <MapPin className="w-4 h-4 mt-0.5 text-gold/70 shrink-0" />
            <div>
              <p>Mid City Sound Studios</p>
              <p>New Orleans, Louisiana</p>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 border border-studio-border rounded-sm flex items-center justify-center text-mist hover:text-gold hover:border-gold transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Link columns ── */}
        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div key={section} className="space-y-4">
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-gold/80">
              {section}
            </p>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target={"external" in link && link.external ? "_blank" : undefined}
                    rel={"external" in link && link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-mist hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-studio-border/50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-mist/60 text-xs">
            © {new Date().getFullYear()} Mid City Sound Studios · New Orleans, LA
          </p>
          <p className="text-mist/40 text-xs">
            A Mid City Sound Production
          </p>
        </div>
      </div>
    </footer>
  );
}
