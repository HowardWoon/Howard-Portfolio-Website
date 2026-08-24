"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, MotionValue, AnimatePresence } from "framer-motion";
import { TiltCard } from './tilt-card';
import { InteractivePhotoStack } from "./interactive-photo-stack";
import { ZeroLagSimulator, BilahujanSimulator, SensorXSimulator } from "./project-simulators";
import { 
  Award, 
  ExternalLink, 
  Terminal, 
  FileText, 
  Activity, 
  ArrowUpRight, 
  Sparkles, 
  Layers,
  CheckCircle2
} from "lucide-react";

interface ProjectData {
  id: string;
  number: string;
  badge: string;
  badgeType: "gold" | "cyan" | "emerald";
  title: string;
  subtitle: string;
  description: string;
  architecturePoints: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
  deckUrl?: string;
  simulatorId: string;
  githubUrl?: string;
  telemetryType: "agentic" | "flood" | "energy";
}

const projects: ProjectData[] = [
      {
      id: "zerolag",
      number: "01",
      badge: "🏆 2nd Place Winner · Supervity Asia Hackathon 2026",
      badgeType: "gold",
      title: "ZeroLag",
      subtitle: "Governed AI Workforce & Autonomous Sales Pipeline",
      description:
        "A Bi-Modal AI Agent Architecture built to resolve B2B buying groups and halt PDPA/GDPR compliance violations. Engineered with deterministic halt states to prevent LLM compute waste and enterprise legal liability with zero pipeline pollution.",
      architecturePoints: [
        "Layer 1 Execution Node: Master Orchestrator triggering 5 specialized Operators (Identity, Dedupe, Comply, Score, Draft)",
        "Layer 2 Governance Node: Dynamic ICP Thresholding & Human-in-the-loop Exception Workbench",
        "Compute-Optimized Logic Gates executing hard halts and raw PostgreSQL SQL Write-Backs"
      ],
      metrics: [
        { label: "Compliance", value: "100% PDPA/GDPR" },
        { label: "Agent Operators", value: "5 Autonomous Nodes" },
        { label: "Wasted Compute", value: "Zero" },
      ],
      tags: ["FastAPI", "LangGraph", "PostgreSQL", "HubSpot API", "React", "Python"],
      deckUrl: "/documents/supervity-pitchdeck.pdf",
      simulatorId: "zerolag",
      githubUrl: "https://github.com",
      telemetryType: "agentic",
    },
  {
      id: "bilahujan",
      number: "02",
      badge: "🏅 V Hack 2026 Case Study 3 — First Responder of the Future",
      badgeType: "cyan",
      title: "BILAHUJAN",
      subtitle: "Decentralised Swarm Intelligence for Flood First Response",
      description:
        "An autonomous, edge-ready civic intelligence platform where every civilian acts as a sensor node. Fuses Gemini 2.5 Flash 12-pass image triage with a Gemini 2.0 Flash Command Agent orchestrated via 7 standardised MCP tools to instantly verify floods and dispatch authorities with zero human intervention.",
      architecturePoints: [
        "Autonomous Command Agent (Gemini 2.0 Flash) running a 3-phase Chain-of-Thought loop",
        "12-pass vision pipeline enforcing unbypassable physical anchor guardrails (e.g., Rooftop = Severity 9)",
        "Decentralised MCP Swarm architecture with real-time Firebase syncing and hardcoded offline-first fallbacks"
      ],
      metrics: [
        { label: "Agent Tool Calls", value: "7 MCP Tools" },
        { label: "Vision Pipeline", value: "12-Pass (Sub-35s)" },
        { label: "Swarm Scale", value: "150+ Pre-seeded Towns" },
      ],
      tags: ["React", "TypeScript", "Firebase RTDB", "Gemini 2.5 Flash", "MCP Architecture", "Google Maps"],
      simulatorId: "bilahujan",
      githubUrl: "https://github.com/HowardWoon/BILAHUJAN-VHack2026",
      telemetryType: "flood",
    },
  {
    id: "sensor-x-sensei",
    number: "03",
    badge: "⚡ UM Technothon 2026 Finalist · IoT Energy Grid",
    badgeType: "emerald",
    title: "Sensor X Sensei",
    subtitle: "Automated Energy Management & Micro-Grid Telemetry",
    description:
      "An IoT-mediated building automation system designed for university lecture halls. Integrates dual-sensor fusion (PIR + NFC) with automated HVAC/lighting relays and live carbon emission telemetry dashboards.",
    architecturePoints: [
      "Low-power ESP32 firmware communicating via lightweight MQTT brokers",
      "Next.js 15 telemetry dashboard streaming real-time kilowatt loads",
      "Automated load-shedding algorithms cutting idle energy consumption by 38%"
    ],
    metrics: [
      { label: "Energy Reduction", value: "38.2% Idle Saved" },
      { label: "Hardware Stack", value: "ESP32 + PIR/NFC" },
      { label: "Protocol", value: "MQTT / WebSockets" },
    ],
    tags: ["ESP32", "C++", "Next.js 15", "MQTT", "PostgreSQL", "Tailwind CSS"],
    simulatorId: "sensor-x",
    githubUrl: "https://github.com",
    telemetryType: "energy",
  },
];

