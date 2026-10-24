import { NextResponse } from 'next/server';
import { createServiceRoleClient, hasServiceRole } from '@/lib/supabase/route';

export const dynamic = 'force-dynamic';

/*
 * Walk-in 3D gallery: the exhibits added at /admin/gallery (table public.gallery_items, sql/002_gallery.sql).
 * Public and read-only: published rows only, mapped to the shape gallery/live.ts parses (it checks every field again).
 * Without Supabase it answers an empty list, so the rooms simply show the page's own data.
 * Vercel's CDN keeps an answer for 30 s: a new exhibit is live for the next visitor within half a minute.
 */

type Row = {
  room: string;
  slug: string;
  kind: string;
  title: string;
  subtitle: string | null;
  kicker: string | null;
  signal: string | null;
  emblem: string | null;
  period: string | null;
  number: string | null;
  value: string | null;
  body: string[] | null;
  bullets: string[] | null;
  tags: string[] | null;
  stats: unknown;
  links: unknown;
  image: unknown;
  images: unknown;
  sort_order: number | null;
  hidden: boolean;
};

const HEADERS = { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' };

export async function GET() {
  if (!hasServiceRole()) return NextResponse.json({ items: [] }, { headers: HEADERS });
  try {
    const { data, error } = await createServiceRoleClient()
      .from('gallery_items')
      .select(
        'room, slug, kind, title, subtitle, kicker, signal, emblem, period, number, value, body, bullets, tags, stats, links, image, images, sort_order, hidden',
      )
      .eq('published', true)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
      .limit(300);
    if (error) throw error;
    const items = ((data ?? []) as Row[]).map((r) => ({
      id: r.slug,
      room: r.room,
      kind: r.kind,
      title: r.title,
      subtitle: r.subtitle ?? undefined,
      kicker: r.kicker ?? undefined,
      signal: r.signal ?? undefined,
      emblem: r.emblem ?? undefined,
      period: r.period ?? undefined,
      number: r.number ?? undefined,
      value: r.value ?? undefined,
      body: r.body ?? undefined,
      bullets: r.bullets ?? undefined,
      tags: r.tags ?? undefined,
      stats: r.stats,
      links: r.links,
      image: r.image ?? undefined,
      images: r.images,
      order: r.sort_order ?? undefined,
      hidden: r.hidden,
    }));
    return NextResponse.json({ items }, { headers: HEADERS });
  } catch (err) {
    console.error('[gallery] read failed', err);
    // the rooms still open with the page's own data
    return NextResponse.json({ items: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}
