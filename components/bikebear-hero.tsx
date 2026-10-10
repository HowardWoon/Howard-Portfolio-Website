'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { WipeLink } from './fx/route-wipe';
import { m, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { Magnetic } from './magnetic-button';
import { Sparkles, Terminal } from 'lucide-react';
import { TextRoll } from './fx/text-roll';
import { TiltCard } from './tilt-card';
import { toLocal } from '@/lib/to-local';
import { SpiderReveal } from './spider-reveal';
import { HeroMascot } from './lazy-sections';
import { BauhausSolid } from './fx/bauhaus-solid';
import { FX } from '@/lib/fx';

/**
 * X-ray magnifier headline.
 * Perf fix: the cursor position is written straight into CSS custom properties
 * (no React state → no re-render on every mousemove).
 * A11y fix: the duplicated overlay copy is aria-hidden so screen readers read the headline once.
 */
function MagnifiedHeadline() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const setVars = (x: number, y: number, on: boolean) => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    el.dataset.hover = on ? 'true' : 'false';
  };

  // Mouse / pen only. On phones a tap fires a synthetic mousemove with no mouseleave, which used to
  // leave a magnifier circle frozen on screen. R24 (owner): the TORCHLIGHT is back - while the mouse is on the headline
  // the headline dims to 25 % and the lens is the bright beam. The lens still has no clip-path transition (never trails).
  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || !containerRef.current) return;
    const { x, y } = toLocal(containerRef.current, e.clientX, e.clientY);
    setVars(x, y, true);
  };

  // Scrolling moves the text under a still cursor → the magnifier would freeze in the wrong place.
  // Switch it off on scroll; the next mouse move switches it back on at the right spot.
  React.useEffect(() => {
    const off = () => {
      const el = containerRef.current;
      if (el?.dataset.hover === 'true') setVars(-1000, -1000, false);
    };
    window.addEventListener('scroll', off, { passive: true });
    return () => window.removeEventListener('scroll', off);
  }, []);

  const headlineClass =
    'hero-title font-display text-[clamp(1.85rem,10.8vw,2.6rem)] leading-[0.95] sm:text-6xl md:text-7xl xl:text-[5.6rem] landscape-short:!text-5xl font-extrabold uppercase tracking-[-0.035em]';
  const chipClass = 'inline-block my-1 px-2 xs:px-3 border-3 rounded-xl xs:rounded-2xl -rotate-1';

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setVars(-1000, -1000, false)}
      data-hover="false"
      style={{ ['--mx' as string]: '-1000px', ['--my' as string]: '-1000px' }}
      className="group/headline relative space-y-2"
    >
      {/* Base Normal Text */}
      <h2
        className={`${headlineClass} text-ink transition-opacity duration-300 group-data-[hover=true]/headline:opacity-25 fx-letterpress fx-aberration`}
      >
        ENGINEERING <br />
        {FX.headlineStamp ? (
          // FX-05 stamp, in CSS since R14 (.fx-stamp-in): the words are in the server HTML from the first paint
          <span className={`${chipClass} fx-stamp-in bg-pop-yellow border-ink shadow-brutal text-ink`}>SYSTEMS TO</span>
        ) : (
          <span className={`${chipClass} bg-pop-yellow border-ink shadow-brutal text-ink`}>SYSTEMS TO</span>
        )}{' '}
        <br />
        STAND OUT IN <br />A NOISY WORLD.
      </h2>

      {/* Scaled X-Ray Magnification Text (decorative duplicate) */}
      <div
        aria-hidden="true"
        className={`${headlineClass} text-pop-blue absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-150 group-data-[hover=true]/headline:opacity-100`}
        style={{
          ...(FX.heroInspection
            ? {
                WebkitTextStroke: '2px #0a0a0a',
                clipPath: 'circle(70px at var(--mx) var(--my))',
              }
            : {
                transform: 'scale(1.15)',
                transformOrigin: 'var(--mx) var(--my)',
                WebkitMaskImage: 'radial-gradient(circle 140px at var(--mx) var(--my), black 60%, transparent 100%)',
                maskImage: 'radial-gradient(circle 140px at var(--mx) var(--my), black 60%, transparent 100%)',
              }),
        }}
      >
        ENGINEERING <br />
        <span className={`${chipClass} bg-pop-red border-ink text-white`}>SYSTEMS TO</span> <br />
        STAND OUT IN <br />A NOISY WORLD.
      </div>

      {/* Decorative squiggle */}
      <div className="w-48 sm:w-64 pt-3 relative z-10" aria-hidden>
        <svg
          viewBox="0 0 200 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full stroke-pop-red"
          strokeWidth="4.5"
          strokeLinecap="round"
        >
          <path d="M2 8 Q 12 0, 22 8 T 42 8 T 62 8 T 82 8 T 102 8 T 122 8 T 142 8 T 162 8 T 182 8 T 198 8" />
        </svg>
      </div>
    </div>
  );
}

