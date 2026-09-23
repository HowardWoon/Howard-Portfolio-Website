"use client";

import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Respect user's motion preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
      autoRaf: true, // replaces the manual rAF loop that was never cancelled on unmount
      // Smoothly handle <a href="#section"> links. Lenis already honours the CSS `scroll-margin-top`
      // set on section[id] in globals.css, so no extra JS offset is needed (adding one doubled it).
      anchors: true,
      // Let scrollable modals / lists scroll natively
      prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
    });

    window.__lenis = lenis;

    return () => {
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
