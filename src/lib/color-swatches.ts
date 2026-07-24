// src/lib/color-swatches.ts
//
// Printify variant color names are free text from the underlying print
// provider's blueprint, so this is a best-effort map covering the common
// apparel color names across Printify's catalog. Unmapped names fall back
// to a neutral gray swatch with the name as a tooltip — never silently
// invisible.

const COLOR_HEX: Record<string, string> = {
  white: '#F5F3EF',
  black: '#0A0A0A',
  'solid black': '#0A0A0A',
  navy: '#1B2438',
  'navy blue': '#1B2438',
  charcoal: '#3A3A3A',
  'dark grey': '#3A3A3A',
  'dark gray': '#3A3A3A',
  grey: '#8C8C8C',
  gray: '#8C8C8C',
  'heather grey': '#A8A8A8',
  'heather gray': '#A8A8A8',
  'sport grey': '#B4B4B4',
  'sport gray': '#B4B4B4',
  olive: '#5C5A3E',
  'olive green': '#5C5A3E',
  'military green': '#4B5320',
  forest: '#233D2C',
  'forest green': '#233D2C',
  maroon: '#5C1A24',
  cardinal: '#8A1538',
  red: '#B0242A',
  burgundy: '#5E1F2E',
  orange: '#D9631E',
  gold: '#C9A24B',
  yellow: '#E8C547',
  mustard: '#C9A63B',
  royal: '#2A4B9B',
  'royal blue': '#2A4B9B',
  'true royal': '#2A4B9B',
  blue: '#3B5CA8',
  'powder blue': '#A9C4D6',
  teal: '#2C6E6B',
  sage: '#8A9A7B',
  purple: '#5B3E7D',
  lavender: '#C3B4D9',
  pink: '#D998A8',
  'heather pink': '#D998A8',
  brown: '#5A4635',
  chocolate: '#3E2E22',
  sand: '#C9B896',
  natural: '#E4DCC8',
  cream: '#EDE4D3',
  ivory: '#F1EAD9',
  khaki: '#B6A57A',
  tan: '#C2A878',
  'ash grey': '#C6C6C0',
  'ash gray': '#C6C6C0',
  mint: '#A9D3C1',
  turquoise: '#3FA3A0',
  coral: '#E37B6B',
}

export function colorHex(name: string): string {
  const key = name.trim().toLowerCase()
  return COLOR_HEX[key] ?? '#6B6B6B' // neutral fallback — never invisible
}

// Light swatches need a dark border to stay visible against dark UI
// (white, cream, ivory, etc. would otherwise vanish on the site's near-black background).
const LIGHT_THRESHOLD = 200 // simple luminance check

export function isLightColor(name: string): boolean {
  const hex = colorHex(name).replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  return luminance > LIGHT_THRESHOLD
}
