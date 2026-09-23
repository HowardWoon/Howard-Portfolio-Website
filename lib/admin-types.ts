export type AdminResource = 'experiences' | 'projects' | 'skills';

/** Row shapes exactly as stored in Supabase (sql/001_init.sql). */
export type ExperienceRow = {
  id: string;
  role: string;
  company: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
};

export type ProjectRow = {
  id: string;
  title: string;
  context: string;
  description: string;
  tags: string[];
  project_url: string | null;
  display_order: number;
};

export type SkillRow = { id: string; name: string; category: string };
