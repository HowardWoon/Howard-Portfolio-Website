// lib/site-data.ts

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  architectureHighlight: string;
  category: 'Agentic AI & Systems' | 'Distributed Backends' | 'Mobile & Cloud IoT';
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  deckUrl?: string;
  certificateUrl?: string;
  featured: boolean;
  highlight?: string;
  metrics?: { label: string; value: string };
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  category: 'Work Experience' | 'Student Governance' | 'Academic Mentorship';
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
  stats?: string;
  link?: string;
  certificateUrl?: string;
}

export const personalDetails = {
  name: 'Howard Woon',
  fullName: 'Howard Woon Hao Zhe',
  title: 'Software Engineer & Systems Developer',
  university: 'Universiti Malaya',
  faculty: 'Faculty of Computer Science & Information Technology',
  degree: 'Bachelor of Computer Science (Software Engineering)',
  cgpa: '4.00 / 4.00',
  location: 'Kajang, Selangor / Kuala Lumpur, Malaysia',
  bio: 'Software Engineering undergraduate at Universiti Malaya (4.00 CGPA) with deep expertise in backend systems, distributed architectures, graph algorithms, and multi-agent AI workflows. Experienced in shipping production solutions across Java, Kotlin, Python, and Spring Boot.',
  email: 'howardwoonhz06@gmail.com',
  github: 'https://github.com/HowardWoon',
  linkedin: 'https://www.linkedin.com/in/howard-woon-hao-zhe-730b9337a/',
  resumeUrl: '/resume.pdf',
  avatarUrl: '/images/howard-solid.jpeg',
};

export const heroMetrics = [
  { label: 'Cumulative CGPA', value: '4.00', sub: 'Faculty Dean’s List' },
  { label: 'Shipped Systems', value: '12+', sub: 'Production & Hackathons' },
  { label: 'AutoPilot 2026', value: '2nd Place', sub: 'Regional Hackathon Prize' },
  { label: 'GitHub Activity', value: '1.2k+', sub: 'Verified Commits' },
];

export const experiences: ExperienceItem[] = [
  {
    id: 'exp-kraiburg',
    role: 'Assistant Finance Executive & Intern',
    organization: 'KRAIBURG TPE Technology (M) Sdn. Bhd.',
    location: 'Kuala Lumpur, Malaysia',
    period: 'Nov 2025 – Present',
    category: 'Work Experience',
    description: [
      'Engineered automated reconciliation pipelines for high-volume corporate financial transactions, eliminating manual ledger discrepancies.',
      'Managed vendor disbursement cycles, treasury compliance audits, and enterprise ERP integrations with zero fault tolerance.',
    ],
    skills: ['Financial Systems', 'Data Pipelines', 'ERP Integration', 'Automation'],
  },
  {
    id: 'exp-pekom',
    role: 'Finance Lead & Treasurer',
    organization: 'Persatuan Komputer Universiti Malaya (PEKOM)',
    location: 'Universiti Malaya',
    period: '2025 – Present',
    category: 'Student Governance',
    description: [
      'Directing fiscal governance, budget modeling, and resource allocation across faculty-wide software engineering initiatives and hackathons.',
      'Overseeing transparent sponsorship disbursement for major academic events with over 500+ participants.',
    ],
    skills: ['Fiscal Governance', 'Budget Modeling', 'Leadership', 'Resource Allocation'],
  },
  {
    id: 'exp-mytech',
    role: 'Treasurer & Operations Lead',
    organization: 'MYTECH Career Fair 2026',
    location: 'Universiti Malaya',
    period: 'Feb 2026',
    category: 'Student Governance',
    description: [
      'Managed corporate sponsorship budgeting and financial tracking for Malaysia’s premier university tech career fair.',
      'Facilitated sponsor agreements, logistics execution, and fiscal audits for tier-1 corporate partners.',
    ],
    skills: ['Corporate Sponsorship', 'Operations Execution', 'Financial Auditing'],
  },
  {
    id: 'exp-codefest',
    role: 'Treasurer',
    organization: 'Code Fest & UM Alphathon 2025',
    location: 'Universiti Malaya',
    period: 'Oct 2025',
    category: 'Student Governance',
    description: [
      'Managed prize distribution pools, participant logistics, and venue budgeting for 200+ competitive programmers.',
    ],
    skills: ['Logistics', 'Budget Tracking', 'Event Operations'],
  },
  {
    id: 'exp-kmns',
    role: 'Assistant Head of Subject (Computer Science)',
    organization: 'KMNS PAL Leader Club',
    location: 'Kolej Matrikulasi Negeri Sembilan',
    period: '2024',
    category: 'Academic Mentorship',
    description: [
      'Conducted structured algorithmic problem solving and OOP tutorials for matriculation students, resulting in top cohort distinctions.',
    ],
    skills: ['DSA Tutoring', 'Java / Python', 'Mentorship'],
  },
];

