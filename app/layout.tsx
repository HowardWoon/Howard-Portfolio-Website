import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SmoothScrollProvider from '@/components/smooth-scroll-provider';
import { CustomCursor } from '@/components/custom-cursor';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Howard Woon — Software Engineer & Systems Architect',
  description:
    'Howard Woon (Universiti Malaya, 4.00 CGPA) is a software engineer building distributed backend architectures, graph algorithms, and autonomous agentic workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="scroll-smooth font-sans antialiased bg-[#F3F3F5] text-[#12151B]">
        <CustomCursor />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
