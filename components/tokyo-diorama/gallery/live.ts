/**
 * Exhibits that live outside the code, merged on top of the page's own data (gallery/content.ts):
 *
 *  1. `public/gallery/gallery.json` - a file in the repo. Edit it, push, Vercel deploys: no TypeScript to touch.
 *  2. `/api/gallery` - rows of the Supabase table `gallery_items`, managed at /admin/gallery. Live: a new award shows
 *     up for the next visitor without any deploy. Off (an empty list) while Supabase is not configured.
 *
 * Both are optional and both fail quietly: the rooms always open with the page's own data first.
 * Everything that arrives is checked here (shapes, lengths, link schemes, image hosts): it is data, never code.
 */
import type { Exhibit, ExtraExhibit, GalleryContent, GalleryImage, GalleryLink } from './types';
import type { Signal } from '@/lib/signal';

const SIGNALS: Signal[] = ['podium', 'qualifier', 'academic', 'leadership', 'ai', 'live', 'industry'];
const EMBLEMS: NonNullable<Exhibit['emblem']>[] = [
  'gold',
  'silver',
  'bronze',
  'star',
  'finalist',
  'seal',
  'ticket',
  'badge',
];
const KINDS = [
  'portrait',
  'fact',
  'statement',
  'plaque',
  'resume',
  'project',
  'experience',
  'honor',
  'contact',
  'custom',
] as const;

const str = (v: unknown, max = 600) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined);
const strList = (v: unknown, max = 24, len = 600) =>
  Array.isArray(v)
    ? v
        .map((x) => str(x, len))
        .filter((x): x is string => !!x)
        .slice(0, max)
    : undefined;

/** same-site paths, or https images (Supabase Storage); never data:, javascript: or http: */
function safeSrc(v: unknown): string | undefined {
  const s = str(v, 1000);
  if (!s) return undefined;
  if (/^\/(?!\/)[\w\-./%]+$/.test(s)) return s;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

function safeHref(v: unknown): string | undefined {
  const s = str(v, 1000);
  if (!s) return undefined;
  if (/^(#[\w-]+|\/(?!\/)\S*)$/.test(s)) return s;
  if (/^mailto:[^\s@]+@[^\s@]+$/.test(s)) return s;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

function image(v: unknown): GalleryImage | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const src = safeSrc(o.src);
  const w = Number(o.w);
  const h = Number(o.h);
  if (!src || !(w > 0 && w < 20000) || !(h > 0 && h < 20000)) return undefined;
  return { src, alt: str(o.alt, 300) ?? '', w, h };
}

function link(v: unknown): GalleryLink | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const href = safeHref(o.href);
  const label = str(o.label, 80);
  if (!href || !label) return undefined;
  const kind: GalleryLink['kind'] = href.startsWith('mailto:')
    ? 'mailto'
    : href.startsWith('#') || (href.startsWith('/') && !/\.(pdf|png|jpe?g|webp)$/i.test(href))
      ? 'internal'
      : href.startsWith('/')
        ? 'file'
        : 'external';
  return { label, href, kind };
}

/** one row / JSON entry -> a checked exhibit, or null */
export function parseExtra(v: unknown): ExtraExhibit | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const id = str(o.id, 80);
  const room = str(o.room, 40);
  if (!id || !room || !/^[\w-]+$/.test(id) || !/^[\w-]+$/.test(room)) return null;
  const hidden = o.hidden === true;
  const title = str(o.title, 200);
  if (!title && !hidden) return null;
  const kind = KINDS.includes(o.kind as (typeof KINDS)[number]) ? (o.kind as Exhibit['kind']) : 'custom';
  const signal = SIGNALS.includes(o.signal as Signal) ? (o.signal as Signal) : undefined;
  const stats = Array.isArray(o.stats)
    ? o.stats
        .map((s) => {
          const r = s as Record<string, unknown>;
          const label = str(r?.label, 60);
          const value = str(r?.value, 60);
          return label && value ? { label, value } : null;
        })
        .filter((s): s is { label: string; value: string } => !!s)
        .slice(0, 8)
    : undefined;
  return {
    id,
    room,
    hidden,
    kind,
    title: title ?? '',
    signal,
    subtitle: str(o.subtitle, 300),
    kicker: str(o.kicker, 120),
    period: str(o.period, 60),
    number: str(o.number, 8),
    value: str(o.value, 16),
    emblem: EMBLEMS.includes(o.emblem as NonNullable<Exhibit['emblem']>)
      ? (o.emblem as NonNullable<Exhibit['emblem']>)
      : undefined,
    order: Number.isFinite(Number(o.order)) ? Number(o.order) : undefined,
    image: image(o.image),
    images: Array.isArray(o.images)
      ? o.images
          .map(image)
          .filter((x): x is GalleryImage => !!x)
          .slice(0, 24)
      : undefined,
    logo: image(o.logo),
    body: strList(o.body, 8, 2000),
    bullets: strList(o.bullets, 12, 600),
    tags: strList(o.tags, 16, 40),
    stats,
    links: Array.isArray(o.links)
      ? o.links
          .map(link)
          .filter((x): x is GalleryLink => !!x)
          .slice(0, 8)
      : undefined,
  };
}

/** merges extras into a copy of the gallery: same id = patch (or hide) the exhibit, a new id = a new exhibit */
export function mergeExtras(base: GalleryContent, extras: ExtraExhibit[]): GalleryContent {
  const out: GalleryContent = {};
  for (const [k, r] of Object.entries(base)) out[k] = { ...r, exhibits: [...r.exhibits] };
  for (const x of extras) {
    const room = out[x.room];
    if (!room) continue; // a room exists only for a section with a door (lib/sections.ts + engine/doors.ts)
    const at = room.exhibits.findIndex((e) => e.id === x.id);
    if (x.hidden) {
      if (at >= 0) room.exhibits.splice(at, 1);
      continue;
    }
    const { room: _room, hidden: _hidden, ...ex } = x;
    void _room;
    void _hidden;
    if (at >= 0) {
      // a patch keeps every field it does not set
      const patch = Object.fromEntries(Object.entries(ex).filter(([, v]) => v !== undefined)) as Partial<Exhibit>;
      room.exhibits[at] = { ...room.exhibits[at], ...patch };
    } else room.exhibits.push(ex);
  }
  // exhibits with an `order` take their place; the page's own order stays for the rest (stable sort)
  for (const r of Object.values(out))
    r.exhibits = r.exhibits
      .map((e, i) => ({ e, k: e.order ?? i }))
      .sort((a, b) => a.k - b.k)
      .map(({ e }) => e);
  return out;
}

async function getList(url: string, signal: AbortSignal): Promise<unknown[]> {
  try {
    const r = await fetch(url, { signal, cache: 'no-cache', headers: { accept: 'application/json' } });
    if (!r.ok) return [];
    const j = (await r.json()) as unknown;
    const list = Array.isArray(j) ? j : (j as { items?: unknown })?.items;
    return Array.isArray(list) ? list.slice(0, 300) : [];
  } catch {
    return [];
  }
}

/** the extras from both sources (the database wins over the file for the same room + id) */
export async function loadExtras(signal: AbortSignal): Promise<ExtraExhibit[]> {
  const [file, db] = await Promise.all([getList('/gallery/gallery.json', signal), getList('/api/gallery', signal)]);
  const seen = new Map<string, ExtraExhibit>();
  for (const raw of [...file, ...db]) {
    const x = parseExtra(raw);
    if (x) seen.set(`${x.room}/${x.id}`, x);
  }
  return [...seen.values()];
}
