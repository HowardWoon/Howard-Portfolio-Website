import { SIGNAL, type Signal } from '@/lib/signal';

/** R21: the colour legend. Every coloured tag in a section means exactly what this key says (lib/signal.ts). */
export function SignalKey({ only, className = '' }: { only?: Signal[]; className?: string }) {
  const keys = only ?? (Object.keys(SIGNAL) as Signal[]);
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border-3 border-ink bg-white px-3 py-2.5 shadow-brutal-sm ${className}`}
    >
      <span className="font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-ink">Signal key</span>
      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {keys.map((k) => (
          <li key={k} className="flex items-center gap-1.5">
            <span aria-hidden className={`h-3.5 w-3.5 shrink-0 rounded-[3px] border-2 border-ink ${SIGNAL[k].fill}`} />
            <span className="font-mono text-xs font-extrabold tracking-[0.08em] text-ink">{SIGNAL[k].label}</span>
            <span className="hidden font-mono text-xs font-bold text-ink-soft xl:inline">{SIGNAL[k].meaning}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
