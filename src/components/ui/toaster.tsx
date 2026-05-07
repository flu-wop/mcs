// src/components/ui/toaster.tsx
// Simple toast implementation without full Radix dependency.
// For production, swap with shadcn's full toast stack.
"use client"

import { useToast }            from "@/hooks/use-toast"
import { X }                   from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "relative flex items-start gap-3 rounded-sm border p-4 shadow-xl",
            "bg-studio-card border-studio-border",
            "animate-fade-up",
          ].join(" ")}
        >
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="text-sm font-medium text-cream">{toast.title}</p>
            )}
            {toast.description && (
              <p className="text-xs text-mist mt-0.5">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-mist hover:text-cream transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
