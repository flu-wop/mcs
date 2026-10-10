// src/app/studio/page.tsx
// Studio booking page. The page itself lives in StudioExperience (client);
// this server file exists so /studio has its own SEO metadata.
//
// Payments: BookingFlow POSTs to /api/booking-checkout, which prices the
// session from lib/studio-rates (never the request body), applies any code
// from lib/booking-discounts, and redirects to Stripe Checkout. Success
// returns to /studio/success.

import type { Metadata } from "next"
import { StudioExperience } from "@/components/studio/StudioExperience"

export const metadata: Metadata = {
  title: "Book the Studio",
  description:
    "Book recording, mixing and Dolby Atmos sessions at Mid City Sound Studios in New Orleans. Three rooms, sessions from $100/hr, approved within 24 hours.",
  alternates: { canonical: "/studio" },
}

export default function StudioPage() {
  return <StudioExperience />
}
