import type { Metadata, Viewport } from 'next';
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SmoothScrollProvider from '@/components/smooth-scroll-provider';
import { CustomCursor } from '@/components/custom-cursor';
import { MotionProvider } from '@/components/motion-provider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

/**
 * TYPE SYSTEM
 * - Display  : Bricolage Grotesque (200–800, optical sizing) → chunky, quirky, playful headlines
 * - Body/UI  : Inter (variable)                             → the most legible screen sans; body set at 500
 * - Mono     : JetBrains Mono (100–800)                      → tall x-height, heavier strokes than Geist Mono
 */
const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const DESCRIPTION =
  'Howard Woon (Universiti Malaya, 4.00 CGPA) is a software engineer building distributed backend architectures, graph algorithms, and autonomous agentic workflows.';

export const metadata: Metadata = {
  // Without this, OG/Twitter image URLs resolve to http://localhost:3000 outside Vercel previews
  metadataBase: new URL('https://howard-woon-portfolio.vercel.app'),
  title: 'Howard Woon // Systems & AI Architect',
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  // Without explicit Open Graph / Twitter fields, LinkedIn & X showed a small generic link card
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Howard Woon',
    title: 'Howard Woon // Systems & AI Architect',
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Howard Woon // Systems & AI Architect',
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Pinch-zoom intentionally NOT disabled (accessibility requirement)
  viewportFit: 'cover', // lets the layout use env(safe-area-inset-*) on notched iPhones / Android cut-outs
  themeColor: '#FFC700',
  // "only light" stops Chrome/Samsung Internet "force dark mode" from auto-inverting the light design
  colorScheme: 'only light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('hw-booted')==='1')document.documentElement.classList.add('hw-booted')}catch(e){}try{if(localStorage.getItem('hw-motion')==='calm')document.documentElement.dataset.motion='calm'}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Howard Woon',
              url: 'https://howard-woon-portfolio.vercel.app/',
              jobTitle: 'Software Engineer & Systems Architect',
              worksFor: {
                '@type': 'Organization',
                name: 'Universiti Malaya',
              },
              sameAs: ['https://github.com/HowardWoon', 'https://linkedin.com/in/howard-woon-hao-zhe-730b9337a'],
            }),
          }}
        />
      </head>
      <body className="font-sans font-medium antialiased bg-paper text-ink">
        {/* If JavaScript is off or fails to load, the "Initialize System" gate could never be dismissed
            and the whole portfolio stayed hidden behind it. */}
        <noscript>
          <style>{`.boot-overlay{display:none!important}body{overflow:auto!important}[style*="opacity:0"]{opacity:1!important;transform:none!important}[data-fx]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <MotionProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
          <CustomCursor />
        </MotionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
