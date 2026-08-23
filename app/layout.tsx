import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

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
    <html lang="en" className={`${inter.variable} ${mono.variable} dark scroll-smooth`}>
      <body className="min-h-screen bg-[#07090E] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
