// src/components/admin/insights/content.ts
// Content planning config for the studio. A starting set: edit freely; the
// planner and the Playbook both read from here. The API validates against
// PILLARS.length and CLIP_CHECKLIST.length, so keep those in sync with it.

export const PILLARS = [
  { id: 0, label: "No post",              tip: "" },
  { id: 1, label: "Session BTS",          tip: "Hands on the board, a take in progress" },
  { id: 2, label: "Rooms & gear",         tip: "One room or one piece of gear per post" },
  { id: 3, label: "Artist spotlight",     tip: "Who's been in, what they made" },
  { id: 4, label: "Legacy & archive",     tip: "A photo or story from Donald's decades" },
  { id: 5, label: "Merch",                tip: "A product on a person, not a mockup" },
  { id: 6, label: "Offer",                tip: "Booking push or a code — 1 in 5 max" },
] as const

export const OFFER_ID = 6

export const CLIP_CHECKLIST = [
  "Artist OK'd the session footage",
  "Trimmed to 15–40 sec",
  "Vertical 9:16",
  "Caption written",
  "Artist and engineer tagged",
  "Posted and logged",
]

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
export const POST_TARGET = { min: 4, max: 6 }
