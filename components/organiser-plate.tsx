import Image from 'next/image';
import { ORGANISERS, type OrganiserId } from '@/lib/organisers';

/**
 * R83 organiser plate: every project shows its organiser's logo the same way - a white luggage-tag plate (ink border,
 * punched eyelet, hard ink shadow) of ONE fixed size per place, with the logo fitted inside a fixed window (contain,
 * left-aligned), so a wide wordmark (Supervity, GDG) and a tall crest (DOSM, UM) read as one set. `md` (project cards)
 * carries the HOSTED BY tab on its top edge; the `sm` plate on the project index is decorative (the tile already names
 * the project), so its logo is hidden from assistive technology. A mark drawn for a dark ground (`dark`) sits on an
 * ink chip inside the same window.
 */
export function OrganiserPlate({ id, size = 'md' }: { id: OrganiserId; size?: 'sm' | 'md' }) {
  const o = ORGANISERS[id];
  const md = size === 'md';
  const logo = (
    <Image
      src={o.src}
      alt={md ? o.name : ''}
      aria-hidden={md ? undefined : true}
      fill
      sizes={md ? '200px' : '160px'}
      className={o.dark ? 'object-contain p-0.5' : 'object-contain object-left'}
    />
  );
  return (
    <span
      data-organiser={id}
      className={`org-plate relative flex items-center border-2 border-ink bg-white ${
        md
          ? 'h-[62px] w-[228px] max-w-full gap-2.5 rounded-[12px] pb-2 pl-2.5 pr-3 pt-4 shadow-brutal-xs'
          : 'h-10 w-full gap-2 rounded-[9px] px-2'
      }`}
    >
      {md ? (
        <span className="absolute -top-2.5 left-7 whitespace-nowrap rounded-[5px] border-2 border-ink bg-ink px-1.5 font-mono text-xs font-extrabold leading-[1.15] tracking-[0.1em] text-white">
          HOSTED BY
        </span>
      ) : null}
      <span
        aria-hidden
        className={`org-eyelet shrink-0 rounded-full border-2 border-ink ${md ? 'h-3 w-3' : 'h-2.5 w-2.5'}`}
      />
      <span className={`relative min-w-0 flex-1 ${md ? 'h-[34px]' : 'h-[26px]'}`}>
        {o.dark ? <span className="absolute inset-y-0 left-0 aspect-square rounded-[6px] bg-ink">{logo}</span> : logo}
      </span>
    </span>
  );
}
