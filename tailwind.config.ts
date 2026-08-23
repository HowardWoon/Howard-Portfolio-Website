import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#F5C400", // Signature Hero Yellow
          black: "#0A0A0A",  // High-contrast deep black
          cream: "#F6F6F2",  // Warm studio content background
          dark: "#121212",   // Card surface for dark mode & simulators
          cyan: "#00E5FF",   // Side rail & award highlight
          emerald: "#10B981" // Active / verified badge
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;