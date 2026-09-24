import Link from 'next/link';
import React from 'react';
import { Reveal } from './reveal';
import { TiltCard } from './tilt-card';
import { InteractivePhotoStack } from './interactive-photo-stack';
import {
  Award,
  ExternalLink,
  Terminal,
  FileText,
  Activity,
  ArrowUpRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Network,
  Github,
} from 'lucide-react';

interface ProjectData {
  id: string;
  number: string;
  badge: string;
  badgeType: 'gold' | 'cyan' | 'emerald';
  title: string;
  subtitle: string;
  description: string;
  architecturePoints: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
  deckUrl?: string;
  prototypeUrl?: string;
  orchestratorUrl?: string;
  colabUrl?: string;
  simulatorId: string;
  githubUrl?: string;
  telemetryType: 'agentic' | 'flood' | 'energy' | 'catfish' | 'slotify' | 'proofpay';
  galleryPhotos?: { src: string; alt: string; rotation: number }[];
}

const projects: ProjectData[] = [
  {
    id: 'zerolag',
    number: '01',
    badge: '🏆 2nd Place Winner · Supervity Asia Hackathon 2026',
    badgeType: 'gold',
    title: 'ZeroLag',
    subtitle: 'Governed AI Workforce & Autonomous Sales Pipeline',
    description:
      'A Bi-Modal AI Agent Architecture built to resolve B2B buying groups and halt PDPA/GDPR compliance violations. Engineered with deterministic halt states to prevent LLM compute waste and enterprise legal liability with zero pipeline pollution.',
    architecturePoints: [
      'Layer 1 Execution Node: Master Orchestrator triggering 5 specialized Operators (Ingestion, Scraper, Sentiment Scorer, Lead Ranker, CRM Dispatch)',
      'Layer 2 Governance Node: Dynamic ICP Thresholding & Human-in-the-loop Exception Workbench',
      'Compute-Optimized Logic Gates executing hard halts and raw PostgreSQL SQL Write-Backs',
    ],
    metrics: [
      { label: 'Compliance', value: '100% PDPA/GDPR' },
      { label: 'Agent Operators', value: '5 Autonomous Nodes' },
      { label: 'Wasted Compute', value: 'Zero' },
    ],
    tags: ['FastAPI', 'LangGraph', 'PostgreSQL', 'HubSpot API', 'React', 'Python'],
    deckUrl: '/documents/supervity-pitchdeck.pdf',
    simulatorId: 'zerolag',
    orchestratorUrl:
      'https://auto.supervity.ai/u/alpha/agent/workflow/019fd755-073c-7000-b437-02bfad99b025?tab=Workflow',
    githubUrl: '',
    telemetryType: 'agentic',
  },
  {
    id: 'proofpay',
    number: '02',
    badge: '🏅 2nd Runner Up (Sui) & Top 6 (Gonka AI) · MUBA 2026',
    badgeType: 'gold',
    title: 'PROOFPAY',
    subtitle: 'Delivery-linked B2B Escrow & Settlement Platform',
    description:
      'A decentralized B2B Transaction Truth Engine built on Sui that replaces blind trust with transparent, programmable trade conditions. Buyers fund a non-custodial smart contract, suppliers ship against visible funds, and Gonka-powered AI validates evidence.',
    architecturePoints: [
      'Sui Move Smart Contract: Non-custodial programmable escrow with atomic PTB funding and milestone-based releases.',
      'Gonka Router AI Verification: Multi-model AI validation (consistency, credibility, completeness) of delivery evidence.',
      'Dispute Resolution: AI generates cited, non-binding mediation proposals grounded in legal and commercial sources.',
    ],
    metrics: [
      { label: 'Sui Track', value: '3rd Place' },
      { label: 'Gonka AI', value: 'Top 6' },
      { label: 'Escrow Logic', value: 'Partial Settlement' },
    ],
    tags: ['Sui Move', 'Next.js', 'USDC Stablecoin', 'TypeScript', 'Gonka Router'],
    prototypeUrl: 'https://proofpay-choong-zhuo-lins-projects.vercel.app/',
    deckUrl: '/proofpay_pitch_deck.pdf',
    galleryPhotos: [
      { src: '/images/muba/1789408409350.jpg', alt: 'ProofPay Interface 1', rotation: -1.5 },
      { src: '/images/muba/1789408409711.jpg', alt: 'ProofPay Interface 2', rotation: 2 },
      { src: '/images/muba/1789408409917.jpg', alt: 'ProofPay Interface 3', rotation: -1 },
      { src: '/images/muba/1789408410071.jpg', alt: 'ProofPay Interface 4', rotation: 1.5 },
      { src: '/images/muba/zilian_muba.jpg', alt: 'MUBA Zilian', rotation: -2 },
      { src: '/images/muba/4ppl_muba.jpg', alt: 'MUBA 4 People', rotation: 3 },
      { src: '/images/muba/gonka_4ppl_muba.jpg', alt: 'MUBA Gonka', rotation: -1 },
      { src: '/images/muba/solo_muba.jpg', alt: 'MUBA Solo', rotation: 2 },
    ],
    simulatorId: 'proofpay',
    telemetryType: 'proofpay',
  },
  {
    id: 'bilahujan',
    number: '03',
    badge: '🏅 V HACK 2026 QUALIFIER',
    badgeType: 'cyan',
    title: 'BILAHUJAN',
    subtitle: 'Decentralised Swarm Intelligence for Flood First Response',
    description:
      'An autonomous, edge-ready civic intelligence platform where every civilian acts as a sensor node. Fuses Gemini 2.5 Flash 12-pass image triage with a Gemini 2.0 Flash Command Agent orchestrated via 7 standardised MCP tools to instantly verify floods and dispatch authorities with zero human intervention.',
    architecturePoints: [
      'Autonomous Command Agent (Gemini 2.0 Flash) running a 3-phase Chain-of-Thought loop',
      '12-pass vision pipeline enforcing unbypassable physical anchor guardrails (e.g., Rooftop = Severity 9)',
      'Decentralised MCP Swarm architecture with real-time Firebase syncing and hardcoded offline-first fallbacks',
    ],
    metrics: [
      { label: 'Agent Tool Calls', value: '7 MCP Tools' },
      { label: 'Vision Pipeline', value: '12-Pass (Sub-35s)' },
      { label: 'Swarm Scale', value: '150+ Pre-seeded Towns' },
    ],
    tags: ['React', 'TypeScript', 'Firebase RTDB', 'Gemini 2.5 Flash', 'MCP Architecture', 'Google Maps'],
    simulatorId: 'bilahujan',
    prototypeUrl: 'https://bilahujan-vhack.web.app/',
    githubUrl: 'https://github.com/HowardWoon/BILAHUJAN-VHack2026',
    telemetryType: 'flood',
  },
  {
    id: 'catfish',
    number: '04',
    badge: 'WIA1006 Machine Learning • Ultimate Pipeline',
    badgeType: 'cyan',
    title: 'CATFISH DETECTOR AI',
    subtitle: 'Detecting Deception Through Mathematical Behavioral Intelligence',
    description:
      'An advanced machine learning pipeline that exposes romance scammers not by scanning static images or text, but by analyzing the mathematical fingerprint of 51 behavioral heuristics. Engineered to process 50,000 raw dating profiles through a custom SMOTE-Tomek balanced, 6-model ensemble engine.',
    architecturePoints: [
      'Layer 1 Heuristic Engine: Dynamic Z-Score mathematical baseline evaluating engagement density and match conversion anomalies.',
      'Layer 2 ML Vote: 6 independently-tuned models (GMM, SVM, NN, etc.) fused via a dynamic probability threshold.',
      'Explainable AI (SHAP): Fully auditable decision trees breaking down the exact marginal contribution of each behavioral signal.',
    ],
    metrics: [
      { label: 'Features', value: '51 Signals' },
      { label: 'Class Balance', value: 'SMOTE-Tomek' },
      { label: 'Model Bundle', value: '6-Model (58MB)' },
    ],
    tags: ['Python', 'Scikit-Learn', 'SHAP', 'SMOTE', 'Flask'],
    githubUrl: 'https://github.com/HowardWoon/Catfish-Detector-ML-Models',
    colabUrl: 'https://colab.research.google.com/drive/1AR7Mv0Eg1iGw2IWA1pB_Xt9RZHPHeLCx',
    galleryPhotos: [
      { src: '/images/projects/catfish/dashboard.png', alt: 'Catfish Dashboard', rotation: -1.5 },
      { src: '/images/projects/catfish/scanner.png', alt: 'Profile Scanner', rotation: 3 },
      { src: '/images/projects/catfish/Screenshot_2026-08-25_225954.png', alt: 'Detection Report 1', rotation: 2 },
      { src: '/images/projects/catfish/Screenshot_2026-08-25_230009.png', alt: 'Detection Report 2', rotation: -1 },
      { src: '/images/projects/catfish/Screenshot_2026-08-25_230023.png', alt: 'Detection Report 3', rotation: 1.5 },
      { src: '/images/projects/catfish/system.png', alt: 'System Architecture', rotation: -2 },
    ],
    simulatorId: 'catfish',
    telemetryType: 'catfish',
  },
  {
    id: 'slotify',
    number: '05',
    badge: 'Java Spring Boot • Data Structures',
    badgeType: 'gold',
    title: 'SLOTIFY',
    subtitle: 'Multi-Data Structure Architecture & Algorithmic Router',
    description:
      "A Spring Boot backend architecture demonstrating seven manually implemented data structures working synchronously. Each API lifecycle threads operations through Custom Min-Heaps, AVL BSTs, HashMaps, and Dijkstra's Shortest Path routing to execute with optimal Big O time complexities.",
    architecturePoints: [
      'Memory Linkages: Doubly Linked Lists & LIFO Stacks track temporal allocation history for instant O(1) state rollbacks.',
      'Priority Engine: A zero-dependency Min-Heap orchestrates O(log n) physical parking slot assignments.',
      "Algorithmic Pathing: Graph adjacency lists compute optimal node-to-node pathways via Dijkstra's Algorithm.",
    ],
    metrics: [
      { label: 'Algorithms', value: '7 Custom Structures' },
      { label: 'Routing', value: 'Dijkstra (O((V+E)logV))' },
      { label: 'Data Cache', value: 'AVL BST & HashMap' },
    ],
    tags: ['Java 21', 'Spring Boot', 'Data Structures', 'Dijkstra', 'Min-Heap', 'AVL BST'],
    githubUrl: 'https://github.com/HowardWoon/Slotify',
    galleryPhotos: [
      { src: '/images/projects/slotify/01.png', alt: 'Slotify Interface', rotation: -4 },
      { src: '/images/projects/slotify/02.png', alt: 'Slotify Algorithm', rotation: 2 },
      { src: '/images/projects/slotify/03.png', alt: 'Slotify Diagram', rotation: -2 },
      { src: '/images/projects/slotify/04.png', alt: 'Slotify Flow', rotation: 4 },
      { src: '/images/projects/slotify/05.png', alt: 'Slotify Architecture', rotation: -1 },
    ],
    simulatorId: 'slotify',
    telemetryType: 'slotify',
  },
  {
    id: 'sensor-x-sensei',
    number: '06',
    badge: '⚡ UM Technothon 2026 Finalist · IoT Energy Grid',
    badgeType: 'emerald',
    title: 'Sensor X Sensei',
    subtitle: 'Automated Energy Management & Micro-Grid Telemetry',
    description:
      'An IoT-mediated building automation system designed for university lecture halls. Integrates dual-sensor fusion (PIR + NFC) with automated HVAC/lighting relays and live carbon emission telemetry dashboards.',
    architecturePoints: [
      'Low-power ESP32 firmware communicating via lightweight MQTT brokers',
      'Next.js 15 telemetry dashboard streaming real-time kilowatt loads',
      'Automated load-shedding algorithms cutting idle energy consumption by -60.8%',
    ],
    metrics: [
      { label: 'Energy Reduction', value: '38.2% Idle Saved' },
      { label: 'Hardware Stack', value: 'ESP32 + PIR/NFC' },
      { label: 'Protocol', value: 'MQTT / WebSockets' },
    ],
    tags: ['ESP32', 'C++', 'Next.js 15', 'MQTT', 'PostgreSQL', 'Tailwind CSS'],
    simulatorId: 'sensor-x',
    githubUrl: 'https://github.com/HowardWoon/Sensor-X-Sensei---UM-Technothon-2026',
    telemetryType: 'energy',
  },
];

