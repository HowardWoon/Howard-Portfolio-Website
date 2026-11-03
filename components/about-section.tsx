'use client';

import React, { useEffect, useRef, useState } from 'react';
import { m, LayoutGroup } from 'framer-motion';
import { Server, Cpu, GitBranch, ShieldCheck, Activity, Sparkles, ArrowUpRight, Layers, Code2 } from 'lucide-react';
import { SplitWords } from './fx/split-words';
import { FX, SPRING_SOFT } from '@/lib/fx';
import { startTrail, useInteractionSelect } from '@/lib/interaction-store';
import { projectsWithSkill, skillKey } from '@/lib/skills';
import { ScrollInk } from './fx/scroll-ink';
import { flapTo } from '@/lib/split-flap';
import { SIGNAL, type Signal } from '@/lib/signal';

// R83 (owner: "update all the info and content to match with my portfolio"): every line below is taken from the
// Projects, Experience and Honours sections of this page (no invented latency, audit or thread-pool figures).
// `signal` follows the SIGNAL KEY (lib/signal.ts): lilac = AI, pink = leadership; a pillar with no category is white.
const architecturePillars: {
  id: string;
  category: string;
  title: string;
  icon: typeof Server;
  signal?: Signal;
  headline: string;
  description: string;
  metrics: { label: string; value: string }[];
  telemetrySnippet: string;
}[] = [
  {
    id: 'fullstack',
    category: '01 // FULL-STACK PRODUCTS',
    title: 'Full-Stack Products',
    icon: Server,
    headline: 'Java 21 · Spring Boot 3 · FastAPI · Next.js 15',
    description:
      'Typed Next.js and React front ends over Spring Boot and FastAPI services, with PostgreSQL and Firebase behind them. Slotify threads every API call through seven hand-built data structures; Sensor X Sensei feeds PIR + NFC sensor fusion into live carbon telemetry dashboards.',
    metrics: [
      { label: 'Backend', value: 'Spring Boot 3 / FastAPI' },
      { label: 'Front end', value: 'Next.js 15 / React / TypeScript' },
      { label: 'Data', value: 'PostgreSQL / Firebase RTDB' },
    ],
    telemetrySnippet: 'slotify> Min-Heap · AVL BST · HashMap · Dijkstra, one API lifecycle',
  },
  {
    id: 'agents',
    category: '02 // AGENTIC AI',
    title: 'Governed AI Agents',
    icon: Cpu,
    signal: 'ai',
    headline: 'Halt states, human-in-the-loop and MCP tools',
    description:
      'ZeroLag is a bi-modal agent workforce that resolves B2B buying groups and halts itself before a PDPA / GDPR violation: 2nd place at Supervity AutoPilot Asia 2026. In BILAHUJAN a Gemini 2.0 Flash command agent verifies floods through 7 standardised MCP tools.',
    metrics: [
      { label: 'Track Record', value: '2nd Place @ Supervity AutoPilot Asia 2026 (ZeroLag)' },
      { label: 'Orchestration', value: 'LangGraph + MCP' },
      { label: 'Models', value: 'Gemini 2.5 Flash / 2.0 Flash' },
    ],
    telemetrySnippet: 'zerolag> deterministic halt states · zero pipeline pollution',
  },
  {
    id: 'data',
    category: '03 // DATA, ML & ALGORITHMS',
    title: 'Data, ML & Algorithms',
    icon: GitBranch,
    headline: 'Scikit-Learn · SHAP · SciPy · Dijkstra',
    description:
      'Monsun Bridge turns the monsoon window METMalaysia already publishes into a plan a district can budget: Top 5 and a consolation prize at the DOSM Datathon 2026. Catfish Detector AI reads 51 behavioural heuristics across 50,000 profiles with a SMOTE-Tomek balanced, 6-model ensemble.',
    metrics: [
      { label: 'Track Record', value: 'Top 5 Finalist @ DOSM Datathon 2026 (Monsun Bridge)' },
      { label: 'Machine Learning', value: 'Scikit-Learn / SHAP / SMOTE' },
      { label: 'Exposure Model', value: '13,703 workers · 4 districts' },
    ],
    telemetrySnippet: 'monsun> 13,703 tourism-linked workers · 52,655 worker-months exposed',
  },
  {
    id: 'finance',
    category: '04 // FINANCE & LEADERSHIP',
    title: 'Finance & Leadership',
    icon: ShieldCheck,
    signal: 'leadership',
    headline: 'Treasurer at PEKOM · finance at KRAIBURG TPE',
    description:
      'Finance Lead and Executive Treasurer of PEKOM, the Universiti Malaya computing society; Assistant Finance Executive & Intern at KRAIBURG TPE Technology since Nov 2025; before that Assistant Head of Subject (Computer Science) at the KMNS PAL Leader Club. ProofPay puts the same discipline into code.',
    metrics: [
      { label: 'Leadership', value: 'Finance Lead & Executive Treasurer @ PEKOM' },
      { label: 'Industry', value: 'Assistant Finance Executive @ KRAIBURG TPE' },
      { label: 'Track Record', value: '2nd Runner Up @ MUBA Blockchain Hackathon 2026 (ProofPay)' },
    ],
    telemetrySnippet: 'proofpay> buyer funds escrow · supplier ships · evidence checked · release',
  },
];

