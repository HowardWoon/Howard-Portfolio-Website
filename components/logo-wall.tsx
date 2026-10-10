import React from 'react';
import { FX } from '@/lib/fx';
import { ArenaRow } from './lazy-sections';

/**
 * FX-71 Arena Wall: three rows that roll past each other in opposite directions (the rows also drift against each
 * other as the band scrolls through the viewport). R44 Proof Reel: the rows carry every gallery photo on the site as
 * a print, between ink tickets that are real links to the part of the page they come from (components/arena-reel.tsx
 * owns the rows and the lightbox). This file stays a server component; the rolling is pure CSS.
 */

export function LogoWall() {
  if (!FX.logoWall) return null;
  return (
    <section
      aria-labelledby="arena-wall-title"
      className={`fx-wall relative w-full overflow-x-clip bg-pop-yellow ${FX.arenaPinboard ? 'bg-dots' : ''} border-y-3 border-ink py-14 sm:py-20`}
    >
      {FX.arenaPinboard ? (
        // FX-94: the boot-gate composition (yellow + dots + blue sun, red square, white moon, triangle) returns as the
        // wall's backdrop, plus a stage light that follows the mouse along the band. Decorative only.
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="fx-depth absolute -left-20 -top-20 w-40 h-40 sm:-left-24 sm:-top-24 sm:w-72 sm:h-72 rounded-full bg-pop-blue border-3 border-ink"
            style={{ '--depth': -16 } as React.CSSProperties}
          />
          <div className="fx-drift absolute right-[7%] top-[9%] w-12 h-12 sm:w-20 sm:h-20 bg-pop-red border-3 border-ink rotate-12 hidden sm:block" />
          <svg
            className="fx-drift-rev absolute left-[6%] bottom-[5%] w-16 h-16 sm:w-24 sm:h-24 hidden md:block"
            viewBox="0 0 100 100"
          >
            <polygon points="50,6 96,92 4,92" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="7" strokeLinejoin="round" />
          </svg>
          <div
            className="fx-depth absolute -right-16 -bottom-16 w-36 h-36 sm:-right-20 sm:-bottom-20 sm:w-64 sm:h-64 rounded-full bg-white border-3 border-ink"
            style={{ '--depth': 12 } as React.CSSProperties}
          />
          <div className="fx-wall-lamp absolute inset-y-0 left-1/2 w-[46%] -ml-[23%]" />
        </div>
      ) : null}
      <div className="relative z-[1] flex flex-col items-center gap-4 px-4 mb-10 sm:mb-14 text-center">
        <span className="nb-kicker bg-white">TRACK RECORD // ARENAS &amp; STACK</span>
        {/* FX-75: stage curtains part to reveal the title (CSS, globals.css) */}
        <h2
          id="arena-wall-title"
          className="fx-curtain nb-title text-[clamp(1.9rem,8vw,4.5rem)] leading-[0.95] flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
        >
          <span className="font-bold">WHERE I BUILD</span>
          <span aria-hidden className="inline-block w-10 sm:w-16 h-[5px] bg-white border-2 border-ink" />
          <em className="italic">&amp; COMPETE</em>
        </h2>
      </div>

      <div className="fx-wall-rows relative z-[1] flex flex-col gap-4 sm:gap-6">
        {/* each row is wider than the band (mx-[-8%]), so the scroll drift never shows an edge */}
        {/* competitions, organisations, stack (REEL_ROWS in arena-reel.tsx) */}
        {[0, 1, 2].map((r) => (
          <ArenaRow key={r} row={r} />
        ))}
      </div>
    </section>
  );
}
