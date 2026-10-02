import Image from 'next/image';

/**
 * R29 Issuer Seal: an institution crest printed like a registrar's seal - upright, in a small paper tile with an ink
 * border and a hard offset shadow. It is only ever placed beside the institution's own written name, so it is
 * decorative (`aria-hidden`); never rotated, never a faint watermark behind text, never glowing.
 */
const CRESTS = {
  um: { src: '/images/logos/um_logo.png', w: 1080, h: 1080 },
  kmns: { src: '/images/logos/kmns_logo.png', w: 200, h: 200 },
} as const;

const SIZES = {
  xs: { box: 'h-7 w-7 rounded-md border-2 p-[3px] shadow-[2px_2px_0_0_#0A0A0A]', px: 28 },
  sm: { box: 'h-9 w-9 rounded-lg border-2 p-1 shadow-[2px_2px_0_0_#0A0A0A]', px: 36 },
  md: { box: 'h-14 w-14 rounded-xl border-3 p-1.5 shadow-brutal-sm', px: 56 },
} as const;

export function InstitutionSeal({
  crest,
  size = 'sm',
  className = '',
}: {
  crest: keyof typeof CRESTS;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const c = CRESTS[crest];
  const s = SIZES[size];
  return (
    <span
      aria-hidden
      data-seal={crest}
      className={`relative inline-grid shrink-0 place-items-center border-ink bg-white ${s.box} ${className}`}
    >
      <Image
        src={c.src}
        alt=""
        width={c.w}
        height={c.h}
        sizes={`${s.px}px`}
        draggable={false}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
