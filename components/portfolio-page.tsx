import { SkipLink } from '@/components/skip-link';
import BikebearInspiredHero from '@/components/bikebear-hero';
import AboutSection from '@/components/about-section';
import {
  BuildStory,
  SystemStatusBar,
  StackedProjects,
  ExperienceSection,
  HonorsSection,
  ContactSection,
  InteractionHud,
  AmbientFx,
  TideCanvas,
  FrameGovernor,
  DeskFx,
  SectionSpine,
  SectionDock,
  CommandPalette,
  OffscreenPause,
  PointerField,
  EasterEgg,
  SectionClock,
} from '@/components/lazy-sections';
import { SiteFooter } from '@/components/site-footer';
import { AfterBoot } from '@/components/after-boot';
import { LogoWall } from '@/components/logo-wall';
import dynamic from 'next/dynamic';
import { RouteWipeClear } from '@/components/fx/route-wipe';
const VelocitySkew = dynamic(() => import('@/components/fx/velocity-skew').then((mod) => mod.VelocitySkew));

import { BootSequence } from '@/components/boot-sequence';
import { TechMarquee } from '@/components/marquees';
import { ScrollToTop } from '@/components/scroll-to-top';
import { SiteHeader } from '@/components/site-header';

export function PortfolioPage() {
  return (
    <BootSequence>
      <div className="fx-page-root relative min-h-screen overflow-x-clip bg-paper text-ink">
        {/* FX-76: the fixed desk surface, first so it paints under everything (z -1 inside .fx-page-root) */}
        <TideCanvas />
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
              items={[
                { label: 'SUPERVITY AUTOPILOT ASIA HACKATHON 2ND PLACE (SALES INTELLIGENCE)', kind: 'podium' },
                {
                  label: 'STRAIGHT 4.00 CGPA COMPUTER SCIENCE (SOFTWARE ENGINEERING) FOR TWO SEMESTERS',
                  kind: 'academic',
                },
                { label: 'UM GAME JAM 2026 PUBLIC CHOICE AWARD', kind: 'podium' },
                { label: 'PERSATUAN KOMPUTER UNIVERSITI MALAYA (PEKOM) FINANCE LEAD 2026/2027', kind: 'leadership' },
                { label: 'USM V HACK PRELIMINARY ROUND QUALIFIER', kind: 'qualifier' },
              ]}
              stack={[
                'Java 21',
                'Spring Boot 3',
                'Python',
                'FastAPI',
                'LangGraph',
                'TypeScript',
                'Next.js 15',
                'PostgreSQL',
                'Sui Move',
                'ESP32 · MQTT',
                'Gemini · MCP',
              ]}
            />
          </VelocitySkew>

          {/* R22: hardware-style status strip (clock, ping, X-ray mode); adds controls, changes no content */}
          <SystemStatusBar />

          <AboutSection />
          {/* R21: scroll-scrubbed storyboard (student ID -> shipped system); owns no section id */}
          <BuildStory />
          <StackedProjects />
          <ExperienceSection />
          <HonorsSection />
          <LogoWall />
          <ContactSection />
        </main>
        {/* FX-83: on large screens the footer is revealed underneath the page (globals.css .fx-foundation) */}
        <div className="fx-foundation">
          <SiteFooter />
        </div>

        <ScrollToTop />
        <FrameGovernor />
        <SectionClock />
        <OffscreenPause />
        <RouteWipeClear home />
        {/* R19 FX-109: the heavy client effects start after the boot gate lifts */}
        {/* mounted one per idle moment, most-used first */}
        <AfterBoot>
          <CommandPalette />
          <InteractionHud />
          <SectionDock />
          <SectionSpine />
          <DeskFx />
          <AmbientFx />
          <PointerField />
          <EasterEgg />
        </AfterBoot>
      </div>
    </BootSequence>
  );
}
