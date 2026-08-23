import { Building2, Landmark, Briefcase, GraduationCap, Server, Database, Code2, Globe, Cpu, Activity, Zap, Compass, CheckCircle2, FileText, Terminal } from 'lucide-react';
export interface Project {
  id: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  architectureHighlight: string;
  category: 'Agentic AI' | 'Distributed Backends' | 'IoT & Cloud';
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  deckUrl?: string;
  certificateUrl?: string;
  featured: boolean;
  highlight?: string;
  year: string;
  metrics?: { label: string; value: string };
}

export interface ExperienceItem {
  id: string;
  index: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  category: 'Corporate Experience' | 'Student Leadership' | 'Academic Tutoring';
  description: string[];
  skills: string[];
}

export interface AwardItem {
  id: string;
  index: string;
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
  title: 'Software Engineer & Systems Architect',
  university: 'Universiti Malaya',
  faculty: 'Faculty of Computer Science & Information Technology',
  degree: 'Bachelor of Computer Science (Software Engineering)',
  cgpa: '4.00 / 4.00',
  location: 'Kajang, Selangor / Kuala Lumpur, Malaysia',
  statement: 'Howard is a software engineer & backend systems architect redefining high-throughput infrastructure, graph algorithms, and autonomous agentic AI workflows, one production prototype at a time.',
  email: 'howardwoonhz06@gmail.com',
  github: 'https://github.com/HowardWoon',
  linkedin: 'https://linkedin.com/in/howardwoon',
  resumeUrl: '/resume.pdf',
  avatarUrl: '/images/howard-solid.jpeg',
};

export const heroStats = [
  { value: '4.00', label: 'Cumulative CGPA', sub: "Faculty Dean's Honours List" },
  { value: '12+', label: 'Shipped Systems', sub: 'Production & Hackathons' },
  { value: '2nd', label: 'Supervity Hackathon', sub: 'Sales Intelligence Track' },
  { value: '1.2k+', label: 'GitHub Activity', sub: 'Verified Commits & PRs' },
];

export const tickerKeywords = [
  'SPRING BOOT 3',
  'JAVA 21',
  'AGENTIC MULTI-OPERATOR AI',
  'GRAPH DIJKSTRA ROUTING',
  'POSTGRESQL',
  'PYTHON FASTAPI',
  'NEXT.JS 15',
  'DISTRIBUTED SYSTEMS',
  'AUTOPILOT ASIA 2026',
  'UNIVERSITI MALAYA (4.00 CGPA)',
  'MIN-HEAP & AVL TREES',
  'IOT TELEMETRY',
];

