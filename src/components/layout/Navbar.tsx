"use client";
// src/components/layout/Navbar.tsx
// Fixed navbar: transparent over the hero, blurred dark backdrop once you
// scroll. Phones get a full-screen menu (scroll-locked, Escape closes, focus
// returns to the toggle). Active link carries a gold underline.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { ShoppingBag, ArrowUpRight } from "lucide-react";
import { EASE_CINEMATIC } from "@flu-wop/design-system/motion";
import { useCart } from "@/components/merch/CartProvider";
import { cartCount } from "@/lib/cart";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Studio",   href: "/studio" },
  { label: "Legacy",   href: "/legacy" },
  { label: "Projects", href: "/projects" },
  { label: "Merch",    href: "/merch" },
  { label: "Contact",  href: "/contact" },
] as const;

const isActive = (pathname: string | null, href: string) =>
  href === "/" ? pathname === "/" : !!pathname?.startsWith(href);

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { state, openDrawer } = useCart();
  const lenis = useLenis();
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(state.items) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Lock scroll (native + Lenis) while the phone menu is open; Escape closes.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) lenis?.stop(); else lenis?.start();
    if (!open) return () => { document.body.style.overflow = ""; };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [open, lenis]);

  const solid = scrolled || open;

  const CartButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={() => { setOpen(false); openDrawer(); }}
      aria-label={`Open cart${count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
      className={cn("relative w-10 h-10 grid place-items-center text-mist hover:text-cream transition-colors", className)}
    >
      <ShoppingBag className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 grid place-items-center min-w-[16px] h-4 px-1 rounded-full bg-gold text-studio-black text-[10px] font-semibold leading-none">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-700",
          solid ? "border-b border-studio-border/60 bg-studio-black/80 backdrop-blur-xl" : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 flex items-center justify-between h-16 md:h-[72px]">
          <Link href="/" className="shrink-0 group" aria-label="Mid City Sound Studios, home">
            <span className="font-display text-2xl tracking-wide text-cream group-hover:text-gold transition-colors duration-300">
              Mid City Sound
            </span>
          </Link>

          <nav aria-label="Main" className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn("relative text-[12.5px] font-medium tracking-wide transition-colors duration-300", active ? "text-gold" : "text-mist hover:text-cream")}
                >
                  {label}
                  <span aria-hidden className={cn("absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-500", active ? "w-full" : "w-0")} />
                </Link>
              );
            })}
            <Link
              href="/studio#booking-form"
              className="ml-1 px-4 h-9 inline-flex items-center text-[11px] font-medium tracking-widest uppercase border border-gold/70 text-gold hover:bg-gold hover:text-studio-black transition-colors duration-300 rounded-sm"
            >
              Book now
            </Link>
            <CartButton className="-mr-2" />
          </nav>

          <div className="md:hidden flex items-center -mr-2">
            <CartButton />
            <button
              ref={toggleRef}
              onClick={() => setOpen(v => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            >
              <span className={cn("h-px w-6 bg-cream transition-transform duration-300", open && "translate-y-[3.5px] rotate-45")} />
              <span className={cn("h-px w-6 bg-cream transition-transform duration-300", open && "-translate-y-[3.5px] -rotate-45")} />
            </button>
          </div>
        </div>
      </header>

      {/* Phone menu: a sibling of <header> so the header's backdrop-blur
          doesn't trap this fixed overlay inside it. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            data-lenis-prevent
            className="md:hidden fixed inset-0 z-40 overflow-y-auto bg-studio-black px-7 pt-24 pb-10 flex flex-col"
          >
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(212,175,119,0.10),transparent)]" />
            <ul className="relative space-y-4">
              {NAV_LINKS.map(({ label, href }, i) => {
                const active = isActive(pathname, href);
                return (
                  <motion.li key={href} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.6, ease: EASE_CINEMATIC }}>
                    <Link href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
                      className={cn("font-display text-[2.6rem] leading-tight font-light", active ? "text-gold" : "text-cream")}>
                      {label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
            <motion.div className="relative mt-auto pt-10 space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
              <Link href="/studio#booking-form" onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 h-12 rounded-sm bg-gold text-studio-black text-xs font-semibold tracking-[0.16em] uppercase">
                Book studio time
              </Link>
              <div className="flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-mist/60">
                <span>Mid City · New Orleans</span>
                <a href="https://streetbeat.video" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-gold">
                  Street Beat <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
