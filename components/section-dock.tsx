'use client';

import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { FX } from '@/lib/fx';
import { SpFill } from './fx/sp-fill';
import { SECTIONS, SECTION_IDS } from '@/lib/sections';
import { useActiveSection } from '@/lib/use-active-section';
import type { PaletteWindow } from './command-palette';
import { useInteractionSelect } from '@/lib/interaction-store';

/**
 * FX-37 Section Dock (below 1280 px, where the header nav appears; R17 validation: it used to stop at 1024 px, which
 * left iPad-landscape / small-laptop widths 1024-1279 with no section navigation). The page is ~35,000 px tall on a phone; this pill always says where you
 * are and one tap opens the existing command palette (same `open-command-palette` event the header uses).
 * Bottom-LEFT so it never collides with the scroll-to-top button (bottom-right). Hidden while typing,
 * so the on-screen keyboard + contact form are never covered.
 */
export function SectionDock() {
  const active = useActiveSection(SECTION_IDS, FX.sectionDock);
  const [typing, setTyping] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);

  // D6: hide while the visitor scrolls down (reading), show again on any scroll up - like mobile browser bars.
  // State only changes when the direction flips, so this does not re-render on every scroll frame.
  useEffect(() => {
    let lastY = window.scrollY;
    let down = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 12) return;
      const nowDown = y > lastY;
      lastY = y;
      if (nowDown !== down) {
        down = nowDown;
        setScrollingDown(nowDown);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    const onIn = (e: FocusEvent) => {
      if (isField(e.target)) setTyping(true);
    };
    const onOut = (e: FocusEvent) => {
      if (isField(e.target)) setTyping(false);
    };
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);

  // Round 10: step aside while a viewer-mode HUD (trail / focus / tour) owns the bottom of the screen
  const hudOpen = useInteractionSelect((s) => !!(s.trail || s.focus || s.tour));

  if (!FX.sectionDock) return null;
  const label = SECTIONS.find((s) => s.id === active)?.label;
  const visible = !!label && !typing && !scrollingDown && !hudOpen;

  return (
    <button
      type="button"
      onClick={() => {
        (window as PaletteWindow).__hwPaletteWanted = true; // queued if the palette is not mounted yet (R22)
        window.dispatchEvent(new Event('open-command-palette'));
      }}
      aria-label={label ? `Current section: ${label}. Open navigation` : 'Open navigation'}
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : true}
      className={`xl:hidden fixed z-[90] left-[var(--cat-clear,1rem)] bottom-[max(0.75rem,calc(var(--safe-bottom)+0.25rem))] inline-flex items-center gap-2 min-h-[48px] max-w-[60vw] px-4 rounded-full border-3 border-ink bg-white shadow-brutal-sm font-mono text-xs font-extrabold uppercase tracking-[0.1em] text-ink transition-[opacity,transform] duration-200 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <Compass className="w-4 h-4 shrink-0" strokeWidth={2.75} aria-hidden />
      <span className="truncate">{label ?? ''}</span>
      {FX.instrumentRail ? (
        // FX-99: how far through this section you are (Section Clock writes --sp)
        <span
          aria-hidden
          className="absolute left-4 right-4 bottom-[5px] h-[3px] rounded-full bg-ink/15 overflow-hidden"
        >
          <SpFill forId="active" className="fx-sp-bar" />
        </span>
      ) : null}
    </button>
  );
}
