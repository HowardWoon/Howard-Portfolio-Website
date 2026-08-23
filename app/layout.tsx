import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Howard Woon | Software Engineer & Systems Developer',
  description:
    'Software Engineering undergraduate at Universiti Malaya (4.00 CGPA) specializing in backend systems, distributed architectures, algorithms, and agentic AI workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${display.variable} dark scroll-smooth`}>
      <body className="min-h-screen bg-canvas text-ink antialiased selection:bg-signal-dim selection:text-signal">
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
