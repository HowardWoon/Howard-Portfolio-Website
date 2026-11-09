import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { RouteWipeClear, WipeLink } from '@/components/fx/route-wipe';
import TokyoDioramaSection from '@/components/tokyo-diorama/tokyo-diorama-section';
import { BootSequence } from '@/components/boot-sequence';

/**
 * R107 (owner: "turn the whole 3D diorama into a segment ... viewers who are interested click a link and come into this
 * page to play, walk, explore; when they scroll the main page they are not affected by it"). The walkable street lives
 * on its own page; the home page keeps a teaser (components/diorama-teaser.tsx) that links here.
 */
export const metadata: Metadata = {
  title: 'Tokyo After Rain · 3D Diorama // Howard Woon',
  description:
    'A hand-built Tokyo street corner after rain. Look around, or switch to walk and explore. Every lit door opens a room you can walk into: the awards, the projects, the story.',
  alternates: { canonical: '/diorama' },
  openGraph: { url: '/diorama', title: 'Tokyo After Rain · 3D Diorama // Howard Woon' },
};

export default function DioramaPage() {
  return (
    // BootSequence: marks the page hydrated (window.__hwHydrated) and booted, like the home page
    <BootSequence>
      <div className="min-h-screen-safe bg-paper bg-dots text-ink">
        <RouteWipeClear />
        <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-[max(1.25rem,var(--safe-top))] xs:px-5 sm:px-10 lg:px-16">
          <WipeLink href="/#diorama" className="nb-btn nb-btn-white px-4 py-2.5">
            <ArrowLeft className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            <span>Return to Portfolio</span>
          </WipeLink>
          <span className="nb-tag bg-white">夜雨の街角 · TOKYO_AFTER_RAIN</span>
        </header>
        <main id="main-content">
          <TokyoDioramaSection />
        </main>
      </div>
    </BootSequence>
  );
}