export default function BikebearHero() {
  const containerRef = useRef<HTMLElement>(null);

  // Scroll Exit Animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const gate = useMotionValue(0);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (min-height: 700px)');
    const set = () => gate.set(mq.matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, [gate]);
  const opacity = useTransform(() => 1 - gate.get() * Math.min(1, scrollYProgress.get() / 0.8));
  const scale = useTransform(() => 1 - gate.get() * 0.05 * Math.min(1, scrollYProgress.get() / 0.8));
  const yTranslate = useTransform(() => gate.get() * 50 * Math.min(1, scrollYProgress.get() / 0.8));

  return (
    <m.section
      id="hero"
      ref={containerRef}
      style={{ opacity, scale, y: yTranslate }}
      className="hero-fit relative min-h-screen-safe bg-paper text-ink flex flex-col justify-between overflow-hidden"
    >
      {/* Structural grid + dot texture */}
      <div
        aria-hidden
        className="fx-floor-grid absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_75%_65%_at_45%_45%,#000_60%,transparent_100%)] pointer-events-none"
      >
        {/* FX-78 grid gravity: the same grid a second time, only visible in a soft circle under the lamp (mouse);
            a child of the floor so it tilts with FX-62 */}
        {FX.gridGravity ? <div className="fx-grid-lens absolute inset-0 bg-grid hidden lg:block" /> : null}
      </div>

      {/* Bauhaus geometry (decorative) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="fx-depth absolute -left-28 bottom-6 w-44 h-44 rounded-full bg-pop-blue border-3 border-ink hidden xl:block"
          style={{ '--depth': -14 } as React.CSSProperties}
        />
        {FX.solids3d ? (
          <div
            className="fx-depth absolute left-[38%] top-28 hidden lg:block"
            style={{ '--depth': 26 } as React.CSSProperties}
          >
            <BauhausSolid kind="cube" size={40} color="#FF4B2B" />
          </div>
        ) : (
          <div className="absolute left-[38%] top-28 w-10 h-10 bg-pop-red border-3 border-ink rotate-12 hidden lg:block" />
        )}
        <svg
          className="fx-depth absolute left-[46%] bottom-24 w-16 h-16 hidden lg:block animate-wobble"
          style={{ '--depth': 20 } as React.CSSProperties}
          viewBox="0 0 100 100"
        >
          <polygon points="50,6 96,92 4,92" fill="#FFC700" stroke="#0A0A0A" strokeWidth="7" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Main Hero Body */}
      <div className="relative flex-1 flex items-center w-full max-w-[1440px] mx-auto px-4 xs:px-5 sm:px-10 lg:px-16 pt-[calc(var(--header-h)+1.75rem)] sm:pt-[calc(var(--header-h)+3rem)] pb-14 lg:pt-[calc(var(--header-h)+clamp(1rem,3.6svh,2.75rem))] lg:pb-[clamp(1.25rem,5svh,3.5rem)] z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          {/* Left Column: Vision & Narrative (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-7 lg:space-y-[clamp(0.9rem,3.2svh,1.75rem)] relative z-30 pointer-events-auto">
            {/* Brand Pill Badge. FX-61: the hero entrance is CSS (.fx-hero-in, keyed off html.hw-booted), so the
                server HTML is visible and the entrance starts at first paint instead of after hydration. */}
            <div className="nb-kicker fx-hero-in" style={{ '--d': 1 } as React.CSSProperties}>
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              <span>ABOUT // VISION & SYSTEMS ARCHITECTURE</span>
            </div>

            {/* Kinetic Typography Headline */}
            <div className="relative space-y-2 fx-hero-in" style={{ '--d': 2 } as React.CSSProperties}>
              <MagnifiedHeadline />
            </div>

            {/* Sub-narrative Bio Copy */}
            <p
              style={{ '--d': 3 } as React.CSSProperties}
              className="fx-hero-in text-ink-soft text-lg sm:text-xl lg:text-[clamp(1.0625rem,2.6svh,1.25rem)] max-w-xl leading-relaxed font-sans font-medium [overflow-wrap:anywhere]"
            >
              Architecting robust,{' '}
              <span className="nb-marker font-bold text-ink">low-latency distributed backends</span> and{' '}
              <span className="nb-marker font-bold text-ink">autonomous AI systems</span> — engineered with algorithmic
              precision, enterprise scalability, and strategic fiscal discipline.
            </p>

            {/* Call to Action Buttons */}
            <div
              style={{ '--d': 4 } as React.CSSProperties}
              className="fx-hero-in flex flex-wrap items-center gap-3 xs:gap-4 pt-2 w-full"
            >
              <Magnetic strength={0.3} stretch>
                <a href="#projects" className="group nb-btn nb-btn-ink px-7 py-4 fx-specular nb-press">
                  <TextRoll>EXPLORE PROJECTS</TextRoll> {String.fromCodePoint(0x2197)}
                </a>
              </Magnetic>
              <Magnetic strength={0.3} stretch>
                {/* FX-85: the button morphs into the simulator screen (View Transitions); otherwise the FX-35 wipe */}
                <WipeLink
                  href="/simulators/agentic"
                  portal="out"
                  className="group nb-btn nb-btn-white px-6 py-4 fx-specular nb-press"
                >
                  <Terminal className="w-4 h-4" strokeWidth={2.75} />
                  <span>
                    <TextRoll>LIVE SIMULATORS</TextRoll>
                  </span>
                </WipeLink>
              </Magnetic>
            </div>
          </div>

          {/* Right Column: Portrait Card (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full relative">
            {/* Big Bauhaus sun behind the portrait (FX-77 .fx-sunset: sinks and swells as the hero leaves) */}
            <div
              aria-hidden
              className="fx-depth fx-sunset pointer-events-none absolute -top-6 right-0 sm:right-10 w-40 h-40 xs:w-56 xs:h-56 sm:w-72 sm:h-72 rounded-full bg-pop-yellow border-3 border-ink"
              style={{ '--depth': -10 } as React.CSSProperties}
            />
            <div
              aria-hidden
              className="fx-depth pointer-events-none absolute -bottom-6 left-0 lg:left-auto lg:right-[70%] w-20 h-20 xs:w-28 xs:h-28 bg-pop-lilac border-3 border-ink rounded-[28px] rotate-6"
              style={{ '--depth': 6 } as React.CSSProperties}
            />

            <div
              style={{ '--d': 2 } as React.CSSProperties}
              className="fx-hero-in fx-hero-pop relative group flex flex-col items-center lg:items-end z-40 pointer-events-auto w-full sm:w-auto px-1 sm:px-0"
            >
              {/* R49: the cat perches on the ticker's top edge (absolute: no layout change) */}
              <HeroMascot />
              {/* News Ticker (Above Photo) */}
              <div
                className="hero-ticker fx-depth w-full max-w-[350px] sm:max-w-none sm:w-[460px] lg:w-[460px] xl:w-[520px] mb-5 overflow-hidden bg-white rounded-2xl border-3 border-ink py-2.5 relative z-20 shadow-brutal pointer-events-auto"
                style={{ '--depth': 18 } as React.CSSProperties}
              >
                {/* Two items, told apart by their tag: the newest (MUBA) in yellow, the dated one (Supervity) in blue */}
                <div className="flex whitespace-nowrap animate-[marquee_40s_linear_infinite] w-max">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center" aria-hidden={i > 0}>
                      <span className="ml-4 shrink-0 rounded-md border-2 border-ink bg-pop-yellow px-1.5 py-0.5 font-mono text-xs font-extrabold uppercase tracking-[0.1em] text-ink">
                        LATEST
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-extrabold text-ink uppercase tracking-[0.12em] px-3">
                        2ND RUNNER UP (SUI) + TOP 6 (GONKA AI) @ MUBA BLOCKCHAIN HACKATHON 2026 🏅
                      </span>
                      <span className="text-xl text-pop-red font-black mx-2 translate-y-[2px]">*</span>
                      <span className="ml-2 shrink-0 rounded-md border-2 border-ink bg-pop-blue px-1.5 py-0.5 font-mono text-xs font-extrabold uppercase tracking-[0.1em] text-white">
                        8 AUG 2026
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-ink-soft uppercase tracking-[0.12em] px-3">
                        2ND PLACE @ SUPERVITY AUTOPILOT ASIA HACKATHON ✈
                      </span>
                      <span className="text-xl text-pop-red font-black mx-2 translate-y-[2px]">*</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Portrait Frame – hover (or tap) reveals Spider-Man under the cursor, see spider-reveal.tsx */}
              <TiltCard
                maxTilt={6}
                glare
                glareRadius="rounded-[28px] xs:rounded-[36px] sm:rounded-[44px]"
                className="w-full max-w-[350px] sm:w-auto sm:max-w-none"
              >
                <div
                  data-xray
                  className="hero-photo relative w-full max-w-[350px] sm:max-w-none sm:w-[460px] lg:w-[460px] xl:w-[520px] aspect-[5/6] xs:aspect-[6/7] sm:aspect-auto sm:h-[560px] lg:h-[600px] xl:h-[660px] rounded-[28px] xs:rounded-[36px] sm:rounded-[44px] border-3 border-ink bg-pop-yellow overflow-hidden shadow-brutal-lg sm:shadow-brutal-xl fx-shadow-follow transition-colors duration-300 hover:border-pop-red pointer-events-auto cursor-crosshair"
                >
                  <Image
                    src="/images/howard-solid.jpeg"
                    alt="Howard Woon - Full Stack Developer"
                    fill
                    sizes="(max-width: 640px) 350px, (max-width: 1280px) 460px, 520px"
                    className="object-cover object-top saturate-[1.15] contrast-[1.05]"
                    priority
                    quality={85}
                  />

                  {/* also renders the ✦ corner sticker, which is the Spider-Sense toggle */}
                  <SpiderReveal />
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </div>
    </m.section>
  );
}
