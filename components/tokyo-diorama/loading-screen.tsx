'use client';

import { useEffect, useState } from 'react';
import '@/app/diorama-loading.css';

/**
 * R120 (owner, screenshot of the R119 card over the street's still: "you only need these messages - behind them, go
 * black first, all the way, and make this loading page more premium"). ONE loading screen for the home teaser window
 * and the /diorama page: a solid ink stage (the still is not shown behind it), the street's name, LOADING THE 3D
 * STREET at display size, the four real build steps with a live count, and a stepped bar.
 *
 * The steps are read from the engine's own `diorama:*` performance measures (R80 / R107) - real progress, never a
 * made-up percentage. The bar is a transform animation the compositor runs, so it keeps stepping through a busy frame.
 * Ink / paper only (no SIGNAL colour); white 3 px rules and hard white offsets on the ink stage.
 */
export const LOADING_STEPS = ['BUILD', 'SHADERS', 'TEXTURES', 'WARM-UP'] as const;

const stepOf = (name: string): number | null => {
  const n = name.slice('diorama:'.length);
  if (n === 'compile-request' || n === 'link' || n === 'first-use') return 1;
  if (n === 'texture') return 2;
  if (n === 'warm-draw') return 3;
  if (n === 'first-frame' || n === 'warm') return null;
  return 0; // renderer, environment, world-N, traffic, weather, seasons, life, tier
};

/** Follows the engine's build while `active`: the current step (0 - 3) and how many items of it are done. */
export function useBuildProgress(active: boolean) {
  const [state, setState] = useState({ step: 0, count: 0 });
  useEffect(() => {
    if (!active || typeof PerformanceObserver === 'undefined') return;
    setState({ step: 0, count: 0 });
    let at = 0;
    let n = 0;
    let alive = true;
    // one state update per observer batch, not per entry (a warm-up reports hundreds of draws)
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.name.startsWith('diorama:')) continue;
        const s = stepOf(e.name);
        if (s === null) continue;
        if (s > at) {
          at = s;
          n = 0;
        }
        if (s === at) n++;
      }
      if (alive) setState({ step: at, count: n });
    });
    try {
      obs.observe({ type: 'measure' });
    } catch {
      return;
    }
    return () => {
      alive = false;
      obs.disconnect();
    };
  }, [active]);
  return state;
}

export function DioramaLoading({
  step,
  count,
  size = 'window',
}: {
  step: number;
  count: number;
  /** 'window' = the home teaser's window, 'stage' = the /diorama page's full street frame */
  size?: 'window' | 'stage';
}) {
  return (
    <div className="dl-stage" data-size={size}>
      <div className="dp-loading" role="status" aria-live="polite" data-loading-step={LOADING_STEPS[step]}>
        <span className="dl-kicker">夜雨の街角 · TOKYO_AFTER_RAIN</span>
        <span className="dp-loading-title">LOADING THE 3D STREET</span>
        <ol className="dp-steps" aria-label="Loading steps">
          {LOADING_STEPS.map((name, i) => (
            <li key={name} data-state={i < step ? 'done' : i === step ? 'now' : 'next'}>
              <span aria-hidden>{String(i + 1).padStart(2, '0')}</span> {name}
              {i === step && count > 0 ? <b> {count}</b> : null}
            </li>
          ))}
        </ol>
        <span className="dp-bar" aria-hidden>
          <i />
        </span>
        <span className="dl-count" aria-hidden>
          STEP {String(step + 1).padStart(2, '0')} / {String(LOADING_STEPS.length).padStart(2, '0')}
        </span>
        <span className="sr-only">
          Step {step + 1} of {LOADING_STEPS.length}: {LOADING_STEPS[step]}
        </span>
      </div>
    </div>
  );
}
