// lib/cart.ts
// Shared cart state for the MCS ecosystem.
// Uses a single localStorage key so cart persists across all four brand sites.
// Import this in CartProvider and in any component that needs direct cart access.

import type { Brand, ProductType } from './printify'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  variantId: number
  productId: string
  slug: string
  name: string
  variantName: string         // e.g. "Black / M"
  brand: Brand
  type: ProductType
  price: number
  quantity: number
  thumbnailUrl: string
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { variantId: number } }
  | { type: 'UPDATE_QTY'; payload: { variantId: number; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'HYDRATE'; payload: CartItem[] }

// ─── Constants ────────────────────────────────────────────────────────────────

export const CART_KEY = 'mcs_cart'          // shared key across all four sites

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, items: action.payload }

    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.variantId === action.payload.variantId)
      const items = existing
        ? state.items.map(i =>
            i.variantId === action.payload.variantId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          )
        : [...state.items, action.payload]
      return { ...state, items, isOpen: true }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.variantId !== action.payload.variantId),
      }

    case 'UPDATE_QTY':
      return {
        ...state,
        items: action.payload.quantity <= 0
          ? state.items.filter(i => i.variantId !== action.payload.variantId)
          : state.items.map(i =>
              i.variantId === action.payload.variantId
                ? { ...i, quantity: action.payload.quantity }
                : i
            ),
      }

    case 'CLEAR':
      return { ...state, items: [] }

    case 'OPEN_DRAWER':
      return { ...state, isOpen: true }

    case 'CLOSE_DRAWER':
      return { ...state, isOpen: false }

    default:
      return state
  }
}

// ─── Selectors ────────────────────────────────────────────────────────────────

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}

export function cartTotalFormatted(items: CartItem[]): string {
  return `$${cartTotal(items).toFixed(2)}`
}

// ─── localStorage helpers ────────────────────────────────────────────────────

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {
    // localStorage quota exceeded — fail silently
  }
}

export function clearCart(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_KEY)
}
