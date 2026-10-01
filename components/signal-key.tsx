import type { CSSProperties } from 'react';
import { SIGNAL, type Signal } from '@/lib/signal';

/**
 * R21 colour legend; R24 redesign (owner: the old wrapping row was "messy, unorganised, misaligned"): a printer's
 * colour bar. An ink header strip, then one ruled cell per colour on a strict grid, so every label and meaning lines
 * up. Each cell = a full-width colour band (together they read as a print calibration strip), its index, the label,
 * what it means, and the swatch's hex. Every coloured tag in the section means exactly what this key says
 * (lib/signal.ts). Columns: phones 1 (up to 3 keys) or 2, tablets up to 4, desktop one row (6-7 keys: from 1280 px).
 */
export function SignalKey({ only, className = '' }: { only?: Signal[]; className?: string }) {
  const keys = only ?? (Object.keys(SIGNAL) as Signal[]);
  const n = keys.length;
  const c1 = n <= 3 ? 1 : 2;
  const c2 = n <= 4 ? n : Math.ceil(n / 2);
  // a long key (6-7 colours) only goes to one row from 1280 px: at 1024 its cells would be too narrow for the labels
  const c3 = n <= 5 ? n : c2;
  // the last cell spans whatever its row leaves empty, so the bar never has a hole
  const fill = (c: number) => c - ((n - 1) % c);
  const cols = {
    '--sk-c1': c1,
    '--sk-c2': c2,
    '--sk-c3': c3,
    '--sk-c4': n,
    '--sk-s1': fill(c1),
    '--sk-s2': fill(c2),
    '--sk-s3': fill(c3),
  } as CSSProperties;
  return (
    <div
      role="group"
      aria-label="Signal key: what each colour means"
      className={`signal-key overflow-hidden rounded-2xl border-3 border-ink bg-white shadow-brutal-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-3 bg-ink px-3 py-2 text-white">
        <span className="font-mono text-xs font-extrabold uppercase tracking-[0.18em]">Signal key</span>
        {/* the bar in miniature: every colour of this key, in order */}
        <span aria-hidden className="flex overflow-hidden rounded-[3px] border-2 border-white">
          {keys.map((k) => (
            <span key={k} className={`h-3 w-4 border-r-2 border-white last:border-r-0 ${SIGNAL[k].fill}`} />
          ))}
        </span>
      </div>
      <ul className="signal-key-grid" style={cols}>
        {keys.map((k, i) => (
          <li key={k} className="signal-key-cell">
            <span aria-hidden className={`signal-key-band ${SIGNAL[k].fill}`} />
            <span className="flex items-baseline gap-2 px-3 pt-2.5">
              <span aria-hidden className="font-mono text-xs font-bold tabular-nums text-ink-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-xs font-extrabold tracking-[0.1em] text-ink">{SIGNAL[k].label}</span>
            </span>
            <span className="block px-3 pt-1 font-mono text-xs font-semibold leading-snug text-ink-soft">
              {SIGNAL[k].meaning}
            </span>
            <span aria-hidden className="mt-auto block px-3 pb-2.5 pt-2 font-mono text-xs font-bold text-ink-muted">
              {SIGNAL[k].hex}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
