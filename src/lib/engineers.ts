// src/lib/engineers.ts
// Roster of studio engineers with individual booking pages, for payout tracking.
// Engineer-page bookings pay a flat $40/hr regardless of package/rate tier.
// Generic /studio bookings (no engineer selected at booking time) pay $30/hr
// once an admin assigns an engineer after the fact via /admin/payouts.

export const ENGINEER_PAGE_RATE_CENTS = 4000  // $40/hr
export const GENERIC_ASSIGNED_RATE_CENTS = 3000  // $30/hr

export interface Engineer {
  slug: string
  name: string
}

export const ENGINEERS: Engineer[] = [
  { slug: "flu",    name: "Flu" },
  { slug: "jesse",  name: "Jesse" },
  { slug: "rodja",  name: "Rodja" },
  { slug: "rich", name: "Rich Mayfield" },
  { slug: "knox",   name: "Knox Ketchum" },
]

export function engineerName(slug: string | null): string {
  if (!slug) return "Unassigned"
  return ENGINEERS.find(e => e.slug === slug)?.name ?? slug
}
