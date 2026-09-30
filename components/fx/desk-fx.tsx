'use client';

import { useEffect } from 'react';
import { FX, canHover, prefersReducedMotion } from '@/lib/fx';
import { useCalm } from '@/lib/motion-pref';
import { useFxLite, isFxLite } from '@/lib/fx-tier';
import { SECTION_IDS } from '@/lib/sections';
import { pointer, POINTER_CONSUMERS } from '@/lib/pointer';
import { jumpTo, willFlip } from '@/lib/jump';
import { restoreSkim } from '@/lib/skim';

/**
 * Round 16 "Drafting Desk Physics": the client-only behaviour of sessions 2-5, in one lazy chunk (never in First
 * Load). Each effect has its own FX flag, cleans up after itself, and stands down for reduced motion / Calm Mode.
 *
 * FX-83 Foundation Reveal: on large screens the footer is fixed under the page inside a clip-path box of its own
 *   height, so the page lifts off it at the end (globals.css). Only when the footer is shorter than 85 % of the screen.
 * FX-84 Shutter Jump: in-page anchor clicks longer than 2.5 screens become one paper flip (lib/jump.ts).
 * FX-86 Soft Landing: a wheel scroll that stops within 6 % of a section top settles onto it (lenis/snap, part of
 *   the installed lenis package). Mouse / trackpad only; keyboard, touch and anchor jumps are never snapped.
 * FX-87 Directional Ink: `.fx-dir-ink` underlines grow from the side the mouse entered and leave the way it left.
 * FX-89 Gyro Lamp: on Android phones / tablets (no permission prompt exists there; iOS would prompt, so it is
 *   skipped) a gentle tilt moves the desk lamp, driving the same --px / --py the mouse drives on desktop.
 * FX-92 Skim Lens: restores the visitor's skim choice for this session.
 */
