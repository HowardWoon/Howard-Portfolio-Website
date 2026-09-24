'use client';

import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Server, Cpu, GitBranch, ShieldCheck, Activity, Sparkles, ArrowUpRight, Layers, Code2 } from 'lucide-react';
import { SplitWords } from './fx/split-words';

const architecturePillars = [
  {
    id: 'backend',
    category: '01 // DISTRIBUTED SYSTEMS',
    title: 'High-Throughput Backends',
    icon: Server,
    color: 'amber',
    accentHex: '#F59E0B',
    headline: 'Low-Latency Java 21 & Spring Boot Architecture',
    description:
      'Architecting concurrent, fault-tolerant backend services utilizing thread pooling and optimized REST/gRPC endpoints to handle high-throughput workloads at scale.',
    metrics: [
      { label: 'Core Runtime', value: 'Java 21 LTS / Node.js' },
      { label: 'Architecture', value: 'Spring Boot / Microservices / Supabase' },
      { label: 'Throughput', value: 'Sub-50ms API Latency' },
    ],
    telemetrySnippet: 'ThreadPool[Active: 64, Idle: 16] · EventLoop: OK',
  },
  {
    id: 'agents',
    category: '02 // AGENTIC AI',
    title: 'Autonomous Multi-Agent Pipelines',
    icon: Cpu,
    color: 'cyan',
    accentHex: '#00E5FF',
    headline: 'Deterministic 5-Operator Agentic Orchestration',
    description:
      'Engineering state-machine AI workflows (LangGraph, CrewAI, local Ollama) that autonomously research, synthesize, and execute end-to-end tasks with verified guardrails.',
    metrics: [
      { label: 'Track Record', value: '2nd Place @ Autopilot Asia Hackathon (ZeroLag)' },
      { label: 'Orchestration', value: 'LangGraph + CrewAI' },
      { label: 'Guardrails', value: 'Deterministic Tool Routing' },
    ],
    telemetrySnippet: 'Agent Pipeline: [Triage -> Planner -> Execution -> QA Review]',
  },
  {
    id: 'algorithms',
    category: '03 // DATA STRUCTURES',
    title: 'Algorithmic Rigor & Graphs',
    icon: GitBranch,
    color: 'purple',
    accentHex: '#A855F7',
    headline: 'Graph Traversal, Min-Heaps & Sub-MS Optimization',
    description:
      "Leveraging Dijkstra's shortest path, priority queues, and dynamic programming for real-time routing engines (e.g. BILAHUJAN flood response app at V Hack 2026).",
    metrics: [
      { label: 'Complexity Focus', value: 'O(E + V log V) Routing' },
      { label: 'PRACTICAL APPLICATION', value: 'Real-Time Pathfinding' },
      { label: 'Optimization', value: 'Spatial Graph Heuristics' },
    ],
    telemetrySnippet: '[Pathfinding] Dijkstra executed: Sub-1.2ms latency',
  },
  {
    id: 'governance',
    category: '04 // OPERATIONS & GOVERNANCE',
    title: 'Fiscal Governance & Security',
    icon: ShieldCheck,
    color: 'emerald',
    accentHex: '#10B981',
    headline: 'Corporate Financial Leadership & System Auditing',
    description:
      'Bridging software engineering with corporate financial stewardship, managing budgets, and executing system audits as PEKOM Finance Lead and Kraiburg TPE Finance Intern.',
    metrics: [
      { label: 'Leadership', value: 'Finance Lead 26/27 @ PEKOM' },
      { label: 'Oversight', value: '100% Audit Compliance' },
      { label: 'Corporate Exp.', value: 'Kraiburg TPE Finance' },
    ],
    telemetrySnippet: 'Audit Process: Zero Discrepancies | Ledger Verified',
  },
];

type SkillStatus = 'production' | 'hackathon' | 'rnd';

