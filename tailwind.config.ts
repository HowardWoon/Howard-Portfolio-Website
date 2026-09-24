import type { Config } from 'tailwindcss';

/**
 * NEO-BRUTALIST × BAUHAUS × CLAY design tokens
 * ------------------------------------------------
 * ink    – every border, shadow and headline (never pure #000, slightly warm)
 * paper  – page backgrounds (white + warm cream alternation)
 * pop    – Bauhaus primaries + playful retro fills for colour-blocked boxes
 */
const config: Config = {
  // Touch devices keep :hover "stuck" after a tap (cards stay lifted, colours stay swapped).
  // This wraps every hover: variant in @media (hover: hover) so phones/tablets only get tap/active states.
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Full list (not `extend`) so `xs` is emitted BEFORE sm/md/lg in the CSS cascade
    screens: {
      xs: '375px', // iPhone SE 2/3 and up — smaller phones (320–374px, Galaxy Fold 280px) get the compact layout
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          yellow: '#FFC700', // Signature yellow (marquee / primary CTA)
          black: '#0A0A0A',
          cream: '#FFF7E0',
          dark: '#121212',
          cyan: '#00E5FF',
          emerald: '#10B981',
        },
        ink: {
          950: '#0B0D12', // admin area background
          DEFAULT: '#0A0A0A', // borders, shadows, headlines
          soft: '#2B2B2B', // body copy (≈14:1 on white)
          muted: '#565656', // secondary copy (≈7.4:1 on white – AAA)
        },
        // admin text colours (were referenced by /admin but never defined → fell back to inherited colour)
        fog: {
          100: '#E7E9EE',
          500: '#A1A6B3',
        },
        paper: {
          DEFAULT: '#FFFFFF', // main canvas
          cream: '#FFF7E0', // alternate section band
          deep: '#F4EEDC', // inset panels inside white cards
        },
        pop: {
          yellow: '#FFC700',
          blue: '#2B4BFF', // Bauhaus blue – also used for accent text (6.3:1)
          red: '#FF4B2B', // Bauhaus red – fills only
          redInk: '#C8261A', // red for text (5.9:1)
          mint: '#3DDC97',
          cyan: '#00E5FF',
          lilac: '#B8A4FF',
          pink: '#FF9ECF',
          orange: '#FF9F1C',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // +~7% on the two smallest steps – the old 12px mono labels were the #1 readability complaint
        xs: ['0.8rem', { lineHeight: '1.15rem' }],
        sm: ['0.9rem', { lineHeight: '1.35rem' }],
      },
      boxShadow: {
        'brutal-xs': '2px 2px 0 0 #0A0A0A',
        'brutal-sm': '3px 3px 0 0 #0A0A0A',
        brutal: '5px 5px 0 0 #0A0A0A',
        'brutal-lg': '8px 8px 0 0 #0A0A0A',
        'brutal-xl': '12px 12px 0 0 #0A0A0A',
        clay: 'inset 3px 3px 6px rgba(255,255,255,0.65), inset -4px -4px 8px rgba(0,0,0,0.18), 3px 3px 0 0 #0A0A0A',
        'clay-pressed': 'inset 4px 4px 8px rgba(0,0,0,0.22), inset -2px -2px 6px rgba(255,255,255,0.5)',
      },
      borderWidth: {
        3: '3px',
      },
      keyframes: {
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        wobble: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 24s linear infinite',
        wobble: 'wobble 4s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // `landscape-short:` = phones held sideways (e.g. 844×390) — used to switch modals to a side-by-side layout
    function ({ addVariant }: { addVariant: (name: string, def: string) => void }) {
      addVariant('landscape-short', '@media (orientation: landscape) and (max-height: 500px)');
    },
  ],
};
export default config;
