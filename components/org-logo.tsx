import Image from 'next/image';

/**
 * R48 Organisation logos (owner upload "logo/": KRAIBURG TPE and PEKOM wordmarks; "better have white background in
 * every logo behind"). A wordmark is always shown on a white, ink-bordered window - never straight on a tinted card -
 * at its real shape (w / h = the files' real pixel sizes, read with sharp). The round institution crests (UM, KMNS)
 * stay with components/institution-seal.tsx; these two are company / society wordmarks, which a round seal would crop.
 * Decorative (empty alt): a logo is only ever placed beside the organisation's written name.
 */
export const ORG_LOGOS = {
  kraiburg: { src: '/images/logos/kraiburg_logo.jpg', w: 400, h: 188 },
  pekom: { src: '/images/logos/pekom_logo.png', w: 403, h: 91 },
  // R50 (owner: "why the kmns logo still got the border? remove it, i want cleanly show the kmns logo only"): on the
  // Experience organisation plate the KMNS logo is shown plain, like the two wordmarks, not inside the Registrar Seal
  kmns: { src: '/images/logos/kmns_logo_clear.png', w: 200, h: 200 },
} as const;
export type OrgLogoKey = keyof typeof ORG_LOGOS;

/** the organisation a piece of text names, if its logo is on the site (matches the names used across the page) */
export function orgLogoFor(text: string): OrgLogoKey | null {
  if (/kraiburg/i.test(text)) return 'kraiburg';
  if (/pekom/i.test(text)) return 'pekom';
  return null; // 'kmns' is placed explicitly (the Experience plate); KMNS awards keep their Registrar Seal
}

export function OrgLogo({
  org,
  className = '',
  bare = false,
}: {
  org: OrgLogoKey;
  /** the white window: give it a width and a height here (the mark is fitted inside it) */
  className?: string;
  /** only the mark, filling a parent that is already the white window (the parent must be `relative`) */
  bare?: boolean;
}) {
  const l = ORG_LOGOS[org];
  return (
    <span
      data-org-logo={org}
      className={
        bare
          ? `absolute inset-0 ${className}`
          : `relative inline-block shrink-0 rounded-xl border-2 border-ink bg-white ${className}`
      }
    >
      {/* The mark is pinned inside the window with a fixed margin and fitted by object-contain, so it can neither
          spill out of the window (a percentage height inside an auto grid track fell back to the file's 200 px and
          the KMNS logo overflowed) nor stay at its file size on a scaled-up canvas (R50). */}
      <Image
        src={l.src}
        alt=""
        width={l.w}
        height={l.h}
        sizes="160px"
        draggable={false}
        className="absolute inset-[0.45rem] h-[calc(100%-0.9rem)] w-[calc(100%-0.9rem)] object-contain"
      />
    </span>
  );
}
