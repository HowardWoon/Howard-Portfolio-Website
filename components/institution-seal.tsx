'use client';

import { useId } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { SPRING_STAMP } from '@/lib/fx';
import { useCalm } from '@/lib/motion-pref';

/**
 * R30 Registrar Seal (R29 Issuer Seal, made special): an institution crest printed like the embossed seal on a
 * certificate. A computed 36-tooth rosette edge (paper, 2.5 px ink), a hard ink offset shadow (no blur), an ACADEMIC
 * orange band (SIGNAL KEY: coursework, grades, university) and the crest on a paper disc. The `ring` size adds the
 * institution's own name as letterpress around the edge.
 *
 * - Upright, never rotated, never a faint watermark behind text, never glowing (30-design-system H6).
 * - Mechanical press on mouse hover (the face drops onto its shadow, like `.nb-key`); stamps in once when it first
 *   scrolls into view; both off for reduced motion / Calm.
 * - Decorative (`aria-hidden`): it is only ever placed beside the institution's written name.
 * - Type floor: the ring is drawn 1:1 (132 px box = 132 viewBox units), so its 13 px / 800 letters render at 13 px.
 */
const CRESTS = {
  um: { src: '/images/logos/um_logo.png', name: 'UNIVERSITI MALAYA' },
  kmns: { src: '/images/logos/kmns_logo_clear.png', name: 'KOLEJ MATRIKULASI NEGERI SEMBILAN' },
} as const;

const SIZES = {
  pill: 'h-8 w-8',
  badge: 'h-10 w-10',
  stamp: 'h-12 w-12 sm:h-16 sm:w-16',
  ring: 'h-[132px] w-[132px]',
} as const;
const PX = { pill: 32, badge: 40, stamp: 64, ring: 132 } as const;

const V = 132; // viewBox
const C = 64; // centre (4 units of the box are the shadow offset)
const SHADOW = 4;

/** rosette edge: 2 * teeth points alternating between the outer and inner radius (computed, never hand-typed) */
export function rosettePoints(cx: number, cy: number, outer: number, inner: number, teeth = 36) {
  return Array.from({ length: teeth * 2 }, (_, i) => {
    const a = (i * Math.PI) / teeth - Math.PI / 2;
    const r = i % 2 ? inner : outer;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}

export function InstitutionSeal({
  crest,
  size = 'badge',
  stampIn = true,
  legend,
  className = '',
}: {
  crest: keyof typeof CRESTS;
  size?: keyof typeof SIZES;
  /** stamp in once when scrolled into view (off where a parent already animates it, e.g. the Build Story) */
  stampIn?: boolean;
  /** ring size: the letterpress text (default: the institution's name); only facts already on the page */
  legend?: string;
  className?: string;
}) {
  const c = CRESTS[crest];
  const ring = size === 'ring';
  const calm = useCalm();
  const pathId = `seal-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  // OS reduced motion is handled site-wide by MotionConfig (components/motion-provider.tsx); Calm skips it here too
  const animate = stampIn && !calm;

  // radii (viewBox units): the ring size keeps room for the letterpress, the small sizes give the crest the space
  const band = ring ? 36 : 50;
  const disc = ring ? 29.5 : 43;
  const textR = 46;
  const crestD = ring ? 46 : 70;
  const pos = (d: number) => ({
    left: `${((C - d / 2) / V) * 100}%`,
    top: `${((C - d / 2) / V) * 100}%`,
    width: `${(d / V) * 100}%`,
    height: `${(d / V) * 100}%`,
  });

  return (
    <m.span
      aria-hidden
      data-seal={crest}
      data-seal-size={size}
      initial={animate ? { scale: 1.35, opacity: 0 } : false}
      whileInView={animate ? { scale: 1, opacity: 1 } : undefined}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={SPRING_STAMP}
      className={`registrar-seal relative inline-block shrink-0 ${SIZES[size]} ${className}`}
    >
      <svg viewBox={`0 0 ${V} ${V}`} className="absolute inset-0 h-full w-full overflow-visible">
        <polygon
          points={rosettePoints(C + SHADOW, C + SHADOW, 62, 57.5)}
          fill="#0A0A0A"
          stroke="#0A0A0A"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </svg>
      <span className="seal-face absolute inset-0">
        <svg viewBox={`0 0 ${V} ${V}`} className="absolute inset-0 h-full w-full overflow-visible">
          <polygon
            points={rosettePoints(C, C, 62, 57.5)}
            fill="#FFFFFF"
            stroke="#0A0A0A"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          {ring ? (
            <>
              <circle cx={C} cy={C} r={54.5} fill="none" stroke="#0A0A0A" strokeWidth={1.5} />
              <defs>
                <path
                  id={pathId}
                  d={`M ${C} ${C - textR} a ${textR} ${textR} 0 1 1 0 ${textR * 2} a ${textR} ${textR} 0 1 1 0 ${-textR * 2}`}
                />
              </defs>
              <text
                data-seal-ring
                className="font-mono"
                fontSize={13}
                fontWeight={800}
                fill="#0A0A0A"
                dominantBaseline="central"
              >
                <textPath href={`#${pathId}`} textLength={2 * Math.PI * textR - 4} lengthAdjust="spacing">
                  {`${legend ?? c.name} · `}
                </textPath>
              </text>
            </>
          ) : null}
          <circle cx={C} cy={C} r={band} fill="#FF9F1C" stroke="#0A0A0A" strokeWidth={2.5} />
          <circle cx={C} cy={C} r={disc} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={2} />
        </svg>
        <span className="absolute" style={pos(crestD)}>
          <Image
            src={c.src}
            alt=""
            fill
            sizes={`${Math.ceil((PX[size] * crestD) / V)}px`}
            draggable={false}
            className="object-contain"
          />
        </span>
      </span>
    </m.span>
  );
}
