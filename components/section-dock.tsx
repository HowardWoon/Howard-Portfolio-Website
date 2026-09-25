'use client';

import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { FX } from '@/lib/fx';
import { SECTIONS, SECTION_IDS } from '@/lib/sections';
import { useActiveSection } from '@/lib/use-active-section';

/**
 * FX-37 Section Dock (below 1024 px). The page is ~35,000 px tall on a phone; this pill always says where you
 * are and one tap opens the existing command palette (same `open-command-palette` event the header uses).
 * Bottom-LEFT so it never collides with the scroll-to-top button (bottom-right). Hidden while typing,
 * so the on-screen keyboard + contact form are never covered.
 */
export function SectionDock() {
  const active = useActiveSection(SECTION_IDS, FX.sectionDock);
  const [typing, setTyping] = useState(false);

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

  if (!FX.sectionDock) return null;
  const label = SECTIONS.find((s) => s.id === active)?.label;
  const visible = !!label && !typing;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
      aria-label={label ? `Current section: ${label}. Open navigation` : 'Open navigation'}
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : true}
      className={`lg:hidden fixed z-[90] left-[max(1rem,calc(var(--safe-left)+0.5rem))] bottom-[max(1rem,calc(var(--safe-bottom)+0.5rem))] sm:bottom-8 sm:left-8 inline-flex items-center gap-2 min-h-[48px] max-w-[60vw] px-4 rounded-full border-3 border-ink bg-white shadow-brutal-sm font-mono text-xs font-extrabold uppercase tracking-[0.1em] text-ink transition-[opacity,transform] duration-200 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <Compass className="w-4 h-4 shrink-0" strokeWidth={2.75} aria-hidden />
      <span className="truncate">{label ?? ''}</span>
    </button>
  );
}