export default function StackedProjects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section 
      ref={containerRef}
      id="projects" 
      className="relative w-full bg-[#090B10] text-white pt-32 pb-[50vh] px-6 sm:px-10 lg:px-16 overflow-x-clip overflow-y-visible border-t border-white/10 selection:bg-amber-500 selection:text-black"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Section Header */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-mono text-amber-300 tracking-widest uppercase">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>PROJECTS // PRODUCTION & ARCHITECTURE</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-3xl leading-[1.05]">
              SCALABLE SYSTEMS & AUTONOMOUS ARCHITECTURES.
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base font-mono max-w-md">
              Scroll through the stack to deconstruct high-throughput backends, deterministic multi-agent LLM pipelines, and hardware-integrated IoT networks built from 0 to 1.
            </p>
          </div>
        </div>

        {/* Stacked Cards Container */}
        <div className="space-y-12 lg:space-y-24">
          {projects.map((project, index) => {
            return (
              <ProjectCard 
                key={project.id} 
                project={project} 
                index={index} 
                total={projects.length}
                progress={scrollYProgress}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
  total,
  progress
}: {
  project: ProjectData;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  
  const [isExpanded, setIsExpanded] = useState(false);

  // Dynamic Badges
  const cardStart = index / total;
  const cardEnd = (index + 1) / total;
  
  

  const badgeStyles = {
    gold: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    cyan: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <div className="sticky top-24 w-full group" style={{ zIndex: index + 10 }}>

        <TiltCard>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full rounded-[36px] p-8 sm:p-10 lg:p-12 border border-white/15 bg-[#0E121B]/95 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-amber-400/40 group"
      >
        {/* Background glow per card */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Narrative, Architecture & Benchmarks (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Bar: Project Index + Award Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 text-white font-mono text-xs font-bold flex items-center justify-center border border-white/15">
                {project.number}
              </span>
              <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono tracking-wider border ${badgeStyles[project.badgeType]}`}>
                <Award className="w-3.5 h-3.5" />
                <span>{project.badge}</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h3 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white flex items-center gap-3">
                {project.title}
                <ArrowUpRight className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm font-mono text-amber-400 font-medium tracking-wide">
                {project.subtitle}
              </p>
            </div>

            {/* Narrative Description */}
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-sans">
              {project.description}
            </p>

            {/* Key Architectural Highlights */}
            <div className="space-y-2.5 bg-black/30 p-4 rounded-2xl border border-white/5">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                KEY ARCHITECTURAL HIGHLIGHTS:
              </span>
              {project.architecturePoints.map((point, pIdx) => (
                <div key={pIdx} className="flex items-start gap-2.5 text-xs font-sans text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Live Benchmarks & Metric Chips */}
            <div className="grid grid-cols-3 gap-3">
              {project.metrics.map((m, mIdx) => (
                <div key={mIdx} className="bg-white/[0.03] border border-white/10 rounded-2xl p-3">
                  <div className="text-xs font-mono text-neutral-400 uppercase ">
                    {m.label}
                  </div>
                  <div className="text-sm font-mono font-bold text-amber-300 mt-1 ">
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-neutral-300 hover:border-amber-400/50 hover:text-white transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {project.id !== "sensor-x-sensei" && (
                  <button onClick={() => setIsExpanded(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-all duration-200 shadow-lg shadow-amber-500/20"><Terminal className="w-3.5 h-3.5" /><span>LAUNCH LIVE SIMULATOR</span></button>
                )}

              {project.deckUrl && (
                <a
                  href={project.deckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs uppercase tracking-wider transition-all duration-200"
                >
                  <FileText className="w-3.5 h-3.5 text-neutral-400" />
                  <span>PITCH DECK</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              )}
            </div>

          </div>

          {/* Right Column: Live Visual Architecture Telemetry (5 Cols) */}
          <motion.div className="lg:col-span-5 w-full bg-black/60 rounded-3xl border border-white/10 p-6 space-y-4 shadow-inner flex flex-col">
            
            {/* Visualizer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                {project.telemetryType === "agentic" ? (
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                ) : (
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                )}
                <span className="uppercase font-bold tracking-wider">
                  {project.telemetryType === "agentic" ? "PROJECT GALLERY" : "LIVE TELEMETRY WINDOW"}
                </span>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {project.telemetryType === "agentic" ? "INTERACTIVE" : "ACTIVE PIPELINE"}
              </span>
            </div>

            {/* Conditional Graphic Visualizers */}
            {project.telemetryType === "agentic" && (
              <div className="flex-1 w-full flex items-center justify-center min-h-[400px] lg:min-h-[450px] py-2 overflow-hidden rounded-xl">
                <InteractivePhotoStack />
              </div>
            )}
            
            {project.telemetryType === "flood" && (
              <div className="space-y-4 py-2">
                <div className="text-xs font-mono text-neutral-400">
                  // Dijkstra Evacuation Path Engine
                </div>

                {/* Simulated Graph Routing */}
                <div className="bg-black/50 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Target Hazard Zone:</span>
                    <span className="text-red-400 font-bold">Inundation Level 3</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Calculated Safe Corridor:</span>
                    <span className="text-emerald-400 font-bold">Path Node #104 ➔ #289</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-4/5 animate-pulse" />
                  </div>
                </div>

                <div className="bg-black p-3 rounded-xl border border-white/5 font-mono text-xs text-neutral-400 space-y-1">
                  <div className="text-amber-400">&gt;_ graph.nodes_evaluated: 1,024</div>
                  <div>&gt;_ priority_queue: &quot;MinHeap_Balanced&quot;</div>
                  <div>&gt;_ route_dispatch_time: 42.8ms</div>
                </div>
              </div>
            )}

            {project.telemetryType === "energy" && (
              <div className="space-y-4 py-2">
                <div className="text-xs font-mono text-neutral-400">
                  // Micro-Grid Power & Occupancy Matrix
                </div>

                {/* IoT Grid Dashboard */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="text-xs font-mono text-neutral-400">Current Load</div>
                    <div className="text-base font-mono font-bold text-white mt-1">1.42 kW</div>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="text-xs font-mono text-neutral-400">Idle Savings</div>
                    <div className="text-base font-mono font-bold text-emerald-400 mt-1">-38.2%</div>
                  </div>
                </div>

                <div className="bg-black p-3 rounded-xl border border-white/5 font-mono text-xs text-neutral-400 space-y-1">
                  <div className="text-emerald-400">&gt;_ sensor_fusion: &quot;PIR_ACTIVE + NFC_PASS&quot;</div>
                  <div>&gt;_ protocol_broker: &quot;MQTT_TLS_v1.3&quot;</div>
                  <div>&gt;_ relay_state: &quot;OPTIMIZED_AUTO_SHED&quot;</div>
                </div>
              </div>
            )}

          </motion.div>

        </div>

        {/* Full-Screen Simulator Expansion Modal */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl p-4 sm:p-8 flex items-center justify-center overflow-y-auto"
              onClick={() => setIsExpanded(false)}
            >
              <motion.div
                layoutId={`project-${project.id}`}
                className="relative w-full max-w-6xl bg-[#0E121B] border border-white/20 rounded-[32px] overflow-hidden shadow-2xl p-6 sm:p-10 my-8 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{project.title} SIMULATOR</h3>
                    <p className="text-sm font-mono text-amber-400 mt-1">LIVE INTERACTIVE ENVIRONMENT</p>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    X
                  </button>
                </div>
                
                <div className="flex-1 w-full min-h-[60vh] bg-black/50 rounded-2xl border border-white/10 overflow-hidden">
                  {project.telemetryType === "agentic" && <ZeroLagSimulator />}
                  {project.telemetryType === "flood" && <BilahujanSimulator />}
                  {project.telemetryType === "energy" && <SensorXSimulator />}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </TiltCard>
      </div>
  );
}