'use client';

import { useEffect } from 'react';

/**
 * FX-99 / FX-105 progress fill: a consumer of the Section Clock (components/fx/section-clock.tsx), which writes
 * --sp (0 -> 1) on it. Consumers can mount after the clock has scanned the page (lazy chunks, the header marker
 * moving between links), so each one asks for a rescan when it mounts.
 */
export function SpFill({ forId, className }: { forId: string; className: string }) {
  useEffect(() => {
    window.dispatchEvent(new Event('fx-clock-scan'));
  }, []);
  return <span data-sp-for={forId} className={className} />;
}
