// src/app/book/rich/page.tsx
import type { Metadata } from "next"
import { EngineerBooking } from "@/components/EngineerBooking"
import type { EngineerConfig } from "@/components/EngineerBooking"

export const metadata: Metadata = {
  title: "Book with Rich Mayfield | Mid City Sound Studios",
  description: "Book a studio session with Rich Mayfield at Mid City Sound Studios in New Orleans.",
}

const config: EngineerConfig = {
  name:            "Rich Mayfield",
  slug:            "rich",
  role:            "Studio Musician",
  bio:             "Rich Mayfield is a studio musician at Mid City Sound, bringing fresh energy and versatility to every session.",
  room:            "B",
  allowRoomSwitch: true,
  linktreeUrl: "#", // ← replace with actual linktree/social URL
  rates: [
    { id: "hourly", label: "Hourly",        hours: 1, price: 10000 },
    { id: "half",   label: "Half Day (4hr)", hours: 4, price: 36000 },
    { id: "full",   label: "Full Day (8hr)", hours: 8, price: 64000 },
  ],
}

export default function RichBookingPage() {
  return <EngineerBooking config={config} />
}
