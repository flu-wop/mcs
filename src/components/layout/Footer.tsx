// src/components/layout/Footer.tsx

import Link  from "next/link";
import Image from "next/image";
import { Instagram, ExternalLink } from "lucide-react";

const SITE_LINKS = [
  { label: "Home",    href: "/" },
  { label: "Watch",   href: "/watch" },
  { label: "About",   href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-studio-border/50 bg-studio-charcoal">
      <div className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* ── Left: Brand + bio + Doug's Instagram only ── */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-5">
          <div>
            <p className="font-display text-2xl text-cream tracking-wide">Street Beat</p>
            <p className="font-display text-lg text-gold/70 italic font-light">Drumming Below Sea Level</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-mist/50 mt-2">
              A Mid City Sound Production
            </p>
          </div>
          <p className="text-mist text-sm leading-relaxed max-w-sm">
            A documentary film exploring the unique drum sound of New Orleans —
            produced by Mid City Sound &amp; Fire on the Bayou, hosted by Doug Belote.
          </p>
          {/* Doug Belote Instagram only */}
          <a
            href="https://www.instagram.com/dougbelote/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mist hover:text-gold transition-colors"
            aria-label="Doug Belote on Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
        </div>

        {/* ── Right: Nav + MCS + DJM blocks ── */}
        <div className="flex flex-col items-center md:items-end gap-8">

          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            {SITE_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className="text-sm text-mist hover:text-cream transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          <Link
            href="https://midcitysound.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border border-studio-border/60 rounded-sm hover:border-gold/40 transition-all group w-full md:max-w-xs"
          >
            <div className="relative w-[60px] h-[60px] shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <Image src="/images/mcs2-logo.png" alt="Mid City Sound Studios" fill className="object-contain object-center" sizes="60px" />
            </div>
            <div>
              <p className="text-cream text-xs font-medium group-hover:text-gold transition-colors">Mid City Sound Studios</p>
              <p className="text-mist/50 text-[10px] mt-0.5">The studio behind the film.</p>
              <p className="text-mist/40 text-[10px]">midcitysound.com</p>
            </div>
            <ExternalLink className="w-3 h-3 text-gold/30 ml-auto group-hover:text-gold transition-colors" />
          </Link>

          <Link
            href="https://donaldmarkowitz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border border-studio-border/40 rounded-sm hover:border-gold/30 transition-all group w-full md:max-w-xs"
          >
            <div className="w-[60px] text-center shrink-0">
              <p className="text-gold/50 font-display text-lg leading-none">DM</p>
            </div>
            <div>
              <p className="text-cream text-xs font-medium group-hover:text-gold transition-colors">Donald Markowitz</p>
              <p className="text-mist/50 text-[10px] mt-0.5">Producer · Composer · Founder</p>
              <p className="text-mist/40 text-[10px]">donaldmarkowitz.com</p>
            </div>
            <ExternalLink className="w-3 h-3 text-gold/30 ml-auto group-hover:text-gold transition-colors" />
          </Link>
        </div>
      </div>

      <div className="border-t border-studio-border/50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-mist/50 text-xs">
            © {new Date().getFullYear()} Street Beat: Drumming Below Sea Level · Mid City Sound · New Orleans, LA
          </p>
          <p className="text-mist/30 text-xs">Runtime: 54 Minutes</p>
        </div>
      </div>
    </footer>
  );
}
