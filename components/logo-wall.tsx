import React from 'react';
import { FX } from '@/lib/fx';

/**
 * FX-71 Arena Wall: three rows of round seals that roll past each other in opposite directions (the rows also
 * drift against each other as the band scrolls through the viewport). Every seal is a real link to the part of
 * the page it comes from. Server component, pure CSS motion: no client JS. Names come from the rest of the site.
 */
type Seal = { name: string; caption: string; href: string };

const ROWS: { label: string; accent: 'yellow' | 'mint' | 'cyan'; speed: number; seals: Seal[] }[] = [
  {
    label: 'Competitions',
    accent: 'yellow',
    speed: 58,
    seals: [
      { name: 'Supervity', caption: 'AutoPilot Asia · 2nd', href: '#project-zerolag' },
      { name: 'MUBA', caption: 'Blockchain · 2026', href: '#project-proofpay' },
      { name: 'UM Game Jam', caption: 'Public Choice', href: '#honors' },
      { name: 'Technothon', caption: 'UM · 2026', href: '#honors' },
      { name: 'V Hack', caption: 'Varsity · 2026', href: '#honors' },
      { name: 'PPAL 4.0', caption: 'Hari Inovasi', href: '#honors' },
      { name: 'Chemcreative', caption: 'Innovation', href: '#honors' },
      { name: 'PAL KPM', caption: 'Simposium', href: '#honors' },
    ],
  },
  {
    label: 'Organisations',
    accent: 'mint',
    speed: 50,
    seals: [
      { name: 'Universiti Malaya', caption: "Dean's List", href: '#honors' },
      { name: 'PEKOM', caption: 'Finance Lead', href: '#experience' },
      { name: 'KRAIBURG TPE', caption: 'Corporate', href: '#experience' },
      { name: 'MYTECH', caption: 'Career Fair 2026', href: '#experience' },
      { name: 'Alphathon', caption: 'UM · 2025', href: '#experience' },
      { name: 'CodeFest', caption: 'PEKOM · 2025', href: '#experience' },
      { name: 'KMNS', caption: '4.00 CGPA', href: '#honors' },
      { name: 'PAL Club', caption: 'Vice President', href: '#experience' },
    ],
  },
  {
    label: 'Stack',
    accent: 'cyan',
    speed: 64,
    seals: [
      { name: 'Sui Move', caption: 'ProofPay', href: '#project-proofpay' },
      { name: 'Gonka', caption: 'AI Router', href: '#project-proofpay' },
      { name: 'LangGraph', caption: 'ZeroLag', href: '#project-zerolag' },
      { name: 'Gemini', caption: 'BILAHUJAN', href: '#project-bilahujan' },
      { name: 'Next.js', caption: 'Sensor X', href: '#project-sensor-x' },
      { name: 'Spring Boot', caption: 'Slotify', href: '#project-slotify' },
      { name: 'Scikit-Learn', caption: 'Catfish AI', href: '#project-catfish' },
      { name: 'ESP32', caption: 'Sensor X', href: '#project-sensor-x' },
    ],
  },
];

const ACCENT = { yellow: 'bg-pop-yellow', mint: 'bg-pop-mint', cyan: 'bg-pop-cyan' } as const;

function SealLink({ seal, accent, copy }: { seal: Seal; accent: keyof typeof ACCENT; copy: boolean }) {
  return (
    <a
      href={seal.href}
      data-fx-seal={accent}
      aria-hidden={copy || undefined}
      tabIndex={copy ? -1 : undefined}
      aria-label={copy ? undefined : `${seal.name}: ${seal.caption}`}
      className="fx-seal group/seal relative shrink-0 grid place-items-center content-center gap-1.5 w-28 h-28 xs:w-32 xs:h-32 sm:w-40 sm:h-40 mx-2 sm:mx-3 rounded-full border-3 border-ink bg-white shadow-brutal-sm text-center px-3 outline-none focus-visible:ring-4 focus-visible:ring-pop-blue"
    >
      {/* accent flood that rolls in from the bottom on hover / focus */}
      <span aria-hidden className={`fx-seal-fill absolute inset-0 rounded-full ${ACCENT[accent]}`} />
      <span className="relative font-display text-[0.85rem] xs:text-[0.95rem] sm:text-lg font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-ink [overflow-wrap:break-word] max-w-full">
        {seal.name}
      </span>
      <span className="relative font-mono text-[0.7rem] font-bold uppercase tracking-[0.06em] text-ink-soft leading-tight">
        {seal.caption}
      </span>
      {/* small registration dot, like a printed seal */}
      <span
        aria-hidden
        className={`absolute top-2.5 sm:top-3.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-ink ${ACCENT[accent]}`}
      />
    </a>
  );
}

export function LogoWall() {
  if (!FX.logoWall) return null;
  return (
    <section
      aria-labelledby="arena-wall-title"
      className="fx-wall relative w-full overflow-x-clip bg-pop-yellow border-y-3 border-ink py-14 sm:py-20"
    >
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

      <div className="flex flex-col gap-4 sm:gap-6">
        {/* each row is wider than the band (mx-[-8%]), so the scroll drift never shows an edge */}
        {ROWS.map((row, r) => (
          <div
            key={row.label}
            role="group"
            aria-label={row.label}
            className="fx-wall-row mx-[-8%]"
            data-dir={r % 2 ? 'r' : 'l'}
          >
            <div
              className="fx-wall-track flex w-max py-2"
              style={{ '--wall-speed': `${row.speed}s` } as React.CSSProperties}
            >
              {[0, 1, 2, 3].map((c) =>
                row.seals.map((s) => <SealLink key={`${c}-${s.name}`} seal={s} accent={row.accent} copy={c > 0} />),
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
