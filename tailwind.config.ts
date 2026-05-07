import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Brand Color Palette ───────────────────────────────────────────
      colors: {
        // Deep dark backgrounds
        studio: {
          black:   "#090909",
          charcoal:"#111111",
          dark:    "#1A1A1A",
          card:    "#1C1C1C",
          border:  "#2A2A2A",
        },
        // Gold accent — headlines, CTAs, hover states
        gold: {
          light:   "#E8C97A",
          DEFAULT: "#D4AF77",
          dark:    "#B8935A",
          muted:   "#9A7B50",
        },
        // Neutral text
        cream:   "#F5EDD8",
        mist:    "#A89880",
      },
      // ─── Typography ────────────────────────────────────────────────────
      fontFamily: {
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      // ─── Custom spacing & sizing ───────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      // ─── Animation ─────────────────────────────────────────────────────
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "fade-up":        "fade-up 0.7s ease-out forwards",
        "fade-in":        "fade-in 0.5s ease-out forwards",
        "shimmer":        "shimmer 2.5s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
      // ─── Border radius matching shadcn convention ──────────────────────
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [animate],
};

export default config;
