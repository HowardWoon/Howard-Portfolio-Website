import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Howard Woon Hao Zhe | Portfolio',
  description: 'Premium dark-mode portfolio and admin dashboard for Howard Woon Hao Zhe.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
