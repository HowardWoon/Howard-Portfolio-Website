import { photos as zerolagPhotos, type Photo } from './interactive-photo-stack';
import { projects } from './stacked-projects';
import { experiences } from './experience-section';
import { ARCHIVE_DATA } from './field-archive-data';
import { PHOTO_MANIFEST } from '@/lib/photo-manifest';
import { SIGNAL, type Signal } from '@/lib/signal';

/**
 * R102 Memory registry (owner: "my other projects are not there ... it must auto update by itself, plan it yourself,
 * put the photos in yourself when I upload new ones"). ONE derived list of every photo on the site, grouped into
 * chapters, read by the Memory Reel and The Build's two film reels. Nothing is typed here:
 *   - builds: every project in `projects` (stacked-projects.tsx), its gallery (ZeroLag's is the photo stack's own list)
 *   - field: every Experience gallery and every Field Archive (MYTECH, Mental Health Week), oldest first
 *   - uploads: each photo in a gallery folder that no gallery lists yet (lib/photo-manifest.ts, made before every
 *     build) joins the chapter that already owns a photo of that folder, with its real size
 * Names, links and SIGNAL colours come from the registries; a new project, experience or photo shows up everywhere.
 */
export type MemoryChapter = {
  id: string;
  name: string;
  kind: 'build' | 'field';
  signal: Signal;
  fill: string;
  href: string;
  photos: Photo[];
};

/** the Field Archives are events of an Experience entry (they live inside its card) */
const ARCHIVE_OWNER: Record<string, string> = { mytech: 'pekom', mhw: 'pekom' };

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
/** the first "[Mon] YYYY" in a period / event name, as a month count (no year: Infinity, kept in list order) */
export const dateKey = (s: string) => {
  const m = s.match(/(?:([A-Za-z]{3})[a-z]*\s+)?(20\d\d)/);
  if (!m) return Infinity;
  const mon = m[1] ? MONTHS.indexOf(m[1].toLowerCase()) : -1;
  return Number(m[2]) * 12 + Math.max(0, mon);
};

const sized = (src: string, alt: string): Photo | null => {
  const s = PHOTO_MANIFEST[src];
  return s ? { src, alt, rotation: 0, w: s[0], h: s[1] } : null;
};

function build(): { chapters: MemoryChapter[]; unfiled: string[] } {
  const builds: MemoryChapter[] = projects.map((p) => ({
    id: p.id,
    name: p.title.toUpperCase(),
    kind: 'build',
    signal: p.signal,
    fill: SIGNAL[p.signal].fill,
    href: `#project-${p.id}`,
    photos: [...(p.id === 'zerolag' ? zerolagPhotos : (p.galleryPhotos ?? []))],
  }));

  type Dated = MemoryChapter & { at: number; order: number };
  const field: Dated[] = [];
  experiences.forEach((e, i) => {
    const at = dateKey(e.period);
    if (e.galleryPhotos?.length)
      field.push({
        id: e.id,
        name: e.organization,
        kind: 'field',
        signal: e.signal,
        fill: SIGNAL[e.signal].fill,
        href: '#experience',
        photos: [...e.galleryPhotos],
        at,
        order: i,
      });
  });
  Object.entries(ARCHIVE_DATA).forEach(([id, records], i) => {
    const owner = experiences.find((e) => e.id === ARCHIVE_OWNER[id]);
    const event = records[0]?.event ?? id.toUpperCase();
    const own = dateKey(event);
    const signal = owner?.signal ?? 'leadership';
    field.push({
      id,
      name: event,
      kind: 'field',
      signal,
      fill: SIGNAL[signal].fill,
      href: '#experience',
      photos: records.flatMap((r) => sized(r.image, r.caption) ?? []),
      at: own === Infinity ? (owner ? dateKey(owner.period) : Infinity) : own,
      order: experiences.length + i,
    });
  });
  field.sort((a, b) => (a.at === b.at ? a.order - b.order : a.at - b.at));

  const chapters: MemoryChapter[] = [
    ...field.map(({ at: _at, order: _order, ...c }) => c), // eslint-disable-line @typescript-eslint/no-unused-vars
    ...builds,
  ];

  // one photo, one place: a later chapter never repeats a photo an earlier one already shows
  const seen = new Set<string>();
  for (const c of chapters) c.photos = c.photos.filter((p) => !seen.has(p.src) && seen.add(p.src));

  // uploads no gallery lists yet join the chapter that owns their folder
  const dir = (src: string) => src.slice(0, src.lastIndexOf('/'));
  const unfiled: string[] = [];
  for (const src of Object.keys(PHOTO_MANIFEST)) {
    if (seen.has(src)) continue;
    const home = chapters.find((c) => c.photos.some((p) => dir(p.src) === dir(src)));
    const photo = home && sized(src, home.name);
    if (home && photo) {
      home.photos.push(photo);
      seen.add(src);
    } else unfiled.push(src);
  }
  return { chapters: chapters.filter((c) => c.photos.length), unfiled };
}

const built = build();
/** every chapter with at least one photo: the field (oldest first), then the builds in the Projects order */
export const MEMORY_CHAPTERS = built.chapters;
/** photos in a gallery folder that belong to no chapter (a new folder needs its project / experience entry first) */
export const UNFILED_PHOTOS = built.unfiled;
/** every memory photo, in reel order (the lightbox walks through all of them) */
export const MEMORY_PHOTOS: Photo[] = MEMORY_CHAPTERS.flatMap((c) => c.photos);
