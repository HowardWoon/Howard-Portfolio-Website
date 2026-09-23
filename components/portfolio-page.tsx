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
        <SiteHeader />

        {/* Hero */}
        <div className="w-full relative z-10">
          <BikebearInspiredHero />
        </div>

        <TechMarquee skills={['AUTOPILOT ASIA HACKATHON 2ND PLACE (SALES INTELLIGENCE)', 'STRAIGHT 4.00 CGPA COMPUTER SCIENCE (SOFTWARE ENGINEERING) FOR TWO SEMESTER', 'UM GAME JAM 2026 PUBLIC CHOICE AWARD', 'PERSATUAN KOMPUTER UNIVERSITI MALAYA (PEKOM) FINANCE LEAD 2026/2027', 'USM V HACK PRELIMINARY ROUND QUALIFIER']} />

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