const techStackGroups: { category: string; skills: { name: string; status: SkillStatus }[] }[] = [
  {
    category: 'CORE LANGUAGES',
    skills: [
      { name: 'Java 21', status: 'production' },
      { name: 'Python 3.12', status: 'production' },
      { name: 'TypeScript', status: 'production' },
      { name: 'SQL (PostgreSQL)', status: 'production' },
      { name: 'C++', status: 'hackathon' },
    ],
  },
  {
    category: 'BACKEND & APIs',
    skills: [
      { name: 'Spring Boot 3', status: 'production' },
      { name: 'FastAPI', status: 'hackathon' },
      { name: 'Next.js 15', status: 'production' },
      { name: 'Node.js', status: 'production' },
      { name: 'Docker', status: 'production' },
    ],
  },
  {
    category: 'DATA & INFRASTRUCTURE',
    skills: [
      { name: 'PostgreSQL', status: 'production' },
      { name: 'Supabase', status: 'hackathon' },
      { name: 'Git / Actions', status: 'production' },
      { name: 'Vercel', status: 'production' },
      { name: 'REST / gRPC APIs', status: 'production' },
    ],
  },
  {
    category: 'AI & AGENTIC SYSTEMS',
    skills: [
      { name: 'LangChain', status: 'rnd' },
      { name: 'LangGraph', status: 'rnd' },
      { name: 'CrewAI', status: 'hackathon' },
      { name: 'Ollama (Local LLMs)', status: 'hackathon' },
      { name: 'Prompt Engineering', status: 'production' },
    ],
  },
  {
    category: 'UI & GRAPHICS',
    skills: [
      { name: 'React', status: 'production' },
      { name: 'Tailwind CSS', status: 'production' },
      { name: 'WebGL', status: 'rnd' },
      { name: 'Framer Motion', status: 'production' },
    ],
  },
  {
    category: 'IOT & HARDWARE',
    skills: [
      { name: 'ESP32', status: 'hackathon' },
      { name: 'Firmware (C/C++)', status: 'hackathon' },
      { name: 'Sensor Networks', status: 'hackathon' },
    ],
  },
];

