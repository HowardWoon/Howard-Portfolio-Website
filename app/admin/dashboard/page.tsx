import { DashboardClient } from '@/components/admin/dashboard-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasSupabaseCredentials } from '@/lib/supabase/fallback';
import type { ExperienceRow, ProjectRow, SkillRow } from '@/lib/admin-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// `@ts-nocheck` removed: the page used to hand site-data objects ({organization, period, technologies…})
// to a dashboard that edits DB rows ({company, start_date, tags…}) → blank names and data loss on edit.
const str = (v: unknown) => (typeof v === 'string' ? v : Array.isArray(v) ? v.join(' ') : '');

function toExperience(r: Record<string, unknown>): ExperienceRow {
  return {
    id: String(r.id),
    role: str(r.role ?? r.title),
    company: str(r.company ?? r.organization),
    description: str(r.description),
    start_date: (r.start_date as string | null) ?? null,
    end_date: (r.end_date as string | null) ?? null,
    is_current: Boolean(r.is_current ?? r.is_active),
  };
}

function toProject(r: Record<string, unknown>, i: number): ProjectRow {
  return {
    id: String(r.id),
    title: str(r.title),
    context: str(r.context),
    description: str(r.description),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    project_url: (r.project_url as string | null) || null,
    display_order: typeof r.display_order === 'number' ? r.display_order : i + 1,
  };
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: experiences }, { data: projects }, { data: skills }, { data: userData }] = await Promise.all([
    supabase.from('experiences').select('*').order('start_date', { ascending: false }),
    supabase.from('projects').select('*').order('display_order', { ascending: true }),
    supabase.from('skills').select('*').order('category', { ascending: true }),
    supabase.auth.getUser()
  ]);

  return (
    <DashboardClient
      initialExperiences={((experiences ?? []) as Record<string, unknown>[]).map(toExperience)}
      initialProjects={((projects ?? []) as Record<string, unknown>[]).map(toProject)}
      initialSkills={(skills ?? []) as SkillRow[]}
      adminName={userData.user?.email ?? undefined}
      isLive={hasSupabaseCredentials()}
    />
  );
}
