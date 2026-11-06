'use client';

import React, { createContext, useContext, useEffect } from 'react';

const BootedContext = createContext(true);
export const useBooted = () => useContext(BootedContext);

declare global {
  interface Window {
    /** true once React has hydrated the page (read by tests and by lib/early-clicks.ts) */
    __hwHydrated?: boolean;
  }
}

/**
 * R98 (owner, 6 Nov 2026: "remove the initialize page for my website, so user click my link website straight away see
 * my hero section"): the "Initialize System" gate (R34 - R91: the yellow screen, the boot log, the tear-off) is gone.
 * Every visit lands on the hero. `<html class="hw-booted">` is in the server HTML (app/layout.tsx), so everything that
 * waited for the gate (the hero entrance, after-boot effects, useBooted) starts at the first paint.
 */
export function BootSequence({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // R98: an in-site return from a simulator ("Return to Portfolio") lands on the project it was launched from
    // (FX-85, components/fx/route-wipe.tsx receiveOnHome); the gate used to force the top over it (R35)
    window.__hwHydrated = true;
  }, []);
  return <BootedContext.Provider value={true}>{children}</BootedContext.Provider>;
}
