// src/app/legacy/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// LEGACY PAGE — Donald Markowitz
// Timeline fully verified against IMDB, donaldmarkowitz.com, and public sources.
// All credits are accurate as of May 2026.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata }  from "next"
import Link               from "next/link"
import Image              from "next/image"
import { Award, Music, Star, Film, Mic2, Theater, MapPin } from "lucide-react"
import { Badge } from "@flu-wop/design-system"
import { Reveal, Parallax, CountUp } from "@flu-wop/design-system/motion"
import { Separator }      from "@/components/ui/separator"
import { SectionIntro }   from "@/components/sections/SectionIntro"
import { NextStep }       from "@/components/sections/NextStep"
import { PhotoArchive }   from "@/components/sections/PhotoArchive"
import { Timeline }       from "@/components/legacy/Timeline"

export const metadata: Metadata = {
  alternates:  { canonical: "/legacy" },
  title:       "Legacy — Donald Markowitz",
  description: "The career of Donald Markowitz — Academy Award-winning co-writer of '(I've Had) The Time of My Life' from Dirty Dancing, Grammy nominated songwriter-producer, and founder of Mid City Sound Studios in New Orleans.",
}

/* ─── Verified timeline ── */
const TIMELINE = [
  {
    year:  "New York",
    era:   "The Beginning",
    city:  "New York City",
    icon:  Music,
    title: "Born & Raised in New York",
    body:  "Donald Markowitz was born and raised in New York City. He began his career as a bass player, performing with Speedo and the Cadillacs and a wide range of artists from that era. He played the Apollo Theatre, Radio City Music Hall, the Cotton Club, and Roseland Ballroom — the beating heart of New York's live music scene.",
    tags:  ["Bass Player", "Apollo Theatre", "Radio City", "NYC"],
  },
  {
    year:  "Theatre",
    era:   "Stage & Composition",
    city:  "New York City",
    icon:  Theater,
    title: "Theatre & Early Composition",
    body:  "Expanding into theatre, Donald's band Arms Akimbo performed and wrote the music for Sam Shepard's \"The Tooth of Crime\" at the renowned La Mama Theatre in New York. He went on to compose for the WPA Theatre, the Old Globe in San Diego, and The Falcon Theatre in Los Angeles — building a reputation as a composer of range and depth.",
    tags:  ["Arms Akimbo", "Sam Shepard", "La Mama Theatre", "WPA Theatre", "Old Globe"],
  },
  {
    year:  "1987",
    era:   "The Oscar",
    city:  "Hollywood / Academy Awards",
    icon:  Award,
    title: "Academy Award — Best Original Song",
    body:  "Donald co-writes \"(I've Had) The Time of My Life\" for the film Dirty Dancing alongside Franke Previte and John DeNicola. The song wins the Academy Award for Best Original Song and the Golden Globe Award for Best Original Song — cementing Donald's place among the most celebrated songwriters of his generation. The song also won a Grammy Award for Best Pop Performance, awarded to performers Bill Medley and Jennifer Warnes.",
    tags:  ["Academy Award", "Oscar", "Golden Globe", "Dirty Dancing", "Time of My Life", "Co-Writer"],
  },
  {
    year:  "Post-Oscar",
    era:   "Hollywood Years",
    city:  "Los Angeles, CA",
    icon:  Film,
    title: "Hollywood — Film & Television",
    body:  "After winning the Oscar, Donald relocated to Los Angeles where he spent many years writing songs and scores for film and television. He was signed to Disney Music as a staff songwriter, contributing to numerous projects during his time there, and built a sustained career in Hollywood production. James Taylor, Shawn Colvin, and Nicolette Larson sang on his records during this era.",
    tags:  ["Film Scoring", "Television", "Hollywood", "Disney Music", "James Taylor", "Shawn Colvin"],
  },
  {
    year:  "2011",
    era:   "New Orleans",
    city:  "New Orleans, Louisiana",
    icon:  MapPin,
    title: "New Orleans — A New Chapter",
    body:  "In 2011, Donald and his family moved to the Broadmoor neighborhood of New Orleans. The city's unmatched musical DNA — the second line, the brass band tradition, the deep funk heritage — drew him immediately into its creative community. He began working with some of the city's most legendary artists.",
    tags:  ["New Orleans", "Broadmoor", "NOLA", "2011"],
  },
  {
    year:  "2014",
    era:   "Grammy Nomination",
    city:  "New Orleans, Louisiana",
    icon:  Star,
    title: "Grammy Nomination — Bobby Rush",
    body:  "Donald produces Bobby Rush's album Decisions, which features a duet with Dr. John on a song co-written by Markowitz called \"Another Murder in New Orleans.\" The album earns a 2014 Grammy Award nomination for Best Blues Album.",
    tags:  ["Grammy Nominated", "Bobby Rush", "Dr. John", "Best Blues Album", "Decisions"],
  },
  {
    year:  "Ongoing",
    era:   "Collaborations",
    city:  "New Orleans & Beyond",
    icon:  Mic2,
    title: "A Career of Legendary Collaborations",
    body:  "Over his career, Donald has produced, written, recorded and worked with Van Morrison, Taj Mahal, Dr. John, Bill Medley, Bobby Rush, Art, Ivan, & Cyril Neville, James Andrews, Irvin Mayfield, Lee Sklar, Shane Theriot, and Doug Belote — among many others. Now signed to Kobalt Music, with Kobalt handling publishing administration, he continues to collaborate with great artists from New Orleans and around the world.",
    tags:  ["Van Morrison", "Taj Mahal", "Art Neville", "Ivan Neville", "Cyril Neville", "Bill Medley", "Kobalt Music"],
  },
  {
    year:  "Now",
    era:   "Mid City Sound",
    city:  "Mid City, New Orleans",
    icon:  Award,
    title: "Mid City Sound Studios",
    body:  "Donald founded Mid City Sound Studios in New Orleans — world class recording spaces built on decades of award-winning craft. The studio is a creative home for local legends, touring artists, and the next generation of creators. He is also the creator and producer of Street Beat: Drumming Below Sea Level, a documentary celebrating New Orleans drumming culture.",
    tags:  ["Mid City Sound", "Studio", "Street Beat", "Documentary"],
  },
]

