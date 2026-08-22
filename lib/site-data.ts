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
  name: 'Howard Woon',
  role: 'Software Engineer',
  avatar_url: '/images/howard-solid.jpeg',
  bio: 'Bachelor of Computer Science student at the University of Malaya, specializing in Software Engineering. Combining a strong technical appetite with hands-on leadership experience to engineer systems that are as efficient as they are impactful.',
  github_url: 'https://github.com/HowardWoon'
};

export const fallbackExperiences: ExperienceItem[] = [
  {
    id: 'experience-1',
    role: 'Finance Lead',
    company: 'Persatuan Komputer Universiti Malaya (PEKOM)',
    description: 'Architected the organization\'s financial portfolio, securing B2B corporate partnerships and spearheading an automated digital claims pipeline to scale operational efficiency.',
    start_date: '2026-06-01',
    end_date: null,
    is_current: true
  },
  {
    id: 'experience-2',
    role: 'Treasurer',
    company: 'MYTECH Career Fair 2026',
    description: 'Managed a RM50,200 budget, secured 30 corporate sponsors and RM46,200 in revenue, delivering a net surplus.',
    start_date: '2026-02-01',
    end_date: '2026-06-30',
    is_current: false
  },
  {
    id: 'experience-3',
    role: 'Treasurer',
    company: 'Code Fest X UM Alphathon 2025',
    description: 'Managed event budget, sponsorship funds, and vendor payments for Code Fest X UM Alphathon.',
    start_date: '2025-10-01',
    end_date: '2025-12-31',
    is_current: false
  },
  {
    id: 'experience-4',
    role: 'Committee Member, Sponsorship & Public Relations',
    company: 'Dean\'s Cup 2025',
    description: 'Coordinated sponsor outreach, handled sponsorship agreements, and assisted with sponsorship reconciliation.',
    start_date: '2025-10-01',
    end_date: '2025-12-31',
    is_current: false
  },
  {
    id: 'experience-5',
    role: 'Executive Assistant Finance',
    company: 'Kraiburg TPE Technology (M) Sdn. Bhd.',
    description: 'Managed high-volume financial data pipelines, executing complex financial reconciliations, and processed vendor payments.',
    start_date: '2025-06-01',
    end_date: '2025-09-30',
    is_current: false
  },
  {
    id: 'experience-6',
    role: 'Assistant Head of Subject, Computer Science',
    company: 'KMNS PAL Leader Club',
    description: 'Led peer-assisted learning sessions, coordinated lesson plans, and mentored junior students in Computer Science topics.',
    start_date: '2024-07-01',
    end_date: '2024-12-31',
    is_current: false
  },
  {
    id: 'experience-7',
    role: 'Chairperson',
    company: 'Village Sports Club',
    description: 'Organized sports events, managed club budgets, and led volunteer coordination.',
    start_date: '2024-07-01',
    end_date: '2024-12-31',
    is_current: false
  },
  {
    id: 'experience-8',
    role: 'Finance Intern',
    company: 'Kraiburg TPE',
    description: 'Supported budget monitoring and expenditure tracking to improve financial planning accuracy. Gained early exposure to enterprise data systems.',
    start_date: '2024-03-01',
    end_date: '2024-06-30',
    is_current: false
  }
];

export const fallbackProjects: ProjectItem[] = [
  {
    id: 'project-1',
    title: 'ZeroLag: Enterprise AI Inbound Command Center',
    context: '2nd Place — AutoPilot Asia Hackathon 2026',
    description: 'Engineered a bi-modal architecture utilizing a 5-operator Supervity Master Orchestrator governed by a localized Next.js, FastAPI, and PostgreSQL control dashboard.',
    tags: ['AI', 'Agentic Workflows', 'Next.js', 'FastAPI'],
    project_url: null,
    display_order: 1
  },
  {
    id: 'project-2',
    title: 'CATFISH.AI — Fraud Detection ML System',
    context: 'Machine Learning Project',
    description: 'Built a 6-model soft-voting ensemble on a 50,000-row dataset. Engineered a robust data pipeline using SMOTE-Tomek and PCA. Deployed predictive model via a Flask REST API hosted on Vercel.',
    tags: ['Machine Learning', 'Python', 'Flask', 'AI'],
    project_url: null,
    display_order: 2
  },
  {
    id: 'project-3',
    title: 'Sensor X Sensei — Smart Lecture Hall',
    context: 'UM Technothon 2026 Top 15 Finalist',
    description: 'Developed an end-to-end IoT solution leveraging ESP32 microcontrollers and multi-sensor data fusion to power a real-time occupancy dashboard. Automated kWh/CO2 calculations.',
    tags: ['IoT', 'ESP32', 'Sensors', 'Energy Management'],
    project_url: null,
    display_order: 3
  },
  {
    id: 'project-4',
    title: 'Slotify — Parking Management System',
    context: 'Data Structures Project',
    description: 'Engineered a Spring Boot backend implementing 7 hand-built data structures unified into a single pipeline. Implemented Dijkstra\'s shortest-path routing and a real-time interactive dashboard.',
    tags: ['Java', 'Spring Boot', 'Data Structures', 'Algorithms'],
    project_url: null,
    display_order: 4
  }
];

export const fallbackSkills: SkillItem[] = [
  { id: 'skill-1', name: 'Java', category: 'Languages' },
  { id: 'skill-2', name: 'Python', category: 'Languages' },
  { id: 'skill-3', name: 'JavaScript', category: 'Languages' },
  { id: 'skill-4', name: 'TypeScript', category: 'Languages' },
  { id: 'skill-5', name: 'React', category: 'Frameworks' },
  { id: 'skill-6', name: 'Next.js', category: 'Frameworks' },
  { id: 'skill-7', name: 'Node.js', category: 'Frameworks' },
  { id: 'skill-8', name: 'Spring Boot', category: 'Frameworks' },
  { id: 'skill-9', name: 'FastAPI', category: 'Frameworks' },
  { id: 'skill-10', name: 'Flask', category: 'Frameworks' },
  { id: 'skill-11', name: 'PostgreSQL', category: 'Backend' },
  { id: 'skill-12', name: 'RESTful APIs', category: 'Backend' },
  { id: 'skill-13', name: 'Agentic Workflows', category: 'AI/ML' },
  { id: 'skill-14', name: 'Ollama', category: 'AI/ML' },
  { id: 'skill-15', name: 'Generative AI', category: 'AI/ML' },
  { id: 'skill-16', name: 'Git/GitHub', category: 'Tools' }
];

export const stackGroups = [
  {
    title: 'Languages',
    items: ['Java', 'Python', 'JavaScript', 'TypeScript']
  },
  {
    title: 'Frameworks',
    items: ['React', 'Next.js', 'Spring Boot', 'FastAPI', 'Flask']
  },
  {
    title: 'Backend & Tools',
    items: ['PostgreSQL', 'RESTful APIs', 'Git/GitHub']
  },
  {
    title: 'AI & Machine Learning',
    items: ['Agentic Workflows', 'Ollama', 'Generative AI']
  }
];
