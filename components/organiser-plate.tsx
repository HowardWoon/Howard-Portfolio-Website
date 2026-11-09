import Image from 'next/image';
import { ORGANISERS, type OrganiserId } from '@/lib/organisers';
import { SIGNAL, type Signal } from '@/lib/signal';

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
export function OrganiserPlate({
  id,
  size = 'md',
  signal,
}: {
  id: OrganiserId;
  size?: 'sm' | 'md';
  /** R103: the card's SIGNAL; its soft tint is the plate's ground (like the Experience company card) */
  signal?: Signal;
}) {
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

  // R103 (owner: "the HOSTED BY strip is ugly ... redo the logo placement, like my Experience company card"): a
  // company card - the logo on its own white tile, an ink HOSTED BY tag over the organiser's printed name - on the
  // project's soft SIGNAL tint, hard shadow. Same size and place on every card (tests/r83).
  return (
    <div
      data-organiser={id}
      className={`org-card flex w-full min-w-0 items-center gap-3 rounded-xl border-3 border-ink p-2.5 shadow-brutal-sm xs:gap-4 xs:p-3 ${
        signal ? SIGNAL[signal].soft : 'bg-white'
      }`}
    >
      <span
        data-org-logo
        className="relative grid h-14 w-24 shrink-0 place-items-center rounded-lg border-2 border-ink bg-white xs:h-16 xs:w-32"
      >
        {o.dark ? (
          <span className="relative h-[78%] aspect-square rounded-[6px] bg-ink">
            <span className="absolute inset-0.5">{logo}</span>
          </span>
        ) : (
          <span className="absolute inset-2">{logo}</span>
        )}
      </span>
      <span className="flex min-w-0 flex-col items-start gap-1.5">
        <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-xs font-extrabold tracking-[0.16em] text-white">
          HOSTED BY
        </span>
        <span
          data-org-name
          className="min-w-0 font-display text-base font-extrabold leading-tight text-ink [overflow-wrap:anywhere] sm:text-lg"
        >
          {o.name}
        </span>
      </span>
    </div>
  );
}
