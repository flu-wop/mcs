// src/app/book/knox/page.tsx
import type { Metadata } from "next"
import { EngineerBooking } from "@/components/EngineerBooking"
import type { EngineerConfig } from "@/components/EngineerBooking"

export const metadata: Metadata = {
  title: "Book with Knox Ketchum | Mid City Sound Studios",
  description: "Book a studio session with Knox Ketchum, Sound Engineer at Mid City Sound Studios in New Orleans.",
}

const config: EngineerConfig = {
  name:            "Knox Ketchum",
  slug:            "knox",
  role:            "Sound Engineer",
  bio:             "Knox Ketchum is a New Orleans-based sound engineer bringing precision and feel to every session at Mid City Sound Studios.",
  room:            "A",
  allowRoomSwitch: true,
  linktreeUrl: "#", // ← replace with actual linktree/social URL
  rates: [
    { id: "hourly", label: "Hourly",        hours: 1, price: 10000 },
    { id: "half",   label: "Half Day (4hr)", hours: 4, price: 36000 },
    { id: "full",   label: "Full Day (8hr)", hours: 8, price: 64000 },
  ],
}

export default function KnoxBookingPage() {
  return <EngineerBooking config={config} />
}
