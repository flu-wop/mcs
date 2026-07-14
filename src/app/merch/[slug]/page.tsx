// app/merch/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProducts, type MerchProduct } from '@/lib/printify'
import ProductDetail from './ProductDetail'
import ProductCard from '@/components/merch/ProductCard'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function findProduct(slug: string) {
  const products = await getProducts()
  return products.find(p => p.slug === slug) ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await findProduct(slug)
  if (!product) return { title: 'Product Not Found | Mid City Sound Studios' }

  return {
    title: `${product.name} | Mid City Sound Studios`,
    description: `${product.name} — ${product.priceFormatted}. Shop official Mid City Sound Studios merch.`,
    openGraph: {
      title: product.name,
      images: product.thumbnailUrl ? [product.thumbnailUrl] : [],
    },
  }
}

// Same brand first, then same type, excluding the current product, capped at 4.
function getRelated(all: MerchProduct[], current: MerchProduct): MerchProduct[] {
  const pool = all.filter(p => p.id !== current.id)
  const sameBrand = pool.filter(p => p.brand === current.brand)
  const sameType  = pool.filter(p => p.type === current.type)

  const related: MerchProduct[] = []
  const seen = new Set<string>()
  for (const p of [...sameBrand, ...sameType]) {
    if (related.length >= 4) break
    if (seen.has(p.id)) continue
    seen.add(p.id)
    related.push(p)
  }
  return related
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const allProducts = await getProducts()
  const product = allProducts.find(p => p.slug === slug) ?? null

  if (!product) notFound()

  const related = getRelated(allProducts, product)

  return (
    <div className="min-h-screen bg-[#090909]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/merch"
          className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase
            text-[#5a4c3a] hover:text-[#D4AF77] transition-colors font-['DM_Sans'] mb-8"
        >
          ← All Products
        </Link>

        <ProductDetail product={product} />

        {related.length > 0 && (
          <section className="mt-20 pt-10 border-t border-[#D4AF77]/10">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF77] font-['DM_Sans'] mb-1">
              You May Also Like
            </p>
            <h2 className="font-['Cormorant_Garamond'] font-light text-[#F5EDD8] text-2xl mb-6">
              More from {product.brand === related[0]?.brand ? 'this brand' : 'the shop'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} variants={p.variants} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