// R83 Build Sheet: four facts from this page, each a link to the section that proves it. tests/r83 counts them again
// from the Projects, Honours and Experience sections, so a value cannot drift from the page.
export const LEDGER: { value: string; from: string; label: string; note: string; signal?: Signal; href: string }[] = [
  {
    value: '4.00',
    from: '0.00',
    label: 'CGPA',
    note: "Dean's Honours List, Universiti Malaya",
    signal: 'academic',
    href: '#honors',
  },
  { value: '07', from: '00', label: 'Projects built', note: 'Agents, escrow, ML, IoT', href: '#projects' },
  {
    value: '04',
    from: '00',
    label: 'Podiums in 2026',
    note: 'Supervity, MUBA, DOSM, UM Game Jam',
    signal: 'podium',
    href: '#honors',
  },
  {
    value: '03',
    from: '00',
    label: 'Finance & lead roles',
    note: 'KRAIBURG TPE, PEKOM, KMNS PAL',
    signal: 'leadership',
    href: '#experience',
  },
];

/**
 * R83 Build Sheet: the four facts as split-flap counters (lib/split-flap.ts). The server renders the final values; the
 * board flips up from zero ONCE, when it is on screen and the page has stopped scrolling (a flip lays out, lesson
 * 30-E21). Reduced motion / Calm Mode: the values simply stand.
 */
