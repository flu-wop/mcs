import Link  from "next/link";
import { Instagram, Twitter, Youtube, Mail, ExternalLink } from "lucide-react";
import { BuiltBySignature } from "./BuiltBySignature";

const SITE_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Studio",   href: "/studio" },
  { label: "Legacy",   href: "/legacy" },
  { label: "Projects", href: "/projects" },
  { label: "Merch",    href: "/merch" },
  { label: "Contact",  href: "/contact" },
];

const SOCIALS = [
  { icon: Instagram, href: "https://www.instagram.com/midcitysoundnola/", label: "Instagram" },
  { icon: Twitter,   href: "https://twitter.com",                          label: "Twitter / X" },
  { icon: Youtube,   href: "https://youtube.com",                           label: "YouTube" },
  { icon: Mail,      href: "mailto:midcitysound1@gmail.com",                label: "Email" },
];

const ECOSYSTEM = [
  { label: "Donald Markowitz", sub: "Composer · Producer · Legend", href: "https://donaldmarkowitz.com" },
  { label: "Street Beat",      sub: "Documentary Film · 2025",       href: "https://streetbeat.video" },
  { label: "Lil Squiggle",     sub: "Reggae-Dub · Merch Campaign",   href: "https://lilsquiggle.vercel.app" },
];

export function Footer() {
  return (
    <footer className="border-t border-studio-border/50 bg-studio-charcoal">

      {/* ── 2-col on desktop, stacked centered on mobile ── */}
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* ── Left: Brand + address + socials ── */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-5">

          <Link href="/" className="group">
            <span className="font-display text-2xl tracking-wide text-cream group-hover:text-gold transition-colors duration-200">
              Mid City Sound
            </span>
          </Link>

          <p className="text-mist text-sm leading-relaxed max-w-sm">
            A New Orleans recording studio built on decades of award-winning
            expertise. Where legacy meets craft.
          </p>

          <div className="text-mist text-sm space-y-0.5">
            <p className="text-cream text-xs font-medium">Mid City Sound Studios</p>
            <p>530 S Norman C Francis Pkwy</p>
            <p>New Orleans, Louisiana</p>
            <a href="mailto:midcitysound1@gmail.com" className="text-gold/70 hover:text-gold transition-colors text-xs">
              midcitysound1@gmail.com
            </a>
          </div>

          <div className="flex gap-3">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={label}
                className="w-8 h-8 border border-studio-border rounded-sm flex items-center justify-center text-mist hover:text-gold hover:border-gold transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Right: Nav links + Ecosystem cards ── */}
        <div className="flex flex-col items-center md:items-end gap-8">

          {/* Nav links — horizontal wrap */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2">
            {SITE_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className="text-sm text-mist hover:text-cream transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          {/* Ecosystem cards */}
          <div className="w-full md:max-w-xs space-y-2">
            <p className="text-[10px] tracking-widest uppercase text-gold/60 text-center md:text-right mb-3">
              Ecosystem
            </p>
            {ECOSYSTEM.map(({ label, sub, href }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-studio-border/50 rounded-sm hover:border-gold/40 group transition-all duration-200"
              >
                <div>
                  <p className="text-cream text-xs font-medium group-hover:text-gold transition-colors">{label}</p>
                  <p className="text-mist/40 text-[10px]">{sub}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-gold/30 group-hover:text-gold transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-studio-border/50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-mist/50 text-xs">© {new Date().getFullYear()} Mid City Sound Studios · New Orleans, LA</p>
          <p className="text-mist/30 text-xs">A Mid City Sound Production</p>
        </div>
      </div>

      <BuiltBySignature />
    </footer>
  );
}
