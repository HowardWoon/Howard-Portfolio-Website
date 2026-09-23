'use client';
import BikebearInspiredHero from '@/components/bikebear-hero';
import AboutSection from '@/components/about-section';
import StackedProjects from '@/components/stacked-projects';
import ExperienceSection from '@/components/experience-section';
import HonorsSection from '@/components/honors-section';
import ContactSection from '@/components/contact-section';

import { BootSequence } from '@/components/boot-sequence';
import { TechMarquee } from '@/components/marquees';
import { ScrollToTop } from '@/components/scroll-to-top';
import { SiteHeader } from '@/components/site-header';


export function PortfolioPage() {
  return (
    <BootSequence>
      <div className="relative min-h-screen overflow-x-clip bg-paper text-ink">

        {/* Fixed header lives OUTSIDE any z-indexed wrapper. It used to sit inside a `relative z-10` div,
            which capped its z-[9999] at 10 — so the marquee (z-20) and honours cards (z-10) scrolled OVER
            the header and blocked taps on the Resume / Search buttons. */}
        {/* Skip link (keyboard / screen-reader users). It moves FOCUS as well as scroll —
            a plain href="#…" is intercepted by Lenis, which scrolls but leaves focus at the top. */}
        <a
          href="#main-content"
          onClick={(e) => {
            const target = document.getElementById("main-content");
            if (!target) return;
            e.preventDefault();
            target.focus({ preventScroll: true });
            if (window.__lenis) window.__lenis.scrollTo(target, { immediate: true });
            else target.scrollIntoView();
          }}
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999999] focus:px-4 focus:py-2 focus:bg-pop-yellow focus:text-ink focus:font-mono focus:font-bold focus:border-3 focus:border-ink focus:rounded-lg focus:shadow-brutal-sm"
        >
          Skip to content
        </a>

        <SiteHeader />

        {/* Hero */}
        <div id="main-content" tabIndex={-1} className="w-full relative z-10 outline-none">
          <BikebearInspiredHero />
        </div>

        <TechMarquee skills={['SUPERVITY AUTOPILOT ASIA HACKATHON 2ND PLACE (SALES INTELLIGENCE)', 'STRAIGHT 4.00 CGPA COMPUTER SCIENCE (SOFTWARE ENGINEERING) FOR TWO SEMESTERS', 'UM GAME JAM 2026 PUBLIC CHOICE AWARD', 'PERSATUAN KOMPUTER UNIVERSITI MALAYA (PEKOM) FINANCE LEAD 2026/2027', 'USM V HACK PRELIMINARY ROUND QUALIFIER']} />

        <main id="main" className="w-full">
          <AboutSection />
          <StackedProjects />
          <ExperienceSection />
          <HonorsSection />
          <ContactSection />
        </main>

        <ScrollToTop />
      </div>
    </BootSequence>
  );
}
