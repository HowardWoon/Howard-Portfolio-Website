import React from 'react';
import { SIGNAL, type Signal } from '@/lib/signal';

/**
 * R21 marquees. Colour only comes from the SIGNAL KEY chips (lib/signal.ts); tapes, shapes and separators are ink /
 * paper, so no colour is used without a meaning. Each band keeps the `animate-[marquee...` class, so FX-D5 still
 * pauses it off-screen, hover pauses it, and reduced motion stops it (globals.css).
 * The first copy of every loop is readable; the repeats are aria-hidden.
 */

/** neutral Bauhaus separators: circle, square, triangle, diamond in turn */
function Glyph({ i, tone = 'paper' }: { i: number; tone?: 'paper' | 'ink' }) {
  const fill = tone === 'paper' ? 'bg-white border-ink' : 'bg-ink border-white';
  const shape = i % 4;
  if (shape === 2)
    return (
      <span
        aria-hidden
        className={`mx-3 inline-block h-5 w-5 shrink-0 sm:mx-5 sm:h-6 sm:w-6 ${tone === 'paper' ? 'bg-ink' : 'bg-white'} [clip-path:polygon(50%_0,100%_100%,0_100%)]`}
      />
    );
  return (
    <span
      aria-hidden
      className={`mx-3 inline-block h-4 w-4 shrink-0 border-3 sm:mx-5 sm:h-5 sm:w-5 ${fill} ${
        shape === 0 ? 'rounded-full' : shape === 1 ? '' : 'rotate-45'
      }`}
    />
  );
}

function SignalChip({ kind }: { kind: Signal }) {
  return (
    <span
      className={`shrink-0 rounded-md border-2 border-ink px-1.5 py-0.5 font-mono text-xs font-extrabold tracking-[0.12em] text-ink ${SIGNAL[kind].fill}`}
    >
      {SIGNAL[kind].label}
    </span>
  );
}

/** a fixed "lower third" label on the left edge of a tape */
function TapeLabel({ children, tone }: { children: React.ReactNode; tone: 'paper' | 'ink' }) {
  return (
    <span
      aria-hidden
      className={`absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 items-center gap-1.5 border-3 px-2.5 py-1 font-mono text-xs font-extrabold tracking-[0.16em] sm:flex ${
        tone === 'paper'
          ? 'border-ink bg-ink text-white shadow-[4px_4px_0_0_#fff]'
          : 'border-white bg-white text-ink shadow-[4px_4px_0_0_#0A0A0A]'
      }`}
    >
      <span className="text-xs">▶</span>
      {children}
    </span>
  );
}

/** kind = its SIGNAL KEY meaning; leave it out for a neutral fact (no chip, no colour) */
export type MarqueeItem = { label: string; kind?: Signal };

export function TechMarquee({ items, stack }: { items: MarqueeItem[]; stack: string[] }) {
  const loop = [...items, ...items, ...items, ...items];
  const stackLoop = [...stack, ...stack, ...stack, ...stack];
  return (
    <div className="relative z-20 w-full -rotate-[0.6deg] scale-[1.02]">
      {/* deck 1: highlights, each tagged with its signal */}
      <div className="relative overflow-hidden border-y-3 border-ink bg-paper py-3 shadow-[0_6px_0_0_#0A0A0A] sm:py-4">
        <TapeLabel tone="paper">HIGHLIGHTS</TapeLabel>
        <div className="flex w-max items-center whitespace-nowrap animate-[marquee_56s_linear_infinite] hover:[animation-play-state:paused]">
          {loop.map((it, idx) => (
            <div key={idx} className="flex items-center" aria-hidden={idx >= items.length}>
              <span className="flex items-center gap-2.5 px-2 sm:gap-3">
                {it.kind ? <SignalChip kind={it.kind} /> : null}
                <span className="font-display text-lg font-extrabold uppercase tracking-[-0.01em] text-ink sm:text-2xl md:text-3xl">
                  {it.label}
                </span>
              </span>
              <Glyph i={idx} />
            </div>
          ))}
        </div>
      </div>
      {/* deck 2: the stack, running the other way on an ink tape */}
      <div className="relative -mt-[3px] overflow-hidden border-b-3 border-ink bg-ink py-2 sm:py-2.5">
        <TapeLabel tone="ink">STACK</TapeLabel>
        <div className="flex w-max items-center whitespace-nowrap animate-[marquee_44s_linear_infinite_reverse] hover:[animation-play-state:paused]">
          {stackLoop.map((s, idx) => (
            <div key={idx} className="flex items-center" aria-hidden={idx >= stack.length}>
              <span className="px-1 font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-white sm:text-sm">
                {s}
              </span>
              <span aria-hidden className="mx-3 font-mono text-xs font-extrabold text-white/50 sm:mx-4">
                {'</>'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Contact: two tapes crossing in an X, running opposite ways (slogan / status) */
export function SloganTape({ slogan, facts }: { slogan: string; facts: MarqueeItem[] }) {
  const factLoop = [...facts, ...facts, ...facts, ...facts, ...facts, ...facts];
  return (
    <div className="relative mt-24 h-[128px] w-full overflow-x-clip sm:h-[156px]">
      {/* tape B (behind): status, ink */}
      <div className="absolute inset-x-[-4%] top-[36%] -translate-y-1/2 -rotate-[2.4deg] overflow-hidden border-y-3 border-ink bg-ink py-2.5 sm:py-3">
        <div className="flex w-max items-center whitespace-nowrap animate-[marquee_38s_linear_infinite_reverse] hover:[animation-play-state:paused]">
          {factLoop.map((f, idx) => (
            <div key={idx} className="flex items-center" aria-hidden={idx >= facts.length}>
              <span className="flex items-center gap-2 px-1">
                {f.kind ? <SignalChip kind={f.kind} /> : null}
                <span className="font-mono text-xs font-extrabold uppercase tracking-[0.14em] text-white sm:text-sm">
                  {f.label}
                </span>
              </span>
              <Glyph i={idx + 1} tone="ink" />
            </div>
          ))}
        </div>
      </div>
      {/* tape A (front): the slogan, paper */}
      <div className="absolute inset-x-[-4%] top-[62%] -translate-y-1/2 rotate-[1.6deg] overflow-hidden border-y-3 border-ink bg-paper py-3 shadow-[0_6px_0_0_#0A0A0A] sm:py-4">
        <div className="flex w-max items-center whitespace-nowrap animate-[marquee_34s_linear_infinite] hover:[animation-play-state:paused]">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center" aria-hidden={i > 0}>
              <span className="px-4 font-display text-lg font-extrabold uppercase tracking-[-0.01em] text-ink sm:px-6 sm:text-2xl md:text-3xl">
                {slogan}
              </span>
              <Glyph i={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
