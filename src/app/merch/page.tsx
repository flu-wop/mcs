// src/app/merch/page.tsx — Full merch page rebuild
// Three-collection tab system: MCS / Lil Squiggle / Streetbeat
// Product grid with size picker, add-to-cart feedback, SVG placeholder art
// Swap ProductArt placeholders with <Image> when real photos arrive.

"use client"

import { useState }   from "react"
import Link           from "next/link"
import {
  ShoppingBag, ArrowRight, Star,
  Truck, Shield, Heart, Music,
  ExternalLink, Check,
} from "lucide-react"
import { Button }    from "@/components/ui/button"
import { Badge }     from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn }        from "@/lib/utils"

type Collection = "mcs" | "squiggle" | "streetbeat"

interface Product {
  id: string; name: string; desc: string; price: number
  tag?: string; bgColor: string; accentColor: string; icon: string
  storeSlug: string; sizes?: string[]; featured?: boolean
}

const COLLECTIONS: Record<Collection, { label: string; tagline: string; products: Product[] }> = {
  mcs: {
    label: "Mid City Sound Studios",
    tagline: "Premium studio gear. Built on legacy.",
    products: [
      { id: "mcs-dad-hat",    name: "MCS Dad Hat",            desc: "Black structured dad hat with embroidered gold MCS crescent/waveform logo. Premium wool blend.", price: 38, tag: "Best Seller", bgColor: "#0a0a0a", accentColor: "#D4AF77", icon: "🧢", storeSlug: "mcs-dad-hat", featured: true },
      { id: "mcs-tee",        name: "MCS Studio Tee",          desc: "Heavyweight black tee. Gold MCS chest logo + full bridge waveform back print. 100% combed cotton.", price: 45, bgColor: "#111111", accentColor: "#D4AF77", icon: "👕", storeSlug: "mcs-studio-tee", sizes: ["S","M","L","XL","2XL"] },
      { id: "mcs-hoodie",     name: "MCS Heavyweight Hoodie",  desc: "Premium French terry hoodie. Embossed MCS logo. Deep charcoal with gold details. Studio-quality weight.", price: 85, tag: "Premium", bgColor: "#1a1a1a", accentColor: "#D4AF77", icon: "🧥", storeSlug: "mcs-hoodie", sizes: ["S","M","L","XL","2XL"] },
      { id: "mcs-crewneck",   name: "MCS Crewneck",            desc: "Studio-weight fleece. Mid City Sound Studios wordmark across chest. Made for long sessions.", price: 65, bgColor: "#1C1C1C", accentColor: "#E8C97A", icon: "👔", storeSlug: "mcs-crewneck", sizes: ["S","M","L","XL"] },
      { id: "mcs-tote",       name: "MCS Canvas Tote",         desc: "Heavy canvas tote. Gold screen-printed MCS full lockup. Carries records and gear with equal style.", price: 28, bgColor: "#F5EDD8", accentColor: "#090909", icon: "🛍️", storeSlug: "mcs-tote" },
      { id: "mcs-stickers",   name: "MCS Sticker Set",         desc: "5 die-cut vinyl stickers. Waterproof. Bridge logo, waveform mark, crescent icon, and more.", price: 14, tag: "New", bgColor: "#1C1C1C", accentColor: "#D4AF77", icon: "🏷️", storeSlug: "mcs-stickers" },
    ],
  },
  squiggle: {
    label: "Lil Squiggle",
    tagline: "#DontDrinkAndDialDecades — One call. Every era. Same regret.",
    products: [
      { id: "sq-rotary-tee",  name: "Don't Dial — Rotary Tee",  desc: "Lil Squiggle spinning the 1970s rotary. Avocado-green kitchen energy. 100% combed cotton.", price: 35, tag: "Best Seller", bgColor: "#1A2A1A", accentColor: "#1D9E75", icon: "📞", storeSlug: "rotary-tee", sizes: ["S","M","L","XL","2XL"], featured: true },
      { id: "sq-flip-hoodie", name: "Flip Phone Hoodie",          desc: "The 90s chapter. Mid-snap, mid-regret. Premium fleece, Rasta-color trim on cuffs.", price: 72, bgColor: "#2A1A2A", accentColor: "#EF9F27", icon: "📱", storeSlug: "flipphone-hoodie", sizes: ["S","M","L","XL"] },
      { id: "sq-crewneck",    name: "Face ID Crewneck",            desc: "Modern era. Face ID. Read receipts. Zero excuses. Maximum regret. Heavyweight fleece.", price: 62, bgColor: "#1A1A2A", accentColor: "#B5D4F4", icon: "📲", storeSlug: "smartphone-crewneck", sizes: ["S","M","L","XL","2XL"] },
      { id: "sq-og-tee",      name: "Lil Squiggle OG Tee",         desc: "Original campaign graphic. All three eras, one shirt. Rasta palette on premium black cotton.", price: 35, tag: "OG", bgColor: "#0f0f0f", accentColor: "#D85A30", icon: "👕", storeSlug: "og-tee", sizes: ["S","M","L","XL","2XL"] },
      { id: "sq-phone-case",  name: "Squiggle Phone Case",          desc: "Full Rasta glory. Fits iPhone 14/15/16 and Samsung Galaxy. Protective matte finish.", price: 28, tag: "New", bgColor: "#1D9E75", accentColor: "#FAEEDA", icon: "📱", storeSlug: "phone-case" },
      { id: "sq-poster",      name: "Campaign Poster 18×24",        desc: "Museum-quality print. \"One Guy. Three Eras. Same Regret.\" Ships in protective tube.", price: 32, bgColor: "#FAEEDA", accentColor: "#D85A30", icon: "🖼️", storeSlug: "campaign-poster" },
    ],
  },
  streetbeat: {
    label: "Street Beat",
    tagline: "Drumming Below Sea Level — Now Available. NOLA's rhythm, on your back.",
    products: [
      { id: "sb-drum-tee",    name: "Drumming Graphic Tee",       desc: "Bold percussion graphic rooted in NOLA street culture. 100% combed ringspun cotton. Unisex fit.", price: 38, tag: "Film Edition", bgColor: "#0a0a0a", accentColor: "#B5D4F4", icon: "🥁", storeSlug: "drum-tee", sizes: ["S","M","L","XL","2XL"], featured: true },
      { id: "sb-longsleeve",  name: "Streetbeat Longsleeve",       desc: "Black longsleeve. Streetbeat doc logo. \"Drumming Below Sea Level\" down the left sleeve.", price: 48, bgColor: "#111111", accentColor: "#B5D4F4", icon: "👕", storeSlug: "sb-longsleeve", sizes: ["S","M","L","XL"] },
      { id: "sb-sticks",      name: "Branded Drumstick Bundle",    desc: "Pro-grade 5A hickory. Laser-etched Streetbeat logo. Two pairs per bundle. Play like NOLA.", price: 24, tag: "Musician Pick", bgColor: "#8B6914", accentColor: "#F5EDD8", icon: "🥢", storeSlug: "drumstick-bundle" },
      { id: "sb-hat",         name: "Streetbeat Doc Hat",           desc: "Film-edition snapback. Embroidered waveform + \"Below Sea Level\" embossed on brim.", price: 34, bgColor: "#0a0a0a", accentColor: "#B5D4F4", icon: "🧢", storeSlug: "doc-hat" },
    ],
  },
}