export function DeskFx() {
  const calm = useCalm();
  const lite = useFxLite();

  // FX-92 (+ a mount signal: the listeners below are live; tests wait for it)
  useEffect(() => {
    if (FX.skimLens) restoreSkim();
    const root = document.documentElement;
    root.dataset.fxDesk = 'on';
    return () => {
      delete root.dataset.fxDesk;
    };
  }, []);

  // FX-83
  useEffect(() => {
    if (!FX.foundationReveal) return;
    const wrap = document.querySelector<HTMLElement>('.fx-foundation');
    const footer = wrap?.querySelector<HTMLElement>('footer');
    if (!wrap || !footer) return;
    const root = document.documentElement;
    const mq = window.matchMedia('(min-width: 1024px) and (min-height: 760px)');
    const update = () => {
      const h = footer.offsetHeight;
      wrap.style.setProperty('--footer-h', `${h}px`);
      const on = mq.matches && !prefersReducedMotion() && !isFxLite() && h < window.innerHeight * 0.85;
      if (on) root.dataset.foundation = 'on';
      else delete root.dataset.foundation;
    };
    const ro = new ResizeObserver(update);
    ro.observe(footer);
    window.addEventListener('resize', update);
    mq.addEventListener('change', update);
    update();
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      mq.removeEventListener('change', update);
      delete root.dataset.foundation;
    };
  }, [calm, lite]);

  // FX-84: capture phase on window, so it runs before Lenis' own anchor handler (bubble phase on window). Lenis
  // does not check defaultPrevented, so its anchor option is switched off for this one click instead of stopping
  // propagation (which would also swallow React's own click handlers).
  useEffect(() => {
    if (!FX.shutterJump) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = a ? decodeURIComponent(a.getAttribute('href')!.slice(1)) : '';
      const el = id ? document.getElementById(id) : null;
      // R17 P1-02: project anchors (index tiles, Arena Wall seals) always go through jumpTo, which lands on the card's
      // untransformed shell; other anchors only when the jump is long enough for the flip
      if (!el || (!willFlip(el) && !el.closest('[data-project-shell]'))) return;
      e.preventDefault();
      const lenis = window.__lenis;
      if (lenis) {
        const prev = lenis.options.anchors;
        lenis.options.anchors = false;
        window.setTimeout(() => {
          lenis.options.anchors = prev;
        }, 0);
      }
      history.pushState(null, '', `#${id}`);
      jumpTo(el, a as HTMLElement);
    };
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, []);

  // FX-86
  useEffect(() => {
    if (!FX.softLanding || calm || prefersReducedMotion() || !canHover()) return;
    let cancelled = false;
    let destroy = () => {};
    let tries = 0;
    const start = async () => {
      const lenis = window.__lenis;
      if (!lenis) {
        if (tries++ < 10) window.setTimeout(start, 400);
        return;
      }
      const { default: Snap } = await import('lenis/snap');
      if (cancelled) return;
      const snap = new Snap(lenis, { type: 'proximity', distanceThreshold: '6%', duration: 0.6, debounce: 220 });
      let removers: (() => void)[] = [];
      const compute = () => {
        removers.forEach((r) => r());
        removers = SECTION_IDS.map((id) => document.getElementById(id))
          .filter((el): el is HTMLElement => el !== null)
          .map((el) => {
            const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
            return snap.add(Math.round(el.getBoundingClientRect().top + window.scrollY - margin));
          });
      };
      let t = 0;
      const soon = () => {
        window.clearTimeout(t);
        t = window.setTimeout(compute, 250);
      };
      const ro = new ResizeObserver(soon); // lazy sections, images and accordions change the section tops
      ro.observe(document.body);
      compute();
      destroy = () => {
        window.clearTimeout(t);
        ro.disconnect();
        snap.destroy();
      };
    };
    start();
    return () => {
      cancelled = true;
      destroy();
    };
  }, [calm]);

  // FX-90: the glint plays when a featured card is first seen (cards can mount off-screen, and remount when the
  // category changes), not when it mounts
  useEffect(() => {
    if (!FX.podiumGlint) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.glint = 'go';
          io.unobserve(e.target);
        }
      },
      { threshold: 0.4 },
    );
    const watch = () => document.querySelectorAll('.fx-glint:not([data-glint])').forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    const host = document.getElementById('honors') ?? document.body;
    mo.observe(host, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  // FX-87
  useEffect(() => {
    if (!FX.directionalInk || !canHover()) return;
    const side = (e: PointerEvent, el: Element) => {
      const r = el.getBoundingClientRect();
      return e.clientX < r.left + r.width / 2 ? 'l' : 'r';
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('.fx-dir-ink');
      if (!el || el.contains(e.relatedTarget as Node | null)) return;
      el.dataset.inkFrom = side(e, el);
    };
    const onOut = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('.fx-dir-ink');
      if (!el || el.contains(e.relatedTarget as Node | null)) return;
      el.dataset.inkFrom = side(e, el);
    };
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerout', onOut, { passive: true });
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
    };
  }, []);

  // FX-89
  useEffect(() => {
    if (!FX.gyroLamp || calm || lite || canHover() || prefersReducedMotion()) return;
    if (typeof window.DeviceOrientationEvent === 'undefined') return;
    // iOS / iPadOS would need DeviceOrientationEvent.requestPermission(), a system prompt: never prompt, skip.
    // (UA test, because Chromium also exposes requestPermission but fires events without it.)
    const iOS =
      /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (iOS) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return;

    const root = document.documentElement;
    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target as HTMLElement);
          else visible.delete(e.target as HTMLElement);
        }
      },
      { rootMargin: '200px 0px' },
    );
    const observed = new WeakSet<Element>();
    const scan = () =>
      document.querySelectorAll(POINTER_CONSUMERS).forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      });
    scan();
    const rescan = window.setInterval(scan, 2000);

    let base: { b: number; g: number } | null = null;
    const target = { x: 0, y: 0 };
    let raf = 0;
    const clamp = (v: number) => Math.max(-0.5, Math.min(0.5, v));
    const step = () => {
      raf = 0;
      const dx = target.x - pointer.x;
      const dy = target.y - pointer.y;
      pointer.x += dx * 0.08;
      pointer.y += dy * 0.08;
      visible.forEach((el) => {
        el.style.setProperty('--px', pointer.x.toFixed(3));
        el.style.setProperty('--py', pointer.y.toFixed(3));
      });
      if (Math.abs(dx) > 0.002 || Math.abs(dy) > 0.002) raf = requestAnimationFrame(step);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null || document.hidden) return;
      if (!base) {
        base = { b: e.beta, g: e.gamma };
        root.dataset.fxGyro = 'on';
      }
      target.x = clamp((e.gamma - base.g) / 30);
      target.y = clamp((e.beta - base.b) / 30);
      if (!raf) raf = requestAnimationFrame(step);
    };
    window.addEventListener('deviceorientation', onTilt);
    return () => {
      window.removeEventListener('deviceorientation', onTilt);
      window.clearInterval(rescan);
      cancelAnimationFrame(raf);
      io.disconnect();
      delete root.dataset.fxGyro;
      visible.forEach((el) => {
        el.style.removeProperty('--px');
        el.style.removeProperty('--py');
      });
    };
  }, [calm, lite]);

  return null;
}