/* ─── Photo archive — real images ── */
const GALLERY = [
  { file: "dr-john-bobby-rush.jpg", alt: "Dr. John and Bobby Rush",      caption: "Dr. John and Bobby Rush" },
  { file: "art-neville.jpg",        alt: "Art and Ian Neville",          caption: "Art and Ian Neville" },
  { file: "cyril-neville.jpeg",     alt: "Cyril Neville and Donald",     caption: "Cyril Neville and Donald" },
  { file: "middle-finger.jpg",      alt: "Russ Kunkel and Lee Sklar",    caption: "Russ Kunkel & Lee Sklar" },
  { file: "misha2.JPG",             alt: "Misha",                        caption: "Misha" },
  { file: "donny-carol.jpg",        alt: "Donny and Carol",              caption: "Donny and Carol" },
]

/* ─────────────────────────────────────────────────────────────────────────── */
const CREDITS = [
  "Academy Award — Best Original Song",
  "Golden Globe — Best Original Song",
  "Grammy Nominated — Best Blues Album (Bobby Rush · Decisions)",
  "Van Morrison", "Taj Mahal", "Dr. John", "Bobby Rush", "Art Neville", "Ivan Neville",
  "Bill Medley", "James Taylor", "Shawn Colvin", "Kobalt Music",
]

