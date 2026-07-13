'use client'
// app/merch/[slug]/ProductDetail.tsx

import { useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import type { MerchProduct, PrintifyVariantDetail } from '@/lib/printify'
import { useCart } from '@/components/merch/CartProvider'

const BRAND_LABELS: Record<string, string> = {
  mcs: 'Mid City Sound', djm: 'Donald Markowitz', streetbeat: 'Streetbeat', squiggle: 'Lil Squiggle',
}
const BRAND_TAG_COLOR: Record<string, string> = {
  mcs:        'text-[#D4AF77] border-[#D4AF77]/20',
  djm:        'text-[#c8a45a] border-[#c8a45a]/20',
  streetbeat: 'text-[#4a7acc] border-[#4a7acc]/20',
  squiggle:   'text-[#1d9e75] border-[#1d9e75]/20',
}

function optionValue(v: PrintifyVariantDetail, key: string) {
  return v.options.find(o => o.id === key || o.id === `${key}s`)?.value
}

export default function ProductDetail({ product }: { product: MerchProduct }) {
  const { addItem, openDrawer } = useCart()
  const variants = useMemo(
    () => (product.variants ?? []).filter(v => v.isAvailable),
    [product.variants]
  )

  const sizes  = useMemo(() => {
    const seen = new Set<string>()
    return variants
      .map(v => optionValue(v, 'size'))
      .filter((s): s is string => !!s && !seen.has(s) && (seen.add(s), true))
  }, [variants])

  const colors = useMemo(() => {
    const seen = new Set<string>()
    return variants
      .map(v => optionValue(v, 'color'))
      .filter((c): c is string => !!c && !seen.has(c) && (seen.add(c), true))
  }, [variants])

  // One representative thumbnail per color — this is what the gallery renders
  // when the product has color variants, so clicking a picture *is* the color picker.
  const colorThumbs = useMemo(() => {
    return colors.map(color => {
      const match = variants.find(v => optionValue(v, 'color') === color && v.imageUrl)
      return { color, url: match?.imageUrl || product.thumbnailUrl }
    })
  }, [colors, variants, product.thumbnailUrl])

  // Fallback gallery for products with no color variants at all (e.g. posters, stickers) —
  // just cycles through whatever distinct images exist.
  const plainGallery = useMemo(() => {
    const urls = Array.from(new Set(variants.map(v => v.imageUrl).filter(Boolean)))
    return urls.length ? urls : [product.thumbnailUrl]
  }, [variants, product.thumbnailUrl])

  const [selectedSize, setSelectedSize]   = useState<string | undefined>(sizes[0])
  const [selectedColor, setSelectedColor] = useState<string | undefined>(colors[0])
  const [activeImage, setActiveImage]     = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const selectedVariant = useMemo(() => {
    return variants.find(v =>
      (!sizes.length  || optionValue(v, 'size')  === selectedSize) &&
      (!colors.length || optionValue(v, 'color') === selectedColor)
    ) ?? variants[0]
  }, [variants, sizes, colors, selectedSize, selectedColor])

  const displayImage = colors.length > 1
    ? (colorThumbs.find(t => t.color === selectedColor)?.url ?? product.thumbnailUrl)
    : (plainGallery[activeImage] ?? product.thumbnailUrl)

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant) return
    addItem({
      variantId:    selectedVariant.variantId,
      productId:    product.id,
      slug:         product.slug,
      name:         product.name,
      variantName:  selectedVariant.name,
      brand:        product.brand,
      type:         product.type,
      price:        parseFloat(selectedVariant.retailPrice),
      quantity:     qty,
      thumbnailUrl: selectedVariant.imageUrl || product.thumbnailUrl,
    })
    setAdded(true)
    openDrawer()
    setTimeout(() => setAdded(false), 2000)
  }, [addItem, openDrawer, product, selectedVariant, qty])

  const tagClass = BRAND_TAG_COLOR[product.brand] ?? BRAND_TAG_COLOR.mcs
  const price = selectedVariant ? parseFloat(selectedVariant.retailPrice) : product.price

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* ── Gallery ─────────────────────────────────────────────────────── */}
      <div>
        <div className="relative aspect-square bg-[#111111] border border-[#D4AF77]/12 overflow-hidden">
          {!imgError && displayImage ? (
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="text-5xl opacity-20">◈</span>
              <span className="text-[10px] tracking-[0.16em] uppercase text-[#5a4c3a] font-['DM_Sans']">
                {product.type}
              </span>
            </div>
          )}
        </div>

        {/* Thumbnails double as the color picker when the product has colors */}
        {colors.length > 1 ? (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1" role="group" aria-label="Select color">
            {colorThumbs.map(({ color, url }) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                aria-pressed={selectedColor === color}
                aria-label={color}
                title={color}
                className={[
                  'relative w-16 h-16 shrink-0 border overflow-hidden bg-[#111111] transition-colors',
                  selectedColor === color ? 'border-[#D4AF77]/70' : 'border-[#D4AF77]/12 hover:border-[#A89880]/40',
                ].join(' ')}
              >
                <Image src={url} alt={color} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        ) : plainGallery.length > 1 ? (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {plainGallery.map((url, i) => (
              <button
                key={url + i}
                onClick={() => setActiveImage(i)}
                className={[
                  'relative w-16 h-16 shrink-0 border overflow-hidden bg-[#111111]',
                  activeImage === i ? 'border-[#D4AF77]/70' : 'border-[#D4AF77]/12',
                ].join(' ')}
              >
                <Image src={url} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        ) : null}

        {colors.length > 1 && selectedColor && (
          <p className="text-[10px] tracking-[0.1em] uppercase text-[#5a4c3a] font-['DM_Sans'] mt-2">
            {selectedColor}
          </p>
        )}
      </div>

      {/* ── Details ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col">
        <span className={`inline-block w-fit text-[9px] tracking-[0.12em] uppercase
          px-2 py-0.5 border font-['DM_Sans'] mb-3 ${tagClass}`}>
          {BRAND_LABELS[product.brand] ?? product.brand}
        </span>

        <h1 className="font-['Cormorant_Garamond'] font-light text-[#F5EDD8] text-3xl sm:text-4xl leading-tight mb-2">
          {product.name}
        </h1>

        <p className="text-[10px] tracking-[0.14em] uppercase text-[#5a4c3a] font-['DM_Sans'] mb-4">
          {product.type}
        </p>

        <span className="font-['Cormorant_Garamond'] text-[#D4AF77] text-2xl mb-6">
          ${price.toFixed(2)}
        </span>

        {/* Size select */}
        {sizes.length > 1 && (
          <div className="mb-6">
            <p className="text-[9px] tracking-[0.14em] uppercase text-[#5a4c3a] font-['DM_Sans'] mb-2">
              Size
            </p>
            {sizes.length > 10 ? (
              <select
                aria-label="Select size"
                value={selectedSize ?? ''}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#D4AF77]/20 text-[#A89880]
                  text-[11px] tracking-[0.08em] uppercase px-3 py-2.5 font-['DM_Sans']
                  focus:outline-none focus:border-[#D4AF77]/50"
              >
                {sizes.map(s => (
                  <option key={s} value={s} className="bg-[#111111] text-[#F5EDD8]">{s}</option>
                ))}
              </select>
            ) : (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select size">
                {sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    aria-pressed={selectedSize === s}
                    className={[
                      'text-[9px] tracking-[0.1em] uppercase px-3 py-1.5 min-w-[36px]',
                      "font-['DM_Sans'] border transition-colors",
                      selectedSize === s
                        ? 'border-[#D4AF77]/60 text-[#D4AF77]'
                        : 'border-[#D4AF77]/12 text-[#5a4c3a] hover:border-[#A89880]/30 hover:text-[#A89880]',
                    ].join(' ')}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Qty + Add to cart */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center border border-[#D4AF77]/20">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-9 h-9 text-[#A89880] hover:text-[#D4AF77] transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center text-[#F5EDD8] font-['DM_Sans'] text-sm">{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              aria-label="Increase quantity"
              className="w-9 h-9 text-[#A89880] hover:text-[#D4AF77] transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant}
            className={[
              'flex-1 text-[10px] tracking-[0.14em] uppercase px-4 py-3',
              "font-['DM_Sans'] border transition-all duration-150",
              added
                ? 'border-[#D4AF77] text-[#D4AF77] bg-[#D4AF77]/08'
                : 'border-[#D4AF77]/30 text-[#D4AF77] hover:bg-[#D4AF77]/08',
              !selectedVariant ? 'opacity-30 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {added ? '✓ Added to Cart' : 'Add to Cart'}
          </button>
        </div>

        {/* Description */}
        {product.description && (
          <div
            className="prose-mcs text-sm text-[#A89880] font-['DM_Sans'] leading-relaxed
              [&_p]:mb-2 border-t border-[#D4AF77]/10 pt-6"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}
      </div>
    </div>
  )
}
