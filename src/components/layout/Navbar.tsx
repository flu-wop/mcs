// src/components/layout/Navbar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// LOGO USAGE IN NAVBAR:
//   Desktop: primary.jpg  (crescent + waveform + "MID CITY SOUND") — horizontal lockup
//   Mobile drawer: stacked-bridge.jpg (bridge + MCS + MID CITY SOUND) — stacked lockup
//   Fallback text wordmark stays visible on tiny screens as backup
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import Link            from "next/link";
import Image           from "next/image";
import { usePathname } from "next/navigation";
import { useState }    from "react";
import { Menu, X }     from "lucide-react";

const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Studio",   href: "/studio" },
  { label: "Legacy",   href: "/legacy" },
  { label: "Projects", href: "/projects" },
  { label: "Merch",    href: "/merch" },
  { label: "Contact",  href: "/contact" },
] as const;

export function Navbar() {
  const pathname        = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-studio-border/60 bg-studio-black/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16">

        {/* ── Logo: primary.jpg — crescent+waveform horizontal lockup ── */}
        <Link
          href="/"
          className="flex items-center shrink-0 group"
          onClick={() => setOpen(false)}
        >
          {/*
            primary.jpg has a dark charcoal bg — blends into nav bg-studio-black/95.
            Width/height ratio of primary.jpg is roughly 3.5:1 (wide landscape).
            At h-9 (36px) the logo renders cleanly at desktop nav scale.
          */}
          <div className="relative h-9 w-[126px]">
            <Image
              src="/images/logo/primary.jpg"
              alt="Mid City Sound Studios"
              fill
              className="object-contain object-left"
              priority
              sizes="126px"
            />
          </div>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "relative text-[13px] font-sans font-medium tracking-wide transition-colors",
                  "after:absolute after:bottom-[-3px] after:left-0 after:h-px after:bg-gold",
                  "after:transition-all after:duration-300",
                  isActive
                    ? "text-gold after:w-full"
                    : "text-mist hover:text-cream after:w-0 hover:after:w-full",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/studio"
            className="ml-2 px-4 py-1.5 text-[11px] font-medium tracking-widest uppercase border border-gold text-gold hover:bg-gold hover:text-studio-black transition-all duration-200 rounded-sm"
          >
            Book Now
          </Link>
        </nav>

        {/* ── Mobile Hamburger ── */}
        <button
          className="md:hidden p-2 text-mist hover:text-cream transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      {open && (
        <div className="md:hidden border-t border-studio-border bg-studio-black">
          {/*
            Mobile drawer uses stacked-bridge.jpg — the tall stacked lockup
            with the bridge icon above MCS + MID CITY SOUND wordmark.
            It fills nicely as a brand header inside the drawer.
          */}
          <div className="px-6 pt-5 pb-4 border-b border-studio-border/40">
            <div className="relative w-[200px] h-[100px]">
              <Image
                src="/images/logo/stacked-bridge.jpg"
                alt="Mid City Sound Studios"
                fill
                className="object-contain object-left"
                sizes="200px"
              />
            </div>
          </div>

          <nav className="flex flex-col px-6 pb-5 gap-1 pt-2">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={[
                    "py-3 text-sm font-medium border-b border-studio-border/40 transition-colors",
                    isActive ? "text-gold" : "text-mist hover:text-cream",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/studio"
              onClick={() => setOpen(false)}
              className="mt-3 text-center py-2.5 border border-gold text-gold text-sm font-medium tracking-widest uppercase hover:bg-gold hover:text-studio-black transition-all"
            >
              Book Studio Time
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
