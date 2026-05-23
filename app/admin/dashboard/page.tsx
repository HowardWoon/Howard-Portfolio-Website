import { DashboardClient } from '@/components/admin/dashboard-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fallbackExperiences, fallbackProjects, fallbackSkills } from '@/lib/site-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      initialExperiences={(experiences ?? fallbackExperiences) as typeof fallbackExperiences}
      initialProjects={(projects ?? fallbackProjects) as typeof fallbackProjects}
      initialSkills={(skills ?? fallbackSkills) as typeof fallbackSkills}
      adminName={userData.user?.email ?? undefined}
    />
  );
}
