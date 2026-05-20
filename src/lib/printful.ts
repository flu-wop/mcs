// lib/printful.ts
// Printful API client for Mid City Sound Studios merch ecosystem.
// Uses v1 for sync product fetching (v2 sync products not yet available),
// v2 for order creation (flexible itemized flow).

const BASE_V1 = 'https://api.printful.com'
const BASE_V2 = 'https://api.printful.com/v2'
const TOKEN   = process.env.PRINTFUL_API_TOKEN!

// ─── Types ────────────────────────────────────────────────────────────────────

export type Brand = 'mcs' | 'djm' | 'streetbeat' | 'squiggle'
export type ProductType = 'tee' | 'hoodie' | 'poster' | 'accessory' | 'mug' | 'sticker' | 'hat' | 'tote'

export interface PrintfulVariant {
  id: number
  name: string                // e.g. "Black / M"
  retail_price: string        // e.g. "36.00"
  sku: string
  availability_status: string // "active" | "discontinued"
  options: { id: string; value: string }[]
  files: { type: string; preview_url: string }[]
}

export interface PrintfulSyncProduct {
  id: number
  external_id: string
  name: string                // raw name including brand prefix e.g. "[djm] Nov 21, 1987 Tee"
  thumbnail_url: string
  variants: number
  synced: number
  is_ignored: boolean
}

export interface PrintfulSyncVariantDetail {
  sync_variant_id: number
  external_id: string
  name: string
  synced: boolean
  variant_id: number
  retail_price: string
  sku: string
  currency: string
  product: { variant_id: number; product_id: number; image: string; name: string }
  files: { type: string; preview_url: string; thumbnail_url: string }[]
  options: { id: string; value: string }[]
  availability_status: string
}

// Enriched product shape used across the app
export interface MerchProduct {
  id: number
  slug: string
  name: string                // clean display name (prefix stripped)
  rawName: string             // original Printful name
  brand: Brand
  type: ProductType
  thumbnailUrl: string
  price: number               // lowest variant price as float
  priceFormatted: string      // "$36.00"
  variantCount: number
  synced: boolean
  mvp: boolean                // true for the 8 launch products
  variants?: PrintfulSyncVariantDetail[]
}

export interface PrintfulOrderRecipient {
  name: string
  address1: string
  address2?: string
  city: string
  state_code: string
  country_code: string
  zip: string
  email?: string
  phone?: string
}

export interface PrintfulOrderItem {
  sync_variant_id: number
  quantity: number
  retail_price?: string
}

export interface PrintfulOrder {
  recipient: PrintfulOrderRecipient
  items: PrintfulOrderItem[]
  retail_costs?: { shipping: string }
  gift?: { subject: string; message: string }
  confirm?: boolean           // set true to immediately submit to production
}

export interface ShippingRate {
  id: string
  name: string
  rate: string
  currency: string
  minDeliveryDays: number
  maxDeliveryDays: number
}

// ─── Brand / type parsing ─────────────────────────────────────────────────────

// Product names follow the convention: "[brand:type] Display Name"
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

