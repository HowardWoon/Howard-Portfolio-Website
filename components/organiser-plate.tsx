import Image from 'next/image';
import { ORGANISERS, type OrganiserId } from '@/lib/organisers';

/**
 * R88 P4 organiser plate (owner: "logo inconsistent - right of the badge tag on one card, under it on another,
 * colliding; left-aligned; no organiser names; just a logo for the sake of a logo"). ONE slot on every card: a
 * full-width white strip under the title block, never in the badge row - an ink HOSTED BY cell, the logo centred in a
 * fixed window, and the organiser's name (lib/organisers.ts, word for word) in mono beside it. Phones stack the HOSTED
 * BY cell on top. `sm` is the same plate scaled for the project index tile: the name bar over the same fixed logo
 * window, so every tile's logo sits at the same height (the tile already names the project, so the tile plate is hidden
 * from assistive technology; on the card the printed name speaks for the logo, so the logo itself is decorative). A
 * hover - or keyboard focus anywhere in the card - prints the plate: the hard ink offset snaps in (no transition, no
 * resting transform). A mark drawn for a dark ground (`dark`) sits on an ink chip inside the same window.
 */
export function OrganiserPlate({ id, size = 'md' }: { id: OrganiserId; size?: 'sm' | 'md' }) {
  const o = ORGANISERS[id];
  const md = size === 'md';
  const logo = (
    <Image
      src={o.src}
      alt=""
      aria-hidden
      fill
      sizes={md ? '160px' : '140px'}
      className="object-contain object-center"
    />
  );
  const frame = (
    <span
      data-org-logo
      className={`relative flex shrink-0 items-center justify-center ${
        md ? 'h-8 w-full xs:h-11 xs:w-28' : 'h-8 w-full'
      }`}
    >
      {o.dark ? (
        <span className="relative h-full aspect-square rounded-[6px] bg-ink">
          <span className="absolute inset-0.5">{logo}</span>
        </span>
      ) : (
        <span className="absolute inset-0">{logo}</span>
      )}
    </span>
  );

  if (!md)
    return (
      <span
        data-organiser={id}
        aria-hidden
        className="org-strip flex w-full min-w-0 flex-col overflow-hidden rounded-lg border-2 border-ink bg-white"
      >
        <span className="border-b-2 border-ink px-1.5 py-0.5 font-mono text-xs font-extrabold uppercase leading-tight tracking-[0.04em] text-ink [overflow-wrap:anywhere]">
          {o.name}
        </span>
        <span className="flex px-1.5 py-1">{frame}</span>
      </span>
    );

  return (
    <div
      data-organiser={id}
      className="org-strip flex w-full min-w-0 flex-col overflow-hidden rounded-xl border-3 border-ink bg-white sm:flex-row hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-brutal-sm group-focus-within:-translate-x-[3px] group-focus-within:-translate-y-[3px] group-focus-within:shadow-brutal-sm"
    >
      <span className="flex shrink-0 items-center whitespace-nowrap bg-ink px-3 py-1 font-mono text-xs font-extrabold tracking-[0.14em] text-white">
        HOSTED BY
      </span>
      {/* flex-1 only in the row layout: in the phone column its zero basis would override the fixed height. Under
          375 px (Galaxy Fold) the name has no room beside the logo, so it sits under it, at one height for every card */}
      <span className="flex h-[5.75rem] min-w-0 flex-col justify-center gap-1.5 px-3 xs:h-[4.25rem] xs:flex-row xs:items-center xs:gap-3 sm:flex-1">
        {frame}
        <span aria-hidden className="hidden h-full w-0 shrink-0 border-l-3 border-ink xs:block" />
        <span
          data-org-name
          className="min-w-0 text-center font-mono text-xs font-extrabold uppercase leading-tight tracking-[0.06em] text-ink xs:text-left sm:text-sm"
        >
          {o.name}
        </span>
      </span>
    </div>
  );
}