export const projects: Project[] = [
  {
    id: 'proj-zerolag',
    title: 'ZeroLag',
    tagline: 'Autonomous Multi-Agent Sales Intelligence Command Center',
    description:
      'Autonomous multi-operator AI platform that ingests unstructured sales communications, classifies high-value buyer intent with 98.6% confidence, and triggers CRM workflows with zero manual latency.',
    architectureHighlight: '5-Operator Agentic Pipeline with real-time intent classification and webhook dispatchers.',
    category: 'Agentic AI & Systems',
    technologies: ['TypeScript', 'Next.js 15', 'FastAPI', 'Agentic Workflows', 'Tailwind CSS'],
    githubUrl: 'https://github.com/HowardWoon',
    deckUrl: '/documents/supervity-pitchdeck.pdf',
    featured: true,
    highlight: '2nd Place @ Supervity Hackathon 2026',
    metrics: { label: 'Intent Classification', value: '98.6%' },
  },
  {
    id: 'proj-slotify',
    title: 'Slotify',
    tagline: 'Smart Parking & Minimum-Congestion Vehicle Routing Engine',
    description:
      'High-performance backend leveraging Spring Boot and custom Graph Data Structures (Dijkstra algorithm, Min-Heaps, and AVL Trees) for optimal slot allocation and minimum-congestion vehicle routing.',
    architectureHighlight: 'O((V + E) log V) Dijkstra Graph Router coupled with Min-Heap spot allocators.',
    category: 'Distributed Backends',
    technologies: ['Java', 'Spring Boot', 'Data Structures', 'Graph Algorithms', 'PostgreSQL'],
    githubUrl: 'https://github.com/HowardWoon/Slotify',
    featured: true,
    highlight: 'Advanced Graph DSA Engine',
    metrics: { label: 'Routing Latency', value: '<40ms' },
  },
  {
    id: 'proj-bilahujan',
    title: 'BILAHUJAN',
    tagline: 'AI-Powered Disaster Preparedness & Flood Response Network',
    description:
      'Real-time crisis management mobile and cloud system providing predictive flood level alerts, nearest evacuation telemetry, and offline emergency dispatch routes for vulnerable communities.',
    architectureHighlight: 'Live IoT telemetry ingestion with automated SMS dispatch and GIS nearest-shelter pathfinding.',
    category: 'Mobile & Cloud IoT',
    technologies: ['Flutter', 'Python', 'FastAPI', 'GIS Mapping', 'Supabase'],
    githubUrl: 'https://github.com/HowardWoon/BILAHUJAN-VHack2026',
    liveUrl: 'https://bilahujan-vhack.web.app/',
    deckUrl: '/documents/dsaise-pitchdeck.pdf',
    certificateUrl: '/certificates/V HACK 2026 QUALIFIER_HOWARD WOON HAO ZHE.pdf',
    featured: true,
    highlight: 'KitaHack 2026 National Innovation',
    metrics: { label: 'Early Warning Window', value: '3.5 Hours' },
  },
  {
    id: 'proj-sensor-sensei',
    title: 'Sensor X Sensei',
    tagline: 'IoT Energy Monitoring & Automated Power Governance',
    description: 'Embedded IoT telemetry and cloud monitoring dashboard for commercial lecture hall energy monitoring, automated load shedding, and peak consumption forecasting.',
    architectureHighlight: 'ESP32 microcontroller telemetry via MQTT with automated HVAC load-shedding algorithms.',
    category: 'Mobile & Cloud IoT',
    technologies: ['ESP32', 'Node.js', 'MQTT', 'React', 'Tailwind CSS'],
    githubUrl: 'https://github.com/HowardWoon',
    certificateUrl: '/certificates/UM TECHNOTHON 2026.pdf',
    featured: false,
    highlight: 'UM Technothon 2026 Finalist',
    metrics: { label: 'Energy Reduction', value: '28.4%' },
  },
];

