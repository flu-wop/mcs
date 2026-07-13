'use client'
// components/merch/ProductCard.tsx
// Renders one merch product in the grid or carousel.
// Includes JSON-LD Product schema for SEO, variant quick-select,
// and add-to-cart wired to CartProvider.

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { MerchProduct, PrintifyVariantDetail } from '@/lib/printify'
import { useCart } from './CartProvider'

// ─── Brand accent colours ─────────────────────────────────────────────────────

const BRAND_BORDER: Record<string, string> = {
  mcs:        'hover:border-[#D4AF77]/50',
  djm:        'hover:border-[#c8a45a]/50',
  streetbeat: 'hover:border-[#4a7acc]/50',
  squiggle:   'hover:border-[#1d9e75]/50',
}

const BRAND_TAG_COLOR: Record<string, string> = {
  mcs:        'text-[#D4AF77]  border-[#D4AF77]/20',
  djm:        'text-[#c8a45a]  border-[#c8a45a]/20',
  streetbeat: 'text-[#4a7acc]  border-[#4a7acc]/20',
  squiggle:   'text-[#1d9e75]  border-[#1d9e75]/20',
}

const BRAND_LABELS: Record<string, string> = {
  mcs:        'MCS',
  djm:        'DJM',
  streetbeat: 'SB',
  squiggle:   'LS',
}

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

