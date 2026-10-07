'use client';

import { useEffect } from 'react';
import { Pin, PinOff } from 'lucide-react';
import { registerPin, togglePin, useIsPinned, type PinFacts } from '@/lib/press-run';
import { FX } from '@/lib/fx';

/**
 * R40 R1 PIN key: pins this card's existing facts to the Proof Tray. A key like the card's other chips (Blueprint,
 * Focus); pressed = interactive blue. Icon only below 1280 px (the card bars are tight), the words from there.
 */
export function PinKey({ facts, className = '' }: { facts: PinFacts; className?: string }) {
  const pinned = useIsPinned(facts.id);
  useEffect(() => registerPin(facts), [facts]);
  if (!FX.proofTray) return null;
  const Icon = pinned ? PinOff : Pin;
  return (
    <button
      type="button"
      data-pin-key={facts.id}
      aria-pressed={pinned}
      aria-label={pinned ? `Unpin ${facts.title} from the tray` : `Pin ${facts.title} to the tray`}
      title={pinned ? 'Unpin from tray' : 'Pin to tray'}
      onClick={() => togglePin(facts.id)}
      className={`nb-chip nb-press inline-flex min-h-[44px] min-w-[44px] shrink-0 justify-center cursor-pointer ${
        pinned ? '!bg-pop-blue !text-white' : ''
      } ${className}`}
    >
      <Icon className="w-4 h-4" strokeWidth={2.75} aria-hidden />
      <span className="hidden xl:inline">{pinned ? 'PINNED' : 'PIN TO TRAY'}</span>
    </button>
  );
}
