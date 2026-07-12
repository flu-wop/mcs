// app/merch/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProducts } from '@/lib/printify'
import ProductDetail from './ProductDetail'

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

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await findProduct(slug)

  if (!product) notFound()

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
      </div>
    </div>
  )
}