const SIMULATOR_ROUTE: Partial<Record<ProjectData['telemetryType'], 'agentic' | 'flood' | 'energy'>> = {
  agentic: 'agentic',
  flood: 'flood',
  energy: 'energy',
};

export default function StackedProjects() {
  return (
    <section
      id="projects"
      className="relative w-full bg-paper-cream bg-dots text-ink py-24 sm:py-32 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-x-clip border-t-3 border-ink"
    >
      <div className="relative max-w-7xl mx-auto space-y-16 sm:space-y-20">
        {/* Section Header */}
        <div className="space-y-7">
          <div className="nb-kicker">
            <Layers className="w-4 h-4" strokeWidth={2.5} />
            <span>PROJECTS // PRODUCTION & ARCHITECTURE</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="nb-title text-[clamp(1.55rem,8.2vw,2.1rem)] sm:text-5xl lg:text-6xl max-w-3xl leading-[1.02]">
              SCALABLE SYSTEMS & AUTONOMOUS ARCHITECTURES.
            </h2>
            <p className="text-ink-soft text-sm sm:text-base font-mono font-semibold max-w-md bg-white border-3 border-ink rounded-2xl p-4 shadow-brutal-sm rotate-1">
              Scroll through the stack to deconstruct high-throughput backends, deterministic multi-agent LLM pipelines,
              and hardware-integrated IoT networks built from 0 to 1.
            </p>
          </div>
        </div>

        {/* Project Cards */}
        <div className="space-y-12 lg:space-y-20">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

const accent = {
  gold: { fill: 'bg-pop-yellow', soft: 'bg-[#FFF3C4]' },
  cyan: { fill: 'bg-pop-cyan', soft: 'bg-[#D9FBFF]' },
  emerald: { fill: 'bg-pop-mint', soft: 'bg-[#DCFAEC]' },
} as const;

// GitHub links that are still placeholders ("https://github.com") are hidden instead of shipped as dead links
const isRealRepo = (url?: string) => !!url && /github\.com\/[^/]+\/[^/]+/.test(url);

function ProjectCard({ project }: { project: ProjectData }) {
  const a = accent[project.badgeType];
  const isGallery =
    project.telemetryType === 'agentic' ||
    project.telemetryType === 'catfish' ||
    project.telemetryType === 'slotify' ||
    project.telemetryType === 'proofpay';

  return (
    <div className="w-full group">
      <TiltCard maxTilt={2.5}>
        <Reveal
          delay={0.1}
          y={40}
          transition={{ duration: 0.6 }}
          className="relative w-full rounded-[32px] border-3 border-ink bg-white shadow-brutal-lg transition-shadow duration-300 group-hover:shadow-brutal-xl overflow-hidden"
        >
          {/* Colour-block header strip (Bauhaus band) */}
          <div
            className={`flex items-center justify-between gap-3 px-4 xs:px-6 sm:px-10 py-3 border-b-3 border-ink ${a.fill}`}
          >
            <div className="flex items-center gap-2" aria-hidden>
              <span className="w-3.5 h-3.5 rounded-full bg-pop-red border-2 border-ink" />
              <span className="w-3.5 h-3.5 bg-pop-blue border-2 border-ink" />
              <span className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-ink" />
            </div>
            <span className="font-mono text-xs font-extrabold tracking-[0.12em] text-ink">
              {project.number} / {String(projects.length).padStart(2, '0')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start p-4 xs:p-6 sm:p-10 lg:p-12">
            {/* Left Column: Narrative, Architecture & Benchmarks (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Top Bar: Project Index + Award Badge */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="nb-num">{project.number}</span>
                <div
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-[0.04em] border-2 border-ink text-ink shadow-brutal-xs ${a.soft}`}
                >
                  <Award className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  <span>{project.badge}</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <h3 className="font-display text-[clamp(1.6rem,8.5vw,2.25rem)] sm:text-5xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink flex items-center gap-3">
                  {project.title}
                  <ArrowUpRight
                    className="w-7 h-7 text-pop-blue opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    strokeWidth={3}
                  />
                </h3>
                <p className="text-sm sm:text-base font-mono text-pop-blue font-bold tracking-[0.01em]">
                  {project.subtitle}
                </p>
              </div>

              {/* Narrative Description */}
              <p className="text-ink-soft text-base leading-relaxed font-sans font-medium">{project.description}</p>

              {/* Key Architectural Highlights */}
              <div className="space-y-3 nb-inset p-4 sm:p-5">
                <span className="text-xs font-mono font-extrabold text-ink uppercase tracking-[0.12em] block mb-1">
                  KEY ARCHITECTURAL HIGHLIGHTS:
                </span>
                {project.architecturePoints.map((point, pIdx) => (
                  <div
                    key={pIdx}
                    className="flex items-start gap-2.5 text-sm font-sans font-medium text-ink-soft leading-snug"
                  >
                    <CheckCircle2 className="w-5 h-5 text-ink fill-pop-mint shrink-0" strokeWidth={2.25} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* Live Benchmarks & Metric Chips (bento) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {project.metrics.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className={`rounded-2xl p-3.5 border-3 border-ink ${mIdx === 0 ? a.fill : 'bg-white'} shadow-brutal-sm`}
                  >
                    <div className="text-[0.7rem] font-mono font-bold text-ink/70 uppercase tracking-[0.06em]">
                      {m.label}
                    </div>
                    <div className="font-display text-lg font-extrabold text-ink mt-1 leading-tight break-words">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {project.tags.map((tag) => (
                  <span key={tag} className="nb-chip hover:bg-pop-yellow transition-colors">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                {project.prototypeUrl && (
                  <a
                    href={project.prototypeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nb-btn nb-btn-yellow px-5 py-3"
                  >
                    <Terminal className="w-4 h-4" strokeWidth={2.75} />
                    LAUNCH LIVE PROTOTYPE
                  </a>
                )}
                {SIMULATOR_ROUTE[project.telemetryType] && (
                  <Link
                    href={`/simulators/${SIMULATOR_ROUTE[project.telemetryType]}`}
                    className="nb-btn nb-btn-white px-5 py-3"
                  >
                    <Terminal className="w-4 h-4" strokeWidth={2.75} />
                    RUN SIMULATOR
                  </Link>
                )}

                {project.colabUrl && (
                  <a
                    href={project.colabUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nb-btn bg-pop-orange px-5 py-3"
                  >
                    <Activity className="w-4 h-4" strokeWidth={2.75} />
                    OPEN IN GOOGLE COLAB
                  </a>
                )}

                {project.orchestratorUrl && (
                  <a
                    href={project.orchestratorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nb-btn nb-btn-lilac px-5 py-3"
                  >
                    <Network className="w-4 h-4" strokeWidth={2.75} />
                    VIEW MASTER ORCHESTRATOR
                  </a>
                )}

                {project.deckUrl && (
                  <a
                    href={project.deckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nb-btn nb-btn-white px-5 py-3"
                  >
                    <FileText className="w-4 h-4" strokeWidth={2.75} />
                    <span>PITCH DECK</span>
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.75} />
                  </a>
                )}

                {isRealRepo(project.githubUrl) && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nb-btn nb-btn-ink px-5 py-3"
                  >
                    <Github className="w-4 h-4" strokeWidth={2.5} />
                    <span>GITHUB</span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Visual Architecture / Gallery (5 Cols) — a physical "desk" for the polaroids */}
            <div className="lg:col-span-5 w-full rounded-[26px] border-3 border-ink bg-paper-deep bg-dots p-5 sm:p-6 space-y-4 flex flex-col shadow-[inset_0_3px_0_rgba(0,0,0,0.06)]">
              {/* Visualizer Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b-2 border-dashed border-ink pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-ink">
                  {project.telemetryType === 'agentic' ? (
                    <Sparkles className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
                  ) : (
                    <Activity className="w-4 h-4 text-ink animate-pulse" strokeWidth={2.5} />
                  )}
                  <span className="uppercase tracking-[0.1em]">
                    {isGallery ? 'PROJECT GALLERY' : 'LIVE TELEMETRY WINDOW'}
                  </span>
                </div>
                <span className={`nb-tag ${a.fill}`}>{isGallery ? 'INTERACTIVE' : 'ACTIVE PIPELINE'}</span>
              </div>

              {/* Conditional Graphic Visualizers */}
              {project.telemetryType === 'agentic' && (
                <div className="flex-1 w-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[440px] py-4">
                  <InteractivePhotoStack />
                </div>
              )}

              {(project.telemetryType === 'catfish' ||
                project.telemetryType === 'slotify' ||
                project.telemetryType === 'proofpay') && (
                <div className="flex-1 w-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[440px] py-4">
                  <InteractivePhotoStack customPhotos={project.galleryPhotos} />
                </div>
              )}

              {project.telemetryType === 'flood' && (
                <div className="space-y-4 py-2">
                  <div className="text-xs font-mono font-bold text-ink-muted">
                    {'// Dijkstra Evacuation Path Engine'}
                  </div>

                  {/* Simulated Graph Routing */}
                  <div className="bg-white border-3 border-ink rounded-2xl p-4 space-y-3 shadow-brutal-sm">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-mono font-semibold">
                      <span className="text-ink-muted">Target Hazard Zone:</span>
                      <span className="text-pop-redInk font-extrabold">Inundation Level 3</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-mono font-semibold">
                      <span className="text-ink-muted">Calculated Safe Corridor:</span>
                      <span className="text-[#0F7A4A] font-extrabold">Path Node #104 ➔ #289</span>
                    </div>
                    <div className="w-full bg-paper-deep h-3 rounded-full overflow-hidden border-2 border-ink">
                      <div className="bg-pop-yellow h-full w-4/5 border-r-2 border-ink animate-pulse" />
                    </div>
                  </div>

                  <div className="terminal space-y-1">
                    <div className="text-pop-yellow">&gt;_ graph.nodes_evaluated: 1,024</div>
                    <div>&gt;_ priority_queue: &quot;MinHeap_Balanced&quot;</div>
                    <div>&gt;_ route_dispatch_time: 42.8ms</div>
                  </div>
                </div>
              )}

              {project.telemetryType === 'energy' && (
                <div className="space-y-4 py-2">
                  <div className="text-xs font-mono font-bold text-ink-muted">
                    {'// Micro-Grid Power & Occupancy Matrix'}
                  </div>

                  {/* IoT Grid Dashboard */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-white border-3 border-ink rounded-2xl shadow-brutal-sm">
                      <div className="text-xs font-mono font-bold text-ink-muted">Current Load</div>
                      <div className="font-display text-2xl font-extrabold text-ink mt-1 whitespace-nowrap">
                        1.84 kW
                      </div>
                    </div>
                    <div className="p-3.5 bg-pop-mint border-3 border-ink rounded-2xl shadow-brutal-sm">
                      <div className="text-xs font-mono font-bold text-ink/70">Idle Savings</div>
                      <div className="font-display text-2xl font-extrabold text-ink mt-1 whitespace-nowrap">-60.8%</div>
                    </div>
                  </div>

                  <div className="terminal space-y-1">
                    <div className="text-pop-mint">&gt;_ sensor_fusion: &quot;PIR_ACTIVE + NFC_PASS&quot;</div>
                    <div>&gt;_ protocol_broker: &quot;MQTT_TLS_v1.3&quot;</div>
                    <div>&gt;_ relay_state: &quot;OPTIMIZED_AUTO_SHED&quot;</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </TiltCard>
    </div>
  );
}
