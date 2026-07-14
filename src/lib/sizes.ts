// lib/sizes.ts
// Printify's variant order reflects internal catalog order, not logical size
// order — left unsorted, "2XL" can easily end up first, which is why every
// product was defaulting to 2XL instead of a sane middle size like M/L.

const SIZE_ORDER = [
  'XS', 'S', 'M', 'L', 'XL',
  '2XL', '3XL', '4XL', '5XL', '6XL', '7XL',
  'ONE SIZE',
]

function rank(size: string): number {
  const i = SIZE_ORDER.indexOf(size.trim().toUpperCase())
  return i === -1 ? SIZE_ORDER.length : i  // unknown sizes sort last, not first
}

export function sortSizes<T>(items: T[], getSize: (item: T) => string): T[] {
  return [...items].sort((a, b) => rank(getSize(a)) - rank(getSize(b)))
}

// Picks a sensible default size to pre-select, preferring M then L then S
// then whatever's first after sorting — never defaults to a plus size.
export function defaultSize(sizes: string[]): string | undefined {
  const sorted = [...sizes].sort((a, b) => rank(a) - rank(b))
  return sorted.find(s => ['M', 'L', 'S'].includes(s.trim().toUpperCase())) ?? sorted[0]
}
