import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0A0A0B',
        surface: '#151518',
        'surface-2': '#1C1C20',
        line: 'rgba(255,255,255,0.08)',
        'line-strong': 'rgba(255,255,255,0.16)',
        ink: '#F3F2EF',
        'ink-2': '#9A99A0',
        'ink-3': '#5C5B62',
        signal: '#C9974C',
        'signal-dim': 'rgba(201,151,76,0.12)',
        success: '#34D399',
        danger: '#F87171',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace']
      },
    }
  },
  plugins: []
};

export default config;