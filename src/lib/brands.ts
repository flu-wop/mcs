// lib/brands.ts
// Shared metadata for the four merch brands — used by collection pages,
// the shop hero quick-links, and anywhere brand-specific styling is needed.

import type { Brand } from './printify'

export interface BrandInfo {
  id: Brand
  slug: string
  label: string
  shortLabel: string
  tagline: string
  description: string
  accent: string       // hex, used for borders/text/accents on the collection page
  accentSoft: string   // low-opacity tint for backgrounds
}

export const BRANDS: Record<Brand, BrandInfo> = {
  mcs: {
    id: 'mcs',
    slug: 'mcs',
    label: 'Mid City Sound Studios',
    shortLabel: 'MCS Studio',
    tagline: 'The studio at the center of it all.',
    description:
      'Merch from the New Orleans studio itself — the home base where every ' +
      'session, every record, and every artist on this site passes through.',
    accent: '#D4AF77',
    accentSoft: 'rgba(212,175,119,0.08)',
  },
  djm: {
    id: 'djm',
    slug: 'djm',
    label: 'Donald Markowitz',
    shortLabel: 'Donald Markowitz',
    tagline: 'Academy Award & Golden Globe winning songwriter.',
    description:
      'Merch celebrating the man behind "(I\'ve Had) The Time of My Life" — ' +
      'Best Original Song, 1987 — and decades of records made with Van Morrison, ' +
      'Taj Mahal, James Taylor, and more.',
    accent: '#c8a45a',
    accentSoft: 'rgba(200,164,90,0.08)',
  },
  streetbeat: {
    id: 'streetbeat',
    slug: 'streetbeat',
    label: 'Streetbeat',
    shortLabel: 'Street Beat',
    tagline: 'Drumming below sea level.',
    description:
      'Official merch for the Streetbeat documentary — a film about New Orleans ' +
      'drumming culture, hosted by session drummer Doug Belote.',
    accent: '#4a7acc',
    accentSoft: 'rgba(74,122,204,0.08)',
  },
  squiggle: {
    id: 'squiggle',
    slug: 'squiggle',
    label: 'Lil Squiggle',
    shortLabel: 'Lil Squiggle',
    tagline: 'Reggae-dub, chibi-sized.',
    description:
      'The world of Lil Squiggle — a rasta chibi mascot living through Rotary ' +
      'Chaos, Flip Fails, and Smartphone Temptation. Part of the "Don\'t Drink ' +
      'and Dial" campaign.',
    accent: '#1d9e75',
    accentSoft: 'rgba(29,158,117,0.08)',
  },
}

export const BRAND_LIST: BrandInfo[] = Object.values(BRANDS)
