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
    user_id = '54c734ee-1e79-4e92-bf9b-8504a1854a31'::uuid
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

-- Enable RLS on messages
ALTER TABLE IF EXISTS public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 1. Allow public / anonymous visitors to submit contact messages
CREATE POLICY "Allow public insert to messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Allow only the designated admin user to view and manage messages
CREATE POLICY "Allow admin full access to messages"
ON public.contact_messages
FOR ALL
TO authenticated
USING (auth.uid() = '54c734ee-1e79-4e92-bf9b-8504a1854a31'::uuid)
WITH CHECK (auth.uid() = '54c734ee-1e79-4e92-bf9b-8504a1854a31'::uuid);

-- Projects, Skills, Experiences: Public read, Admin write
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow admin manage projects" ON public.projects FOR ALL TO authenticated
USING (auth.uid() = '54c734ee-1e79-4e92-bf9b-8504a1854a31'::uuid)
WITH CHECK (auth.uid() = '54c734ee-1e79-4e92-bf9b-8504a1854a31'::uuid);

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

create policy "Admin manage skills"
on public.skills
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

insert into public.profiles (id, full_name, bio, current_role)
values (
  '11111111-1111-1111-1111-111111111111',
  'Howard Woon',
  'Driven Software Engineering student (CGPA 4.00) specializing in full-stack development, AI/ML integration, and IoT solutions. Leveraging a background in corporate finance to engineer high-impact, production-ready systems.',
  'Software Engineer'
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
    'Managed high-volume financial data pipelines, executing complex financial reconciliations, and processed vendor payments.',
    '2025-06-01',
    '2025-09-30',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Finance Intern',
    'Kraiburg TPE Technology (M) Sdn. Bhd.',
    'Supported budget monitoring and expenditure tracking to improve financial planning accuracy. Gained early exposure to enterprise data systems.',
    '2024-03-01',
    '2024-06-30',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    'Finance Lead',
    'Persatuan Komputer Universiti Malaya (PEKOM)',
    'Lead the financial architecture and resource management for Universiti Malaya''s flagship technology community.',
    '2026-06-01',
    null,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222224',
    'Treasurer',
    'MYTECH Career Fair 2026',
    'Managed a RM50,200 budget, secured 30 corporate sponsors and RM46,200 in revenue, delivering a RM9,272.90 surplus.',
    '2026-02-01',
    '2026-06-30',
    false
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
    'CATFISH.AI — Fraud Detection ML System',
    'Machine Learning Project',
    'Built a 6-model soft-voting ensemble on a 50,000-row dataset. Engineered a robust data pipeline using SMOTE-Tomek and PCA. Deployed predictive model via a Flask REST API hosted on Vercel.',
    array['Machine Learning', 'Python', 'Flask', 'AI'],
    null,
    1
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    'Sensor X Sensei — Smart Lecture Hall',
    'UM Technothon 2026 Top 15 Finalist',
    'Developed an end-to-end IoT solution leveraging ESP32 microcontrollers and multi-sensor data fusion to power a real-time occupancy dashboard. Automated kWh/CO2 calculations.',
    array['IoT', 'ESP32', 'Sensors', 'Energy Management'],
    null,
    2
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Slotify — Parking Management System',
    'Data Structures Project',
    'Engineered a Spring Boot backend implementing 7 hand-built data structures unified into a single pipeline. Implemented Dijkstra''s shortest-path routing and a real-time interactive dashboard.',
    array['Java', 'Spring Boot', 'Data Structures', 'Algorithms'],
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
  ('44444444-4444-4444-4444-444444444443', 'JavaScript', 'Languages'),
  ('44444444-4444-4444-4444-444444444444', 'TypeScript', 'Languages'),
  ('44444444-4444-4444-4444-444444444445', 'React', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444446', 'Node.js', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444447', 'Spring Boot', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444448', 'Flask', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444449', 'Firebase', 'Backend'),
  ('44444444-4444-4444-4444-444444444450', 'RESTful APIs', 'Backend'),
  ('44444444-4444-4444-4444-444444444451', 'Gemini API', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444452', 'Ollama', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444453', 'Generative AI', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444454', 'Git/GitHub', 'Tools')
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category;
