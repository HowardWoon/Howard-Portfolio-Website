'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/admin-auth';
import { createServiceRoleClient, hasServiceRole } from '@/lib/supabase/route';

/*
 * Walk-in 3D gallery admin (table public.gallery_items, sql/002_gallery.sql). Every action checks the admin first.
 * Images are uploaded straight from the admin's browser to the public `gallery` bucket (so no large body passes
 * through a server action); the action receives only the image's public URL and real pixel size.
 */

function admin() {
  if (!hasServiceRole()) throw new Error('Supabase service role is not configured.');
  return createServiceRoleClient();
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SUPABASE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').host;
  } catch {
    return '';
  }
})();

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

const Exhibit = z.object({
  room: z.string().regex(/^[a-z0-9-]{1,40}$/),
  slug: z.string().regex(/^[A-Za-z0-9_-]{1,80}$/, 'The id may use letters, digits, - and _ only.'),
  kind: z.enum([
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
  ]),
  title: z.string().trim().min(1, 'A title is required.').max(200),
  subtitle: z.string().trim().max(300).optional(),
  kicker: z.string().trim().max(120).optional(),
  signal: z.enum(['podium', 'qualifier', 'academic', 'leadership', 'ai', 'live', 'industry']).optional(),
  emblem: z.enum(['gold', 'silver', 'bronze', 'star', 'finalist', 'seal', 'ticket', 'badge']).optional(),
  period: z.string().trim().max(60).optional(),
  number: z.string().trim().max(8).optional(),
  value: z.string().trim().max(16).optional(),
  body: z.array(z.string().max(2000)).max(8),
  bullets: z.array(z.string().max(600)).max(12),
  tags: z.array(z.string().max(40)).max(16),
  stats: z.array(z.object({ label: z.string().max(60), value: z.string().max(60) })).max(8),
  links: z.array(z.object({ label: z.string().max(80), href: z.string().max(1000) })).max(8),
  image: z
    .object({
      src: z.string().url().max(1000),
      alt: z.string().max(300),
      w: z.number().int().positive().max(20000),
      h: z.number().int().positive().max(20000),
    })
    .nullable(),
  sort_order: z.number().int().min(-100000).max(100000).nullable(),
});

const opt = (v: FormDataEntryValue | null) => {
  const s = String(v ?? '').trim();
  return s ? s : undefined;
};

/** adds (or, for the same room + id, replaces) an exhibit */
export async function saveExhibit(form: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminUser();
  const src = opt(form.get('image_src'));
  // only images from this project's own Supabase Storage (what the form uploads) or this site
  if (src && SUPABASE_HOST && new URL(src).host !== SUPABASE_HOST)
    return { ok: false, error: 'The image must be uploaded through this page.' };
  const parsed = Exhibit.safeParse({
    room: opt(form.get('room')),
    slug: opt(form.get('slug')),
    kind: opt(form.get('kind')) ?? 'custom',
    title: opt(form.get('title')) ?? '',
    subtitle: opt(form.get('subtitle')),
    kicker: opt(form.get('kicker')),
    signal: opt(form.get('signal')),
    emblem: opt(form.get('emblem')),
    period: opt(form.get('period')),
    number: opt(form.get('number')),
    value: opt(form.get('value')),
    body: String(form.get('body') ?? '')
      .split(/\n\s*\n/)
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter(Boolean),
    bullets: lines(form.get('bullets')),
    tags: String(form.get('tags') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    stats: lines(form.get('stats'))
      .map((l) => l.split(':'))
      .filter((p) => p.length >= 2)
      .map(([label, ...v]) => ({ label: label.trim(), value: v.join(':').trim() })),
    links: lines(form.get('links'))
      .map((l) => l.split('|'))
      .filter((p) => p.length >= 2)
      .map(([label, ...h]) => ({ label: label.trim(), href: h.join('|').trim() })),
    image: src
      ? {
          src,
          alt: opt(form.get('image_alt')) ?? '',
          w: Number(form.get('image_w')),
          h: Number(form.get('image_h')),
        }
      : null,
    sort_order: opt(form.get('sort_order')) !== undefined ? Number(form.get('sort_order')) : null,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const row = { ...parsed.data, published: true, hidden: false };
  const { error } = await admin().from('gallery_items').upsert(row, { onConflict: 'room,slug' });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/gallery');
  return { ok: true };
}

export async function togglePublished(id: string, published: boolean) {
  await requireAdminUser();
  if (!UUID.test(id)) throw new Error('Invalid id');
  const { error } = await admin().from('gallery_items').update({ published }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/gallery');
}

/** hide a BUILT-IN exhibit of the page (no image, no content: just the hide flag for that room + id) */
export async function hideBuiltIn(form: FormData) {
  await requireAdminUser();
  const room = String(form.get('room') ?? '');
  const slug = String(form.get('slug') ?? '');
  if (!/^[a-z0-9-]{1,40}$/.test(room) || !/^[A-Za-z0-9_-]{1,80}$/.test(slug)) throw new Error('Invalid exhibit');
  const { error } = await admin()
    .from('gallery_items')
    .upsert({ room, slug, title: '', hidden: true, published: true }, { onConflict: 'room,slug' });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/gallery');
}

export async function deleteExhibit(id: string) {
  await requireAdminUser();
  if (!UUID.test(id)) throw new Error('Invalid id');
  const db = admin();
  const { data } = await db.from('gallery_items').select('image').eq('id', id).maybeSingle();
  const src = (data?.image as { src?: string } | null)?.src;
  const { error } = await db.from('gallery_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
  // free the uploaded file too (only files of our own bucket)
  const at = src?.indexOf('/storage/v1/object/public/gallery/') ?? -1;
  if (src && at >= 0)
    await db.storage.from('gallery').remove([src.slice(at + '/storage/v1/object/public/gallery/'.length)]);
  revalidatePath('/admin/gallery');
}
