import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import SmoothScrollProvider from '@/components/smooth-scroll-provider';
import { CustomCursor } from '@/components/custom-cursor';
import { CommandPalette } from '@/components/command-palette';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const sans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Howard Woon // Systems & AI Architect',
  description:
    'Howard Woon (Universiti Malaya, 4.00 CGPA) is a software engineer building distributed backend architectures, graph algorithms, and autonomous agentic workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="scroll-smooth font-sans antialiased bg-[#090B10] text-white">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <CommandPalette />
        <Analytics />
        <SpeedInsights />
        <CustomCursor />
      </body>
    </html>
  );
}

