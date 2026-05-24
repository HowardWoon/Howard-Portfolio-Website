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
  'First-year Computer Science (Software Engineering) student at the University of Malaya.',
  'Builder across software engineering, finance, AI systems, and smart energy products.'
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
    'Treasurer',
    'MYTECH Career Fair',
    'Oversaw budgeting, bank reconciliation, vendor payments, and financial reporting for MYTECH Career Fair 2026.',
    '2026-02-01',
    null,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Executive Assistant Finance',
    'KRAIBURG TPE Technology (M) Sdn. Bhd.',
    'Supported account management, reconciliations, month-end close tasks, and financial reporting for the finance team.',
    '2025-06-01',
    '2025-09-30',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    'Treasurer',
    'Code Fest X UM Alphathon 2025',
    'Managed event budget, sponsorship funds, and vendor payments for Code Fest X UM Alphathon 2025.',
    '2025-10-01',
    '2025-12-31',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222224',
    'Committee Member, Sponsorship & Public Relations',
    'Dean''s Cup 2025',
    'Coordinated sponsor outreach, handled sponsorship agreements, and assisted with sponsorship reconciliation.',
    '2025-10-01',
    '2025-12-31',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222225',
    'Treasurer',
    'Mental Health Week 2025',
    'Managed budgeting, procurement, and bank reconciliation for Mental Health Week 2025.',
    '2025-09-01',
    '2025-11-30',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222226',
    'Finance Intern',
    'KRAIBURG TPE',
    'Assisted with financial analysis, project finance tracking, bookkeeping, and routine reconciliations.',
    '2024-03-01',
    '2024-06-30',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222227',
    'Assistant Head of Subject, Computer Science',
    'Negeri Sembilan Matriculation College (KMNS) - PAL Leader Club',
    'Led peer-assisted learning sessions, coordinated lesson plans, and mentored junior students in Computer Science topics.',
    '2024-07-01',
    '2024-12-31',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222228',
    'Chairperson',
    'Village Sports Club',
    'Organized sports events, managed club budgets, and led volunteer coordination.',
    '2024-07-01',
    '2024-12-31',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222229',
    'Representative',
    'KMNS PAL Leaders - KPM Madani Leadership Course',
    'Selected representative for the KPM Madani leadership course; participated in workshops and leadership training.',
    '2024-10-01',
    '2024-10-31',
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
    'BILAHUJAN',
    'KitaHack 2026',
    'Intelligent disaster response mobile application.',
    array['Mobile', 'AI', 'Disaster Response'],
    null,
    1
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    'Sensor X Sensei',
    'UM Technothon 2026',
    'Smart energy management system engineered to reduce electricity waste.',
    array['IoT', 'Energy Management', 'Systems Architecture'],
    null,
    2
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'BIOMELON',
    'PPAL 4.0 Innovation Day',
    'Population genetics data platform.',
    array['Data', 'Genetics', 'Innovation'],
    null,
    3
  )
  ,
  (
    '33333333-3333-3333-3333-333333333334',
    'BILAHUJAN',
    'VHack / KitaHack 2026',
    'Intelligent disaster response mobile application.',
    array['Mobile', 'AI', 'Disaster Response'],
    'https://github.com/HowardWoon/BILAHUJAN-VHack2026.git',
    4
  ),
  (
    '33333333-3333-3333-3333-333333333335',
    'Kuliah F3 (UM Hackathon)',
    'UM Hackathon 2026',
    'Project built during UM Hackathon 2026.',
    array['Hackathon', 'Mobile', 'Prototype'],
    'https://github.com/HowardWoon/Kuliah-F3---UM-Hackathon-2026.git',
    5
  ),
  (
    '33333333-3333-3333-3333-333333333336',
    'Catfish Detector (ML Models)',
    'Machine Learning',
    'Models for detecting catfishing content and media.',
    array['Machine Learning', 'Models', 'Data'],
    'https://github.com/HowardWoon/Catfish-Detector-ML-Models.git',
    6
  ),
  (
    '33333333-3333-3333-3333-333333333337',
    'Slotify',
    'Personal / Group Project',
    'Music-related app / prototype.',
    array['Web', 'Music', 'Full-stack'],
    'https://github.com/HowardWoon/Slotify.git',
    7
  ),
  (
    '33333333-3333-3333-3333-333333333338',
    'Group Assignment — Buka',
    'FSKTMCoders Group Project',
    'Collaborative group assignment repository.',
    array['Collaboration', 'Web', 'Coursework'],
    'https://github.com/FSKTMCoders/group-assignment-5-5-buka.git',
    8
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
  ('44444444-4444-4444-4444-444444444443', 'JavaScript/TypeScript', 'Languages'),
  ('44444444-4444-4444-4444-444444444444', 'React', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444445', 'Flutter', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444446', 'Node.js', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444447', 'Firebase', 'Backend'),
  ('44444444-4444-4444-4444-444444444448', 'RESTful APIs', 'Backend'),
  ('44444444-4444-4444-4444-444444444449', 'Ollama', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444450', 'Claude Code', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444451', 'Google Colab', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444452', 'Learning Pipelines', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444453', 'Git/GitHub', 'Tools'),
  ('44444444-4444-4444-4444-444444444454', 'Figma', 'Tools'),
  ('44444444-4444-4444-4444-444444444455', 'Canva', 'Tools'),
  ('44444444-4444-4444-4444-444444444456', 'Draw.io', 'Tools')
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category;