export const projects: Project[] = [
  {
    id: 'proj-zerolag',
    index: '01',
    title: 'ZeroLag',
    tagline: 'Autonomous Multi-Operator Sales Intelligence Pipeline',
    description: 'Engineered an enterprise agentic triage system that ingests unstructured multi-channel communications, classifies intent with 98.6% confidence, and dispatches automated webhook responses with zero manual lag.',
    architectureHighlight: '5-Operator asynchronous DAG agent pipeline with real-time confidence thresholding.',
    category: 'Agentic AI',
    technologies: ['TypeScript', 'Next.js 15', 'FastAPI', 'Agentic Workflows', 'Tailwind CSS'],
    deckUrl: '/documents/supervity-pitchdeck.pdf',
    certificateUrl: '/certificates/Sales Intelligence Winner - 2nd Place.png',
    featured: true,
    highlight: '2nd Place Winner @ Supervity Hackathon',
    year: '2026',
    metrics: { label: 'Intent Accuracy', value: '98.6%' },
  },
  {
    id: 'proj-slotify',
    index: '02',
    title: 'Slotify',
    tagline: 'Minimum-Congestion Vehicle Routing & Parking Allocation Engine',
    description: 'High-performance backend engine utilizing custom Graph algorithms (Dijkstra, Min-Heaps, and AVL Trees) for real-time parking spot reservation and sub-40ms vehicular routing.',
    architectureHighlight: 'O((V + E) log V) Dijkstra Graph Router with dynamic obstacle & congestion re-weighing.',
    category: 'Distributed Backends',
    technologies: ['Java 21', 'Spring Boot', 'Graph Algorithms', 'Min-Heaps', 'PostgreSQL'],
    githubUrl: 'https://github.com/HowardWoon/Slotify',
    featured: true,
    highlight: 'Production Graph Architecture',
    year: '2025 – 2026',
    metrics: { label: 'Route Latency', value: '<40ms' },
  },
  {
    id: 'proj-bilahujan',
    index: '03',
    title: 'BILAHUJAN',
    tagline: 'Disaster Preparedness & AI Flood Telemetry Emergency Response',
    description: 'Real-time disaster response system delivering predictive water level warnings, offline evacuation route generation, and automated crisis alert broadcasts for vulnerable municipal zones.',
    architectureHighlight: 'Live telemetry ingestion with GIS shelter pathfinding and automated SMS dispatch.',
    category: 'IoT & Cloud',
    technologies: ['Flutter', 'Python', 'FastAPI', 'GIS Mapping', 'Supabase'],
    githubUrl: 'https://github.com/HowardWoon/BILAHUJAN-VHack2026',
    liveUrl: 'https://bilahujan-vhack.web.app/',
    certificateUrl: '/certificates/VHack 2026.pdf',
    featured: true,
    highlight: 'KitaHack 2026 National Innovation',
    year: '2026',
    metrics: { label: 'Early Warning', value: '3.5 Hours' },
  },
  {
    id: 'proj-sensor-sensei',
    index: '04',
    title: 'Sensor X Sensei',
    tagline: 'Smart Micro-Climate Energy Management System',
    description: 'Intelligent, automated energy management solution for modern lecture halls leveraging IoT-based occupancy tracking to dynamically route power and HVAC ventilation only to occupied rows.',
    architectureHighlight: 'Dual-rail power system via ESP32, authenticated via NFC with real-time C++ WebServer telemetry and Glassmorphism dashboard.',
    category: 'IoT & Cloud',
    technologies: ['C++', 'ESP32', 'React', 'Tailwind CSS', 'IoT Sensors'],
    githubUrl: 'https://github.com/HowardWoon/Sensor-X-Sensei---UM-Technothon-2026',
    certificateUrl: '/certificates/UM TECHNOTHON 2026.pdf',
    featured: false,
    highlight: 'UM Technothon Finalist',
    year: '2026',
    metrics: { label: 'Energy Savings', value: '28.4%' },
  },
];

export const experiences: ExperienceItem[] = [
  {
    id: 'exp-kraiburg',
    index: '01',
    role: 'Assistant Finance Executive & Intern',
    organization: 'KRAIBURG TPE Technology (M) Sdn. Bhd.',
    location: 'Kuala Lumpur, Malaysia',
    period: 'Nov 2025 – Present',
    category: 'Corporate Experience',
    description: [
      'Architected automated reconciliation scripts for high-volume enterprise financial ledgers, eliminating manual data entry bottlenecks.',
      'Managed vendor disbursements, statutory compliance, and corporate ERP workflows with strict fault tolerance.',
    ],
    skills: ['ERP Integration', 'Process Automation', 'Financial Data Pipelines', 'Audit Compliance'],
  },
  {
    id: 'exp-pekom',
    index: '02',
    role: 'Finance Lead & Treasurer',
    organization: 'Persatuan Komputer Universiti Malaya (PEKOM)',
    location: 'Universiti Malaya',
    period: '2025 – Present',
    category: 'Student Leadership',
    description: [
      'Directing fiscal governance and budget modeling across faculty-wide software engineering hackathons and academic summits.',
      'Overseeing sponsorship distribution and financial accountability for 500+ participants.',
    ],
    skills: ['Fiscal Governance', 'Budget Modeling', 'Leadership', 'Resource Allocation'],
  },
  {
    id: 'exp-mytech',
    index: '03',
    role: 'Treasurer & Operations Lead',
    organization: 'MYTECH Career Fair 2026',
    location: 'Universiti Malaya',
    period: 'Feb 2026',
    category: 'Student Leadership',
    description: [
      'Structured corporate tier sponsorship budgets and financial tracking for Malaysia’s premier university tech career fair.',
    ],
    skills: ['Corporate Sponsorship', 'Operations Execution', 'Budget Auditing'],
  },
  {
    id: 'exp-kmns',
    index: '04',
    role: 'Assistant Head of Subject (Computer Science)',
    organization: 'KMNS PAL Leader Club',
    location: 'Kolej Matrikulasi Negeri Sembilan',
    period: '2024',
    category: 'Academic Tutoring',
    description: [
      'Conducted structured algorithmic problem solving and OOP tutorials for matriculation cohorts, resulting in top distinctions.',
    ],
    skills: ['DSA Coaching', 'Java / Python', 'Mentorship'],
  },
];

