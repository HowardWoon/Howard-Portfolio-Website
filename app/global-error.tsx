'use client';

import { useEffect } from 'react';
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ErrorScreen } from '@/components/error-screen';

// global-error replaces the root layout (it only shows when the layout itself fails), so it loads the same three
// families with the same settings as app/layout.tsx (next/font serves one copy)
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

/** R35: last line of defence - even a crash in the root layout shows a styled page with a way back */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable} hw-booted`}>
      <body className="font-sans font-medium bg-paper text-ink">
        <ErrorScreen
          code="ERROR"
          title="Something broke on this page."
          detail="Reload to start the portfolio again."
          onRetry={reset}
        />
      </body>
    </html>
  );
}
