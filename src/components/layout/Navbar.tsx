"use client";

import Link            from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect }    from "react";
import { Menu, X, ShoppingBag }     from "lucide-react";
import { useCart }     from "@/components/merch/CartProvider";
import { cartCount }   from "@/lib/cart";

const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Studio",   href: "/studio" },
  { label: "Legacy",   href: "/legacy" },
  { label: "Groove",   href: "/groove" },
  { label: "Projects", href: "/projects" },
  { label: "Merch",    href: "/merch/brand/mcs" },
  { label: "Contact",  href: "/contact" },
] as const;

export function Navbar() {
  const pathname        = usePathname();
  const [open, setOpen] = useState(false);
  const { state, openDrawer } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(state.items) : 0;

  const CartButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={openDrawer}
      aria-label={`Open cart${count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
      className={`relative p-2 text-mist hover:text-cream transition-colors ${className}`}
    >
      <ShoppingBag className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center
          min-w-[16px] h-4 px-1 rounded-full bg-gold text-studio-black text-[10px] font-semibold leading-none">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-studio-border/60 bg-studio-black/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16">

        {/* ── Logo: text only ── */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="shrink-0 group"
        >
          <span className="font-display text-2xl tracking-wide text-cream group-hover:text-gold transition-colors duration-200">
            Mid City Sound
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "relative text-[12px] font-sans font-medium tracking-wide transition-colors duration-200",
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
            className="ml-1 px-4 py-1.5 text-[11px] font-medium tracking-widest uppercase border border-gold text-gold hover:bg-gold hover:text-studio-black transition-all duration-200 rounded-sm"
          >
            Book Now
          </Link>
          <CartButton className="ml-1" />
        </nav>

        {/* ── Mobile: cart + hamburger ── */}
        <div className="md:hidden flex items-center">
          <CartButton />
          <button
            className="p-2 text-mist hover:text-cream transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {open && (
        <div className="md:hidden border-t border-studio-border bg-studio-black">
          <div className="px-6 pt-5 pb-4 border-b border-studio-border/40">
            <span className="font-display text-2xl text-cream">Mid City Sound</span>
            <p className="text-[10px] tracking-[0.2em] uppercase text-mist/50 mt-2">New Orleans, Louisiana</p>
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
