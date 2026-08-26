'use client';
import { useState, useEffect } from 'react';
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
  const [scale, setScale] = useState(0.3555);
  useEffect(() => {
    const handleResize = () => {
      const target = Math.max(window.innerWidth / 512, window.innerHeight / 288);
      setScale(1 / target);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BootSequence>
      <div className="relative min-h-screen overflow-x-clip bg-[#090B10] selection:bg-amber-500 selection:text-black">
        <div className="relative w-full h-[200vh]">
            {/* Real website stays sticky at top while we scroll 200vh */}
            <div className="sticky top-0 h-screen w-full z-0 overflow-hidden">
              <SiteHeader />
            <BikebearInspiredHero />
          </div>
          
          {/* Macbook overlay dictates the 200vh scroll and fades out at end */}
          <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
            <div className="w-full h-full">
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
                showGradient={false}
              >
                {/* 
                  Render the actual hero component inside the Macbook screen.
                  We force it to a desktop width (1440px) and scale it down to fit the 512px (32rem) laptop screen.
                  512 / 1440 = 0.3555
                */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="origin-center pointer-events-none shrink-0" 
                    style={{ width: '100vw', height: '100vh', transform: `scale(${scale})` }}
                  >
                   <div className="w-full h-full bg-[#090B10]">
                     <SiteHeader />
                       <BikebearInspiredHero />
                     </div>
                  </div>
                </div>
              </MacbookScroll>
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
