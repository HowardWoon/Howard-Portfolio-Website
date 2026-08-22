import { SiteHeader } from '@/components/site-header';
import { EngineeringHUD } from '@/components/EngineeringHUD';
import Scene from '@/components/canvas/Scene';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fallbackExperiences, fallbackProfile, fallbackProjects, fallbackSkills } from '@/lib/site-data';

import { PortfolioPage } from '@/components/portfolio-page';
import { SmoothScroller } from '@/components/smooth-scroller';

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
    <SmoothScroller>
      <main className="relative min-h-screen w-full bg-background">
        <SiteHeader />
        <EngineeringHUD />
        
        {/* Fixed 3D Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Scene profile={profile} experiences={experiences} projects={projects} skills={skills} />
        </div>

        {/* Native Scrolling Content */}
        <div className="relative z-10">
          <PortfolioPage profile={profile} experiences={experiences} projects={projects} skills={skills} />
        </div>
      </main>
    </SmoothScroller>
  );
}
