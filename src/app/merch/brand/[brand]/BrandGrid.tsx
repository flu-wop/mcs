'use client'
// app/merch/brand/[brand]/BrandGrid.tsx

import { useState, useMemo } from 'react'
import ProductCard from '@/components/merch/ProductCard'
import { TYPE_CHIPS, SORT_OPTIONS, type SortOption } from '@/components/merch/FilterBar'
import type { MerchProduct, ProductType } from '@/lib/printify'

export default function BrandGrid({ products, accent }: { products: MerchProduct[]; accent: string }) {
  const [type, setType] = useState<ProductType | 'all'>('all')
  const [sort, setSort] = useState<SortOption>('featured')

  // Only show type chips that this brand actually has products in
  const availableTypes = useMemo(() => {
    const present = new Set(products.map(p => p.type))
    return TYPE_CHIPS.filter(c => c.value === 'all' || present.has(c.value as ProductType))
  }, [products])

  const filtered = useMemo(() => {
    let result = type === 'all' ? products : products.filter(p => p.type === type)
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'price-asc':  return a.price - b.price
        case 'price-desc': return b.price - a.price
        case 'name':        return a.name.localeCompare(b.name)
        default: {
          // "featured" — multi-material products first (same priority as
          // the main /merch grid), then MVP, then everyone else.
          const aMulti = (a.materials?.length ?? 0) > 1
          const bMulti = (b.materials?.length ?? 0) > 1
          if (aMulti !== bMulti) return aMulti ? -1 : 1
          return (b.mvp ? 1 : 0) - (a.mvp ? 1 : 0)
        }
      }
    })
    return result
  }, [products, type, sort])

  return (
    <div>
      {/* Type chips + sort */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1" role="group" aria-label="Filter by type">
          {availableTypes.map(chip => (
            <button
              key={chip.value}
              onClick={() => setType(chip.value as ProductType | 'all')}
              role="radio"
              aria-checked={type === chip.value}
              className={[
                'shrink-0 px-3 py-1.5 text-[10px] tracking-[0.14em] uppercase whitespace-nowrap',
                "font-['DM_Sans'] transition-all duration-150 border",
                type === chip.value
                  ? 'text-[#090909]'
                  : 'border-[#D4AF77]/15 text-[#A89880] hover:border-[#A89880]/40 hover:text-[#F5EDD8]',
              ].join(' ')}
              style={type === chip.value ? { backgroundColor: accent, borderColor: accent } : undefined}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          aria-label="Sort products"
          className="bg-[#111] border border-[#D4AF77]/15 text-[#A89880]
            font-['DM_Sans'] text-[11px] tracking-[0.08em] uppercase px-3 py-2 outline-none cursor-pointer
            focus:border-[#D4AF77]/40 transition-colors"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <p className="text-[11px] tracking-[0.1em] uppercase text-[#5a4c3a] font-['DM_Sans'] mb-4">
        {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} variants={p.variants} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="font-['Cormorant_Garamond'] text-xl text-[#A89880] italic mb-2">Nothing here yet.</p>
          <p className="text-[11px] text-[#5a4c3a] font-['DM_Sans']">Try a different type filter.</p>
        </div>
      )}
    </div>
  )
}
