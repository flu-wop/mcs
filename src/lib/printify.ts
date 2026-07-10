// lib/printify.ts
// Printify API client for Mid City Sound Studios merch ecosystem.
// Replaces the old Printful-based client (lib/printful.ts, removed).

const BASE   = 'https://api.printify.com/v1'
const TOKEN  = process.env.PRINTIFY_API_TOKEN!
const SHOP_ID = process.env.PRINTIFY_SHOP_ID!

// ─── Types ────────────────────────────────────────────────────────────────────

export type Brand = 'mcs' | 'djm' | 'streetbeat' | 'squiggle'
export type ProductType = 'tee' | 'hoodie' | 'poster' | 'accessory' | 'mug' | 'sticker' | 'hat' | 'tote'

// Raw Printify shapes (subset of fields we actually use)
interface PrintifyImage {
  src: string
  variant_ids: number[]
  position: string
  is_default: boolean
}

interface PrintifyOptionValue {
  id: number
  title: string
}

interface PrintifyOption {
  name: string          // e.g. "Colors", "Sizes"
  type: string
  values: PrintifyOptionValue[]
}

interface PrintifyRawVariant {
  id: number
  sku: string
  cost: number
  price: number          // cents
  title: string          // e.g. "White / S"
  is_enabled: boolean
  is_available: boolean
  is_default: boolean
  options: number[]      // option-value ids, positional per product.options
}

interface PrintifyRawProduct {
  id: string
  title: string
  description: string
  tags: string[]
  options: PrintifyOption[]
  variants: PrintifyRawVariant[]
  images: PrintifyImage[]
  visible: boolean
  blueprint_id: number
}

// Enriched variant shape used by ProductCard etc.
export interface PrintifyVariantDetail {
  variantId: number
  productId: string
  name: string                // e.g. "White / S"
  retailPrice: string         // formatted dollar string, e.g. "36.00"
  sku: string
  isAvailable: boolean
  options: { id: string; value: string }[]   // e.g. [{id:'colors',value:'White'},{id:'sizes',value:'S'}]
  imageUrl: string
}

// Enriched product shape used across the app
export interface MerchProduct {
  id: string
  slug: string
  name: string                // clean display name (brand/type prefix stripped)
  rawName: string             // original Printify title
  brand: Brand
  type: ProductType
  thumbnailUrl: string
  price: number               // lowest enabled variant price as float
  priceFormatted: string      // "$36.00"
  variantCount: number
  mvp: boolean                // true for the 8 launch products
  variants?: PrintifyVariantDetail[]
}

export interface PrintifyOrderRecipient {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  country: string    // ISO 2-letter, e.g. "US"
  region: string      // state/province
  address1: string
  address2?: string
  city: string
  zip: string
}

export interface PrintifyOrderLineItem {
  product_id: string
  variant_id: number
  quantity: number
}

// ─── Brand / type parsing ─────────────────────────────────────────────────────

// Product titles follow the convention: "[brand:type] Display Name"
// e.g. "[djm:poster] Billboard #1" or "[mcs:hat] MCS Patch Hat"
// Falls back gracefully if the convention isn't followed.

const BRAND_PREFIXES: Record<string, Brand> = {
  djm: 'djm',
  streetbeat: 'streetbeat',
  sb: 'streetbeat',
  squiggle: 'squiggle',
  ls: 'squiggle',
  mcs: 'mcs',
}

const TYPE_KEYWORDS: Record<string, ProductType> = {
  tee: 'tee',
  't-shirt': 'tee',
  shirt: 'tee',
  hoodie: 'hoodie',
  sweatshirt: 'hoodie',
  crewneck: 'hoodie',
  poster: 'poster',
  print: 'poster',
  mug: 'mug',
  hat: 'hat',
  cap: 'hat',
  tote: 'tote',
  sticker: 'sticker',
}

// MVP product slugs — set these to match your actual product titles
// (slugified) after you publish the products in Printify.
const MVP_SLUGS = new Set([
  'nov-21-1987-tee',
  'billboard-1-poster',
  'second-line-tee',
  'blue-drummers-poster',
  'squiggle-character-tee',
  'era-sticker-pack',
  'mcs-logo-tee',
  'mcs-patch-hat',
])

function parseBrand(raw: string): Brand {
  const match = raw.match(/^\[([a-z]+)(?::[a-z]+)?\]/i)
  if (match) {
    const key = match[1].toLowerCase()
    return BRAND_PREFIXES[key] ?? 'mcs'
  }
  return 'mcs'
}

function parseType(raw: string): ProductType {
  const lower = raw.toLowerCase()
  for (const [keyword, type] of Object.entries(TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) return type
  }
  return 'accessory'
}

