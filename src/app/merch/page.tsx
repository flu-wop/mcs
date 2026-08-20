// app/merch/page.tsx
// Central shop page for midcitysound.com/merch.
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
    url: 'https://midcitysound.com/merch',
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
    canonical: 'https://midcitysound.com/merch',
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
    products = await getProductsWithPrices()
  } catch (err) {
    console.error('Failed to load products from Printify:', err)
    // ShopClient renders an error/empty state — don't throw here
  }

  return (
    <main className="min-h-screen bg-[#090909]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <ShopHero />

      {/* ── Editorial break ──────────────────────────────────────────────── */}
      <EditorialBreak />

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
      className="relative overflow-hidden border-b border-[#D4AF77]/10"
      aria-label="Shop hero"
    >
      {/* Ember-glow atmosphere + grain — ties into Fire on the Bayou's
          cinematic dark/ember treatment used elsewhere in the ecosystem.
          Decorative-only (pointer-events-none), sits behind all real
          content. grain-overlay is the existing globals.css utility used
          on other hero sections — reused here rather than a one-off. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(60% 50% at 12% 100%, rgba(212,175,119,0.14), transparent 70%),
            radial-gradient(40% 35% at 85% 10%, rgba(212,175,119,0.06), transparent 70%)
          `,
        }}
      />
      <div aria-hidden="true" className="grain-overlay pointer-events-none absolute inset-0" />

      <div className="relative px-6 sm:px-10 py-16 sm:py-24">
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
              href={`/merch/brand/${brand}`}
              className="text-[10px] tracking-[0.14em] uppercase text-[#A89880]
                border-b border-[#A89880]/20 pb-px hover:text-[#D4AF77]
                hover:border-[#D4AF77]/40 transition-colors font-['DM_Sans']"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Ecosystem marquee — same four brands as the quick links above,
          purely decorative/ambient here (duplicate content is aria-hidden
          so screen readers only hit the real links once). Slow, continuous,
          not meant to be read — a texture, not a nav. */}
      <div
        aria-hidden="true"
        className="relative border-t border-[#D4AF77]/10 overflow-hidden py-3"
      >
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          {[0, 1].map(i => (
            <span
              key={i}
              className="flex items-center gap-10 pr-10 shrink-0
                text-[11px] tracking-[0.35em] uppercase text-[#5a4c3a] font-['DM_Sans']"
            >
              <span>Mid City Sound</span><span className="text-[#D4AF77]/40">◈</span>
              <span>Donald Markowitz</span><span className="text-[#D4AF77]/40">◈</span>
              <span>Street Beat</span><span className="text-[#D4AF77]/40">◈</span>
              <span>Lil Squiggle</span><span className="text-[#D4AF77]/40">◈</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Editorial break ──────────────────────────────────────────────────────────
// One-line callout between the hero and the grid — currently used to flag
// the new material selector so it doesn't go unnoticed sitting quietly on
// individual cards. Swap the copy here for future callouts (new drop,
// restock, etc.) rather than adding another whole section.

function EditorialBreak() {
  return (
    <section className="px-6 sm:px-10 py-8 border-b border-[#D4AF77]/10 flex items-center gap-3 flex-wrap">
      <span className="font-['Cormorant_Garamond'] italic text-[#D4AF77] text-xl sm:text-2xl">
        Fresh —
      </span>
      <p className="text-[#A89880] text-[11px] sm:text-xs tracking-wide font-['DM_Sans']">
        Every heavyweight tee now also comes in a classic cotton fit. Same design, your call on weight.
      </p>
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