export const awards: AwardItem[] = [
  {
    id: 'award-um-game-jam',
    index: '00',
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
    index: '01',
    title: '2nd Place Winner (Sales Intelligence Track)',
    issuer: 'Supervity AutoPilot Asia Hackathon 2026',
    date: 'August 2026',
    highlight: 'Regional Hackathon Prize',
    description: 'Built ZeroLag, an autonomous multi-agent sales command center, outperforming over 50 regional teams across APAC.',
    stats: '2nd / 50+ Regional Teams',
    certificateUrl: '/certificates/Sales Intelligence Winner - 2nd Place.png',
  },
  {
    id: 'award-deans-list',
    index: '02',
    title: "Dean's Honours List (4.00 CGPA)",
    issuer: 'Faculty of Computer Science & IT, Universiti Malaya',
    date: '2025 – 2026',
    highlight: 'Academic Distinction',
    description: 'Maintained a flawless 4.00 CGPA across all software engineering, data structures, algorithms, and distributed systems coursework.',
    stats: 'Top 1% Academic Distinction',
  },
  {
    id: 'award-kmns',
    index: '03',
    title: 'Academic Excellence Award (4.00 CGPA)',
    issuer: 'Kolej Matrikulasi Negeri Sembilan',
    date: '2024',
    highlight: 'Matriculation Distinction',
    description: 'Graduated top of cohort in Physical Sciences & Computer Science with straight-A distinctions.',
    stats: '4.00 Flawless Score',
  },
];

export const skillsMatrix = [
  {
    category: 'A / Core Languages & Systems',
    skills: ['Java (17 / 21)', 'Kotlin', 'Python 3', 'TypeScript', 'SQL (PostgreSQL)', 'C / C++'],
  },
  {
    category: 'B / Distributed Backend & Frameworks',
    skills: ['Spring Boot 3', 'FastAPI', 'Node.js / Express', 'RESTful APIs', 'Microservices', 'Agentic AI'],
  },
  {
    category: 'C / Data Structures & Storage Engines',
    skills: ['PostgreSQL', 'Supabase', 'Redis Cache', 'MySQL', 'Graph Dijkstra', 'Min-Heaps / AVL Trees'],
  },
  {
    category: 'D / Cloud Infrastructure & DevOps',
    skills: ['Docker', 'Google Cloud Platform', 'AWS', 'Git / GitHub CI/CD', 'Linux / Bash', 'Vercel'],
  },
];

export const fallbackSkills = skillsMatrix.flatMap(ts => ts.skills.map((s, i) => ({ id: `${i}`, name: s, category: ts.category })));
export const fallbackExperiences = experiences.map((e, i) => ({ id: e.id, title: e.role, company: e.organization, date_range: e.period, description: e.description.join(' '), is_active: i===0 }));
export const fallbackProjects = projects.map(p => ({ id: p.id, title: p.title, description: p.description, image_url: '', project_url: p.githubUrl, github_url: p.githubUrl, tags: p.technologies }));
export const fallbackAwards = awards.map(a => ({ id: a.id, title: a.title, issuer: a.issuer, date_received: a.date, description: a.description }));

export const faqs = [
  {
    question: "What kind of role are you looking for?",
    answer: "I am primarily looking for Backend Engineering, Systems Engineering, or Data Infrastructure roles where I can leverage Java, Python, and Spring Boot to build distributed logic and agentic workflows."
  },
  {
    question: "Are you open to internships or full-time?",
    answer: "I am currently seeking software engineering internships or part-time contracting roles alongside my undergraduate studies at Universiti Malaya."
  },
  {
    question: "What is your notice period / earliest start date?",
    answer: "I am available to begin a new role within 2 weeks of offer acceptance, depending on academic term commitments."
  },
  {
    question: "Which tech stack are you strongest in?",
    answer: "My strongest ecosystem is Java/Spring Boot for scalable backends, coupled with Python (FastAPI) for AI and data orchestration. I am highly proficient with PostgreSQL, Docker, and graph algorithm implementations."
  }
];

export const fallbackProfile = personalDetails;

