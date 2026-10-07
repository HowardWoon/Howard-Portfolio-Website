'use client';

import { useEffect, useState } from 'react';
import { FX } from '@/lib/fx';
import { SECTION_IDS } from '@/lib/sections';
import { useActiveSection } from '@/lib/use-active-section';
import { TIDE } from '@/lib/section-clock';

/**
 * FX-76 Chromatic Tide: one fixed "desk surface" behind the page whose tint glides between the section soft
 * fills already used by the About / Experience accent maps (no new colour). The cream sections go transparent
 * (globals.css `html[data-tide='on'] .fx-tide-surface`) so the desk shows through; dots, rules and cards stay.
 *
 * Section awareness is the existing useActiveSection IntersectionObserver (renders only when the section
 * changes). Between sections (marquee, Arena Wall, footer) the last tint is kept, so the desk never flashes
 * back to cream; back at the top of the page the tint is cleared. Colour is not motion: reduced motion /
 * Calm keep the tint, the global rule just removes the glide.
 */
// R18: when the Section Clock (FX-95) runs, it writes --tide / --tide-b / --relay on this element itself, and the
// second layer (.fx-relay-b) sweeps the next section's desk colour in (FX-96..98). Without it, the R16 path below.
const CLOCK = FX.sectionClock;

export function TideCanvas() {
  const active = useActiveSection(SECTION_IDS, FX.chromaticTide && !CLOCK);
  const [key, setKey] = useState('');

  useEffect(() => {
    if (!FX.chromaticTide) return;
    const root = document.documentElement;
    root.dataset.tide = 'on';
    return () => {
      delete root.dataset.tide;
    };
  }, []);

  useEffect(() => {
    if (CLOCK) return;
    if (active) setKey(active);
    else if (window.scrollY < window.innerHeight * 0.5) setKey('');
  }, [active]);

  if (!FX.chromaticTide) return null;
  return (
    <div
      aria-hidden
      className="fx-tide-canvas"
      data-tide-key={CLOCK ? undefined : key || undefined}
      style={!CLOCK && key ? ({ '--tide': TIDE[key] } as React.CSSProperties) : undefined}
    >
      {CLOCK && FX.atmosphereRelay ? <div className="fx-relay-b" /> : null}
      {/* R40 P3: the ink roller rides the halftone front of the relay layer (desktop, globals.css) */}
      {CLOCK && FX.atmosphereRelay ? <div className="fx-roller" /> : null}
    </div>
  );
}
