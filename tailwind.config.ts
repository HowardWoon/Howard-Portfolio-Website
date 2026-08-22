import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        accent: '#06B6D4',
        background: '#0A0A0A',
        surface: '#111111',
        muted: '#A1A1AA'
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        jetbrains: ['var(--font-jetbrains)', 'monospace']
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 20px rgba(99, 102, 241, 0.5)'
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, rgba(10,10,10,1) 100%)',
      }
    }
  },
  plugins: []
};

export default config;