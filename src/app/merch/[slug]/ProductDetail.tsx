'use client'
// app/merch/[slug]/ProductDetail.tsx

import { useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import type { MerchProduct } from '@/lib/printify'
import { useCart } from '@/components/merch/CartProvider'
import { sortSizes, defaultSize, optionValue } from '@/lib/sizes'
import { GALLERY_OVERRIDES } from '@/lib/product-overrides'
import { colorHex, isLightColor } from '@/lib/color-swatches'

const BRAND_LABELS: Record<string, string> = {
  mcs: 'Mid City Sound', djm: 'Donald Markowitz', streetbeat: 'Streetbeat', squiggle: 'Lil Squiggle',
}
const BRAND_TAG_COLOR: Record<string, string> = {
  mcs:        'text-[#D4AF77] border-[#D4AF77]/20',
  djm:        'text-[#c8a45a] border-[#c8a45a]/20',
  streetbeat: 'text-[#4a7acc] border-[#4a7acc]/20',
  squiggle:   'text-[#1d9e75] border-[#1d9e75]/20',
}

export default function ProductDetail({ product }: { product: MerchProduct }) {
  const { addItem, openDrawer } = useCart()

  // Material selection — only relevant for products in a material group
  // (see lib/material-groups.ts). Defaults to materials[0], same anchor
  // material the page's own metadata/price was generated from server-side.
  const hasMaterials = (product.materials?.length ?? 0) > 1
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0)
  const activeMaterial = hasMaterials ? product.materials![selectedMaterialIdx] : null
  const activeProductId = activeMaterial?.productId ?? product.id

  // Keep ALL variants, not just available ones — out-of-stock sizes/colors
  // should show up disabled, not vanish, so people know an option exists.
  const variants = useMemo(
    () => activeMaterial?.variants ?? product.variants ?? [],
    [activeMaterial, product.variants]
  )

  const sizes  = useMemo(() => {
    const seen = new Set<string>()
    const unsorted = variants
      .map(v => optionValue(v, 'size'))
      .filter((s): s is string => !!s && !seen.has(s) && (seen.add(s), true))
    return sortSizes(unsorted, s => s)
  }, [variants])

  const availableSizes = useMemo(() => {
    const seen = new Set<string>()
    const unsorted = variants
      .filter(v => v.isAvailable)
      .map(v => optionValue(v, 'size'))
      .filter((s): s is string => !!s && !seen.has(s) && (seen.add(s), true))
    return sortSizes(unsorted, s => s)
  }, [variants])

  const colors = useMemo(() => {
    const seen = new Set<string>()
    return variants
      .filter(v => v.isAvailable)
      .map(v => optionValue(v, 'color'))
      .filter((c): c is string => !!c && !seen.has(c) && (seen.add(c), true))
  }, [variants])

  // One entry per color, carrying every image position Printify returned
  // for that color (front, back, etc.) — not just one representative photo.
  const colorInfo = useMemo(() => {
    return colors.map(color => {
      const colorVariants = variants.filter(v => optionValue(v, 'color') === color)
      const withImages = colorVariants.find(v => Object.keys(v.imagesByPosition).length > 0) ?? colorVariants[0]
      return {
        color,
        images: withImages?.imagesByPosition ?? {},
        available: colorVariants.some(v => v.isAvailable),
      }
    })
  }, [colors, variants])

  // Fallback gallery for products with no color variants at all (e.g. posters, stickers) —
  // just cycles through whatever distinct images exist, unless a specific product has
  // a curated override (see GALLERY_OVERRIDES).
  const plainGallery = useMemo(() => {
    const override = GALLERY_OVERRIDES[product.id]
    if (override?.length) return override
    const urls = Array.from(new Set(variants.map(v => v.imageUrl).filter(Boolean)))
    return urls.length ? urls : [product.thumbnailUrl]
  }, [variants, product.thumbnailUrl, product.id])

  const [selectedSize, setSelectedSize]   = useState<string | undefined>(
    sizes.length > 10 ? undefined : defaultSize(availableSizes.length ? availableSizes : sizes)
  )
  const [selectedColor, setSelectedColor] = useState<string | undefined>(colors[0])
  const [activeImage, setActiveImage]     = useState(0)
  const [activeSide, setActiveSide]       = useState<string | undefined>(undefined)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Switching material changes the whole variant set (a different Printify
  // product), so a color/size/gallery position picked for Heavyweight has
  // no meaning on Classic Cotton — reset gallery + selections to that
  // material's own defaults rather than carrying over a stale selection.
  const handleMaterialChange = useCallback((idx: number) => {
    setSelectedMaterialIdx(idx)
    const nextVariants = product.materials?.[idx]?.variants ?? []

    const seenSize = new Set<string>()
    const nextSizes = sortSizes(
      nextVariants
        .map(v => optionValue(v, 'size'))
        .filter((s): s is string => !!s && !seenSize.has(s) && (seenSize.add(s), true)),
      s => s
    )
    const seenAvailSize = new Set<string>()
    const nextAvailableSizes = sortSizes(
      nextVariants
        .filter(v => v.isAvailable)
        .map(v => optionValue(v, 'size'))
        .filter((s): s is string => !!s && !seenAvailSize.has(s) && (seenAvailSize.add(s), true)),
      s => s
    )
    const seenColor = new Set<string>()
    const nextColors = nextVariants
      .filter(v => v.isAvailable)
      .map(v => optionValue(v, 'color'))
      .filter((c): c is string => !!c && !seenColor.has(c) && (seenColor.add(c), true))

    setSelectedSize(nextSizes.length > 10 ? undefined : defaultSize(nextAvailableSizes.length ? nextAvailableSizes : nextSizes))
    setSelectedColor(nextColors[0])
    setActiveImage(0)
    setActiveSide(undefined)
  }, [product.materials])

  const currentColorImages = colorInfo.find(c => c.color === selectedColor)?.images ?? {}
  // Prefer 'front' as the default side shown, but fall back to whatever
  // position actually exists (a back-only product has no front image).
  const sides = Object.keys(currentColorImages)
  const resolvedSide = activeSide && currentColorImages[activeSide] ? activeSide
    : currentColorImages.front ? 'front'
    : sides[0]

  const isSizeAvailable = useCallback((size: string) => {
    return variants.some(v =>
      optionValue(v, 'size') === size &&
      (!colors.length || optionValue(v, 'color') === selectedColor) &&
      v.isAvailable
    )
  }, [variants, colors, selectedColor])

  const selectedVariant = useMemo(() => {
    const match = variants.find(v =>
      (!sizes.length  || optionValue(v, 'size')  === selectedSize) &&
      (!colors.length || optionValue(v, 'color') === selectedColor)
    )
    if (match) return match
    // Dropdown case (10+ sizes) requires an explicit pick — don't silently
    // fall back to some arbitrary size just because nothing matched yet.
    if (sizes.length > 10 && !selectedSize) return undefined
    return variants[0]
  }, [variants, sizes, colors, selectedSize, selectedColor])

  const canAddToCart = !!selectedVariant?.isAvailable

  const displayImage = colors.length > 1
    ? (currentColorImages[resolvedSide ?? ''] ?? product.thumbnailUrl)
    : (plainGallery[activeImage] ?? product.thumbnailUrl)

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant || !selectedVariant.isAvailable) return
    addItem({
      variantId:    selectedVariant.variantId,
      productId:    activeProductId,
      slug:         product.slug,
      name:         activeMaterial ? `${product.name} — ${activeMaterial.material}` : product.name,
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
  }, [addItem, openDrawer, product, selectedVariant, qty, activeProductId, activeMaterial])

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
              alt={`${product.name}${resolvedSide ? ` — ${resolvedSide}` : ''}`}
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

        {/* Front / Back toggle — only shown when a color actually has both */}
        {colors.length > 0 && sides.length > 1 && (
          <div className="flex gap-2 mt-3" role="group" aria-label="Select photo side">
            {sides.map(side => (
              <button
                key={side}
                onClick={() => setActiveSide(side)}
                aria-pressed={resolvedSide === side}
                className={[
                  'px-3 py-1.5 text-[9px] tracking-[0.14em] uppercase',
                  "font-['DM_Sans'] border transition-colors capitalize",
                  resolvedSide === side
                    ? 'border-[#D4AF77]/60 text-[#D4AF77]'
                    : 'border-[#D4AF77]/12 text-[#5a4c3a] hover:border-[#A89880]/30 hover:text-[#A89880]',
                ].join(' ')}
              >
                {side}
              </button>
            ))}
          </div>
        )}

        {/* Non-color products (posters, stickers) still use a plain thumbnail strip */}
        {colors.length === 0 && plainGallery.length > 1 && (
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
        )}

        {/* Color swatches — compact grid, wraps instead of scrolling */}
        {colors.length > 1 && (
          <div className="mt-4" role="group" aria-label="Select color">
            <div className="flex flex-wrap gap-2">
              {colorInfo.map(({ color, available }) => {
                const hex = colorHex(color)
                const light = isLightColor(color)
                const selected = selectedColor === color
                return (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setActiveSide(undefined) }}
                    disabled={!available}
                    aria-pressed={selected}
                    aria-label={color}
                    title={available ? color : `${color} (sold out)`}
                    className={[
                      'relative w-8 h-8 rounded-full transition-all',
                      light ? 'border border-[#3a3a3a]/40' : 'border border-transparent',
                      selected ? 'ring-2 ring-[#D4AF77] ring-offset-2 ring-offset-[#0d0d0d]' : '',
                      !available ? 'opacity-25 cursor-not-allowed' : 'hover:scale-110',
                    ].join(' ')}
                    style={{ backgroundColor: hex }}
                  >
                    {!available && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] text-[#F5EDD8]">✕</span>
                    )}
                  </button>
                )
              })}
            </div>
            {selectedColor && (
              <p className="text-[10px] tracking-[0.1em] uppercase text-[#5a4c3a] font-['DM_Sans'] mt-2">
                {selectedColor}
              </p>
            )}
          </div>
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

        {product.brand === 'mcs' && (
          <a
            href="https://dahiddengem.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 w-fit text-[10px] tracking-[0.1em] uppercase
              text-[#5a4c3a] hover:text-[#D4AF77] font-['DM_Sans'] transition-colors mb-4 -mt-2"
          >
            Designed by <span className="text-[#A89880] group-hover:text-[#D4AF77] transition-colors">Hidden Gem</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}

        <div className="flex items-center gap-3 mb-6">
          <span className="font-['Cormorant_Garamond'] text-[#D4AF77] text-2xl">
            ${price.toFixed(2)}
          </span>
          {!(activeMaterial?.inStock ?? product.inStock) && (
            <span className="text-[9px] tracking-[0.12em] uppercase px-2 py-0.5
              border border-[#A89880]/30 text-[#A89880] font-['DM_Sans']">
              Sold Out
            </span>
          )}
        </div>

        {/* Material select — only rendered for products with more than one
            blank (see lib/material-groups.ts). Sits above Size since
            picking it determines which product's sizes/colors/price apply. */}
        {hasMaterials && (
          <div className="mb-6">
            <p className="text-[9px] tracking-[0.14em] uppercase text-[#5a4c3a] font-['DM_Sans'] mb-2">
              Material
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select material">
              {product.materials!.map((m, idx) => (
                <button
                  key={m.productId}
                  onClick={() => handleMaterialChange(idx)}
                  aria-pressed={selectedMaterialIdx === idx}
                  className={[
                    'text-[9px] tracking-[0.1em] uppercase px-3 py-1.5',
                    "font-['DM_Sans'] border transition-colors",
                    selectedMaterialIdx === idx
                      ? 'border-[#D4AF77]/60 text-[#D4AF77]'
                      : 'border-[#D4AF77]/12 text-[#5a4c3a] hover:border-[#A89880]/30 hover:text-[#A89880]',
                  ].join(' ')}
                >
                  {m.material} · {m.priceFormatted}
                </button>
              ))}
            </div>
          </div>
        )}

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
                <option value="" disabled className="bg-[#111111] text-[#5a4c3a]">
                  Select a size
                </option>
                {availableSizes.map(s => (
                  <option key={s} value={s} className="bg-[#111111] text-[#F5EDD8]">
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select size">
                {sizes.filter(isSizeAvailable).map(s => (
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
            disabled={!canAddToCart}
            className={[
              'flex-1 text-[10px] tracking-[0.14em] uppercase px-4 py-3',
              "font-['DM_Sans'] border transition-all duration-150",
              added
                ? 'border-[#D4AF77] text-[#D4AF77] bg-[#D4AF77]/08'
                : 'border-[#D4AF77]/30 text-[#D4AF77] hover:bg-[#D4AF77]/08',
              !canAddToCart ? 'opacity-30 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {added ? '✓ Added to Cart' : canAddToCart ? 'Add to Cart' : (sizes.length > 10 && !selectedSize) ? 'Select a Size' : 'Out of Stock'}
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
