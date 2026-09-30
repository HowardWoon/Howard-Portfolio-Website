import type { ReactNode } from 'react';

/**
 * R21: every honour gets an emblem whose FORM says what it is, so no two kinds of honour look alike:
 *   gold / silver / bronze  a ribboned medal in the real metal colour (placements and medals)
 *   star                    a gold medal with a star (#1 public choice)
 *   finalist                a pennant (finalist, cyan = QUALIFIER)
 *   seal                    a scalloped seal (academic distinction, orange = ACADEMIC)
 *   ticket                  a ticket stub (qualified, cyan = QUALIFIER)
 *   badge                   a plain shield (participation, neutral white)
 * The value (e.g. "2nd", "Gold", "4.00") sits on the emblem; the label sits under it.
 */
export type EmblemKind = 'gold' | 'silver' | 'bronze' | 'star' | 'finalist' | 'seal' | 'ticket' | 'badge';

const FILL: Record<EmblemKind, string> = {
  gold: '#FFC700',
  star: '#FFC700',
  silver: '#D5D9E0',
  bronze: '#E0A86B',
  finalist: '#00E5FF',
  seal: '#FF9F1C',
  ticket: '#00E5FF',
  badge: '#FFFFFF',
};

const INK = '#0A0A0A';

function Shape({ kind }: { kind: EmblemKind }) {
  const fill = FILL[kind];
  if (kind === 'gold' || kind === 'silver' || kind === 'bronze' || kind === 'star')
    return (
      <>
        {/* ribbon tails */}
        <polygon points="34,4 56,4 66,46 44,50" fill="#FFFFFF" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <polygon points="86,4 64,4 54,46 76,50" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="60" cy="74" r="40" fill={fill} stroke={INK} strokeWidth="4" />
        <circle cx="60" cy="74" r="31" fill="none" stroke={INK} strokeWidth="1.6" strokeDasharray="3 3" />
        {kind === 'star' ? (
          <polygon
            points="60,40 63.5,49 73,49 65.5,54.5 68.5,63.5 60,58 51.5,63.5 54.5,54.5 47,49 56.5,49"
            fill={INK}
          />
        ) : null}
      </>
    );
  if (kind === 'seal') {
    const pts: string[] = [];
    for (let i = 0; i < 32; i++) {
      const r = i % 2 ? 40 : 46;
      const a = (i / 32) * Math.PI * 2;
      pts.push(`${(60 + r * Math.cos(a)).toFixed(1)},${(64 + r * Math.sin(a)).toFixed(1)}`);
    }
    return (
      <>
        <polygon points="40,92 52,118 58,104 70,116 80,92" fill={INK} />
        <polygon points={pts.join(' ')} fill={fill} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <circle cx="60" cy="64" r="31" fill="#FFFFFF" stroke={INK} strokeWidth="2.5" />
      </>
    );
  }
  if (kind === 'ticket')
    return (
      <path
        d="M8 34 H112 V54 A10 10 0 0 0 112 74 V94 H8 V74 A10 10 0 0 0 8 54 Z"
        fill={fill}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    );
  if (kind === 'finalist')
    return (
      <>
        <line x1="16" y1="10" x2="16" y2="116" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <polygon points="18,14 112,40 18,68" fill={fill} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      </>
    );
  return (
    <path
      d="M60 8 L108 24 V62 C108 88 86 106 60 116 C34 106 12 88 12 62 V24 Z"
      fill={fill}
      stroke={INK}
      strokeWidth="4"
      strokeLinejoin="round"
    />
  );
}

/** where the value sits on each emblem (percent of the 120x120 box) */
const VALUE_AT: Record<EmblemKind, { top: string; left: string; w: string }> = {
  gold: { top: '64%', left: '50%', w: '52%' },
  silver: { top: '64%', left: '50%', w: '52%' },
  bronze: { top: '64%', left: '50%', w: '52%' },
  star: { top: '68%', left: '50%', w: '52%' },
  seal: { top: '53%', left: '50%', w: '48%' },
  ticket: { top: '53%', left: '50%', w: '70%' },
  finalist: { top: '34%', left: '44%', w: '56%' },
  badge: { top: '52%', left: '50%', w: '62%' },
};

export function HonorEmblem({ kind, value, label }: { kind: EmblemKind; value: ReactNode; label: string }) {
  const at = VALUE_AT[kind];
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[104px] w-[104px] shrink-0 -rotate-3 drop-shadow-[3px_3px_0_#0A0A0A]">
        <svg aria-hidden viewBox="0 0 120 120" className="absolute inset-0 h-full w-full overflow-visible">
          <Shape kind={kind} />
        </svg>
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 text-center font-display text-[1.05rem] font-extrabold leading-none tracking-[-0.03em] text-ink"
          style={{ top: at.top, left: at.left, width: at.w }}
        >
          {value}
        </span>
      </div>
      <span className="max-w-[12rem] font-mono text-[0.7rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </span>
    </div>
  );
}
