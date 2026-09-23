import { useEffect } from "react";
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis?.stop();
    return () => { 
      document.body.style.overflow = prev; 
      (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis?.start(); 
    };
  }, [active]);
}


