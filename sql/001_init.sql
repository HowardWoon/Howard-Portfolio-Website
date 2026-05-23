create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
as $$
  select
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
    or coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now(),
  full_name text,
  bio text,
  current_role text
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  role text not null,
  company text not null,
  description text not null,
  start_date date,
  end_date date,
  is_current boolean not null default false
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  context text not null,
  description text not null,
  tags text[] not null default '{}'::text[],
  project_url text,
  display_order integer not null default 0
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.experiences enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Public read profiles" on public.profiles;
drop policy if exists "Public read experiences" on public.experiences;
drop policy if exists "Public read projects" on public.projects;
drop policy if exists "Public read skills" on public.skills;
drop policy if exists "Admin manage profiles" on public.profiles;
drop policy if exists "Admin manage experiences" on public.experiences;
drop policy if exists "Admin manage projects" on public.projects;
drop policy if exists "Admin manage skills" on public.skills;
drop policy if exists "Admin read contact messages" on public.contact_messages;

create policy "Public read profiles"
on public.profiles
for select
to anon, authenticated
using (true);

create policy "Public read experiences"
on public.experiences
for select
to anon, authenticated
using (true);

create policy "Public read projects"
on public.projects
for select
to anon, authenticated
using (true);

create policy "Public read skills"
on public.skills
for select
to anon, authenticated
using (true);

create policy "Admin manage profiles"
on public.profiles
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin manage experiences"
on public.experiences
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin manage projects"
on public.projects
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin manage skills"
on public.skills
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin read contact messages"
on public.contact_messages
for select
to authenticated
using (public.is_admin(auth.uid()));

insert into public.profiles (id, full_name, bio, current_role)
values (
  '11111111-1111-1111-1111-111111111111',
  'Howard Woon Hao Zhe',
  'First-year Computer Science (Software Engineering) student at the University of Malaya. From managing corporate finance at Kraiburg TPE to architecting AI-driven applications and smart energy systems.',
  'Computer Science student and builder across software, finance, and systems.'
)
on conflict (id) do update set
  updated_at = now(),
  full_name = excluded.full_name,
  bio = excluded.bio,
  current_role = excluded.current_role;

insert into public.experiences (id, role, company, description, start_date, end_date, is_current)
values
  (
    '22222222-2222-2222-2222-222222222221',
    'Assistant Finance Executive',
    'Kraiburg TPE Technology (M) Sdn. Bhd.',
    'Managed budgets, executed transactions, and maintained financial precision before transitioning to software engineering.',
    '2024-01-01',
    null,
    false
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Treasurer & Leadership Roles',
    'UM Alphathon 2025, MYTECH Career Fair 2026, PEKOM CODEFEST / Mental Health Week',
    'Led financial operations and kept event logistics disciplined across university initiatives and tech communities.',
    '2025-01-01',
    null,
    true
  )
on conflict (id) do update set
  role = excluded.role,
  company = excluded.company,
  description = excluded.description,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  is_current = excluded.is_current;

insert into public.projects (id, title, context, description, tags, project_url, display_order)
values
  (
    '33333333-3333-3333-3333-333333333331',
    'BILAHUJAN',
    'Built for KitaHack 2026.',
    'An intelligent disaster response mobile application.',
    array['Mobile', 'AI', 'Disaster Response'],
    null,
    1
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    'Sensor X Sensei',
    'UM Technothon 2026.',
    'A smart energy management system engineered to drastically reduce electricity waste.',
    array['IoT', 'Energy Management', 'Systems Architecture'],
    null,
    2
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'BIOMELON',
    'PPAL 4.0 Innovation Day.',
    'A population genetics data platform.',
    array['Data', 'Genetics', 'Innovation'],
    null,
    3
  )
on conflict (id) do update set
  title = excluded.title,
  context = excluded.context,
  description = excluded.description,
  tags = excluded.tags,
  project_url = excluded.project_url,
  display_order = excluded.display_order;

insert into public.skills (id, name, category)
values
  ('44444444-4444-4444-4444-444444444441', 'Java', 'Languages'),
  ('44444444-4444-4444-4444-444444444442', 'Python', 'Languages'),
  ('44444444-4444-4444-4444-444444444443', 'React', 'Languages'),
  ('44444444-4444-4444-4444-444444444444', 'Flutter', 'Languages'),
  ('44444444-4444-4444-4444-444444444445', 'Node.js', 'Languages'),
  ('44444444-4444-4444-4444-444444444446', 'Firebase', 'Backend'),
  ('44444444-4444-4444-4444-444444444447', 'RESTful APIs', 'Backend'),
  ('44444444-4444-4444-4444-444444444448', 'Ollama', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444449', 'Claude Code', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444450', 'Google Colab', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444451', 'Learning Pipelines', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444452', 'Git/GitHub', 'Design'),
  ('44444444-4444-4444-4444-444444444453', 'Figma', 'Design'),
  ('44444444-4444-4444-4444-444444444454', 'Canva', 'Design'),
  ('44444444-4444-4444-4444-444444444455', 'Draw.io', 'Design')
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category;