function cleanName(raw: string): string {
  return raw.replace(/^\[[^\]]+\]\s*/, '').trim()
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatPrice(cents: number): { price: number; formatted: string } {
  const price = cents / 100
  return { price, formatted: `$${price.toFixed(2)}` }
}

// Match a variant's option-value ids back to human-readable {id, value} pairs
// using the product-level options array (positional lookup).
function resolveVariantOptions(
  variant: PrintifyRawVariant,
  productOptions: PrintifyOption[]
): { id: string; value: string }[] {
  return productOptions
    .map(opt => {
      const valueId = variant.options.find(id =>
        opt.values.some(v => v.id === id)
      )
      const match = opt.values.find(v => v.id === valueId)
      if (!match) return null
      return { id: opt.name.toLowerCase(), value: match.title }
    })
    .filter((o): o is { id: string; value: string } => o !== null)
}

// Best-match image for a given variant (falls back to the default product image)
function resolveVariantImage(variantId: number, images: PrintifyImage[]): string {
  const match = images.find(img => img.variant_ids.includes(variantId))
  const fallback = images.find(img => img.is_default) ?? images[0]
  return (match ?? fallback)?.src ?? ''
}

function enrichVariant(v: PrintifyRawVariant, product: PrintifyRawProduct): PrintifyVariantDetail {
  const { formatted } = formatPrice(v.price)
  return {
    variantId: v.id,
    productId: product.id,
    name: v.title,
    retailPrice: formatted.replace('$', ''),
    sku: v.sku,
    isAvailable: v.is_enabled && v.is_available,
    options: resolveVariantOptions(v, product.options),
    imageUrl: resolveVariantImage(v.id, product.images),
  }
}

function enrichProduct(p: PrintifyRawProduct): MerchProduct {
  const brand = parseBrand(p.title)
  const type  = parseType(p.title)
  const name  = cleanName(p.title)
  const slug  = toSlug(name)
  const mvp   = MVP_SLUGS.has(slug)

  const enabledVariants = p.variants.filter(v => v.is_enabled && v.is_available)
  const prices = enabledVariants.map(v => v.price).filter(n => !isNaN(n))
  const lowestCents = prices.length > 0 ? Math.min(...prices) : 0
  const { price, formatted } = formatPrice(lowestCents)

  const defaultImage = p.images.find(img => img.is_default) ?? p.images[0]

  return {
    id: p.id,
    slug,
    name,
    rawName: p.title,
    brand,
    type,
    thumbnailUrl: defaultImage?.src ?? '',
    price,
    priceFormatted: formatted,
    variantCount: p.variants.length,
    mvp,
    variants: p.variants.map(v => enrichVariant(v, p)),
  }
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

async function pfGet(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    next: { revalidate: 3600 }, // ISR — re-fetch every hour
  })
  if (!res.ok) {
    throw new Error(`Printify GET ${path} failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function pfPost(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Printify POST ${path} failed: ${res.status} — ${detail}`)
  }
  return res.json()
}

// ─── Product fetching ─────────────────────────────────────────────────────────

// Fetch all published, visible products for the shop (with full variant + price detail —
// Printify's list endpoint already returns full variant data, unlike Printful's two-step fetch).
export async function getProducts(): Promise<MerchProduct[]> {
  const data = await pfGet(`/shops/${SHOP_ID}/products.json?limit=100`)
  const raw: PrintifyRawProduct[] = data.data ?? []

  return raw
    .filter(p => p.visible)
    .map(enrichProduct)
}

// Fetch one product by Printify product id
export async function getProduct(id: string): Promise<MerchProduct> {
  const raw: PrintifyRawProduct = await pfGet(`/shops/${SHOP_ID}/products/${id}.json`)
  return enrichProduct(raw)
}

// Kept for API-compatibility with existing callers — Printify's list endpoint
// already returns full variant/price data, so this is just an alias for getProducts().
export async function getProductsWithPrices(limit = 24): Promise<MerchProduct[]> {
  const products = await getProducts()
  return products.slice(0, limit)
}

// ─── Order creation (called from Stripe webhook only) ─────────────────────────

export async function createOrder(order: {
  recipient: PrintifyOrderRecipient
  items: PrintifyOrderLineItem[]
}): Promise<{ id: string; status: string }> {
  const data = await pfPost(`/shops/${SHOP_ID}/orders.json`, {
    line_items: order.items,
    shipping_method: 1,               // 1 = standard
    send_shipping_notification: true,
    address_to: order.recipient,
  })
  return { id: data.id, status: data.status }
}

// ─── Webhooks (register on boot or manually via dashboard) ───────────────────

export async function registerWebhook(url: string) {
  return pfPost(`/shops/${SHOP_ID}/webhooks.json`, {
    topic: 'order:sent-to-production',
    url,
  })
}