// MVP product external IDs — set these to match your actual Printful external IDs
// after you create the products in the dashboard.
const MVP_EXTERNAL_IDS = new Set([
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

function formatPrice(raw: string | number): { price: number; formatted: string } {
  const price = typeof raw === 'string' ? parseFloat(raw) : raw
  return {
    price,
    formatted: `$${price.toFixed(2)}`,
  }
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

async function pfGet(path: string, base = BASE_V1) {
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    next: { revalidate: 3600 }, // ISR — re-fetch every hour
  })
  if (!res.ok) {
    throw new Error(`Printful GET ${path} failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function pfPost(path: string, body: unknown, base = BASE_V1) {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Printful POST ${path} failed: ${res.status} — ${detail}`)
  }
  return res.json()
}

// ─── Product fetching ─────────────────────────────────────────────────────────

// Fetch all store sync products (summary list, no variants)
export async function getProducts(): Promise<MerchProduct[]> {
  const data = await pfGet('/store/products')
  const raw: PrintfulSyncProduct[] = data.result ?? []

  return raw
    .filter(p => !p.is_ignored)
    .map(p => {
      const brand = parseBrand(p.name)
      const type  = parseType(p.name)
      const name  = cleanName(p.name)
      const slug  = p.external_id || toSlug(name)
      const mvp   = MVP_EXTERNAL_IDS.has(slug)

      return {
        id: p.id,
        slug,
        name,
        rawName: p.name,
        brand,
        type,
        thumbnailUrl: p.thumbnail_url,
        price: 0,             // populated by getProduct() when needed
        priceFormatted: '',
        variantCount: p.variants,
        synced: p.synced === p.variants,
        mvp,
      }
    })
}

// Fetch one product with full variant + price detail
export async function getProduct(id: number): Promise<MerchProduct & { variants: PrintfulSyncVariantDetail[] }> {
  const data = await pfGet(`/store/products/${id}`)
  const { sync_product, sync_variants } = data.result

  const brand = parseBrand(sync_product.name)
  const type  = parseType(sync_product.name)
  const name  = cleanName(sync_product.name)
  const slug  = sync_product.external_id || toSlug(name)

  // Use lowest retail price across variants as display price
  const prices = (sync_variants as PrintfulSyncVariantDetail[])
    .map(v => parseFloat(v.retail_price))
    .filter(p => !isNaN(p))
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0
  const { price, formatted } = formatPrice(lowestPrice)

  return {
    id: sync_product.id,
    slug,
    name,
    rawName: sync_product.name,
    brand,
    type,
    thumbnailUrl: sync_product.thumbnail_url,
    price,
    priceFormatted: formatted,
    variantCount: sync_product.variants,
    synced: sync_product.synced === sync_product.variants,
    mvp: MVP_EXTERNAL_IDS.has(slug),
    variants: sync_variants,
  }
}

// Fetch products with prices pre-populated (parallel detail fetches, cached)
// Call this from page.tsx with a limit to avoid hammering the rate limit on build.
export async function getProductsWithPrices(limit = 24): Promise<MerchProduct[]> {
  const summaries = await getProducts()
  const slice = summaries.slice(0, limit)

  const detailed = await Promise.allSettled(
    slice.map(p => getProduct(p.id))
  )

  return detailed.map((result, i) => {
    if (result.status === 'fulfilled') return result.value
    // Fall back to summary if detail fetch fails
    console.error(`Failed to fetch detail for product ${slice[i].id}:`, result.reason)
    return slice[i]
  })
}

// ─── Shipping ─────────────────────────────────────────────────────────────────

export async function getShippingRates(
  recipient: Omit<PrintfulOrderRecipient, 'name' | 'email' | 'phone'>,
  items: { sync_variant_id: number; quantity: number }[]
): Promise<ShippingRate[]> {
  const data = await pfPost('/shipping/rates', { recipient, items })
  return (data.result ?? []).map((r: {
    id: string
    name: string
    rate: string
    currency: string
    minDeliveryDays: number
    maxDeliveryDays: number
  }) => ({
    id: r.id,
    name: r.name,
    rate: r.rate,
    currency: r.currency,
    minDeliveryDays: r.minDeliveryDays,
    maxDeliveryDays: r.maxDeliveryDays,
  }))
}

// ─── Order creation (called from Stripe webhook only) ─────────────────────────

export async function createOrder(order: PrintfulOrder): Promise<{ id: number; status: string }> {
  // Use v2 for order creation (flexible itemized flow)
  const data = await pfPost('/orders', { ...order, confirm: true }, BASE_V2)
  return { id: data.data?.id ?? data.result?.id, status: data.data?.status ?? data.result?.status }
}

// ─── Webhooks (register on boot or manually via dashboard) ───────────────────

export async function registerWebhook(url: string) {
  return pfPost('/webhooks', {
    url,
    types: ['order_updated', 'order_created', 'shipment_sent'],
  })
}
