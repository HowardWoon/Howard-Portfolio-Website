// lib/site-data.ts

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'AI & Agents' | 'Distributed Systems' | 'Full-Stack' | 'IoT';
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  deckUrl?: string;
  featured: boolean;
  highlight?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  type: 'Work Experience' | 'Student Governance' | 'Academic Distinction';
  description: string[];
  skills: string[];
}

export interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  highlight: string;
  description: string;
}

export const personalDetails = {
  name: 'Howard Woon',
  fullName: 'Howard Woon Hao Zhe',
  title: 'Software Engineer & Systems Developer',
  university: 'Universiti Malaya',
  degree: 'Bachelor of Computer Science (Software Engineering)',
  cgpa: '4.00 / 4.00',
  bio: 'Software Engineering undergraduate at Universiti Malaya (4.00 CGPA) with expertise in backend systems, distributed architectures, graph algorithms, and multi-agent AI workflows. Experienced in shipping production-grade solutions across Java, Kotlin, Python, and Spring Boot.',
  email: 'howardwoonhz06@gmail.com',
  github: 'https://github.com/HowardWoon',
  linkedin: 'https://linkedin.com/in/howardwoon',
  resumeUrl: '/resume.pdf',
  avatarUrl: '/images/howard-solid.jpeg',
};

export const metrics = [
  { label: 'Cumulative GPA', value: '4.00' },
  { label: 'Shipped Systems', value: '12+' },
  { label: 'Hackathon Track 2nd Place', value: 'AutoPilot 2026' },
  { label: 'GitHub Activity', value: '1.2k+ Commits' },
];

export const experiences: ExperienceItem[] = [
  {
    id: 'exp-kraiburg',
    role: 'Assistant Finance Executive & Intern',
    organization: 'KRAIBURG TPE Technology (M) Sdn. Bhd.',
    period: 'Nov 2025 – Present',
    type: 'Work Experience',
    description: [
      'Engineered automated reconciliation workflows for high-volume corporate financial data pipelines, eliminating manual ledger verification discrepancies.',
      'Managed vendor disbursement lifecycles, treasury audits, and ERP integrations with cross-border precision.',
    ],
    skills: ['Financial Systems', 'Data Pipelines', 'ERP Workflows', 'Automation'],
  },
  {
    id: 'exp-pekom',
    role: 'Finance Lead & Treasurer',
    organization: 'Persatuan Komputer Universiti Malaya (PEKOM)',
    period: '2025 – Present',
    type: 'Student Governance',
    description: [
      'Overseeing fiscal governance, committee financial planning, and budget allocation for faculty-wide software engineering and tech initiatives.',
      'Directed treasury operations for flagship faculty hackathons and symposiums, ensuring audit compliance and sponsorship transparency.',
    ],
    skills: ['Fiscal Governance', 'Budget Modeling', 'Stakeholder Management'],
  },
  {
    id: 'exp-mytech',
    role: 'Treasurer & Operations Lead',
    organization: 'MYTECH Career Fair 2026',
    period: 'Feb 2026',
    type: 'Student Governance',
    description: [
      'Governed a multi-tier financial framework and corporate sponsorship tracking system for one of Malaysia’s premier university tech career fairs.',
      'Collaborated with corporate partners and tech recruiters to facilitate sponsorship contracts and event logistical infrastructure.',
    ],
    skills: ['Corporate Sponsorship', 'Operations', 'Resource Management'],
  },
  {
    id: 'exp-codefest',
    role: 'Treasurer',
    organization: 'Code Fest & UM Alphathon 2025',
    period: 'Oct 2025',
    type: 'Student Governance',
    description: [
      'Managed prize distribution pools, participant budgeting, and logistical procurement for over 200+ competitive programming participants.',
    ],
    skills: ['Event Operations', 'Financial Planning'],
  },
  {
    id: 'exp-kmns',
    role: 'Assistant Head of Subject (Computer Science)',
    organization: 'KMNS PAL Leader Club',
    period: '2024',
    type: 'Academic Distinction',
    description: [
      'Mentored matriculation students in structured programming, algorithmic problem solving, and object-oriented fundamentals, achieving top subject distinctions.',
    ],
    skills: ['Mentorship', 'Data Structures', 'Algorithmic Problem Solving'],
  },
];

