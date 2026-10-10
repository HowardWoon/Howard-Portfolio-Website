'use client';

import React, { useEffect, useState } from 'react';
import { useBooted } from './boot-sequence';

/**
 * R19 FX-109: renders its children only once the boot gate has lifted, and then one child per idle moment, in order.
 * The heavy client-only effects (pointer field, HUD, desk physics, ambient FX, palette, dock, rail, easter egg) used
 * to start behind the gate and competed with the loader for the main thread (a 567 ms frame at 4x CPU); mounting
 * them all in the reveal frame then froze the boot shatter (447 + 377 ms long tasks). Now:
 *  - after a real boot they wait until the shatter has played (SETTLE_MS), then mount one per idle callback;
 *  - returning visitors (no gate) get them one per idle callback right away.
 * The server and the first client render both output nothing here, so hydration never differs.
 */
const SETTLE_MS = 1000; // boot shatter length (fx/boot-shatter.ts) + a little

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function AfterBoot({
  children,
  eager = 0,
}: {
  children: React.ReactNode;
  /** R49 (owner: "where is the menu?"): the first `eager` children are navigation the visitor looks for at once (the
   *  section rail, the mobile dock). They mount as soon as the gate lifts instead of waiting for the shatter to end
   *  and then for an idle moment (the rail used to appear 1.4 - 2.1 s after the gate). They are light: no canvas, no
   *  physics. Everything after them keeps the settled, one-per-idle start. */
  eager?: number;
}) {
  const booted = useBooted();
  const items = React.Children.toArray(children);
  const total = items.length;
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);

  // Returning visitors never see a gate: start at once. After a real boot (booted turns true during the gate's 100 %
  // hold), wait until html.hw-booted (the shatter starts), then let the shatter play (SETTLE_MS).
  useEffect(() => {
    if (!booted) return;
    const root = document.documentElement;
    let t = 0;
    if (root.classList.contains('hw-booted') && !document.querySelector('[data-fx-shatter]')) {
      setStarted(true);
      return;
    }
    const arm = () => {
      t = window.setTimeout(() => setStarted(true), SETTLE_MS);
    };
    if (root.classList.contains('hw-booted')) {
      arm();
      return () => window.clearTimeout(t);
    }
    const mo = new MutationObserver(() => {
      if (!root.classList.contains('hw-booted')) return;
      mo.disconnect();
      arm();
    });
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => {
      mo.disconnect();
      window.clearTimeout(t);
    };
  }, [booted]);

  // one more child per idle moment (fallback: every 50 ms)
  useEffect(() => {
    if (!started) return;
    if (count >= total) {
      document.documentElement.dataset.afterBoot = 'done';
      return;
    }
    const w = window as IdleWindow;
    const more = () => setCount((c) => Math.max(c, eager) + 1);
    if (w.requestIdleCallback) {
      const h = w.requestIdleCallback(more, { timeout: 600 });
      return () => w.cancelIdleCallback?.(h);
    }
    const t = window.setTimeout(more, 50);
    return () => window.clearTimeout(t);
  }, [started, count, total, eager]);

  return booted ? <>{items.slice(0, Math.max(count, Math.min(eager, total)))}</> : null;
}
