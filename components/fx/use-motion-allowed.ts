import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/lib/fx';

/**
 * Hydration-safe motion switch. Returns true on the server AND on the first client render (so the HTML
 * always matches), then flips to false after mount for visitors with prefers-reduced-motion.
 * NEVER branch the rendered element tree on framer's useReducedMotion(): on the server it is null and on
 * the client it is true, which changes the markup and throws React hydration error #418.
 * Change only styles/props with this hook, never which elements are rendered.
 */
export function useMotionAllowed(flag: boolean = true): boolean {
  const [allowed, setAllowed] = useState(true);
  useEffect(() => {
    if (!flag || prefersReducedMotion()) setAllowed(false);
  }, [flag]);
  return flag && allowed;
}
