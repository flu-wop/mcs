// src/app/book/flu/page.tsx
import type { Metadata } from "next"
import { EngineerBooking } from "@/components/EngineerBooking"
import type { EngineerConfig } from "@/components/EngineerBooking"

export const metadata: Metadata = {
  title: "Book with Flu | Mid City Sound Studios",
  description: "Book a studio session with Flu, Studio Manager & Head of Production at Mid City Sound Studios in New Orleans.",
}

const config: EngineerConfig = {
  name:            "Flu",
  slug:            "flu",
  role:            "Studio Manager / Head of Production",
  bio:             "Flu runs day-to-day operations at Mid City Sound and oversees production across all active projects. Booking through Flu gets you direct access to the full studio ecosystem.",
  room:            "A",
  allowRoomSwitch: true,
  rates: [
    { id: "hourly", label: "Hourly",        hours: 1, price: 10000 },
    { id: "half",   label: "Half Day (4hr)", hours: 4, price: 36000 },
    { id: "full",   label: "Full Day (8hr)", hours: 8, price: 64000 },
  ],
}

export default function FluBookingPage() {
  return <EngineerBooking config={config} />
}
