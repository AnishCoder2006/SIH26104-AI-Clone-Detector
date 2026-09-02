import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'serif'],
        cormorant: ['var(--font-cormorant)', 'serif'],
        karla: ['var(--font-karla)', 'sans-serif'],
        fraunces: ['var(--font-fraunces)', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        space: ['var(--font-space)', 'sans-serif'],
        plex: ['var(--font-plex)', 'sans-serif'],
      },
      colors: {
        // Neo-Mint & Deep Slate (The AI-Cyber Look)
        background: "#0B0F19", // Deep Slate — sophisticated, ultra-dark blue-gray
        panel: "#161D2F",      // Dark Card — for structuring content containers and cards
        card: "#161D2F",       // Dark Card
        primary: "#00F5A0",    // Neo-Mint — glowing, energetic green for primary CTA buttons
        secondary: "#161D2F",  // Dark Card
        accent: "#00D2FF",     // Electric Cyan — for links, borders, and subheadings
        mint: "#00F5A0",       // Neo-Mint
        cyan: {
          DEFAULT: "#00D2FF",
          400: "#00D2FF",
          500: "#00B8E6",
        },
        silver: "#94A3B8",     // Muted Silver — for body copy and secondary metadata
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
