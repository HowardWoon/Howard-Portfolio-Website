-- =====================================================================
-- Walk-in 3D gallery: exhibits managed from /admin/gallery (safe to re-run)
--
-- Run AFTER sql/001_init.sql (it uses public.is_admin and public.set_updated_at).
-- Supabase dashboard > SQL editor > paste this file > Run.
--
-- What it makes:
--   * public.gallery_items   one row = one exhibit in a 3D room (a new award, a photo, a project, ...).
--                            `room` is a section id of lib/sections.ts (about, projects, experience, honors, contact).
--                            `slug` = the exhibit id inside its room. A slug that matches a built-in exhibit
--                            (e.g. 'zerolag' in projects) PATCHES it; `hidden = true` hides it.
--   * storage bucket gallery  public images for those exhibits (the admin page uploads them as WebP)
--
-- Security: anyone may READ published rows (the public site shows them); only the admin may write.
-- The public API (/api/gallery) reads with the service role and returns published rows only.
-- =====================================================================

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  room text not null check (room ~ '^[a-z0-9-]{1,40}$'),
  slug text not null check (slug ~ '^[A-Za-z0-9_-]{1,80}$'),
  kind text not null default 'custom'
    check (kind in ('portrait','fact','statement','plaque','resume','project','experience','honor','contact','custom')),
  title text not null default '' check (char_length(title) <= 200),
  subtitle text check (char_length(subtitle) <= 300),
  kicker text check (char_length(kicker) <= 120),
  signal text check (signal in ('podium','qualifier','academic','leadership','ai','live','industry')),
  emblem text check (emblem in ('gold','silver','bronze','star','finalist','seal','ticket','badge')),
  period text check (char_length(period) <= 60),
  number text check (char_length(number) <= 8),
  value text check (char_length(value) <= 16),
  body text[] not null default '{}',
  bullets text[] not null default '{}',
  tags text[] not null default '{}',
  stats jsonb not null default '[]'::jsonb,   -- [{ "label": "...", "value": "..." }]
  links jsonb not null default '[]'::jsonb,   -- [{ "label": "...", "href": "https://..." }]
  image jsonb,                                -- { "src": "https://...", "alt": "...", "w": 1600, "h": 1131 }
  images jsonb not null default '[]'::jsonb,  -- more photos, same shape
  sort_order integer,
  hidden boolean not null default false,
  published boolean not null default true,
  unique (room, slug)
);

create index if not exists gallery_items_room_idx on public.gallery_items (room, sort_order nulls last, created_at);

drop trigger if exists set_gallery_items_updated_at on public.gallery_items;
create trigger set_gallery_items_updated_at
before update on public.gallery_items
for each row execute function public.set_updated_at();

alter table public.gallery_items enable row level security;

drop policy if exists "Public read published gallery" on public.gallery_items;
drop policy if exists "Admin manage gallery" on public.gallery_items;
create policy "Public read published gallery" on public.gallery_items
  for select to anon, authenticated using (published);
create policy "Admin manage gallery" on public.gallery_items
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------- storage: the exhibit images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 8388608, array['image/webp','image/png','image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read gallery images" on storage.objects;
drop policy if exists "Admin write gallery images" on storage.objects;
drop policy if exists "Admin update gallery images" on storage.objects;
drop policy if exists "Admin delete gallery images" on storage.objects;
create policy "Public read gallery images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'gallery');
create policy "Admin write gallery images" on storage.objects
  for insert to authenticated with check (bucket_id = 'gallery' and public.is_admin(auth.uid()));
create policy "Admin update gallery images" on storage.objects
  for update to authenticated using (bucket_id = 'gallery' and public.is_admin(auth.uid()));
create policy "Admin delete gallery images" on storage.objects
  for delete to authenticated using (bucket_id = 'gallery' and public.is_admin(auth.uid()));
