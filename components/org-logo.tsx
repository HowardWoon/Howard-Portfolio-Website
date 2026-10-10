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
} as const;
export type OrgLogoKey = keyof typeof ORG_LOGOS;

/** the organisation a piece of text names, if its logo is on the site (matches the names used across the page) */
export function orgLogoFor(text: string): OrgLogoKey | null {
  if (/kraiburg/i.test(text)) return 'kraiburg';
  if (/pekom/i.test(text)) return 'pekom';
  return null;
}

export function OrgLogo({
  org,
  className = '',
  imgClassName = 'max-h-12',
  bare = false,
}: {
  org: OrgLogoKey;
  /** the white window (size it here) */
  className?: string;
  /** the wordmark's height cap inside the window */
  imgClassName?: string;
  /** only the wordmark, for a parent that is already the white window */
  bare?: boolean;
}) {
  const l = ORG_LOGOS[org];
  return (
    <span
      data-org-logo={org}
      className={
        bare
          ? `inline-grid place-items-center ${className}`
          : `inline-grid shrink-0 place-items-center rounded-xl border-2 border-ink bg-white px-2.5 py-2 ${className}`
      }
    >
      <Image
        src={l.src}
        alt=""
        width={l.w}
        height={l.h}
        sizes="160px"
        draggable={false}
        className={`h-auto w-auto max-w-full object-contain ${imgClassName}`}
      />
    </span>
  );
}
