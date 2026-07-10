'use client'
// components/merch/FilterBar.tsx
// Search + brand/type filter chips + sort dropdown.
// Mobile: chips scroll horizontally in a snap container.
// Reads/writes URL search params so filters survive page refresh and are shareable.

import { useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Brand, ProductType } from '@/lib/printify'

// ─── Types ───────────────────────────────────────────────────────────────────

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name'

export interface FilterState {
  brand: Brand | 'all'
  type: ProductType | 'all'
  search: string
  sort: SortOption
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BRAND_CHIPS: { value: Brand | 'all'; label: string }[] = [
  { value: 'all',        label: 'All Brands'       },
  { value: 'mcs',        label: 'MCS Studio'        },
  { value: 'djm',        label: 'Donald Markowitz'  },
  { value: 'streetbeat', label: 'Street Beat'       },
  { value: 'squiggle',   label: 'Lil Squiggle'      },
]

const TYPE_CHIPS: { value: ProductType | 'all'; label: string }[] = [
  { value: 'all',       label: 'All Types'   },
  { value: 'tee',       label: 'Tees'        },
  { value: 'hoodie',    label: 'Hoodies'     },
  { value: 'poster',    label: 'Posters'     },
  { value: 'accessory', label: 'Accessories' },
  { value: 'mug',       label: 'Mugs'        },
  { value: 'hat',       label: 'Hats'        },
  { value: 'tote',      label: 'Totes'       },
  { value: 'sticker',   label: 'Stickers'    },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured',   label: 'Featured'          },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'name',       label: 'Name A–Z'          },
]

// ─── Hook — read filter state from URL params ─────────────────────────────────

export function useFilterState(): FilterState {
  const params = useSearchParams()
  return {
    brand:  (params.get('brand')  as Brand | 'all')       ?? 'all',
    type:   (params.get('type')   as ProductType | 'all') ?? 'all',
    search: params.get('search') ?? '',
    sort:   (params.get('sort')   as SortOption)          ?? 'featured',
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  resultCount?: number
  className?: string
}

export default function FilterBar({ resultCount, className = '' }: FilterBarProps) {
  const router    = useRouter()
  const pathname  = usePathname()
  const params    = useSearchParams()
  const filters   = useFilterState()
  const [, startTransition] = useTransition()

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value === 'all' || value === '' || value === 'featured') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      // Reset to page 1 on any filter change
      next.delete('page')
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`, { scroll: false })
      })
    },
    [params, pathname, router]
  )

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }, [pathname, router])

  const hasActiveFilters =
    filters.brand !== 'all' ||
    filters.type  !== 'all' ||
    filters.search !== ''  ||
    filters.sort !== 'featured'

  return (
    <div className={`border-b border-[#D4AF77]/10 bg-[#090909] ${className}`}>

      {/* ── Row 1: Search + Sort ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 sm:px-10 pt-5 pb-3">

        {/* Search */}
        <label className="relative flex-1 max-w-xs" htmlFor="merch-search">
          <span className="sr-only">Search products</span>
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89880]"
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            id="merch-search"
            type="search"
            value={filters.search}
            onChange={e => update('search', e.target.value)}
            placeholder="Search products…"
            className={[
              'w-full bg-[#111] border border-[#D4AF77]/15 text-[#F5EDD8]',
              'font-[\'DM_Sans\'] text-[13px] tracking-wide',
              'pl-9 pr-4 py-2.5 outline-none',
              'placeholder:text-[#A89880]/60',
              'focus:border-[#D4AF77]/50 transition-colors',
            ].join(' ')}
          />
        </label>

        {/* Result count — hidden on mobile */}
        {resultCount !== undefined && (
          <span className="hidden sm:block text-[11px] tracking-[0.1em] uppercase text-[#5a4c3a] font-['DM_Sans'] whitespace-nowrap">
            {resultCount} {resultCount === 1 ? 'product' : 'products'}
          </span>
        )}

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={e => update('sort', e.target.value)}
          aria-label="Sort products"
          className={[
            'ml-auto bg-[#111] border border-[#D4AF77]/15 text-[#A89880]',
            'font-[\'DM_Sans\'] text-[11px] tracking-[0.08em] uppercase',
            'px-3 py-2.5 outline-none cursor-pointer',
            'focus:border-[#D4AF77]/40 transition-colors',
          ].join(' ')}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Row 2: Brand chips ───────────────────────────────────────────── */}
      <div
        className="flex gap-2 overflow-x-auto px-6 sm:px-10 pb-3 scrollbar-hide snap-x"
        role="group"
        aria-label="Filter by brand"
      >
        {BRAND_CHIPS.map(chip => (
          <Chip
            key={chip.value}
            label={chip.label}
            active={filters.brand === chip.value}
            onClick={() => update('brand', chip.value)}
          />
        ))}
      </div>

      {/* ── Row 3: Type chips ────────────────────────────────────────────── */}
      <div
        className="flex gap-2 overflow-x-auto px-6 sm:px-10 pb-4 scrollbar-hide snap-x"
        role="group"
        aria-label="Filter by product type"
      >
        {TYPE_CHIPS.map(chip => (
          <Chip
            key={chip.value}
            label={chip.label}
            active={filters.type === chip.value}
            onClick={() => update('type', chip.value)}
          />
        ))}

        {/* Clear all — only visible when filters are active */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className={[
              'shrink-0 snap-start px-3 py-1.5',
              'text-[10px] tracking-[0.14em] uppercase whitespace-nowrap',
              'font-[\'DM_Sans\'] text-[#A89880]',
              'border border-[#A89880]/20 hover:border-[#A89880]/50',
              'transition-colors',
            ].join(' ')}
          >
            Clear all ×
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      role="radio"
      aria-checked={active}
      className={[
        'shrink-0 snap-start px-3 py-1.5',
        'text-[10px] tracking-[0.14em] uppercase whitespace-nowrap',
        'font-[\'DM_Sans\'] transition-all duration-150',
        'min-h-[36px]', // 44px tap target via line-height + padding
        active
          ? 'border border-[#D4AF77] text-[#D4AF77] bg-[#D4AF77]/08'
          : 'border border-[#D4AF77]/15 text-[#A89880] hover:border-[#A89880]/40 hover:text-[#F5EDD8]',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
