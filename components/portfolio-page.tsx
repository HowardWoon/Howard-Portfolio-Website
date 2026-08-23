'use client';
import BikebearInspiredHero from '@/components/bikebear-hero';
import AboutSection from '@/components/about-section';
import StackedProjects from '@/components/stacked-projects';
import ExperienceSection from '@/components/experience-section';
import HonorsSection from '@/components/honors-section';
import ContactSection from '@/components/contact-section';

import { BootSequence } from '@/components/boot-sequence';
import { TechMarquee } from '@/components/marquees';



export function PortfolioPage() {
  
    
  

  return (
    <BootSequence><div className="relative min-h-screen bg-[#090B10] selection:bg-amber-500 selection:text-black">
      <BikebearInspiredHero />
      <TechMarquee skills={['REGIONAL APAC HACKATHON 2ND PLACE', 'STRAIGHT 4.00 CGPA UM SOFTWARE ENGINEERING', 'UM GAME JAM 2026 PUBLIC CHOICE AWARD', 'PERSATUAN KOMPUTER UNIVERSITI MALAYA (PEKOM) FINANCE LEAD', 'USM V HACK PRELIMINARY ROUND QUALIFIER']} />
      <main className="w-full">
        

        <AboutSection />

        <StackedProjects />
        <ExperienceSection />

        <HonorsSection />

        <ContactSection />
      </main>

      
    </div></BootSequence>
  );
}
