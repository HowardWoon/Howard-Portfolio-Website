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
import { MacbookScroll } from '@/components/ui/macbook-scroll';


export function PortfolioPage() {
  

  return (
    <BootSequence>
      <div className="relative min-h-screen bg-[#090B10] selection:bg-amber-500 selection:text-black">
        <SiteHeader />
        <div className="relative w-full h-[200vh]">
          {/* Real website stays sticky at top while we scroll 200vh */}
          <div className="sticky top-0 h-screen w-full z-0 overflow-hidden">
            <BikebearInspiredHero />
          </div>
          
          {/* Macbook overlay dictates the 200vh scroll and fades out at end */}
          <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
            <div className="w-full h-full overflow-hidden">
              <MacbookScroll
                title={
                  <div className="flex flex-col items-center justify-center mb-10">
                    <h1 className="text-4xl font-semibold text-white pointer-events-auto">
                      Welcome to my universe. <br />
                      <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                        Scroll down to enter.
                      </span>
                    </h1>
                  </div>
                }
                src="/hero-screenshot.png"
                showGradient={false}
              />
            </div>
          </div>
        </div>
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
