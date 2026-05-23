import { SiteHeader } from '@/components/site-header';
import { PortfolioPage } from '@/components/portfolio-page';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fallbackExperiences, fallbackProfile, fallbackProjects, fallbackSkills } from '@/lib/site-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const [profileResult, experiencesResult, projectsResult, skillsResult] = await Promise.all([
    supabase.from('profiles').select('*').maybeSingle(),
    supabase.from('experiences').select('*').order('start_date', { ascending: false }),
    supabase.from('projects').select('*').order('display_order', { ascending: true }),
    supabase.from('skills').select('*').order('category', { ascending: true })
  ]);

  const profile = profileResult.data ?? fallbackProfile;
  const experiences = (experiencesResult.data ?? fallbackExperiences) as typeof fallbackExperiences;
  const projects = (projectsResult.data ?? fallbackProjects) as typeof fallbackProjects;
  const skills = (skillsResult.data ?? fallbackSkills) as typeof fallbackSkills;

  return (
    <>
      <SiteHeader />
      <PortfolioPage profile={profile} experiences={experiences} projects={projects} skills={skills} />
    </>
  );
}