export const awards: AwardItem[] = [
  {
    id: 'award-um-game-jam',
    title: 'Public Choice Award',
    issuer: 'UM Game Jam 2026 (PEKOM)',
    date: 'Apr 2026',
    highlight: 'National Game Jam',
    description: 'Developed "The Goofy Experience" with Team Charlton—a medical horror/comedy game themed around "Losing Control". Implemented complex Perceptual Sabotage mechanics (UI hijacking, cursor manipulation) and a Chaos Buddy system to actively disorient players. Features 100% custom a cappella audio. Won against 39 universities nationwide.',
    stats: 'Public Choice / 39 Teams',
    link: 'https://howard-woon.itch.io/the-goofy-experience',
    certificateUrl: '/certificates/UM GAME JAM 2026 HOWARD WOON HAO ZHE.png',
  },
  {
    id: 'award-supervity',
    title: '2nd Place Winner (Sales Intelligence Track)',
    issuer: 'Supervity AutoPilot Asia Hackathon 2026',
    date: 'August 2026',
    highlight: 'Regional Hackathon Prize',
    description: 'Engineered ZeroLag, an agentic sales intelligence automation system, outperforming over 50 regional teams across Asia-Pacific.',
    stats: '2nd / 50+ Regional Teams',
    certificateUrl: '/certificates/Sales Intelligence Winner - 2nd Place.png',
  },
  {
    id: 'award-deans-list',
    title: "Dean's Honours List (4.00 CGPA)",
    issuer: 'Faculty of Computer Science & Information Technology, Universiti Malaya',
    date: '2025 – 2026',
    highlight: 'Academic Distinction',
    description: 'Maintained a flawless 4.00 CGPA across all software engineering, data structures, algorithms, and systems coursework.',
    stats: 'Top 1% Academic Ranking',
  },
  {
    id: 'award-kmns',
    title: 'Academic Excellence Award (4.00 CGPA)',
    issuer: 'Kolej Matrikulasi Negeri Sembilan',
    date: '2024',
    highlight: 'Matriculation Distinction',
    description: 'Graduated top of cohort in Physical Sciences & Computer Science with straight-A distinctions.',
    stats: '4.00 Flawless Score',
  },
];

export const techMatrix = [
  {
    domain: 'Core Languages & Systems',
    icon: 'Terminal',
    skills: ['Java (17/21)', 'Kotlin', 'Python', 'TypeScript', 'SQL (PostgreSQL)', 'C / C++'],
  },
  {
    domain: 'Backend Architecture & Frameworks',
    icon: 'Cpu',
    skills: ['Spring Boot', 'FastAPI', 'Node.js / Express', 'RESTful APIs', 'Microservices', 'Agentic AI'],
  },
  {
    domain: 'Databases & Algorithm Design',
    icon: 'Database',
    skills: ['PostgreSQL', 'Supabase', 'MySQL', 'Redis Cache', 'Graph Dijkstra / Min-Heaps', 'AVL Trees'],
  },
  {
    domain: 'DevOps, Cloud & Tooling',
    icon: 'Cloud',
    skills: ['Docker', 'GCP', 'AWS', 'Git / GitHub CI/CD', 'Linux / Bash', 'Vercel Deployment'],
  },
];

// Fallback exports for admin compilation bypass
export const fallbackProfile = {
  name: personalDetails.name,
  role: personalDetails.title,
  bio: personalDetails.bio,
  email: personalDetails.email,
  github_url: personalDetails.github,
  linkedin_url: personalDetails.linkedin,
  resume_url: personalDetails.resumeUrl
};
export const fallbackSkills = techMatrix.flatMap(ts => ts.skills.map((s, i) => ({ id: `${ts.domain}-${i}`, name: s, category: ts.domain, proficiency: 100 })));
export const fallbackExperiences = experiences.map((e, i) => ({ id: e.id, title: e.role, company: e.organization, date_range: e.period, description: e.description.join(' '), is_active: i===0 }));
export const fallbackProjects = projects.map(p => ({ id: p.id, title: p.title, description: p.description, image_url: '', project_url: p.githubUrl, github_url: p.githubUrl, tags: p.technologies }));
export const fallbackAwards = awards.map(a => ({ id: a.id, title: a.title, issuer: a.issuer, date_received: a.date, description: a.description }));
