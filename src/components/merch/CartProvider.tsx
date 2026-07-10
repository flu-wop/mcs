'use client'
// components/merch/CartProvider.tsx
// Wraps the app in cart context. Also renders the cart drawer UI.
// Place this in your root layout inside <body>:
//   <CartProvider>{children}</CartProvider>

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useTransition,
  type ReactNode,
} from 'react'
import Image from 'next/image'
import {
  cartReducer,
  loadCart,
  saveCart,
  cartCount,
  cartTotal,
  type CartItem,
  type CartState,
} from '@/lib/cart'

// ─── Context ─────────────────────────────────────────────────────────────────

interface CartContext {
  state: CartState
  addItem: (item: CartItem) => void
  removeItem: (variantId: number) => void
  updateQty: (variantId: number, quantity: number) => void
  clear: () => void
  openDrawer: () => void
  closeDrawer: () => void
  checkout: () => Promise<void>
  isCheckingOut: boolean
}

const CartCtx = createContext<CartContext | null>(null)

export function useCart(): CartContext {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}

// ─── Brand colours (for cart item accent) ────────────────────────────────────

const BRAND_ACCENT: Record<string, string> = {
  mcs:        'border-l-[#D4AF77]',
  djm:        'border-l-[#c8a45a]',
  streetbeat: 'border-l-[#4a7acc]',
  squiggle:   'border-l-[#1d9e75]',
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export default function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })
  const [isCheckingOut, startCheckout] = useTransition()

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadCart()
    if (saved.length > 0) {
      dispatch({ type: 'HYDRATE', payload: saved })
    }
  }, [])

  // Persist to localStorage whenever items change
  useEffect(() => {
    saveCart(state.items)
  }, [state.items])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = state.isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [state.isOpen])

  const addItem    = useCallback((item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item }), [])
  const removeItem = useCallback((variantId: number) => dispatch({ type: 'REMOVE_ITEM', payload: { variantId } }), [])
  const updateQty  = useCallback((variantId: number, quantity: number) => dispatch({ type: 'UPDATE_QTY', payload: { variantId, quantity } }), [])
  const clear      = useCallback(() => dispatch({ type: 'CLEAR' }), [])
  const openDrawer  = useCallback(() => dispatch({ type: 'OPEN_DRAWER' }), [])
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), [])

  // Stripe Checkout — POST to /api/checkout, redirect to Stripe-hosted page
  const checkout = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      startCheckout(async () => {
        try {
          const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: state.items }),
          })
          if (!res.ok) throw new Error('Checkout session creation failed')
          const { url } = await res.json() as { url: string }
          window.location.href = url
          resolve()
        } catch (err) {
          console.error('Checkout error:', err)
          reject(err)
        }
      })
    })
  }, [state.items])

  const total = cartTotal(state.items)
  const count = cartCount(state.items)

  return (
    <CartCtx.Provider value={{ state, addItem, removeItem, updateQty, clear, openDrawer, closeDrawer, checkout, isCheckingOut }}>
      {children}

      {/* ── Overlay ──────────────────────────────────────────────────────── */}
      {state.isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* ── Drawer ───────────────────────────────────────────────────────── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={[
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col',
          'bg-[#0d0d0d] border-l border-[#D4AF77]/15',
          'transform transition-transform duration-300 ease-out',
          state.isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4AF77]/10 px-6 py-5">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#D4AF77] uppercase font-['DM_Sans']">
              Mid City Sound
            </p>
            <h2 className="font-['Cormorant_Garamond'] text-xl font-light text-[#F5EDD8] leading-tight">
              Your Cart
              {count > 0 && (
                <span className="ml-2 font-['DM_Sans'] text-sm text-[#A89880]">
                  ({count})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="text-[#A89880] hover:text-[#F5EDD8] transition-colors p-1"
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pt-12">
              <p className="font-['Cormorant_Garamond'] text-2xl font-light text-[#A89880] italic mb-2">
                Nothing yet.
              </p>
              <p className="text-xs text-[#5a4c3a] tracking-wider uppercase font-['DM_Sans']">
                But the culture's waiting.
              </p>
              <button
                onClick={closeDrawer}
                className="mt-8 text-[10px] tracking-[0.16em] uppercase text-[#D4AF77]
                  border-b border-[#D4AF77]/30 pb-0.5 font-['DM_Sans'] hover:border-[#D4AF77]
                  transition-colors"
              >
                Continue shopping →
              </button>
            </div>
          ) : (
            state.items.map(item => (
              <CartItemRow
                key={item.variantId}
                item={item}
                onRemove={() => removeItem(item.variantId)}
                onQtyChange={(qty) => updateQty(item.variantId, qty)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-[#D4AF77]/10 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-[0.1em] uppercase text-[#A89880] font-['DM_Sans']">
                Subtotal
              </span>
              <span className="font-['Cormorant_Garamond'] text-xl text-[#D4AF77]">
                ${total.toFixed(2)}
              </span>
            </div>
            <p className="text-[10px] text-[#5a4c3a] font-['DM_Sans'] leading-relaxed">
              Shipping calculated at checkout · Ships from New Orleans via Printify
            </p>
            <button
              onClick={() => void checkout()}
              disabled={isCheckingOut}
              className={[
                'w-full py-3.5 text-[11px] tracking-[0.18em] uppercase font-[DM_Sans]',
                'border border-[#D4AF77] text-[#D4AF77]',
                'transition-all duration-200',
                isCheckingOut
                  ? 'opacity-50 cursor-wait'
                  : 'hover:bg-[#D4AF77]/10 active:scale-[0.99]',
              ].join(' ')}
            >
              {isCheckingOut ? 'Redirecting…' : 'Proceed to Checkout →'}
            </button>
            <button
              onClick={clear}
              className="w-full text-[10px] tracking-[0.1em] uppercase text-[#5a4c3a]
                hover:text-[#A89880] transition-colors font-['DM_Sans']"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </CartCtx.Provider>
  )
}

// ─── Cart Item Row ────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  onRemove,
  onQtyChange,
}: {
  item: CartItem
  onRemove: () => void
  onQtyChange: (qty: number) => void
}) {
  const accent = BRAND_ACCENT[item.brand] ?? BRAND_ACCENT.mcs

  return (
    <div className={`flex gap-3 border-l-2 pl-3 py-1 ${accent}`}>
      {/* Thumbnail */}
      <div className="relative w-16 h-16 shrink-0 bg-[#111] overflow-hidden">
        <Image
          src={item.thumbnailUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-['Cormorant_Garamond'] text-sm text-[#F5EDD8] leading-tight truncate">
          {item.name}
        </p>
        <p className="text-[10px] text-[#5a4c3a] font-['DM_Sans'] uppercase tracking-wider mt-0.5">
          {item.variantName}
        </p>
        <div className="flex items-center justify-between mt-2">
          {/* Qty stepper */}
          <div className="flex items-center gap-2 border border-[#D4AF77]/15">
            <button
              onClick={() => onQtyChange(item.quantity - 1)}
              className="px-2 py-0.5 text-[#A89880] hover:text-[#D4AF77] transition-colors text-sm"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="text-[#F5EDD8] text-xs font-['DM_Sans'] min-w-[16px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(item.quantity + 1)}
              className="px-2 py-0.5 text-[#A89880] hover:text-[#D4AF77] transition-colors text-sm"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-['Cormorant_Garamond'] text-sm text-[#D4AF77]">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
            <button
              onClick={onRemove}
              className="text-[#5a4c3a] hover:text-[#A89880] transition-colors"
              aria-label={`Remove ${item.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
