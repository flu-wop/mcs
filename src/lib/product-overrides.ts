// src/lib/product-overrides.ts
//
// Why this exists: brand/type used to be parsed entirely from a
// "[brand:type]" prefix in the Printify product title (e.g. "[djm:tee]").
// That's fragile — it depends on whoever renames a product in Printify
// remembering to keep the prefix, and it's already broken twice when
// products got renamed without it, silently defaulting every product to
// "mcs" and miscategorizing several as "accessory".
//
// This map is the fix: an explicit, permanent record of each product's
// real brand/type, keyed by Printify's own product ID (which never
// changes, unlike titles). enrichProduct() checks this FIRST. Title
// parsing still runs as a fallback for anything not listed here, so new
// products work immediately without a code change — but once a product
// is added here, renaming it in Printify can never break its category
// again.
//
// To add a new product: find its ID in the Printify dashboard URL when
// viewing the product (or pull /shops/{id}/products.json), then add a
// line below.

import type { Brand, ProductType } from './printify'

export const PRODUCT_OVERRIDES: Record<string, { brand: Brand; type: ProductType }> = {
  '6a553c87566692467d039225': { brand: 'mcs',        type: 'tee' },     // We Make Records Tee
  '6a552f66dea358be2a00bad0': { brand: 'squiggle',   type: 'sticker' }, // Lil Squiggle Stickers
  '6a45dce73f51befdc7058199': { brand: 'streetbeat', type: 'poster' },  // Drumming Below Sea Level Poster
  '6a45dbe7b3b24691aa0e14ed': { brand: 'streetbeat', type: 'tee' },     // Street Beat Pocket Tee
  '6a448d4b837faa324c0d5183': { brand: 'streetbeat', type: 'tee' },     // Street Beat Drumming Tee
  '6a3c9d3de636356ebe0d0e8b': { brand: 'squiggle',   type: 'tee' },     // Lil Squiggle Bape Tee
  '6a36280441155d651f090328': { brand: 'djm',        type: 'poster' },  // Billboard Poster
  '6a36226b93a2ad63ed0218cc': { brand: 'djm',        type: 'tee' },     // Billboard #1 Tee
  '6a3453a19a5c0f7d880f1432': { brand: 'mcs',        type: 'sticker' }, // Mid City Sound Wave Sticker
  '6a3452b59a5c0f7d880f1392': { brand: 'mcs',        type: 'sticker' }, // Mid City Sound Moon Wave Sticker
  '6a337c05dcbc8455730f0dc9': { brand: 'djm',        type: 'tee' },     // Time of My Life '87
  '6a3368c9834c7859a6004ec6': { brand: 'mcs',        type: 'tee' },     // Mid City Sound Moon Wave Tee
  '6a32c0c3eea21a0dbd05c69a': { brand: 'mcs',        type: 'hat' },     // Mid City Sound Patch Hat
  '6a2ddd5c73ad2eacae0f16ad': { brand: 'mcs',        type: 'mug' },     // Mid City Sound Crescent Mug
  '6a2c6cc8a4bf9acfe901c035': { brand: 'mcs',        type: 'tee' },     // Mid City Sound Wave Tee
  '6a2c6b22aa0cfe0a810b8f90': { brand: 'mcs',        type: 'tee' },     // Mid City Sound Crescent Wave Tee
}

// ─── Image position overrides ───────────────────────────────────────────────
//
// Printify returns every mockup image for a variant (front, back, context
// shots) with no guaranteed order — resolveVariantImage() picks whichever
// comes first, which in practice is "front". That's wrong for a design
// that's only printed on the back: the front mockup is blank, so the site
// shows a shirt with no design at all until this is set.
//
// This only fixes which image the SITE shows. It does nothing about which
// mockups are actually selected in Printify's Mockup Library — if no
// "Back" mockup was checked there for a product, no image with
// position: "back" will ever come back from the API, and this override
// has nothing to prefer. Check the mockup selection in Printify's
// dashboard first (Mockup Library → that product → make sure a Back
// angle is checked, not just Front colors), then list the product here.
//
// Printify's `position` values are typically "front", "back", "left",
// "right", "context", etc. — check the actual value returned for a given
// product if unsure (log `product.images` once) rather than assuming.
export const IMAGE_POSITION_OVERRIDES: Record<string, string> = {
  '6a553c87566692467d039225': 'back', // We Make Records Tee (BACK ONLY)
}


//
// The product detail page normally shows one thumbnail per available
// size/finish combo, deduped by image — the right default for most
// multi-variant products. Some products just don't need that (visually
// near-identical mockups across sizes); this lets a specific product show
// a single curated image instead, keyed by product ID same as above.
export const GALLERY_OVERRIDES: Record<string, string[]> = {
  // Billboard Poster — was showing 4 near-identical size mockups; only the
  // 60" x 40" Matte shot is needed.
  '6a36280441155d651f090328': [
    'https://images-api.printify.com/mockup/6a36280441155d651f090328/99146/92793/billboard-poster.jpg?camera_label=front',
  ],
  // Drumming Below Sea Level Poster (Streetbeat) — only the first image needed.
  '6a45dce73f51befdc7058199': [
    'https://images-api.printify.com/mockup/6a45dce73f51befdc7058199/75293/22727/drumming-below-sea-level-poster.jpg?camera_label=context-2',
  ],
}