export default function LegacyPage() {
  return (
    <div className="pt-16 min-h-screen bg-studio-black">

      {/* ── Hero ── */}
      <section className="relative py-20 md:py-28 px-6 bg-studio-charcoal border-b border-studio-border overflow-hidden">
        <div aria-hidden className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_60%_60%_at_80%_40%,rgba(212,175,119,0.07),transparent)]" />
        <div className="relative mx-auto max-w-6xl grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <Reveal className="order-2 md:order-1">
            <div className="relative aspect-[3/4] bg-studio-dark border border-studio-border rounded-sm overflow-hidden">
              <Parallax speed={-0.15} className="absolute inset-0 -top-[10%] h-[120%]">
                <Image src="/images/young-donny-guitar.JPG" alt="Donald Markowitz in his early years, with guitar" fill priority
                  className="object-cover object-top" sizes="(max-width: 768px) 100vw, 50vw" />
              </Parallax>
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-studio-black/50 to-transparent" />
              <div aria-hidden className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-gold/40" />
              <div aria-hidden className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-gold/40" />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="space-y-6 order-1 md:order-2">
            <p className="flex items-center gap-3 text-[11px] tracking-[0.25em] uppercase text-gold/80">
              <span className="inline-block h-px w-10 bg-gold/60" />The legacy of Donald Markowitz
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-cream leading-[0.95] font-light">
              Four decades<br /><span className="text-gold-gradient italic">of award-winning craft</span>
            </h1>
            <Separator className="w-12 bg-gold/40" />
            <p className="text-mist text-sm md:text-base leading-relaxed">
              Donald Markowitz is a New York-born, New Orleans-based composer, producer, and
              songwriter. He is best known as the co-writer of{" "}
              <em>&ldquo;(I&apos;ve Had) The Time of My Life&rdquo;</em> from{" "}
              <em>Dirty Dancing</em> — which won the Academy Award for Best Original Song
              and the Golden Globe Award for Best Original Song.
            </p>
            <p className="text-mist text-sm md:text-base leading-relaxed">
              A Grammy nominated songwriter-producer, Donald has produced and/or written with:
              Van Morrison, Taj Mahal, Dr. John, Bobby Rush, Cyril Neville, Bill Medley, and
              dozens more. He is the founder of Mid City Sound Studios and the creator of the documentary
              <em> Street Beat: Drumming Below Sea Level</em>.
            </p>
            <dl className="grid grid-cols-3 gap-3 pt-2">
              {[
                { val: "Oscar",   label: "Academy Award\nWinner" },
                { val: "Grammy",  label: "Nominated\nProducer" },
                { val: "40+",     label: "Years in\nMusic" },
              ].map(({ val, label }) => (
                <div key={label} className="border border-studio-border rounded-sm p-3 text-center bg-studio-black/30">
                  <dt className="sr-only">{label.replace("\n", " ")}</dt>
                  <dd className="font-display text-2xl text-gold"><CountUp value={val} /></dd>
                  <dd aria-hidden className="text-mist text-[10px] mt-1 leading-snug whitespace-pre-line">{label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── Credits ticker ── */}
      <section aria-label="Selected credits and collaborations" className="border-b border-studio-border/40 bg-studio-black py-5 overflow-hidden">
        <p className="text-[10px] tracking-[0.2em] uppercase text-gold/60 text-center mb-4">Selected credits & collaborations</p>
        <div className="flex w-max animate-marquee motion-reduce:animate-none hover:[animation-play-state:paused]">
          {[0, 1].map(k => (
            <ul key={k} aria-hidden={k === 1} className="flex shrink-0 gap-2 pr-2">
              {CREDITS.map(c => (
                <li key={c} className="text-[11px] tracking-wide px-3 py-1.5 border border-studio-border/60 text-mist/80 rounded-sm whitespace-nowrap">{c}</li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-24 md:py-32 px-6">
        <div className="mx-auto max-w-3xl">
          <SectionIntro center eyebrow="The journey" title="A life in music"
            lede="All credits verified via IMDB, donaldmarkowitz.com, and public sources." />
          <Timeline entries={TIMELINE.map(({ icon: Icon, ...t }) => ({ ...t, icon: <Icon className="w-5 h-5 text-gold" /> }))} />
        </div>
      </section>

      {/* ── Photo archive ── */}
      <section className="py-24 md:py-32 px-6 bg-studio-charcoal border-t border-studio-border">
        <div className="mx-auto max-w-6xl">
          <SectionIntro center eyebrow="Photo archive" title="Through the decades" lede="Tap any photo to see it full size." />
          <PhotoArchive photos={GALLERY.map(g => ({ src: `/images/${g.file}`, alt: g.alt, caption: g.caption }))} />
        </div>
      </section>

      {/* ── Pull quote ── */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(212,175,119,0.05),transparent)]" />
        <Reveal as="article" className="relative mx-auto max-w-3xl text-center">
          <span aria-hidden className="block font-display text-8xl leading-none text-gold/25 -mb-6">&ldquo;</span>
          <blockquote className="font-display text-3xl md:text-5xl text-cream/90 leading-snug italic font-light">
            Every session is a conversation between where music has been and where it needs to go.
          </blockquote>
          <p className="text-gold mt-8 text-sm tracking-wide">— Donald Markowitz</p>
        </Reveal>
      </section>

      <NextStep line={<>Work where the <span className="text-gold-gradient italic">legacy</span> lives.</>}
        href="/studio#booking-form" label="Book a session" secondary={{ href: "/projects", label: "See current projects" }} />
    </div>
  )
}
