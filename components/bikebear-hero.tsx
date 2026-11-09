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
import { FX } from '@/lib/fx';
import '@/app/hero-forme.css';

/**
 * Hero headline with the torch (R86).
 * Perf fix: the beam's centre and size are written straight into the clip path and the lens transform from one rAF
 * (no React state → no re-render on every mousemove).
 * A11y fix: the duplicated overlay copy is aria-hidden so screen readers read the headline once.
 */
// nothing shows until the beam opens (every browser understands this one)
const HEADLINE_CLOSED = 'circle(0px at 0px 0px)';

function MagnifiedHeadline() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const beamRef = React.useRef<HTMLDivElement>(null);
  const lensRef = React.useRef<HTMLDivElement>(null);

  // R86 (owner, 3 Nov 2026, after R63's water: "the water with the black edge is disgusting and blocks it ... make it a
  // torch like the version long ago, cleaner, and 3D when it shines"; R63's water is gone, lib/liquid.ts with it).
  // While the mouse is on the headline it dims and a razor-edged round beam (clip-path circle, no rim, no blur) lights
  // the words under it: magnified 1.12x and lifted off the page in the interactive blue with a hard ink extrusion.
  // The beam glides after the pointer and opens / closes on a short ease; Calm / reduced motion: it sits exactly
  // under the pointer, no magnification. Mouse / pen only: on phones a tap fires a synthetic move with no leave.
  React.useEffect(() => {
    const el = containerRef.current;
    const beam = beamRef.current;
    const lens = lensRef.current;
    if (!el || !beam || !lens) return;
    const still =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'calm';
    const size = () => Math.round(Math.min(110, Math.max(64, el.clientWidth * 0.13)));
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let r = 0;
    let tr = 0;
    const draw = () => {
      raf = 0;
      const k = still ? 1 : 0.28;
      x += (tx - x) * k;
      y += (ty - y) * k;
      r += (tr - r) * (still ? 1 : 0.3);
      if (r < 0.5 && tr === 0) {
        r = 0;
        beam.style.clipPath = HEADLINE_CLOSED;
        return;
      }
      beam.style.clipPath = `circle(${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
      lens.style.transformOrigin = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3 || Math.abs(tr - r) > 0.3) raf = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const on = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const p = toLocal(el, e.clientX, e.clientY);
      tx = p.x;
      ty = p.y;
      if (el.dataset.hover !== 'true') {
        el.dataset.hover = 'true';
        // the beam opens where the pointer came in, not where it last closed
        if (r === 0) {
          x = tx;
          y = ty;
        }
        tr = size();
      }
      kick();
    };
    const off = () => {
      if (el.dataset.hover !== 'true') return;
      el.dataset.hover = 'false';
      tr = 0;
      kick();
    };
    // Scrolling moves the text under a still cursor: the beam would sit in the wrong place. It closes on scroll;
    // the next mouse move opens it again at the right spot.
    el.addEventListener('pointermove', on, { passive: true });
    el.addEventListener('pointerleave', off);
    window.addEventListener('scroll', off, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', on);
      el.removeEventListener('pointerleave', off);
      window.removeEventListener('scroll', off);
    };
  }, []);

  const headlineClass =
    'hero-title font-display text-[clamp(1.85rem,10.8vw,2.6rem)] leading-[0.95] sm:text-6xl md:text-7xl xl:text-[5.6rem] landscape-short:!text-5xl font-extrabold uppercase tracking-[-0.035em]';
  const chipClass = 'inline-block my-1 px-2 xs:px-3 border-3 rounded-xl xs:rounded-2xl -rotate-1';

  return (
    <div ref={containerRef} data-hover="false" className="group/headline relative space-y-2">
      {/* R98 forme (app/hero-forme.css): cast block letters - paper faces, an ink rim and a solid ink extrusion that
          falls away from the pointer; on load each line drops into its slot as a slug, then the type rises off the
          paper. Replaces the FX-29 blue lamp shadow and the FX-30 RGB fringes on this headline. Dims while the torch
          is on it (a flat 35 %, instant: no fade that reads as haze). */}
      <h2 className={`${headlineClass} hx-forme group-data-[hover=true]/headline:opacity-35`}>
        <span className="hx-line">
          <span className="hx-slug" style={{ '--i': 0 } as React.CSSProperties}>
            ENGINEERING
          </span>
        </span>{' '}
        <span className="hx-line">
          <span className="hx-slug" style={{ '--i': 1 } as React.CSSProperties}>
            {/* FX-05 stamp, in CSS since R14 (.fx-stamp-in): the words are in the server HTML from the first paint */}
            <span
              className={`${chipClass} hx-chip ${FX.headlineStamp ? 'fx-stamp-in ' : ''}bg-pop-yellow border-ink shadow-brutal`}
            >
              SYSTEMS TO
            </span>
          </span>
        </span>{' '}
        <span className="hx-line">
          <span className="hx-slug" style={{ '--i': 2 } as React.CSSProperties}>
            STAND OUT IN
          </span>
        </span>{' '}
        <span className="hx-line">
          <span className="hx-slug" style={{ '--i': 3 } as React.CSSProperties}>
            A NOISY WORLD.
          </span>
        </span>
      </h2>

      {/* The torch beam (decorative): a hard round cut of the paper, no rim. Inside it the same headline, magnified
          and lifted in the interactive blue with a hard ink extrusion (the "3D" of the beam). Closed until the mouse
          is on the headline. */}
      <div
        ref={beamRef}
        aria-hidden="true"
        data-torch
        className="absolute inset-0 !mt-0 pointer-events-none overflow-hidden bg-ground-lilac"
        style={{ clipPath: HEADLINE_CLOSED }}
      >
        <div
          ref={lensRef}
          className={`${headlineClass} motion-safe:scale-[1.12] text-pop-blue`}
          style={{ WebkitTextStroke: '2px #0a0a0a', textShadow: '4px 4px 0 #0a0a0a' }}
        >
          ENGINEERING <br />
          <span
            className={`${chipClass} bg-pop-yellow border-ink text-ink`}
            style={{ WebkitTextStroke: '0', textShadow: 'none' }}
          >
            SYSTEMS TO
          </span>{' '}
          <br />
          STAND OUT IN <br />A NOISY WORLD.
        </div>
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

/**
 * R111 (owner, Pinterest references: the round "AVAILABLE FROM OCTOBER" sticker): a lime sticker with its words set on a
 * circle (SVG textPath), stuck on the portrait's top-left corner with a hard ink offset. The words are the Contact
 * card's own ("AVAILABLE FOR 2026 ROLES"). Decoration for the eye, read once by screen readers.
 */
function HireSticker() {
  return (
    <div
      data-hire-sticker
      role="img"
      aria-label="Available for 2026 roles"
      className="pointer-events-none absolute -left-3 top-16 z-50 h-28 w-28 sm:-left-10 sm:top-20 sm:h-32 sm:w-32"
    >
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-12 drop-shadow-[4px_4px_0_#0a0a0a]" aria-hidden>
        <defs>
          <path id="hire-ring" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <circle cx="60" cy="60" r="57" fill="#D4FF3A" stroke="#0a0a0a" strokeWidth="3" />
        <circle cx="60" cy="60" r="31" fill="#0a0a0a" />
        <text
          fill="#0a0a0a"
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '11.5px',
            fontWeight: 800,
            letterSpacing: '1.6px',
          }}
        >
          {/* the words run once round the whole ring (textLength = the circle's length, 2 x pi x 44) */}
          <textPath href="#hire-ring" startOffset="0" textLength="276" lengthAdjust="spacing">
            AVAILABLE FOR 2026 ROLES ·
          </textPath>
        </text>
        <text
          x="60"
          y="66"
          textAnchor="middle"
          fill="#D4FF3A"
          style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: '19px', fontWeight: 800 }}
        >
          2026
        </text>
      </svg>
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
  const scale = useTransform(() => 1 - gate.get() * 0.05 * Math.min(1, scrollYProgress.get() / 0.8));
  const yTranslate = useTransform(() => gate.get() * 50 * Math.min(1, scrollYProgress.get() / 0.8));

  return (
    <m.section
      id="hero"
      ref={containerRef}
      // R98: the hero sinks as the page scrolls on; it no longer fades (R87: motion is a transition, not a fade)
      style={{ scale, y: yTranslate }}
      className="hero-fit relative min-h-screen-safe bg-ground-lilac text-ink flex flex-col justify-between overflow-hidden"
    >
      {/* Main Hero Body */}
      <div className="hero-wrap relative flex-1 flex items-center w-full max-w-[1440px] mx-auto px-4 xs:px-5 sm:px-10 lg:px-16 pt-[calc(var(--header-h)+1.75rem)] sm:pt-[calc(var(--header-h)+3rem)] pb-14 lg:pt-[calc(var(--header-h)+clamp(1rem,3.6svh,2.75rem))] lg:pb-[clamp(1.25rem,5svh,3.5rem)] z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          {/* Left Column: Vision & Narrative (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-7 lg:space-y-[clamp(0.9rem,3.2svh,1.75rem)] relative z-30 pointer-events-auto">
            {/* Brand Pill Badge. FX-61 / R98: the hero entrance is CSS (a stepped print-head wipe, .hx-wipe), so the
                server HTML is visible and the entrance starts at first paint instead of after hydration. */}
            <div className="nb-kicker hx-wipe" style={{ '--d': 1 } as React.CSSProperties}>
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              <span>ABOUT // VISION & SYSTEMS ARCHITECTURE</span>
            </div>

            {/* Kinetic Typography Headline */}
            <div className="relative space-y-2">
              <MagnifiedHeadline />
            </div>

            {/* Sub-narrative Bio Copy */}
            <p
              style={{ '--d': 3 } as React.CSSProperties}
              className="hx-wipe text-ink-soft text-lg sm:text-xl lg:text-[clamp(1.0625rem,2.6svh,1.25rem)] max-w-xl leading-relaxed font-sans font-medium [overflow-wrap:anywhere]"
            >
              Architecting robust,{' '}
              <span className="nb-marker font-bold text-ink">low-latency distributed backends</span> and{' '}
              <span className="nb-marker font-bold text-ink">autonomous AI systems</span> — engineered with algorithmic
              precision, enterprise scalability, and strategic fiscal discipline.
            </p>

            {/* Call to Action Buttons */}
            <div
              style={{ '--d': 4 } as React.CSSProperties}
              className="hx-wipe flex flex-wrap items-center gap-3 xs:gap-4 pt-2 w-full"
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
            <div
              style={{ '--d': 2 } as React.CSSProperties}
              className="hx-wipe-down relative group flex flex-col items-center lg:items-end z-40 pointer-events-auto w-full sm:w-auto px-1 sm:px-0"
            >
              {/* News Ticker (Above Photo) */}
              <div
                className="hero-ticker fx-depth w-full max-w-[350px] sm:max-w-none sm:w-[460px] lg:w-[460px] xl:w-[520px] mb-5 overflow-hidden bg-white rounded-2xl border-3 border-ink py-2.5 relative z-20 shadow-brutal pointer-events-auto"
                style={{ '--depth': 18 } as React.CSSProperties}
              >
                {/* Owner (22 Oct 2026): the ticker carries the DOSM Datathon result only, tagged LATEST in yellow */}
                <div className="flex whitespace-nowrap animate-[marquee_40s_linear_infinite] w-max">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center" aria-hidden={i > 0}>
                      <span className="ml-4 shrink-0 rounded-md border-2 border-ink bg-pop-yellow px-1.5 py-0.5 font-mono text-xs font-extrabold uppercase tracking-[0.1em] text-ink">
                        LATEST
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-extrabold text-ink uppercase tracking-[0.12em] px-3">
                        TOP 5 FINALIST & CONSOLATION PRIZE @ DOSM DATATHON 2026 🏆
                      </span>
                      <span className="text-xl text-pop-red font-black mx-2 translate-y-[2px]">*</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* R111: the round availability sticker on the portrait's corner (the words of the Contact card) */}
              <HireSticker />
              {/* Main Portrait Frame – hover (or tap) reveals Spider-Man under the cursor, see spider-reveal.tsx */}
              <TiltCard
                maxTilt={6}
                glare
                glareRadius="rounded-2xl xs:rounded-2xl sm:rounded-2xl"
                className="w-full max-w-[350px] sm:w-auto sm:max-w-none"
              >
                <div
                  data-xray
                  className="hero-photo relative w-full max-w-[350px] sm:max-w-none sm:w-[460px] lg:w-[460px] xl:w-[520px] aspect-[5/6] xs:aspect-[6/7] sm:aspect-auto sm:h-[560px] lg:h-[600px] xl:h-[660px] rounded-2xl xs:rounded-2xl sm:rounded-2xl border-3 border-ink bg-pop-yellow overflow-hidden shadow-brutal-lg sm:shadow-brutal-xl fx-shadow-follow transition-colors duration-300 hover:border-pop-red pointer-events-auto cursor-crosshair"
                >
                  <Image
                    src="/images/howard-solid.jpeg"
                    alt="Howard Woon - Software Engineer"
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