export const projects: Project[] = [
  {
    id: 'proj-zerolag',
    title: 'ZeroLag',
    tagline: 'Autonomous Multi-Agent Sales Intelligence Command Center',
    description:
      'Autonomous multi-operator AI agent platform that ingests unstructured sales communications, scores intent with 98%+ confidence, and triggers CRM workflows with zero manual latency. Awarded 2nd Place in the Sales Intelligence Track at Supervity AutoPilot Asia Hackathon 2026.',
    category: 'AI & Agents',
    technologies: ['TypeScript', 'Next.js 15', 'FastAPI', 'Agentic Workflows', 'Tailwind CSS'],
    githubUrl: 'https://github.com/HowardWoon',
    deckUrl: '/documents/supervity-pitchdeck.pdf',
    featured: true,
    highlight: '2nd Place @ Supervity Hackathon 2026',
  },
  {
    id: 'proj-slotify',
    title: 'Slotify',
    tagline: 'Smart Parking & Minimum-Congestion Vehicle Routing Engine',
    description:
      'High-performance traffic and parking management backend leveraging Spring Boot and custom Graph Data Structures (Dijkstra algorithm, Min-Heaps, and AVL Trees) for optimal slot allocation and minimum-congestion vehicle routing.',
    category: 'Distributed Systems',
    technologies: ['Java', 'Spring Boot', 'Data Structures', 'Graph Algorithms', 'PostgreSQL'],
    githubUrl: 'https://github.com/HowardWoon/Slotify',
    featured: true,
    highlight: 'Advanced DSA Architecture',
  },
  {
    id: 'proj-bilahujan',
    title: 'BILAHUJAN',
    tagline: 'AI-Powered Disaster Preparedness & Flood Response Network',
    description:
      'Real-time crisis management mobile and cloud system providing predictive flood level alerts, nearest evacuation telemetry, and offline emergency dispatch routes for vulnerable communities.',
    category: 'Full-Stack',
    technologies: ['Flutter', 'Python', 'FastAPI', 'GIS Mapping', 'Supabase'],
    githubUrl: 'https://github.com/HowardWoon',
    deckUrl: '/documents/dsaise-pitchdeck.pdf',
    featured: true,
    highlight: 'KitaHack 2026 Innovation',
  },
  {
    id: 'proj-sensor-sensei',
    title: 'Sensor X Sensei',
    tagline: 'IoT Energy Monitoring & Automated Power Governance',
    description:
      'Embedded IoT telemetry and cloud monitoring dashboard for commercial lecture hall energy monitoring, automated load shedding, and peak consumption forecasting.',
    category: 'IoT',
    technologies: ['ESP32', 'Node.js', 'MQTT', 'React', 'Tailwind CSS'],
    githubUrl: 'https://github.com/HowardWoon',
    featured: false,
    highlight: 'UM Technothon 2026 Finalist',
  },
];

export const awards: AwardItem[] = [
  {
    id: 'award-supervity',
    title: '2nd Place Winner (Sales Intelligence Track)',
    issuer: 'Supervity AutoPilot Asia Hackathon 2026',
    date: 'August 2026',
    highlight: 'Regional Hackathon Prize',
    description: 'Engineered ZeroLag, an agentic sales intelligence automation system, outperforming over 50 regional teams.',
  },
  {
    id: 'award-deans-list',
    title: "Dean's Honours List (4.00 CGPA)",
    issuer: 'Faculty of Computer Science & Information Technology, Universiti Malaya',
    date: '2025 – 2026',
    highlight: 'Academic Distinction',
    description: 'Maintained a flawless 4.00 CGPA across all software engineering, data structures, and algorithmic coursework.',
  },
  {
    id: 'award-kmns',
    title: 'Academic Excellence Award (4.00 CGPA)',
    issuer: 'Kolej Matrikulasi Negeri Sembilan',
    date: '2024',
    highlight: 'Matriculation Distinction',
    description: 'Graduated top of cohort in Physical Sciences & Computer Science with straight-A distinctions.',
  },
];

export const techStack = [
  {
    category: 'Backend & Distributed Systems',
    skills: ['Java', 'Spring Boot', 'Kotlin', 'Python', 'FastAPI', 'Node.js', 'RESTful APIs', 'Microservices'],
  },
  {
    category: 'Core Computer Science',
    skills: ['Data Structures & Algorithms', 'Object-Oriented Design (OOD)', 'Database Optimization', 'System Architecture'],
  },
  {
    category: 'Databases & Cloud DevOps',
    skills: ['PostgreSQL', 'Supabase', 'MySQL', 'Redis', 'Docker', 'AWS', 'GCP', 'Git / GitHub CI/CD'],
  },
  {
    category: 'Frontend & Mobile Engineering',
    skills: ['TypeScript', 'Next.js 15', 'React', 'Tailwind CSS', 'Flutter', 'HTML5/CSS3'],
  },
];

// LEGACY EXPORTS FOR ADMIN DASHBOARD
// These are included solely to prevent the legacy /admin routes from failing compilation 
// since the database schema was severely modified.
export const fallbackProfile = {
  full_name: personalDetails.fullName,
  title: personalDetails.title,
  github_url: personalDetails.github,
  linkedin_url: personalDetails.linkedin,
  bio: personalDetails.bio,
  avatar_url: personalDetails.avatarUrl,
  resume_url: personalDetails.resumeUrl
};
export const fallbackHero = {
  title: personalDetails.fullName,
  subtitle: personalDetails.title,
  badge_text: 'Software Engineering @ UM',
  description: personalDetails.bio
};
export const fallbackSkills = techStack.flatMap(ts => ts.skills.map((s, i) => ({ id: `${ts.category}-${i}`, name: s, category: ts.category, proficiency: 100 })));
export const fallbackExperiences = experiences.map((e, i) => ({ id: e.id, title: e.role, company: e.organization, date_range: e.period, description: e.description.join(' '), is_active: i===0 }));
export const fallbackProjects = projects.map(p => ({ id: p.id, title: p.title, description: p.description, image_url: '', project_url: p.githubUrl, github_url: p.githubUrl, tags: p.technologies }));
export const fallbackAwards = awards.map(a => ({ id: a.id, title: a.title, issuer: a.issuer, date_received: a.date, description: a.description }));