function ProductSchema({ product }: { product: MerchProduct }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.thumbnailUrl,
    brand: {
      '@type': 'Brand',
      name: 'Mid City Sound Studios',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `https://midcitysound.com/merch/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'Mid City Sound Studios',
      },
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: MerchProduct
  variants?: PrintifyVariantDetail[]
  featured?: boolean          // larger card in carousel
  showSchema?: boolean        // only true for first visible cards (above fold)
}

export default function ProductCard({
  product,
  variants,
  featured = false,
  showSchema = false,
}: ProductCardProps) {
  const { addItem, openDrawer } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<PrintifyVariantDetail | null>(
    variants?.[0] ?? null
  )
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const borderClass = BRAND_BORDER[product.brand] ?? BRAND_BORDER.mcs
  const tagClass    = BRAND_TAG_COLOR[product.brand] ?? BRAND_TAG_COLOR.mcs

  // Group variants by size for quick-select — dedupe to one button per unique
  // size, not one per variant (a variant exists per color x size combo, so
  // without this a 9-color tee would render the same size 9 times over).
  const sizeVariants = (() => {
    const seen = new Set<string>()
    return (variants ?? []).filter(v => {
      const size = v.options.find(o => o.id === 'size' || o.id === 'sizes')?.value
      if (!size || seen.has(size)) return false
      seen.add(size)
      return true
    })
  })()

  const handleAddToCart = useCallback(() => {
    const variant = selectedVariant ?? variants?.[0]
    if (!variant) return

    addItem({
      variantId:    variant.variantId,
      productId:    product.id,
      slug:         product.slug,
      name:         product.name,
      variantName:  variant.name,
      brand:        product.brand,
      type:         product.type,
      price:        parseFloat(variant.retailPrice),
      quantity:     1,
      thumbnailUrl: variant.imageUrl || product.thumbnailUrl,
    })

    setAdded(true)
    openDrawer()
    setTimeout(() => setAdded(false), 2000)
  }, [addItem, openDrawer, product, selectedVariant, variants])

  return (
    <article
      className={[
        'group relative flex flex-col',
        'bg-[#111111] border border-[#D4AF77]/12',
        'transition-all duration-250',
        borderClass,
        'hover:-translate-y-0.5',
        featured ? 'md:col-span-1' : '',
      ].join(' ')}
      aria-label={product.name}
    >
      {showSchema && <ProductSchema product={product} />}

      {/* ── Image ──────────────────────────────────────────────────────── */}
      <Link
        href={`/merch/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-[#0d0d0d]"
      >
        {!imgError ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-103"
            sizes={featured
              ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
              : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            }
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-3xl opacity-20">◈</span>
            <span className="text-[9px] tracking-[0.16em] uppercase text-[#5a4c3a] font-['DM_Sans']">
              {product.type}
            </span>
          </div>
        )}

        {/* MVP badge */}
        {product.mvp && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#D4AF77] text-[#090909]
            text-[8px] font-['DM_Sans'] tracking-[0.12em] uppercase px-2 py-0.5 font-medium">
            Launch
          </span>
        )}

        {/* Brand tag */}
        <span className={`absolute top-2.5 right-2.5 z-10
          text-[8px] tracking-[0.1em] uppercase px-2 py-0.5
          font-['DM_Sans'] border bg-[#090909]/75 ${tagClass}`}>
          {BRAND_LABELS[product.brand] ?? product.brand.toUpperCase()}
        </span>
      </Link>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 border-t border-[#D4AF77]/08">

        {/* Name */}
        <Link href={`/merch/${product.slug}`} className="group/name">
          <h3 className={[
            'font-[\'Cormorant_Garamond\'] font-light text-[#F5EDD8]',
            'leading-tight mb-0.5',
            'group-hover/name:text-[#D4AF77] transition-colors',
            featured ? 'text-lg' : 'text-base',
          ].join(' ')}>
            {product.name}
          </h3>
        </Link>

        {/* Type */}
        <p className="text-[10px] tracking-[0.1em] uppercase text-[#5a4c3a]
          font-['DM_Sans'] mb-3">
          {product.type}
        </p>

        {/* Size quick-select: buttons for small sets (apparel S–5XL), a dropdown
            for anything larger (posters can have 20+ genuinely distinct sizes —
            rendering that many buttons on a compact card breaks the layout) */}
        {sizeVariants.length > 1 && (
          sizeVariants.length > 6 ? (
            <select
              aria-label="Select size"
              value={selectedVariant?.variantId ?? ''}
              onChange={(e) => {
                const v = sizeVariants.find(sv => sv.variantId === Number(e.target.value))
                if (v) setSelectedVariant(v)
              }}
              className="mb-3 w-full bg-[#0d0d0d] border border-[#D4AF77]/20 text-[#A89880]
                text-[10px] tracking-[0.08em] uppercase px-2 py-2 font-['DM_Sans']
                focus:outline-none focus:border-[#D4AF77]/50"
            >
              {sizeVariants.map(v => {
                const size = v.options.find(o => o.id === 'size' || o.id === 'sizes')?.value ?? v.name
                return (
                  <option key={v.variantId} value={v.variantId} className="bg-[#111111] text-[#F5EDD8]">
                    {size}
                  </option>
                )
              })}
            </select>
          ) : (
            <div className="flex flex-wrap gap-1 mb-3" role="group" aria-label="Select size">
              {sizeVariants.map(v => {
                const size = v.options.find(o => o.id === 'size' || o.id === 'sizes')?.value ?? v.name
                const isSelected = selectedVariant?.variantId === v.variantId
                return (
                  <button
                    key={v.variantId}
                    onClick={() => setSelectedVariant(v)}
                    aria-pressed={isSelected}
                    className={[
                      'text-[9px] tracking-[0.1em] uppercase px-2 py-1',
                      'font-[\'DM_Sans\'] border transition-colors min-w-[28px]',
                      isSelected
                        ? 'border-[#D4AF77]/60 text-[#D4AF77]'
                        : 'border-[#D4AF77]/12 text-[#5a4c3a] hover:border-[#A89880]/30 hover:text-[#A89880]',
                    ].join(' ')}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          )
        )}

        {/* Price + Add CTA */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="font-['Cormorant_Garamond'] text-[#D4AF77]
            text-lg leading-none">
            {product.priceFormatted || (
              selectedVariant
                ? `$${parseFloat(selectedVariant.retailPrice).toFixed(2)}`
                : '—'
            )}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!variants && !product.price}
            aria-label={`Add ${product.name} to cart`}
            className={[
              'text-[9px] tracking-[0.14em] uppercase px-3 py-2',
              'font-[\'DM_Sans\'] border transition-all duration-150',
              'min-w-[72px] min-h-[36px]',
              added
                ? 'border-[#D4AF77] text-[#D4AF77] bg-[#D4AF77]/08'
                : 'border-[#D4AF77]/20 text-[#A89880] hover:border-[#D4AF77]/60 hover:text-[#D4AF77]',
              (!variants && !product.price) ? 'opacity-30 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {added ? '✓ Added' : '+ Add'}
          </button>
        </div>
      </div>
    </article>
  )
}