const WHY_SHOP = [
  { icon: Star,   title: "Premium Quality",        body: "Heavyweight cotton, durable prints, real embroidery. Not fast fashion — gear that lasts." },
  { icon: Heart,  title: "Supports the Studio",    body: "Every purchase helps keep Mid City Sound Studios running as an independent New Orleans creative space." },
  { icon: Truck,  title: "Fulfilled by Printful",  body: "Printed on demand, shipped worldwide from the nearest Printful facility. Fast and reliable." },
  { icon: Shield, title: "Satisfaction Guaranteed",body: "Order arrives damaged or with a print defect? We replace it. No questions, no hassle." },
]

function ProductArt({ id, bgColor, accentColor, icon }: { id: string; bgColor: string; accentColor: string; icon: string }) {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="200" fill={bgColor} />
      <defs>
        <pattern id={`g-${id}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0L0 0 0 20" fill="none" stroke={accentColor} strokeWidth="0.15" opacity="0.25" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill={`url(#g-${id})`} />
      <line x1="8"   y1="8"   x2="24"  y2="8"   stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
      <line x1="8"   y1="8"   x2="8"   y2="24"  stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
      <line x1="192" y1="192" x2="176" y2="192" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
      <line x1="192" y1="192" x2="192" y2="176" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
      <text x="100" y="105" textAnchor="middle" dominantBaseline="middle" fontSize="68">{icon}</text>
      <rect x="0" y="186" width="200" height="14" fill={accentColor} opacity="0.2" />
      <text x="100" y="176" textAnchor="middle" fill={accentColor} fontSize="7" fontFamily="system-ui" opacity="0.45" letterSpacing="2">PHOTO COMING SOON</text>
    </svg>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false)
  const [size, setSize]   = useState<string | null>(product.sizes?.[1] ?? product.sizes?.[0] ?? null)

  function handleCart() {
    // ── CART INTEGRATION: replace with Stripe/Printful/Shopify call ──
    // e.g. fetch('/api/cart/add', { method:'POST', body: JSON.stringify({ id: product.id, size, qty: 1 }) })
    console.log("Cart:", { id: product.id, size, qty: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className={cn(
      "group flex flex-col border border-studio-border bg-studio-card rounded-sm overflow-hidden",
      "transition-all duration-300 hover:border-gold/40",
      "hover:shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(212,175,119,0.06)]",
      product.featured && "ring-1 ring-gold/20"
    )}>
      {/* Image */}
      <div className="relative aspect-square bg-studio-dark overflow-hidden">
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-[1.04]">
          {/*
            PHOTO SWAP: replace ProductArt with:
            <Image src={`/images/merch/${product.id}.jpg`} fill className="object-cover" alt={product.name} />
          */}
          <ProductArt id={product.id} bgColor={product.bgColor} accentColor={product.accentColor} icon={product.icon} />
        </div>
        {product.tag && (
          <div className="absolute top-3 left-3">
            <Badge className="text-[9px] tracking-wide">{product.tag}</Badge>
          </div>
        )}
        {product.featured && <div className="absolute inset-0 bg-gradient-to-t from-gold/5 to-transparent pointer-events-none" />}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex-1">
          <h3 className="font-display text-lg text-cream leading-tight mb-1.5 group-hover:text-gold transition-colors">{product.name}</h3>
          <p className="text-mist text-xs leading-relaxed">{product.desc}</p>
        </div>

        {/* Size picker */}
        {product.sizes && (
          <div className="space-y-1.5">
            <p className="text-[9px] tracking-[0.15em] uppercase text-mist/50">Size</p>
            <div className="flex gap-1.5 flex-wrap">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)}
                  className={cn("w-8 h-8 text-[10px] font-medium border rounded-sm transition-all",
                    size === s ? "border-gold bg-gold/10 text-gold" : "border-studio-border text-mist/60 hover:border-gold/40 hover:text-mist"
                  )}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-1 border-t border-studio-border/40">
          <p className="font-display text-2xl text-gold">${product.price}</p>
          <button onClick={handleCart}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium tracking-widest uppercase rounded-sm transition-all duration-200",
              added
                ? "bg-gold/20 border border-gold text-gold"
                : "border border-studio-border text-mist hover:border-gold hover:text-gold hover:bg-gold/5"
            )}
          >
            {added ? <><Check className="w-3.5 h-3.5" />Added</> : <><ShoppingBag className="w-3.5 h-3.5" />Add to Cart</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MerchPage() {
  const [tab, setTab] = useState<Collection>("mcs")
  const col = COLLECTIONS[tab]

  return (
    <div className="pt-16 min-h-screen bg-studio-black">

      {/* ── HERO ── */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-studio-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-studio-black via-studio-charcoal to-studio-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(212,175,119,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_20%_70%,rgba(29,158,117,0.04),transparent)]" />
        {/* Vinyl rings */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-gold/5" />
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full border border-gold/8" />
        <div className="absolute -top-2  -right-2  w-36 h-36 rounded-full border border-gold/10" />
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")` }} />

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-gold/60" />
              <span className="text-[11px] tracking-[0.25em] uppercase text-gold/80 font-sans">Official Store · New Orleans</span>
            </div>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-cream leading-[0.92] mb-5">
              Shop the<br /><span className="text-gold-gradient italic">Studio</span>
            </h1>
            <p className="text-mist text-base md:text-lg max-w-md leading-relaxed mb-8 font-light">
              Gear from the studio that makes history. Every purchase supports independent music in New Orleans.
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(COLLECTIONS) as Collection[]).map(key => (
                <button key={key} onClick={() => setTab(key)}
                  className={cn("px-4 py-1.5 text-[11px] font-medium tracking-widest uppercase rounded-sm border transition-all",
                    tab === key ? "border-gold bg-gold text-studio-black" : "border-studio-border text-mist hover:border-gold/50 hover:text-cream"
                  )}
                >
                  {key === "mcs" ? "MCS" : key === "squiggle" ? "Lil Squiggle" : "Streetbeat"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKY TABS ── */}
      <div className="sticky top-16 z-30 bg-studio-black/95 backdrop-blur-md border-b border-studio-border/60">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex overflow-x-auto -mb-px">
            {(Object.entries(COLLECTIONS) as [Collection, typeof col][]).map(([key, c]) => (
              <button key={key} onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3.5 text-[12px] font-medium tracking-wide uppercase whitespace-nowrap border-b-2 transition-all",
                  tab === key ? "border-gold text-gold" : "border-transparent text-mist hover:text-cream"
                )}
              >
                {c.label}
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-sm", tab === key ? "bg-gold/20 text-gold" : "bg-studio-dark text-mist/50")}>
                  {c.products.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <section className="py-14 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl text-cream">{col.label}</h2>
              <p className="text-mist text-sm mt-1.5 max-w-md">{col.tagline}</p>
            </div>
            <a href="https://store.lilsquiggle.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-mist hover:text-gold transition-colors">
              Full store <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {col.products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          <p className="text-center text-mist/40 text-[11px] mt-10 tracking-wide">
            All products fulfilled by Printful · Printed on demand · Ships worldwide
          </p>
        </div>
      </section>

      {/* ── WHY SHOP ── */}
      <section className="py-20 px-6 border-t border-studio-border/40 bg-studio-charcoal">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase">Why Shop With Us</Badge>
            <h2 className="font-display text-4xl text-cream">Quality you can feel</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_SHOP.map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-6 border border-studio-border bg-studio-card rounded-sm hover:border-gold/30 transition-all group">
                <div className="w-9 h-9 border border-studio-border rounded-sm flex items-center justify-center mb-4 group-hover:border-gold/40 transition-colors">
                  <Icon className="w-4 h-4 text-gold/60 group-hover:text-gold transition-colors" />
                </div>
                <h3 className="font-display text-xl text-cream mb-2">{title}</h3>
                <p className="text-mist text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="py-20 px-6 relative overflow-hidden border-t border-studio-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_60%_at_50%_50%,rgba(212,175,119,0.05),transparent)]" />
        <div className="relative mx-auto max-w-2xl text-center space-y-6">
          <Music className="w-8 h-8 text-gold/30 mx-auto" />
          <h2 className="font-display text-4xl md:text-5xl text-cream leading-tight">
            Every purchase supports<br /><span className="text-gold-gradient italic">independent music</span>
          </h2>
          <p className="text-mist text-sm leading-relaxed max-w-sm mx-auto">
            All merch proceeds go directly toward keeping Mid City Sound Studios running
            as an independent creative home in New Orleans.
          </p>
          <Separator className="w-10 bg-gold/30 mx-auto" />
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <a href="https://store.lilsquiggle.com" target="_blank" rel="noopener noreferrer">
                <ShoppingBag className="w-4 h-4" />
                Visit Full Store
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                Back to Mid City Sound
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
