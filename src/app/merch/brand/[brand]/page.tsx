// app/merch/brand/[brand]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProducts } from '@/lib/printify'
import { BRANDS, BRAND_LIST } from '@/lib/brands'
import BrandGrid from './BrandGrid'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ brand: string }>
}

function isKnownBrand(slug: string): slug is keyof typeof BRANDS {
  return slug in BRANDS
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: brandSlug } = await params
  if (!isKnownBrand(brandSlug)) return { title: 'Not Found | Mid City Sound Studios' }
  const brand = BRANDS[brandSlug]
  return {
    title: `${brand.label} Merch | Mid City Sound Studios`,
    description: brand.description,
  }
}

export default async function BrandPage({ params }: PageProps) {
  const { brand: brandSlug } = await params
  if (!isKnownBrand(brandSlug)) notFound()

  const brand = BRANDS[brandSlug]
  const allProducts = await getProducts()
  const products = allProducts.filter(p => p.brand === brand.id)

  return (
    <div className="min-h-screen bg-[#090909]">
      {/* ── Brand hero ───────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b px-6 sm:px-10 py-16 sm:py-24"
        style={{ borderColor: `${brand.accent}20` }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 right-0 select-none
            font-['Cormorant_Garamond'] font-semibold leading-none"
          style={{
            fontSize: 'clamp(60px, 15vw, 180px)',
            letterSpacing: '-0.04em',
            color: brand.accent,
            opacity: 0.05,
          }}
        >
          {brand.shortLabel.split(' ')[0].toUpperCase()}
        </span>

        <Link
          href="/merch"
          className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase
            text-[#5a4c3a] hover:text-[#A89880] transition-colors font-['DM_Sans'] mb-6"
        >
          ← All Products
        </Link>

        <p
          className="mb-4 text-[10px] tracking-[0.22em] uppercase font-['DM_Sans']"
          style={{ color: brand.accent }}
        >
          Mid City Sound Studios · Brand
        </p>

        <h1
          className="font-['Cormorant_Garamond'] font-light text-[#F5EDD8] leading-[1.04] max-w-lg"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}
        >
          {brand.label}
        </h1>

        <p className="mt-3 font-['Cormorant_Garamond'] italic text-lg" style={{ color: brand.accent }}>
          {brand.tagline}
        </p>

        <p className="mt-5 max-w-md text-[12px] leading-relaxed tracking-wide text-[#A89880] font-['DM_Sans']">
          {brand.description}
        </p>

        {/* Other brands */}
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {BRAND_LIST.filter(b => b.id !== brand.id).map(b => (
            <Link
              key={b.id}
              href={`/merch/brand/${b.slug}`}
              className="text-[10px] tracking-[0.14em] uppercase text-[#A89880]
                border-b border-[#A89880]/20 pb-px hover:text-[#F5EDD8]
                hover:border-[#A89880]/50 transition-colors font-['DM_Sans']"
            >
              {b.shortLabel}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div className="px-6 sm:px-10 py-10">
        <BrandGrid products={products} accent={brand.accent} />
      </div>
    </div>
  )
}