function PillarCard({
  pillar,
  activeCard,
  setActiveCard,
  colorMap,
  delay,
}: {
  pillar: (typeof architecturePillars)[0];
  activeCard: string;
  setActiveCard: (id: string) => void;
  colorMap: Record<string, { fill: string; soft: string; dot: string }>;
  delay: number;
}) {
  const Icon = pillar.icon;
  const isActive = activeCard === pillar.id;
  const c = colorMap[pillar.color as keyof typeof colorMap];

  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onClick={() => setActiveCard(pillar.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveCard(pillar.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      className={`relative group cursor-pointer rounded-[26px] p-4 xs:p-6 sm:p-8 border-3 border-ink flex flex-col justify-between gap-6 transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-pop-blue ${
        isActive
          ? `${c.soft} shadow-brutal-lg -translate-x-1 -translate-y-1`
          : 'bg-white shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className={`nb-tag ${isActive ? c.fill : 'bg-white'}`}>{pillar.category}</span>
        <div
          className={`w-12 h-12 rounded-2xl grid place-items-center border-3 border-ink shadow-clay transition-transform duration-300 group-hover:rotate-6 ${c.fill}`}
        >
          <Icon className="w-6 h-6 text-ink" strokeWidth={2.5} />
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-display text-[clamp(1.25rem,6.4vw,1.5rem)] sm:text-[1.7rem] font-extrabold uppercase tracking-[-0.02em] leading-tight text-ink flex items-center gap-2">
          {pillar.title}
          <ArrowUpRight
            className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-pop-blue"
            strokeWidth={3}
          />
        </h3>
        <p className="text-sm font-mono font-bold text-pop-blue">{pillar.headline}</p>
        <p className="text-[0.95rem] text-ink-soft leading-relaxed font-sans font-medium pt-1">{pillar.description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t-2 border-dashed border-ink">
        {pillar.metrics.map((metric, mIdx) => (
          <div key={mIdx} className="bg-white rounded-xl p-3 border-2 border-ink">
            <div className="text-[0.7rem] font-mono font-bold text-ink-muted uppercase tracking-[0.06em] leading-tight">
              {metric.label}
            </div>
            <div className="text-sm font-sans font-extrabold text-ink mt-1.5 leading-snug break-words">
              {metric.value}
            </div>
          </div>
        ))}
      </div>
      <div className="terminal flex items-start xs:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-4 h-4 text-pop-mint animate-pulse shrink-0" strokeWidth={2.5} />
          <span className="truncate">{pillar.telemetrySnippet}</span>
        </div>
        {/* Always rendered so every card keeps the same height; only the active card shows it. */}
        <span
          aria-hidden={!isActive}
          className={`text-[0.7rem] font-extrabold shrink-0 px-2 py-0.5 rounded border-2 border-ink text-ink ${c.fill} ${isActive ? '' : 'invisible'}`}
        >
          ACTIVE
        </span>
      </div>
    </m.div>
  );
}

export default function AboutSection() {
  const [activeCard, setActiveCard] = useState<string>('backend');

  // Accent → Neo-brutalist colour-block mapping (fills always carry black ink text → AAA contrast)
  const colorMap = {
    amber: { fill: 'bg-pop-yellow', soft: 'bg-[#FFF3C4]', dot: 'bg-pop-yellow' },
    cyan: { fill: 'bg-pop-cyan', soft: 'bg-[#D9FBFF]', dot: 'bg-pop-cyan' },
    purple: { fill: 'bg-pop-lilac', soft: 'bg-[#EEE9FF]', dot: 'bg-pop-lilac' },
    emerald: { fill: 'bg-pop-mint', soft: 'bg-[#DCFAEC]', dot: 'bg-pop-mint' },
  };

  return (
    <section
      id="about"
      className="relative w-full bg-paper-cream bg-dots text-ink py-24 sm:py-28 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-hidden border-t-3 border-ink"
    >
      {/* Bauhaus accents */}
      <div
        aria-hidden
        className="fx-drift pointer-events-none absolute -right-20 top-24 w-64 h-64 rounded-full border-3 border-ink bg-pop-blue hidden lg:block"
      />
      <div
        aria-hidden
        className="fx-drift-rev pointer-events-none absolute right-40 top-72 w-16 h-16 border-3 border-ink bg-pop-red rotate-45 hidden lg:block"
      />

      <div className="relative max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="space-y-7">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="nb-kicker"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span>ABOUT // SYSTEMS ARCHITECTURE & VISION</span>
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="nb-title text-[clamp(1.55rem,8.2vw,2.1rem)] sm:text-5xl lg:text-6xl max-w-5xl leading-[1.02]"
          >
            <SplitWords text="I ARCHITECT RESILIENT BACKENDS AND AUTONOMOUS AI PIPELINES, TURNING COMPLEX IDEAS INTO PRODUCTION-READY SYSTEMS." />
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-ink-soft text-lg sm:text-xl max-w-3xl leading-relaxed font-sans font-medium"
          >
            Software Engineering undergraduate at <strong className="text-ink font-extrabold">Universiti Malaya</strong>{' '}
            (
            <span className="inline-block bg-pop-yellow border-2 border-ink rounded-md px-1.5 text-ink font-mono font-extrabold text-[0.95em] leading-snug">
              4.00 CGPA
            </span>
            ). Bridging low-latency algorithmic backend performance and AI orchestration with strong technical
            leadership and fiscal governance to deliver scalable, cost-effective solutions.
          </m.p>
        </div>

        {/* Core Architecture Bento Grid (4 Pillars) — True Masonry Layout */}
        <div className="flex flex-col lg:hidden gap-7">
          {architecturePillars.map((pillar, idx) => (
            <PillarCard
              key={pillar.id}
              pillar={pillar}

              activeCard={activeCard}
              setActiveCard={setActiveCard}
              colorMap={colorMap}
              delay={idx * 0.1}
            />
          ))}
        </div>
        <div className="hidden lg:grid grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8">
            {architecturePillars
              .filter((_, i) => i % 2 === 0)
              .map((pillar, idx) => (
                <PillarCard
                  key={pillar.id}
                  pillar={pillar}

                  activeCard={activeCard}
                  setActiveCard={setActiveCard}
                  colorMap={colorMap}
                  delay={idx * 2 * 0.1}
                />
              ))}
          </div>
          <div className="flex flex-col gap-8 mt-10">
            {architecturePillars
              .filter((_, i) => i % 2 === 1)
              .map((pillar, idx) => (
                <PillarCard
                  key={pillar.id}
                  pillar={pillar}

                  activeCard={activeCard}
                  setActiveCard={setActiveCard}
                  colorMap={colorMap}
                  delay={(idx * 2 + 1) * 0.1}
                />
              ))}
          </div>
        </div>

        {/* Categorized Technical Stack Matrix */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="nb-card-lg p-4 xs:p-6 sm:p-8 lg:p-10 space-y-8 lg:mt-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b-3 border-ink pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-pop-blue tracking-[0.12em] uppercase">
                <Code2 className="w-4 h-4" strokeWidth={2.75} />
                <span>TECHNICAL TOOLING MATRIX</span>
              </div>
              <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-ink uppercase tracking-[-0.02em]">
                Verified Production & Research Stack
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-ink">
              <span className="nb-chip">
                <span className="nb-dot bg-pop-mint" /> Production Tested
              </span>
              <span className="nb-chip">
                <span className="nb-dot bg-pop-yellow" /> Hackathon Proven
              </span>
              <span className="nb-chip">
                <span className="nb-dot bg-pop-blue" /> Active R&D
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-9 gap-x-6">
            {techStackGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-3.5">
                <h5 className="text-xs font-mono font-extrabold text-ink tracking-[0.1em] uppercase flex items-center gap-2">
                  <span className="grid place-items-center w-6 h-6 rounded-md bg-pop-yellow border-2 border-ink">
                    <Layers className="w-3.5 h-3.5" strokeWidth={2.75} />
                  </span>
                  {group.category}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => {
                    const dotColor =
                      skill.status === 'production'
                        ? 'bg-pop-mint'
                        : skill.status === 'hackathon'
                          ? 'bg-pop-yellow'
                          : 'bg-pop-blue';
                    return (
                      <span
                        key={skill.name}
                        className="nb-chip transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-brutal-xs"
                      >
                        <span className={`nb-dot ${dotColor}`} />
                        {skill.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}
