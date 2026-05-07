// src/hooks/use-toast.ts
// Minimal toast hook. Replace with shadcn's full hook if adding more features.
"use client"

import { useState, useCallback } from "react"

interface Toast {
  id:          string
  title?:      string
  description?: string
  variant?:    "default" | "destructive"
}

let _toasts:   Toast[]                     = []
let _setToasts: React.Dispatch<React.SetStateAction<Toast[]>> | null = null

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(_toasts)
  _setToasts = setToasts

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    const next = [..._toasts, { ...t, id }]
    _toasts = next
    _setToasts?.(next)
    // Auto-dismiss after 5 s
    setTimeout(() => {
      _toasts = _toasts.filter((x) => x.id !== id)
      _setToasts?.([..._toasts])
    }, 5000)
  }, [])

  const dismiss = useCallback((id: string) => {
    _toasts = _toasts.filter((x) => x.id !== id)
    _setToasts?.([..._toasts])
  }, [])

  return { toasts, toast, dismiss }
}
