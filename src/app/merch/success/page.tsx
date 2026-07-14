'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/components/merch/CartProvider'

function SuccessContent() {
  const params    = useSearchParams()
  const sessionId = params.get('session_id')
  const [cleared, setCleared] = useState(false)
  const { clear } = useCart()

  useEffect(() => {
    if (!cleared) {
      clear()
      setCleared(true)
    }
  }, [cleared, clear])

  return (
    <main className="min-h-screen bg-[#090909] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 border border-[#D4AF77]/30 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#D4AF77" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <p className="text-[10px] tracking-[0.22em] uppercase text-[#D4AF77] font-['DM_Sans'] mb-4">
          Mid City Sound Studios
        </p>
        <h1 className="font-['Cormorant_Garamond'] font-light text-[#F5EDD8] mb-4"
          style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          Order confirmed.
        </h1>
        <p className="text-[13px] text-[#A89880] font-['DM_Sans'] leading-relaxed mb-2">
          Your order is being prepared and will ship from New Orleans via Printify.
          You'll receive a confirmation email with tracking once it's on the way.
        </p>
        {sessionId && (
          <p className="text-[10px] text-[#5a4c3a] font-['DM_Sans'] tracking-wider mt-2 mb-8">
            Reference: {sessionId.slice(-12).toUpperCase()}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/merch"
            className="text-[10px] tracking-[0.16em] uppercase px-6 py-3
              border border-[#D4AF77] text-[#D4AF77] hover:bg-[#D4AF77]/08
              transition-all font-['DM_Sans']">
            Continue Shopping
          </Link>
          <Link href="/"
            className="text-[10px] tracking-[0.16em] uppercase px-6 py-3
              border border-[#D4AF77]/20 text-[#A89880] hover:border-[#A89880]/40
              hover:text-[#F5EDD8] transition-all font-['DM_Sans']">
            Back to Studio
          </Link>
        </div>
        <p className="mt-12 text-[10px] tracking-[0.1em] uppercase text-[#3a3020] font-['DM_Sans']">
          Ships from New Orleans · Fulfilled by Printify
        </p>
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#090909] flex items-center justify-center">
        <p className="text-[#A89880] font-['DM_Sans'] text-sm tracking-widest uppercase">
          Loading…
        </p>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}