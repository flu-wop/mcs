// src/app/merch/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// MERCH PAGE  (route: /merch)
// Links to Lil Squiggle store + previews products.
// Swap product images and Stripe/Printful product URLs with real ones.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata }  from "next"
import Link               from "next/link"
import { ShoppingBag, ExternalLink, ArrowRight, Tag } from "lucide-react"
import { Button }    from "@/components/ui/button"
import { Badge }     from "@/components/ui/badge"

export const metadata: Metadata = {
  title:       "Merch — Lil Squiggle Shop",
  description: "Official Mid City Sound merch — powered by the Lil Squiggle #DontDrinkAndDialDecades campaign. Hats, tees, and more.",
}

/* ─── Product previews ────────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    title: "Lil Squiggle OG Tee",
    price: "$35",
    tag:   "Best Seller",
    slug:  "og-tee",
    desc:  "The signature Lil Squiggle chibi graphic. 100% combed cotton.",
  },
  {
    title: "Don't Drink & Dial Dad Hat",
    price: "$28",
    tag:   "New",
    slug:  "dad-hat",
    desc:  "Embroidered logo. One-size-fits-all adjustable strap.",
  },
  {
    title: "Mid City Sound Crewneck",
    price: "$65",
    tag:   null,
    slug:  "crewneck",
    desc:  "Studio-weight fleece. Mid City Sound Studios wordmark on chest.",
  },
  {
    title: "Squiggle Sticker Pack",
    price: "$12",
    tag:   null,
    slug:  "sticker-pack",
    desc:  "6 die-cut vinyl stickers. Weather-resistant. Vibes, certified.",
  },
]

/* ─────────────────────────────────────────────────────────────────────────── */
export default function MerchPage() {
  return (
    <div className="pt-16 min-h-screen bg-studio-black">

      {/* ── Hero banner ── */}
      <section className="relative py-20 px-6 bg-studio-charcoal border-b border-studio-border overflow-hidden">
        {/* Rasta-ish green glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_70%_50%,rgba(29,158,117,0.06),transparent)]" />

        <div className="relative mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-10">
          {/* Text */}
          <div className="flex-1 space-y-5">
            <Badge variant="outline" className="text-[10px] tracking-widest uppercase">
              Official Merch
            </Badge>
            <h1 className="font-display text-5xl md:text-6xl text-cream leading-tight">
              Lil Squiggle
              <br />
              <span className="text-gold-gradient italic">Shop</span>
            </h1>
            <p className="text-mist text-sm leading-relaxed max-w-sm">
              Gear from the <strong className="text-cream">#DontDrinkAndDialDecades</strong> campaign.
              All orders fulfilled via Printful — printed on demand, shipped worldwide.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link
                  href="https://store.lilsquiggle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop All Products
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link
                  href="https://lilsquiggle.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Campaign Site
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Visual block */}
          <div className="w-full md:w-72 aspect-square bg-studio-dark border border-studio-border rounded-sm flex flex-col items-center justify-center text-mist/30 gap-3">
            <ShoppingBag className="w-16 h-16" />
            <span className="text-[10px] tracking-widest uppercase">Store Preview</span>
            <span className="text-[9px] text-mist/20">Replace with real product image</span>
          </div>
        </div>
      </section>

      {/* ── Featured products ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <Badge variant="outline" className="mb-3 text-[10px] tracking-widest uppercase">
                Featured Items
              </Badge>
              <h2 className="font-display text-3xl text-cream">Popular right now</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link
                href="https://store.lilsquiggle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mist hover:text-gold"
              >
                View all in store
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRODUCTS.map(({ title, price, tag, slug, desc }) => (
              <Link
                key={slug}
                href={`https://store.lilsquiggle.com/products/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block border border-studio-border bg-studio-card rounded-sm hover:border-gold/40 transition-all card-lift overflow-hidden"
              >
                {/* Product image placeholder */}
                <div className="aspect-square bg-studio-dark flex flex-col items-center justify-center text-mist/20 gap-2 relative">
                  <ShoppingBag className="w-10 h-10" />
                  <span className="text-[9px] tracking-widest uppercase">Photo</span>
                  {tag && (
                    <Badge className="absolute top-2 right-2 text-[9px]">{tag}</Badge>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-sans font-medium text-cream text-sm mb-1">{title}</h3>
                  <p className="text-mist text-xs mb-3 leading-relaxed">{desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg text-gold">{price}</span>
                    <div className="flex items-center gap-1 text-xs text-mist group-hover:text-gold transition-colors">
                      <span>Shop</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Campaign callout ── */}
      <section className="py-20 px-6 border-t border-studio-border bg-studio-charcoal">
        <div className="mx-auto max-w-3xl grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="text-[10px] tracking-widest uppercase">
              The Campaign
            </Badge>
            <h2 className="font-display text-3xl text-cream">
              #DontDrinkAndDialDecades
            </h2>
            <p className="text-mist text-sm leading-relaxed">
              One call. Every era. Same regret. Lil Squiggle is the character at the center
              of our reggae-dub chibi Lego universe — follow the campaign on social.
            </p>
            <div className="space-y-1 text-xs">
              {[
                "@lilsquigglemon (TikTok)",
                "@lilsquigglemon (YouTube)",
                "@lilsquigglemon (X)",
                "@lil.squiggle (Instagram)",
              ].map((h) => (
                <p key={h} className="text-gold/70 font-mono">{h}</p>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] tracking-widest uppercase text-mist">Quick links</p>
            {[
              { label: "Campaign Landing Page",   href: "https://lilsquiggle.vercel.app" },
              { label: "Full Merch Store",        href: "https://store.lilsquiggle.com" },
              { label: "Wholesale / Bulk Orders", href: "/contact?ref=merch-wholesale" },
              { label: "Collab Inquiries",        href: "/contact?ref=merch-collab" },
            ].map(({ label, href }) => {
              const isExternal = href.startsWith("http")
              return (
                <Link
                  key={label}
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-studio-border hover:border-gold/40 rounded-sm group transition-all"
                >
                  <span className="text-sm text-mist group-hover:text-cream transition-colors">
                    {label}
                  </span>
                  {isExternal
                    ? <ExternalLink className="w-3.5 h-3.5 text-mist/40 group-hover:text-gold transition-colors" />
                    : <ArrowRight className="w-3.5 h-3.5 text-mist/40 group-hover:text-gold transition-colors" />
                  }
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
