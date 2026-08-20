'use client'
// app/merch/ShopClient.tsx
// All interactivity lives here: filter/sort/search logic, featured carousel,
// full product grid, empty state, back-link for brand referrals.
// Receives pre-fetched products from the server page component.

import { useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import FilterBar from '@/components/merch/FilterBar'
import ProductCard from '@/components/merch/ProductCard'
import type { MerchProduct, Brand, ProductType } from '@/lib/printify'
import type { SortOption } from '@/components/merch/FilterBar'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShopClientProps {
  products: MerchProduct[]
  initialBrand:  Brand | 'all'
  initialType:   ProductType | 'all'
  initialSearch: string
  initialSort:   SortOption
}

// ─── Filter + sort logic ──────────────────────────────────────────────────────

// Manual placement in the default "featured" sort/carousel — not tied to
// any product attribute (mvp/inStock/etc.), so it lives here explicitly
// as a data-driven exception list rather than a rule.
//
// Lower number = earlier. Items not listed here fall through to the
// normal mvp-then-alphabetical sort, then get spliced in around the
// manually-placed ones at their target index.
const MANUAL_POSITION: Record<string, number> = {
  '6a553c87566692467d039225': 0, // We Make Records Tee — always first
  '6a625715318a95514d01730b': 3, // We Make Records Back Tee — near the top,
                                  // but index 3 (not 1) so it's not sitting
                                  // right next to the original and reading
                                  // as a duplicate at a glance
}

// Splices manually-positioned items into their target index, in ascending
// target order, pulling each from wherever it landed naturally first.
// Using explicit index (not a comparator) so "position 3" means "4th card"
// regardless of how many other items shift around it.
function applyManualPositions<T extends { id: string }>(items: T[]): T[] {
  const result = [...items]
  const ids = Object.keys(MANUAL_POSITION).sort((a, b) => MANUAL_POSITION[a] - MANUAL_POSITION[b])
  for (const id of ids) {
    const from = result.findIndex(p => p.id === id)
    if (from === -1) continue
    const [item] = result.splice(from, 1)
    const target = Math.min(MANUAL_POSITION[id], result.length)
    result.splice(target, 0, item)
  }
  return result
}

function applyFilters(
  products: MerchProduct[],
  brand:  Brand | 'all',
  type:   ProductType | 'all',
  search: string,
  sort:   SortOption
): MerchProduct[] {
  let result = products.filter(p => {
    if (brand  !== 'all' && p.brand !== brand)        return false
    if (type   !== 'all' && p.type  !== type)         return false
    if (search) {
      const q = search.toLowerCase()
      return (
        p.name.toLowerCase().includes(q)  ||
        p.type.toLowerCase().includes(q)  ||
        p.brand.toLowerCase().includes(q)
      )
    }
    return true
  })

  switch (sort) {
    case 'price-asc':  result = [...result].sort((a, b) => a.price - b.price); break
    case 'price-desc': result = [...result].sort((a, b) => b.price - a.price); break
    case 'name':       result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break
    default:
      // "featured" — multi-material products (Heavyweight/Classic Cotton
      // choice) surface first so the new option doesn't get buried behind
      // MVP launch items or plain alphabetical order; MVP products next,
      // everyone else alphabetical after that. Manually-placed items still
      // get spliced into their fixed positions on top of all of this.
      result = [...result].sort((a, b) => {
        const aMulti = (a.materials?.length ?? 0) > 1
        const bMulti = (b.materials?.length ?? 0) > 1
        if (aMulti && !bMulti) return -1
        if (!aMulti && bMulti) return 1
        if (a.mvp && !b.mvp) return -1
        if (!a.mvp && b.mvp) return 1
        return a.name.localeCompare(b.name)
      })
      result = applyManualPositions(result)
  }
  return result
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShopClient({
  products,
  initialBrand,
  initialType,
  initialSearch,
  initialSort,
}: ShopClientProps) {
  const searchParams = useSearchParams()
  const gridRef = useRef<HTMLDivElement>(null)

  // Read live filter state from URL (FilterBar writes to URL)
  const brand  = (searchParams.get('brand')  as Brand | 'all')       ?? initialBrand
  const type   = (searchParams.get('type')   as ProductType | 'all') ?? initialType
  const search = searchParams.get('search') ?? initialSearch
  const sort   = (searchParams.get('sort')   as SortOption)          ?? initialSort

  // MVP products for the featured carousel (always unfiltered) — same
  // manual placement rule as the main grid below.
  const mvpProducts = useMemo(() => {
    return applyManualPositions(products.filter(p => p.mvp))
  }, [products])

  // Whether we're in a "filtered" state (hide carousel when filtering)
  const isFiltering = brand !== 'all' || type !== 'all' || search !== '' || sort !== 'featured'

  // Filtered + sorted grid products — when the featured carousel is showing,
  // exclude whatever it already displays so nothing appears twice on the
  // page (rows shift down to start with the next products instead of
  // repeating the carousel as the grid's first row). When actively
  // filtering, the carousel is hidden anyway, so show everything.
  const filtered = useMemo(() => {
    const pool = isFiltering ? products : products.filter(p => !p.mvp)
    return applyFilters(pool, brand, type, search, sort)
  }, [products, brand, type, search, sort, isFiltering])

  // Back-link: if ?brand= is set and we came from a brand sub-site
  const brandOrigins: Record<string, { label: string; href: string }> = {
    djm:        { label: 'Donald Markowitz', href: 'https://donaldmarkowitz.com' },
    streetbeat: { label: 'Street Beat',      href: 'https://streetbeat.video'    },
    squiggle:   { label: 'Lil Squiggle',     href: 'https://lilsquiggle.vercel.app' },
  }
  const origin = brand !== 'all' ? brandOrigins[brand] : null

  const gridTitle = isFiltering
    ? {
        all:        'All',
        mcs:        'Studio',
        djm:        'Legacy',
        streetbeat: 'Documentary',
        squiggle:   'Character',
      }[brand] + (type !== 'all' ? ` · ${type}s` : '') + ' Products'
    : 'All Products'

  return (
    <div>
      {/* ── Back-link ──────────────────────────────────────────────────────── */}
      {origin && (
        <div className="px-6 sm:px-10 pt-4">
          <a
            href={origin.href}
            className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em]
              uppercase text-[#A89880] hover:text-[#D4AF77] transition-colors
              font-['DM_Sans'] border-b border-[#A89880]/20 hover:border-[#D4AF77]/40 pb-px"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {origin.label}
          </a>
        </div>
      )}

      {/* ── Featured Carousel ──────────────────────────────────────────────── */}
      {!isFiltering && mvpProducts.length > 0 && (
        <section
          className="px-6 sm:px-10 py-12 border-b border-[#D4AF77]/10"
          aria-label="MVP launch collection"
        >
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-['Cormorant_Garamond'] font-light text-[#F5EDD8]"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>
              MVP{' '}
              <em className="italic text-[#D4AF77]">Launch</em>{' '}
              Collection
            </h2>
            <a
              href="#all-products"
              onClick={e => { e.preventDefault(); gridRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
              className="text-[10px] tracking-[0.14em] uppercase text-[#D4AF77]
                border-b border-[#D4AF77]/30 pb-px hover:border-[#D4AF77]
                transition-colors font-['DM_Sans']"
            >
              View all →
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {mvpProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                variants={product.variants}
                showSchema={i < 4}
                featured
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <FilterBar resultCount={filtered.length} />

      {/* ── All Products Grid ──────────────────────────────────────────────── */}
      <section
        id="all-products"
        ref={gridRef}
        className="px-6 sm:px-10 py-10"
        aria-label={gridTitle}
      >
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-['Cormorant_Garamond'] font-light text-[#F5EDD8]"
            style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)' }}>
            {isFiltering ? (
              <>
                <em className="italic text-[#D4AF77]">
                  {({ all: 'All', mcs: 'Studio', djm: 'Legacy', streetbeat: 'Documentary', squiggle: 'Character' } as Record<string, string>)[brand]}
                </em>{' '}
                Products
              </>
            ) : (
              <>All <em className="italic text-[#D4AF77]">Products</em></>
            )}
          </h2>
          {filtered.length > 0 && (
            <span className="text-[11px] tracking-[0.1em] uppercase text-[#5a4c3a] font-['DM_Sans']">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                variants={product.variants}
                showSchema={!isFiltering && i < 4}
              />
            ))}
          </div>
        ) : (
          <EmptyState onClear={() => { window.location.href = '/merch' }} />
        )}
      </section>

      {/* ── Ecosystem footer strip ─────────────────────────────────────────── */}
      <EcosystemStrip />
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span
        aria-hidden="true"
        className="block mb-4 font-['Cormorant_Garamond'] text-[80px] leading-none
          text-[#D4AF77]/10 font-light select-none"
      >
        ◈
      </span>
      <p className="font-['Cormorant_Garamond'] text-xl font-light text-[#A89880] italic mb-2">
        Nothing found.
      </p>
      <p className="text-[11px] tracking-[0.1em] uppercase text-[#5a4c3a] font-['DM_Sans'] mb-8">
        Try a different search or filter
      </p>
      <button
        onClick={onClear}
        className="text-[10px] tracking-[0.16em] uppercase px-5 py-2.5
          border border-[#D4AF77]/25 text-[#D4AF77] hover:bg-[#D4AF77]/08
          transition-all font-['DM_Sans']"
      >
        Clear filters →
      </button>
    </div>
  )
}

// ─── Ecosystem Strip ──────────────────────────────────────────────────────────

function EcosystemStrip() {
  const links = [
    { label: 'Mid City Sound Studios', href: '/',                              note: 'Studio · New Orleans'       },
    { label: 'Donald Markowitz',       href: 'https://donaldmarkowitz.com',    note: 'Composer · Producer · Legend' },
    { label: 'Street Beat',            href: 'https://streetbeat.video',       note: 'Documentary · 2025'          },
    { label: 'Lil Squiggle',           href: 'https://lilsquiggle.vercel.app', note: '#DontDrinkAndDialDecades'    },
  ]

  return (
    <section
      className="border-t border-[#D4AF77]/10 px-6 sm:px-10 py-10"
      aria-label="Ecosystem links"
    >
      <p className="text-[10px] tracking-[0.2em] uppercase text-[#5a4c3a]
        font-['DM_Sans'] mb-6">
        The Ecosystem
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {links.map(l => (
          <a
            key={l.href}
            href={l.href}
            className="group flex flex-col gap-1 border border-[#D4AF77]/08
              p-4 hover:border-[#D4AF77]/30 transition-colors"
          >
            <span className="font-['Cormorant_Garamond'] text-sm text-[#F5EDD8]
              group-hover:text-[#D4AF77] transition-colors leading-tight">
              {l.label}
            </span>
            <span className="text-[9px] tracking-[0.1em] uppercase text-[#5a4c3a]
              font-['DM_Sans']">
              {l.note}
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
