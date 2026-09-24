import { SkipLink } from '@/components/skip-link';
import BikebearInspiredHero from '@/components/bikebear-hero';
import AboutSection from '@/components/about-section';
import { StackedProjects, ExperienceSection, HonorsSection, ContactSection } from '@/components/lazy-sections';
import { SiteFooter } from '@/components/site-footer';
import dynamic from 'next/dynamic';
const PointerField = dynamic(() => import('@/components/fx/pointer-field').then((mod) => mod.PointerField));
const EasterEgg = dynamic(() => import('@/components/fx/easter-egg').then((mod) => mod.EasterEgg));
const VelocitySkew = dynamic(() => import('@/components/fx/velocity-skew').then((mod) => mod.VelocitySkew));

import { BootSequence } from '@/components/boot-sequence';
import { TechMarquee } from '@/components/marquees';
import { ScrollToTop } from '@/components/scroll-to-top';
import { SiteHeader } from '@/components/site-header';
const CommandPalette = dynamic(() => import('@/components/command-palette').then((mod) => mod.CommandPalette), {});

export function PortfolioPage() {
  return (
    <BootSequence>
      <div className="relative min-h-screen overflow-x-clip bg-paper text-ink">
        {/* Fixed header lives OUTSIDE any z-indexed wrapper. It used to sit inside a `relative z-10` div,
            which capped its z-[9999] at 10 — so the marquee (z-20) and honours cards (z-10) scrolled OVER
            the header and blocked taps on the Resume / Search buttons. */}
        {/* Skip link (keyboard / screen-reader users). It moves FOCUS as well as scroll —
            a plain href="#…" is intercepted by Lenis, which scrolls but leaves focus at the top. */}
        <SkipLink />

        <SiteHeader />

        {/* One <main> landmark for ALL page content, hero included (the hero used to sit before <main>,
            so screen-reader "jump to main" skipped the headline and the call-to-action buttons). */}
        <main id="main-content" tabIndex={-1} className="w-full outline-none">
          {/* Hero */}
          <div className="w-full relative z-10">
            <BikebearInspiredHero />
          </div>

          <VelocitySkew>
            <TechMarquee
              skills={[
                'SUPERVITY AUTOPILOT ASIA HACKATHON 2ND PLACE (SALES INTELLIGENCE)',
                'STRAIGHT 4.00 CGPA COMPUTER SCIENCE (SOFTWARE ENGINEERING) FOR TWO SEMESTERS',
                'UM GAME JAM 2026 PUBLIC CHOICE AWARD',
                'PERSATUAN KOMPUTER UNIVERSITI MALAYA (PEKOM) FINANCE LEAD 2026/2027',
                'USM V HACK PRELIMINARY ROUND QUALIFIER',
              ]}
            />
          </VelocitySkew>

          <AboutSection />
          <StackedProjects />
          <ExperienceSection />
          <HonorsSection />
          <ContactSection />
        </main>
        <SiteFooter />

        <ScrollToTop />
        <CommandPalette />
        <PointerField />
        <EasterEgg />
      </div>
    </BootSequence>
  );
}
