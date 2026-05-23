import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#000000',
          900: '#0A0A0A',
          800: '#131316',
          700: '#1D1D21'
        },
        fog: {
          100: '#F4F4F5',
          200: '#E5E5E7',
          400: '#A1A1AA',
          500: '#86868B'
        }
      },
      boxShadow: {
        glass: '0 18px 80px rgba(0, 0, 0, 0.55)',
        glow: '0 0 0 1px rgba(255,255,255,0.16), 0 24px 60px rgba(255,255,255,0.06)'
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at top, rgba(255,255,255,0.10), transparent 40%), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.03), transparent 26%)'
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -12px, 0)' }
        }
      },
      animation: {
        drift: 'drift 9s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;