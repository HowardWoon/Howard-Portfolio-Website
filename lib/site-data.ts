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
  bio: 'First-year Computer Science (Software Engineering) student at the University of Malaya.',
  current_role: 'Builder across software engineering, finance, AI systems, and smart energy products.'
};

export const fallbackExperiences: ExperienceItem[] = [
  {
    id: 'experience-1',
    role: 'Treasurer',
    company: 'MYTECH Career Fair',
    description: 'Oversaw budgeting, bank reconciliation, vendor payments, and financial reporting for MYTECH Career Fair 2026.',
    start_date: '2026-02-01',
    end_date: null,
    is_current: true
  },
  {
    id: 'experience-2',
    role: 'Executive Assistant Finance',
    company: 'KRAIBURG TPE Technology (M) Sdn. Bhd.',
    description: 'Supported account management, reconciliations, month-end close tasks, and financial reporting for the finance team.',
    start_date: '2025-06-01',
    end_date: '2025-09-30',
    is_current: false
  },
  {
    id: 'experience-3',
    role: 'Treasurer',
    company: 'Code Fest X UM Alphathon 2025',
    description: 'Managed event budget, sponsorship funds, and vendor payments for Code Fest X UM Alphathon 2025.',
    start_date: '2025-10-01',
    end_date: '2025-12-31',
    is_current: false
  },
  {
    id: 'experience-4',
    role: 'Committee Member, Sponsorship & Public Relations',
    company: "Dean's Cup 2025",
    description: 'Coordinated sponsor outreach, handled sponsorship agreements, and assisted with sponsorship reconciliation.',
    start_date: '2025-10-01',
    end_date: '2025-12-31',
    is_current: false
  },
  {
    id: 'experience-5',
    role: 'Treasurer',
    company: 'Mental Health Week 2025',
    description: 'Managed budgeting, procurement, and bank reconciliation for Mental Health Week 2025.',
    start_date: '2025-09-01',
    end_date: '2025-11-30',
    is_current: false
  },
  {
    id: 'experience-6',
    role: 'Finance Intern',
    company: 'KRAIBURG TPE',
    description: 'Assisted with financial analysis, project finance tracking, bookkeeping, and routine reconciliations.',
    start_date: '2024-03-01',
    end_date: '2024-06-30',
    is_current: false
  },
  {
    id: 'experience-7',
    role: 'Assistant Head of Subject, Computer Science',
    company: "Negeri Sembilan Matriculation College (KMNS) - PAL Leader Club",
    description: 'Led peer-assisted learning sessions, coordinated lesson plans, and mentored junior students in Computer Science topics.',
    start_date: '2024-07-01',
    end_date: '2024-12-31',
    is_current: false
  },
  {
    id: 'experience-8',
    role: 'Chairperson',
    company: 'Village Sports Club',
    description: 'Organized sports events, managed club budgets, and led volunteer coordination.',
    start_date: '2024-07-01',
    end_date: '2024-12-31',
    is_current: false
  },
  {
    id: 'experience-9',
    role: 'Representative',
    company: 'KMNS PAL Leaders - KPM Madani Leadership Course',
    description: 'Selected representative for the KPM Madani leadership course; participated in workshops and leadership training.',
    start_date: '2024-10-01',
    end_date: '2024-10-31',
    is_current: false
  }
];

export const fallbackProjects: ProjectItem[] = [
  {
    id: 'project-1',
    title: 'BILAHUJAN',
    context: 'KitaHack 2026',
    description: 'Intelligent disaster response mobile application.',
    tags: ['Mobile', 'AI', 'Disaster Response'],
    project_url: null,
    display_order: 1
  },
  {
    id: 'project-2',
    title: 'Sensor X Sensei',
    context: 'UM Technothon 2026',
    description: 'Smart energy management system engineered to reduce electricity waste.',
    tags: ['IoT', 'Energy Management', 'Systems Architecture'],
    project_url: null,
    display_order: 2
  },
  {
    id: 'project-3',
    title: 'BIOMELON',
    context: 'PPAL 4.0 Innovation Day',
    description: 'Population genetics data platform.',
    tags: ['Data', 'Genetics', 'Innovation'],
    project_url: null,
    display_order: 3
  }
];

export const fallbackSkills: SkillItem[] = [
  { id: 'skill-1', name: 'Java', category: 'Languages' },
  { id: 'skill-2', name: 'Python', category: 'Languages' },
  { id: 'skill-3', name: 'JavaScript/TypeScript', category: 'Languages' },
  { id: 'skill-4', name: 'React', category: 'Frameworks' },
  { id: 'skill-5', name: 'Flutter', category: 'Frameworks' },
  { id: 'skill-6', name: 'Node.js', category: 'Frameworks' },
  { id: 'skill-7', name: 'Firebase', category: 'Backend' },
  { id: 'skill-8', name: 'RESTful APIs', category: 'Backend' },
  { id: 'skill-9', name: 'Ollama', category: 'AI/ML' },
  { id: 'skill-10', name: 'Claude Code', category: 'AI/ML' },
  { id: 'skill-11', name: 'Google Colab', category: 'AI/ML' },
  { id: 'skill-12', name: 'Learning Pipelines', category: 'AI/ML' },
  { id: 'skill-13', name: 'Git/GitHub', category: 'Tools' },
  { id: 'skill-14', name: 'Figma', category: 'Tools' },
  { id: 'skill-15', name: 'Canva', category: 'Tools' },
  { id: 'skill-16', name: 'Draw.io', category: 'Tools' }
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
