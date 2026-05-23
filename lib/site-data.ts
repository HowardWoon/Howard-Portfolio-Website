export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
};

export type ProjectItem = {
  id: string;
  title: string;
  context: string;
  description: string;
  tags: string[];
  project_url: string | null;
  display_order: number;
};

export type SkillItem = {
  id: string;
  name: string;
  category: string;
};

export const fallbackProfile = {
  full_name: 'Howard Woon Hao Zhe',
  bio: 'First-year Computer Science (Software Engineering) student at the University of Malaya. From managing corporate finance at Kraiburg TPE to architecting AI-driven applications and smart energy systems.',
  current_role: 'Computer Science student and builder across software, finance, and systems.'
};

export const fallbackExperiences: ExperienceItem[] = [
  {
    id: 'experience-1',
    role: 'Assistant Finance Executive',
    company: 'Kraiburg TPE Technology (M) Sdn. Bhd.',
    description: 'Managed budgets, executed transactions, and maintained financial precision before transitioning to software engineering.',
    start_date: '2024-01-01',
    end_date: null,
    is_current: false
  },
  {
    id: 'experience-2',
    role: 'Treasurer & Leadership Roles',
    company: 'UM Alphathon 2025, MYTECH Career Fair 2026, PEKOM CODEFEST / Mental Health Week',
    description: 'Led financial operations and kept event logistics disciplined across university initiatives and tech communities.',
    start_date: '2025-01-01',
    end_date: null,
    is_current: true
  }
];

export const fallbackProjects: ProjectItem[] = [
  {
    id: 'project-1',
    title: 'BILAHUJAN',
    context: 'Built for KitaHack 2026.',
    description: 'An intelligent disaster response mobile application.',
    tags: ['Mobile', 'AI', 'Disaster Response'],
    project_url: null,
    display_order: 1
  },
  {
    id: 'project-2',
    title: 'Sensor X Sensei',
    context: 'UM Technothon 2026.',
    description: 'A smart energy management system engineered to drastically reduce electricity waste.',
    tags: ['IoT', 'Energy Management', 'Systems Architecture'],
    project_url: null,
    display_order: 2
  },
  {
    id: 'project-3',
    title: 'BIOMELON',
    context: 'PPAL 4.0 Innovation Day.',
    description: 'A population genetics data platform.',
    tags: ['Data', 'Genetics', 'Innovation'],
    project_url: null,
    display_order: 3
  }
];

export const fallbackSkills: SkillItem[] = [
  { id: 'skill-1', name: 'Java', category: 'Languages' },
  { id: 'skill-2', name: 'Python', category: 'Languages' },
  { id: 'skill-3', name: 'React', category: 'Languages' },
  { id: 'skill-4', name: 'Flutter', category: 'Languages' },
  { id: 'skill-5', name: 'Node.js', category: 'Languages' },
  { id: 'skill-6', name: 'Firebase', category: 'Backend' },
  { id: 'skill-7', name: 'RESTful APIs', category: 'Backend' },
  { id: 'skill-8', name: 'Ollama', category: 'AI/ML' },
  { id: 'skill-9', name: 'Claude Code', category: 'AI/ML' },
  { id: 'skill-10', name: 'Google Colab', category: 'AI/ML' },
  { id: 'skill-11', name: 'Learning Pipelines', category: 'AI/ML' },
  { id: 'skill-12', name: 'Git/GitHub', category: 'Design' },
  { id: 'skill-13', name: 'Figma', category: 'Design' },
  { id: 'skill-14', name: 'Canva', category: 'Design' },
  { id: 'skill-15', name: 'Draw.io', category: 'Design' }
];

export const stackGroups = [
  {
    title: 'Languages & Frameworks',
    items: ['Java', 'Python', 'React', 'Flutter', 'Node.js']
  },
  {
    title: 'Backend & Cloud',
    items: ['Firebase', 'RESTful APIs']
  },
  {
    title: 'AI & Machine Learning',
    items: ['Local LLMs', 'Ollama', 'Claude Code', 'Google Colab', 'Supervised / Unsupervised pipelines']
  },
  {
    title: 'Tools & Design',
    items: ['Git / GitHub', 'Figma', 'Canva', 'Draw.io']
  }
];
