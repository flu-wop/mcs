// src/app/book/et/page.tsx
import type { Metadata } from "next"
import { EngineerBooking } from "@/components/EngineerBooking"
import type { EngineerConfig } from "@/components/EngineerBooking"

export const metadata: Metadata = {
  title: "Book with E.T. Deaux | Mid City Sound Studios",
  description: "Book a studio session with E.T. Deaux, Sound Engineer & Producer at Mid City Sound Studios in New Orleans.",
}

const config: EngineerConfig = {
  name:            "E.T. Deaux",
  slug:            "et",
  role:            "Sound Engineer / Producer",
  bio:             "E.T. Deaux is a producer and sound engineer rooted in New Orleans, with a ear for both raw energy and polished sound.",
  room:            "A",
  allowRoomSwitch: true,
  rates: [
    { id: "hourly", label: "Hourly",        hours: 1, price: 10000 },
    { id: "half",   label: "Half Day (4hr)", hours: 4, price: 36000 },
    { id: "full",   label: "Full Day (8hr)", hours: 8, price: 64000 },
  ],
}

export default function ETBookingPage() {
  return <EngineerBooking config={config} />
}
