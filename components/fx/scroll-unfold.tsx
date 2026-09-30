'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useMotionAllowed } from './use-motion-allowed';
import { FX } from '@/lib/fx';

/**
 * FX-07: a card rises out of a tilted-back 3D plane (like a drawing lifted off a drafting table) as it
 * scrolls into view, and is perfectly flat by the time its top reaches 80% of the viewport (R17 P1-13: at 55 % the header controls were
 * still foreshortened to 24 px when they became readable).
 * Scroll-linked (not time-based), so it never replays and never lags behind fast scrolling.
 *
 * R20 perf: driven by a CSS view timeline (globals.css "FX-07", runs off the main thread) instead of one framer
 * useScroll tracker per card, which walked the offsetParent chain on every scroll event. Same pose, same range,
 * same linear curve. Browsers without scroll-driven animations get a small fallback that reads layout once when
 * the card nears the screen and only scrollY per frame after that.
 * Server HTML and first paint are flat (no transform); the unfold is switched on after mount only where it is
 * allowed (desktop, fine pointer, motion allowed, not Calm Mode).
 */
export function ScrollUnfold({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed(FX.cardUnfold);

  useEffect(() => {
    const el = ref.current;
    if (!el || !allowed) return;
    if (CSS.supports('animation-timeline: view()')) {
      el.dataset.unfold = 'css';
      return () => {
        delete el.dataset.unfold;
      };
    }

    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    let top = 0;
    let raf = 0;
    let near = false;
    const measure = () => {
      let t = 0;
      for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) t += n.offsetTop;
      top = t;
    };
    const paint = () => {
      raf = 0;
      if (!mq.matches) {
        el.style.transform = '';
        return;
      }
      const vh = window.innerHeight;
      const k = 1 - Math.min(1, Math.max(0, (vh - (top - window.scrollY)) / (0.2 * vh)));
      el.style.transform = `perspective(1400px) translateY(${48 * k}px) scale(${1 - 0.07 * k}) rotateX(${14 * k}deg)`;
    };
    const schedule = () => {
      if (near && !raf) raf = requestAnimationFrame(paint);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        if (near) {
          measure();
          schedule();
        }
      },
      { rootMargin: '0px 0px 200px 0px' },
    );
    io.observe(el);
    const onResize = () => {
      measure();
      schedule();
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    mq.addEventListener('change', onResize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      mq.removeEventListener('change', onResize);
      el.style.transform = '';
    };
  }, [allowed]);

  return (
    <div data-fx ref={ref} className={className} style={{ transformOrigin: '50% 100%' }}>
      {children}
    </div>
  );
}