function BuildSheet() {
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const still =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'calm';
    const boards = Array.from(list.querySelectorAll<HTMLElement>('[data-flap]'));
    boards.forEach((el, i) => flapTo(el, still ? LEDGER[i].value : LEDGER[i].from, false));
    if (still) return;
    const timers: number[] = [];
    let idle = 0;
    let done = false;
    const wait = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(play, 180);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        window.addEventListener('scroll', wait, { passive: true });
        wait();
      },
      { threshold: 0.5 },
    );
    function play() {
      if (done) return;
      // the page stopped somewhere else (a fling past About): the flip waits for the board's next visit, so it never
      // plays off screen and lands in the reader's next scroll (r17 P0-01 on CI)
      const r = list!.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= window.innerHeight) {
        window.removeEventListener('scroll', wait);
        return;
      }
      done = true;
      io.disconnect();
      window.removeEventListener('scroll', wait);
      boards.forEach((el, i) => timers.push(window.setTimeout(() => flapTo(el, LEDGER[i].value), 120 + i * 140)));
    }
    io.observe(list);
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', wait);
      window.clearTimeout(idle);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <ul ref={listRef} aria-label="Build sheet" className="ab-sheet fx-rise flex flex-wrap gap-4 sm:gap-5">
      {LEDGER.map((x) => {
        const sig = x.signal ? SIGNAL[x.signal] : null;
        return (
          <li key={x.label} className="flex-[1_1_220px]">
            <a
              href={x.href}
              className="ab-tile nb-press group flex h-full flex-col overflow-hidden rounded-[22px] border-3 border-ink bg-white text-ink shadow-brutal focus-visible:outline focus-visible:outline-4 focus-visible:outline-pop-blue"
            >
              <span
                className={`flex items-center justify-between gap-2 border-b-3 border-ink px-4 py-2 font-mono text-xs font-extrabold uppercase tracking-[0.12em] ${sig ? sig.fill : 'bg-white'}`}
              >
                {x.label}
                <ArrowUpRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={3}
                />
              </span>
              <span className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
                <span data-flap className="ab-flap font-mono font-extrabold">
                  {x.value}
                </span>
                <span className="font-mono text-xs font-bold leading-snug text-ink-soft">{x.note}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

type SkillStatus = 'production' | 'hackathon' | 'rnd';

// Same three legend labels and dot colours as before - now buttons that highlight matching skills (FX-36).
const STATUS_KEYS: { status: SkillStatus; label: string; dot: string }[] = [
  { status: 'production', label: 'Production Tested', dot: 'bg-pop-mint' },
  { status: 'hackathon', label: 'Hackathon Proven', dot: 'bg-pop-yellow' },
  { status: 'rnd', label: 'Active R&D', dot: 'bg-pop-blue' },
];

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
      { name: 'Firebase', status: 'hackathon' },
      { name: 'Power BI', status: 'hackathon' },
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
      { name: 'Gemini API', status: 'hackathon' },
      { name: 'MCP', status: 'hackathon' },
      { name: 'Scikit-Learn', status: 'hackathon' },
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
      { name: 'MQTT', status: 'hackathon' },
      { name: 'Sui Move', status: 'hackathon' },
    ],
  },
];

function PillarCard({
  pillar,
  activeCard,
  setActiveCard,
}: {
  pillar: (typeof architecturePillars)[0];
  activeCard: string;
  setActiveCard: (id: string) => void;
}) {
  const Icon = pillar.icon;
  const isActive = activeCard === pillar.id;
  // a pillar without a category stays white, its active state paper (the SIGNAL KEY: no colour without a meaning)
  const c = pillar.signal ? SIGNAL[pillar.signal] : { fill: 'bg-white', soft: 'bg-paper-cream' };

  return (
    <m.div
      layout={FX.bentoReflow ? 'position' : false}
      transition={{ layout: SPRING_SOFT }}
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
      className={`fx-rise relative group cursor-pointer rounded-[26px] p-4 xs:p-6 sm:p-8 border-3 border-ink flex flex-col justify-between gap-6 transition-[translate,box-shadow,background-color] duration-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-pop-blue ${
        isActive
          ? `${c.soft} shadow-brutal-lg [translate:-4px_-4px]`
          : 'bg-white shadow-brutal hover:[translate:0_-4px] hover:shadow-brutal-lg'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className={`nb-tag ${isActive ? c.fill : 'bg-white'}`}>{pillar.category}</span>
        <div
          data-pillar-icon
          className={`w-12 h-12 rounded-2xl grid place-items-center border-3 border-ink shadow-clay transition-transform duration-300 group-hover:rotate-6 ${c.fill}`}
        >
          <Icon className="w-6 h-6 text-ink" strokeWidth={2.5} />
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-display text-[clamp(1.25rem,6.4vw,1.5rem)] sm:text-[1.7rem] font-extrabold uppercase tracking-[-0.02em] leading-tight text-ink flex items-center gap-2">
          {pillar.title}
          {/* R38: the "this card opens" cue was hover-only (opacity 0 on every phone / tablet and for keyboard users):
              now always shown on the active card, on keyboard focus and on touch screens; mouse keeps the hover reveal */}
          <ArrowUpRight
            aria-hidden
            data-pillar-cue
            className={`w-5 h-5 shrink-0 transition-opacity text-pop-blue ${
              isActive
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100'
            }`}
            strokeWidth={3}
          />
        </h3>
        <p className="text-sm font-mono font-bold text-pop-blue">{pillar.headline}</p>
        <p className="text-[0.95rem] text-ink-soft leading-relaxed font-sans font-medium pt-1">{pillar.description}</p>
      </div>
      {/* R65 zoom: a row that wraps, not a 3-column grid. A grid column can be squeezed below its longest word (at
          175 % zoom the tiles were 90 px and "Architecture" broke in two); a flex tile never goes below it, so when
          three no longer fit, the third takes the next row at full width. Where three fit they are equal, as before. */}
      <div
        data-metrics
        className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-5 border-t-2 border-dashed border-ink"
      >
        {pillar.metrics.map((metric, mIdx) => (
          <div key={mIdx} className="sm:flex-1 bg-white rounded-xl p-3 border-2 border-ink">
            <div className="text-xs font-mono font-bold text-ink-muted uppercase tracking-[0.06em] leading-tight">
              {metric.label}
            </div>
            <div className="text-sm font-sans font-extrabold text-ink mt-1.5 leading-snug break-words">
              {metric.value}
            </div>
          </div>
        ))}
      </div>
      <div className="terminal flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-4 h-4 text-pop-mint animate-pulse shrink-0" strokeWidth={2.5} />
          <span data-telemetry className="min-w-0 [overflow-wrap:anywhere]">
            {pillar.telemetrySnippet}
          </span>
        </div>
        {/* Always rendered so every card keeps the same height; only the active card shows it. */}
        <span
          aria-hidden={!isActive}
          className={`text-xs font-extrabold shrink-0 px-2 py-0.5 rounded border-2 border-ink text-ink ${c.fill} ${isActive ? '' : 'invisible'}`}
        >
          ACTIVE
        </span>
      </div>
    </m.div>
  );
}

export default function AboutSection() {
  const [activeCard, setActiveCard] = useState<string>('fullstack');
  // P2-08: the pillars have a phone list and a masonry desktop list. Both are server-rendered (CSS picks one),
  // but after mount only the list for the current breakpoint stays mounted: half the layout-animated cards,
  // in-view observers and re-measures per click. null = not measured yet (SSR / first paint).
  const [isLg, setIsLg] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const set = () => setIsLg(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);
  const [statusFocus, setStatusFocus] = useState<SkillStatus | null>(null);
  // FX-38 Evidence Trail: how many project cards use each skill. Read from the project cards' data attributes
  // after mount (the Projects section is server-rendered below), so the project data stays the single source.
  const [evidence, setEvidence] = useState<Record<string, number>>({});
  const trail = useInteractionSelect((s) => s.trail);
  useEffect(() => {
    if (!FX.evidenceTrail) return;
    const counts: Record<string, number> = {};
    techStackGroups.forEach((g) =>
      g.skills.forEach((sk) => {
        const k = skillKey(sk.name);
        counts[k] = projectsWithSkill(k).length;
      }),
    );
    setEvidence(counts);
  }, []);

  return (
    <section
      id="about"
      className="fx-tide-surface fx-dot-plane fx-sheet relative w-full bg-paper-cream bg-dots text-ink py-24 sm:py-28 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-clip border-t-3 border-ink"
    >
      <div className="relative max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="space-y-7">
          <div className="nb-kicker fx-rise">
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span>ABOUT // FULL STACK DEVELOPER</span>
          </div>

          <h2 className="fx-rise nb-title text-[clamp(1.55rem,8.2vw,2.1rem)] sm:text-5xl lg:text-6xl max-w-5xl leading-[1.02]">
            <SplitWords text="I BUILD FULL-STACK SYSTEMS AND GOVERNED AI AGENTS, THEN SHIP THEM ON A HACKATHON CLOCK." />
          </h2>

          <p className="fx-rise text-ink-soft text-lg sm:text-xl max-w-3xl leading-relaxed font-sans font-medium">
            {/* R27: the words ink in as they scroll up (ScrollReveal / SplitText scrub, CSS scroll timeline) */}
            <ScrollInk>
              Software Engineering undergraduate at{' '}
              <strong className="text-ink font-extrabold">Universiti Malaya</strong> (
              <span className="inline-block bg-pop-yellow border-2 border-ink rounded-md px-1.5 text-ink font-mono font-extrabold text-[0.95em] leading-snug">
                4.00 CGPA
              </span>
              ), on the Dean&apos;s Honours List. In 2026 four of my builds reached the podium: Supervity AutoPilot
              Asia, MUBA Blockchain, the DOSM Datathon and UM Game Jam. I keep the books too, as Finance Lead at PEKOM
              and in finance at KRAIBURG TPE.
            </ScrollInk>
          </p>
        </div>

        {/* R83 Build Sheet: four facts from this page as split-flap counters, each linking to its proof */}
        <BuildSheet />

        {/* Core Architecture Bento Grid (4 Pillars) — True Masonry Layout */}
        {isLg !== true && (
          <LayoutGroup id="about-pillars-mobile">
            <div className="flex flex-col lg:hidden gap-7">
              {architecturePillars.map((pillar) => (
                <PillarCard
                  key={pillar.id}
                  pillar={pillar}

                  activeCard={activeCard}
                  setActiveCard={setActiveCard}
                />
              ))}
            </div>
          </LayoutGroup>
        )}
        {isLg !== false && (
          <LayoutGroup id="about-pillars-desktop">
            <div className="hidden lg:grid grid-cols-2 gap-8 items-start">
              <div className="flex flex-col gap-8">
                {architecturePillars
                  .filter((_, i) => i % 2 === 0)
                  .map((pillar) => (
                    <PillarCard
                      key={pillar.id}
                      pillar={pillar}

                      activeCard={activeCard}
                      setActiveCard={setActiveCard}
                    />
                  ))}
              </div>
              <div className="flex flex-col gap-8 mt-10">
                {architecturePillars
                  .filter((_, i) => i % 2 === 1)
                  .map((pillar) => (
                    <PillarCard
                      key={pillar.id}
                      pillar={pillar}

                      activeCard={activeCard}
                      setActiveCard={setActiveCard}
                    />
                  ))}
              </div>
            </div>
          </LayoutGroup>
        )}

        {/* Categorized Technical Stack Matrix */}
        <div className="fx-rise nb-card-lg p-4 xs:p-6 sm:p-8 lg:p-10 space-y-8 lg:mt-10">
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
            <div
              role="group"
              aria-label="Highlight skills by status"
              className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-ink"
            >
              {STATUS_KEYS.map((k) => {
                const on = statusFocus === k.status;
                if (!FX.stackFocus)
                  return (
                    <span key={k.status} className="nb-chip">
                      <span className={`nb-dot ${k.dot}`} /> {k.label}
                    </span>
                  );
                return (
                  <button
                    key={k.status}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setStatusFocus(on ? null : k.status)}
                    className={`nb-chip nb-press min-h-[40px] cursor-pointer ${on ? '!bg-ink !text-white' : ''}`}
                  >
                    <span className={`nb-dot ${k.dot}`} /> {k.label}
                  </button>
                );
              })}
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
                    const key = skillKey(skill.name);
                    const count = evidence[key] ?? 0;
                    const match = statusFocus ? (skill.status === statusFocus ? 'true' : 'false') : undefined;
                    if (count > 0) {
                      const lit = trail?.key === key;
                      return (
                        <button
                          key={skill.name}
                          type="button"
                          data-match={match}
                          aria-pressed={lit}
                          aria-label={`Trace ${skill.name}: used in ${count} project${count > 1 ? 's' : ''}`}
                          onClick={() => startTrail(key, skill.name, projectsWithSkill(key))}
                          className={`nb-chip nb-press fx-stack-chip fx-trail-chip cursor-pointer min-h-[32px] [@media(pointer:coarse)]:min-h-[40px] transition-[transform,box-shadow,color,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-brutal-xs ${
                            lit ? '!bg-ink !text-white' : ''
                          }`}
                        >
                          <span className={`nb-dot ${dotColor}`} />
                          {skill.name}
                          <span aria-hidden className="fx-count">
                            {count}
                          </span>
                        </button>
                      );
                    }
                    return (
                      <span
                        key={skill.name}
                        data-match={match}
                        className="nb-chip fx-stack-chip transition-[transform,box-shadow,color,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-brutal-xs"
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
        </div>
      </div>
    </section>
  );
}
