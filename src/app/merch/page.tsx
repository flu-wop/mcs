// app/merch/page.tsx
// Central shop page for midcitysound.vercel.app/shop.
// Server component: fetches products at build/ISR, passes to client ShopClient.
// URL params: ?brand=djm|streetbeat|squiggle|mcs &type=tee|hoodie|poster|accessory|mug|hat|tote|sticker &search=... &sort=featured|price-asc|price-desc|name

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getProductsWithPrices, type MerchProduct, type Brand, type ProductType } from '@/lib/printify'
import ShopClient from './ShopClient'

// ─── ISR — re-fetch products every hour ───────────────────────────────────────
export const revalidate = 3600

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Shop | Mid City Sound Studios — New Orleans Music Merch',
  description:
    'Print-on-demand apparel, art prints, and accessories from Mid City Sound Studios, Donald Markowitz, Street Beat, and Lil Squiggle. Ships worldwide.',
  openGraph: {
    title: 'Mid City Sound Merch',
    description: 'Four brands. One studio. Wear the culture.',
    images: [{ url: '/images/og-shop.jpg', width: 1200, height: 630 }],
    url: 'https://midcitysound.vercel.app/shop',
    siteName: 'Mid City Sound Studios',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mid City Sound Merch',
    description: 'Four brands. One studio. Wear the culture.',
    images: ['/images/og-shop.jpg'],
  },
  alternates: {
    canonical: 'https://midcitysound.vercel.app/shop',
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{
    brand?:  string
    type?:   string
    search?: string
    sort?:   string
  }>
}

export default async function MerchPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Fetch all products with prices (cached via ISR)
  let products: MerchProduct[] = []
  try {
    products = await getProductsWithPrices(24)
  } catch (err) {
    console.error('Failed to load products from Printify:', err)
    // ShopClient renders an error/empty state — don't throw here
  }

  return (
    <main className="min-h-screen bg-[#090909]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <ShopHero />

      {/* ── Shop body (client — filters, search, grid) ───────────────────── */}
      <Suspense fallback={<ShopSkeleton />}>
        <ShopClient
          products={products}
          initialBrand={(params.brand  as Brand | 'all')       ?? 'all'}
          initialType={(params.type    as ProductType | 'all') ?? 'all'}
          initialSearch={params.search ?? ''}
          initialSort={(params.sort    as 'featured' | 'price-asc' | 'price-desc' | 'name') ?? 'featured'}
        />
      </Suspense>
    </main>
  )
}

// ─── Hero (static, renders on server) ────────────────────────────────────────

function ShopHero() {
  return (
    <section
      className="relative overflow-hidden border-b border-[#D4AF77]/10 px-6 sm:px-10 py-16 sm:py-24"
      aria-label="Shop hero"
    >
      {/* Decorative watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 right-0 select-none
          font-['Cormorant_Garamond'] font-semibold leading-none text-[#D4AF77]/[0.035]"
        style={{ fontSize: 'clamp(80px, 18vw, 220px)', letterSpacing: '-0.04em' }}
      >
        MERCH
      </span>

      <p className="mb-4 text-[10px] tracking-[0.22em] uppercase text-[#D4AF77] font-['DM_Sans']">
        Mid City Sound Studios · New Orleans
      </p>

      <h1
        className="font-['Cormorant_Garamond'] font-light text-[#F5EDD8] leading-[1.04] max-w-lg"
        style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}
      >
        Wear the{' '}
        <em className="italic text-[#D4AF77]">culture.</em>
        <br />
        Own the sound.
      </h1>

      <p className="mt-5 max-w-md text-[12px] leading-relaxed tracking-wide text-[#A89880] font-['DM_Sans']">
        Print-on-demand merch from four brands born in the studio.
        Ships from New Orleans via Printify — no inventory, no minimums.
      </p>

      {/* Ecosystem quick links */}
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
        {([
          { label: 'MCS Studio',       brand: 'mcs'        },
          { label: 'Donald Markowitz', brand: 'djm'        },
          { label: 'Street Beat',      brand: 'streetbeat' },
          { label: 'Lil Squiggle',     brand: 'squiggle'   },
        ] as const).map(({ label, brand }) => (
          <a
            key={brand}
            href={`/shop?brand=${brand}`}
            className="text-[10px] tracking-[0.14em] uppercase text-[#A89880]
              border-b border-[#A89880]/20 pb-px hover:text-[#D4AF77]
              hover:border-[#D4AF77]/40 transition-colors font-['DM_Sans']"
          >
            {label}
          </a>
        ))}
      </div>
    </section>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ShopSkeleton() {
  return (
    <div className="px-6 sm:px-10 py-12">
      {/* Filter bar skeleton */}
      <div className="h-28 bg-[#111]/60 animate-pulse mb-8 rounded-sm" />
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square bg-[#111]/60 animate-pulse rounded-sm" />
        ))}
      </div>
    </div>
  )
}
