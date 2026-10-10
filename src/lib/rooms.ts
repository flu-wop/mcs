// src/lib/rooms.ts
// The three Mid City Sound rooms. Used by /studio (rooms showcase + booking
// picker), the engineer booking pages, and the admin Room Map, so names and
// gear never drift between them. Fire on the Bayou's bays/sound stage are a
// different business and never belong here.

export type RoomId = "A" | "B" | "C"

export interface Room {
  id: RoomId
  name: string
  role: string
  /** One line for the booking picker. */
  short: string
  /** Paragraph for the rooms showcase. */
  about: string
  gear: string[]
  image?: string
  imageAlt?: string
  /** Booked through the studio rather than open self-booking. */
  byArrangement?: boolean
}

export const ROOMS: Room[] = [
  {
    id: "A",
    name: "Studio A",
    role: "Control / Vocal Room",
    short: "Dedicated vocal booth, Neumann U87, UA Apollo, Donald's guitar collection.",
    about: "A dedicated vocal booth environment built for precision tracking and control. Donald's personal guitar collection lines the walls — decades of instruments, each with its own story.",
    gear: [
      "Dedicated vocal booth",
      "Universal Audio Apollo interface",
      "Neumann U87 microphone",
      "Mac Pro workstation",
      "MIDI piano / controller (main desk)",
      "Donald's personal guitar collection",
    ],
    image: "/images/studio-interior.jpg",
    imageAlt: "Studio A control room with Donald Markowitz's guitar collection on the walls",
  },
  {
    id: "B",
    name: "Studio B",
    role: "Live Room",
    short: "Full drum kit, upright piano, bass & guitar amps, Mac Pro workstation — all professionally miked.",
    about: "A cozy, warm live room built for ensemble tracking. Drums and piano are professionally miked and ready. All signals run through the Apollo for a consistent, high-quality signal chain.",
    gear: [
      "Full drum kit — professionally miked",
      "Upright piano — professionally miked",
      "Mac Pro workstation",
      "Bass & electric guitar amplifiers",
      "Shure digital vocal microphone",
      "Tascam mixer → Universal Audio Apollo (4 inputs)",
      "MIDI controller",
    ],
    image: "/images/b-room.jpg",
    imageAlt: "Studio B live room with drum kit and upright piano",
  },
  {
    id: "C",
    name: "Studio C",
    role: "Irvin Mayfield's Office",
    short: "Irvin's private creative space with some of his personal guitar collection. Available for select sessions by arrangement.",
    about: "Studio C is the private office and creative space of Grammy Award-winning trumpeter and New Orleans cultural ambassador Irvin Mayfield. Available for select sessions and collaborations by arrangement.",
    gear: [
      "Private creative office",
      "Mac Pro workstation",
      "Irvin's personal guitar collection",
      "Available by arrangement",
      "Ideal for small ensemble work",
    ],
    image: "/images/studio-c.jpg",
    imageAlt: "Studio C, Irvin Mayfield's office: a monitor desk with keyboards, guitars on stands, a green velvet sofa and a wall-mounted screen",
    byArrangement: true,
  },
]

export const roomById = (id: string | null | undefined) => ROOMS.find(r => r.id === id)
