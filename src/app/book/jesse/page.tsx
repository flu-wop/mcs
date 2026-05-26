// src/app/book/jesse/page.tsx
import type { Metadata } from "next"
import { EngineerBooking } from "@/components/EngineerBooking"
import type { EngineerConfig } from "@/components/EngineerBooking"

export const metadata: Metadata = {
  title: "Book with Jesse | Mid City Sound Studios",
  description: "Book a studio session with Jesse, Studio Engineer at Mid City Sound Studios in New Orleans.",
}

const config: EngineerConfig = {
  name:            "Jesse",
  slug:            "jesse",
  role:            "Studio Engineer",
  bio:             "Jesse is a studio engineer at Mid City Sound with a sharp technical ear and a collaborative approach to every session.",
  room:            "B",
  allowRoomSwitch: true,
  linktreeUrl: "#", // ← replace with actual linktree/social URL
  rates: [
    { id: "hourly", label: "Hourly",        hours: 1, price: 10000 },
    { id: "half",   label: "Half Day (4hr)", hours: 4, price: 36000 },
    { id: "full",   label: "Full Day (8hr)", hours: 8, price: 64000 },
  ],
}

export default function JesseBookingPage() {
  return <EngineerBooking config={config} />
}
