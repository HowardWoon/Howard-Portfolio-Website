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
      <div className="relative min-h-screen bg-[#090B10] selection:bg-amber-500 selection:text-black">
        <SiteHeader />
        <BikebearInspiredHero />
      <TechMarquee skills={['AUTOPILOT ASIA HACKATHON 2ND PLACE (SALES INTELLIGENCE)', 'STRAIGHT 4.00 CGPA COMPUTER SCIENCE (SOFTWARE ENGINEERING) FOR TWO SEMESTER', 'UM GAME JAM 2026 PUBLIC CHOICE AWARD', 'PERSATUAN KOMPUTER UNIVERSITI MALAYA (PEKOM) FINANCE LEAD 2026/2027', 'USM V HACK PRELIMINARY ROUND QUALIFIER']} />
      <main className="w-full">
        

        <div id="about"><AboutSection /></div>

        <div id="projects"><StackedProjects /></div>
        <div id="experience"><ExperienceSection /></div>

        <div id="honors"><HonorsSection /></div>

        <ContactSection />
      </main>

      <ScrollToTop />
    </div></BootSequence>
  );
}
