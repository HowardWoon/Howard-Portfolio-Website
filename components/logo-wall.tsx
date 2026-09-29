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

/**
 * FX-94 Arena Pinboard: Bauhaus colour-blocked seal faces (existing pop fills only). One list per row, indexed by
 * the seal's position in the row, so all four copies are identical and the marquee loop stays seamless. A row
 * never uses its own hover colour as a face (the flood would be invisible), and no two neighbours share a face,
 * across the copy boundary too. Ink text on every light face is >= 6:1; the ink face carries white / yellow text.
 */
type Face = 'white' | 'cyan' | 'pink' | 'mint' | 'lilac' | 'orange' | 'ink';
const FACE_BG: Record<Face, string> = {
  white: 'bg-white',
  cyan: 'bg-pop-cyan',
  pink: 'bg-pop-pink',
  mint: 'bg-pop-mint',
  lilac: 'bg-pop-lilac',
  orange: 'bg-pop-orange',
  ink: 'bg-ink',
};
const FACES: Face[][] = [
  ['white', 'cyan', 'pink', 'mint', 'white', 'lilac', 'orange', 'ink'],
  ['lilac', 'white', 'orange', 'cyan', 'white', 'pink', 'ink', 'white'],
  ['pink', 'white', 'mint', 'ink', 'orange', 'white', 'lilac', 'white'],
];

function SealLink({
  seal,
  accent,
  copy,
  face,
}: {
  seal: Seal;
  accent: keyof typeof ACCENT;
  copy: boolean;
  face: Face;
}) {
  const dark = face === 'ink';
  return (
    <a
      href={seal.href}
      data-fx-seal={accent}
      data-fx-stamp-target
      aria-hidden={copy || undefined}
      tabIndex={copy ? -1 : undefined}
      aria-label={copy ? undefined : `${seal.name}: ${seal.caption}`}
      className={`fx-seal group/seal relative shrink-0 grid place-items-center content-center gap-1.5 w-28 h-28 xs:w-32 xs:h-32 sm:w-40 sm:h-40 mx-2 sm:mx-3 rounded-full border-3 border-ink ${FX.arenaPinboard ? FACE_BG[face] : 'bg-white'} shadow-brutal-sm text-center px-3 outline-none focus-visible:ring-4 focus-visible:ring-pop-blue`}
    >
      {/* accent flood that rolls in from the bottom on hover / focus */}
      <span aria-hidden className={`fx-seal-fill absolute inset-0 rounded-full ${ACCENT[accent]}`} />
      <span
        className={`relative font-display text-[0.85rem] xs:text-[0.95rem] sm:text-lg font-extrabold uppercase leading-[0.95] tracking-[-0.02em] [overflow-wrap:break-word] max-w-full transition-colors ${
          dark && FX.arenaPinboard
            ? 'text-white group-hover/seal:text-ink group-focus-visible/seal:text-ink'
            : 'text-ink'
        }`}
      >
        {seal.name}
      </span>
      <span
        className={`relative font-mono text-[0.7rem] font-bold uppercase tracking-[0.06em] leading-tight transition-colors ${
          dark && FX.arenaPinboard
            ? 'text-pop-yellow group-hover/seal:text-ink-soft group-focus-visible/seal:text-ink-soft'
            : 'text-ink-soft'
        }`}
      >
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
                row.seals.map((s, i) => (
                  <SealLink
                    key={`${c}-${s.name}`}
                    seal={s}
                    accent={row.accent}
                    copy={c > 0}
                    face={FACES[r][i % FACES[r].length]}
                  />
                )),
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
