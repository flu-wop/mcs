// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge }               from "tailwind-merge"

/** Merge Tailwind classes safely — handles conflicts and conditionals. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a dollar amount as currency string (USD). */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style:    "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100)
}
