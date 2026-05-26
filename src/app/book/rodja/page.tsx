// src/app/book/rodja/page.tsx
import type { Metadata } from "next"
import { EngineerBooking } from "@/components/EngineerBooking"
import type { EngineerConfig } from "@/components/EngineerBooking"

export const metadata: Metadata = {
  title: "Book with Rodja | Mid City Sound Studios",
  description: "Book a studio session with Rodja, Studio Engineer at Mid City Sound Studios in New Orleans.",
}

const config: EngineerConfig = {
  name:            "Rodja",
  slug:            "rodja",
  role:            "Studio Engineer",
  bio:             "Rodja is a studio engineer at Mid City Sound, known for his attention to detail and ability to get the best out of every artist.",
  room:            "B",
  allowRoomSwitch: true,
  linktreeUrl: "#", // ← replace with actual linktree/social URL
  rates: [
    { id: "hourly", label: "Hourly",        hours: 1, price: 10000 },
    { id: "half",   label: "Half Day (4hr)", hours: 4, price: 36000 },
    { id: "full",   label: "Full Day (8hr)", hours: 8, price: 64000 },
  ],
}

export default function RodjaBookingPage() {
  return <EngineerBooking config={config} />
}
