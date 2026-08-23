"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Server, 
  Cpu, 
  GitBranch, 
  ShieldCheck, 
  Terminal, 
  Activity, 
  Database, 
  Sparkles, 
  ArrowUpRight, 
  Layers,
  Code2
} from "lucide-react";

const architecturePillars = [
  {
    id: "backend",
    category: "01 // DISTRIBUTED SYSTEMS",
    title: "High-Throughput Backends",
    icon: Server,
    color: "amber",
    accentHex: "#F59E0B",
    headline: "Low-Latency Java 21 & Spring Boot Architecture",
    description:
      "Architecting concurrent, fault-tolerant backend services with thread pooling, connection pooling, and optimized REST/gRPC endpoints designed for scale.",
    metrics: [
      { label: "Core Runtime", value: "Java 21 LTS" },
      { label: "Architecture", value: "Spring Boot / Microservices" },
      { label: "Throughput", value: "Sub-50ms API Latency" },
    ],
    telemetrySnippet: "ThreadPool[Active: 64, Idle: 16] · EventLoop: OK",
  },
  {
    id: "agents",
    category: "02 // AGENTIC AI",
    title: "Autonomous Multi-Agent Pipelines",
    icon: Cpu,
    color: "cyan",
    accentHex: "#00E5FF",
    headline: "Deterministic 5-Operator Agentic Orchestration",
    description:
      "Engineering state-machine AI workflows (LangGraph, CrewAI, local Ollama) that autonomously research, synthesize, and execute end-to-end tasks with verified guardrails.",
    metrics: [
      { label: "Track Record", value: "2nd Place @ Supervity Hackathon" },
      { label: "Orchestration", value: "LangGraph + CrewAI" },
      { label: "Guardrails", value: "Deterministic Tool Routing" },
    ],
    telemetrySnippet: "Agent Pipeline: [Planner ➔ Coder ➔ Reviewer ➔ Deployer]",
  },
  {
    id: "algorithms",
    category: "03 // DATA STRUCTURES",
    title: "Algorithmic Rigor & Graphs",
    icon: GitBranch,
    color: "purple",
    accentHex: "#A855F7",
    headline: "Graph Traversal, Min-Heaps & Sub-MS Optimization",
    description:
      "Leveraging Dijkstra's shortest path, priority queues, and dynamic programming for real-time routing engines (e.g. BILAHUJAN flood response app at KitaHack 2026).",
    metrics: [
      { label: "Complexity Focus", value: "O(E + V log V) Routing" },
      { label: "Academic Standing", value: "4.00 CGPA @ Univ Malaya" },
      { label: "Optimization", value: "Spatial Graph Heuristics" },
    ],
    telemetrySnippet: "MinHeap[Priority Queue: 1,024 Nodes Balanced]",
  },
  {
    id: "governance",
    category: "04 // OPERATIONS & GOVERNANCE",
    title: "Fiscal Governance & Security",
    icon: ShieldCheck,
    color: "emerald",
    accentHex: "#10B981",
    headline: "Corporate Financial Leadership & System Auditing",
    description:
      "Combining technical engineering with executive financial stewardship as PEKOM Finance Lead and corporate finance intern at Kraiburg TPE.",
    metrics: [
      { label: "Leadership", value: "Finance Lead @ PEKOM UM" },
      { label: "Oversight", value: "100% Audit Compliance" },
      { label: "Corporate Exp.", value: "Kraiburg TPE Finance" },
    ],
    telemetrySnippet: "Audit Log: 100% Balanced · Ledger Verified",
  },
];

const techStackGroups = [
  {
    category: "CORE LANGUAGES",
    skills: ["Java 21", "Python 3.12", "TypeScript", "SQL (PostgreSQL)", "C++"],
  },
  {
    category: "BACKEND & FRAMEWORKS",
    skills: ["Spring Boot 3", "FastAPI", "Next.js 15 (App Router)", "Node.js", "Docker"],
  },
  {
    category: "AI & AGENTIC SYSTEMS",
    skills: ["LangChain", "LangGraph", "CrewAI", "Ollama (Local LLMs)", "Prompt Engineering"],
  },
  {
    category: "DATA & INFRASTRUCTURE",
    skills: ["PostgreSQL", "Supabase", "Git / GitHub Actions", "Vercel", "REST / gRPC APIs"],
  },
];

export default function AboutSection() {
  const [activeCard, setActiveCard] = useState<string>("backend");

  return (
    <section 
      id="about" 
      className="relative w-full bg-[#0A0D14] text-white py-28 px-6 sm:px-10 lg:px-16 overflow-hidden border-t border-white/10 selection:bg-amber-500 selection:text-black"
    >
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-mono text-amber-300 tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ABOUT // SYSTEMS ARCHITECTURE & VISION</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-5xl leading-[1.08]"
          >
            I architect resilient backend systems and engineer autonomous agentic pipelines from 0 to 1.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-neutral-300 text-lg sm:text-xl max-w-3xl leading-relaxed font-sans"
          >
            Software Engineering undergraduate at <strong className="text-white">Universiti Malaya</strong> (<span className="text-amber-400 font-mono font-bold">4.00 CGPA</span>). Bridging low-latency algorithmic backend performance with production-grade AI agent orchestration and corporate fiscal governance.
          </motion.p>
        </div>

        {/* Core Architecture Bento Grid (4 Pillars) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {architecturePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isActive = activeCard === pillar.id;

            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                onClick={() => setActiveCard(pillar.id)}
                className={`relative group cursor-pointer rounded-3xl p-8 border transition-all duration-500 flex flex-col justify-between space-y-6 ${
                  isActive
                    ? "bg-[#121622] border-amber-500/60 shadow-2xl shadow-amber-500/10"
                    : "bg-[#0E121B]/90 hover:bg-[#121622] border-white/10 hover:border-white/25"
                }`}
              >
                {/* Top Card Bar: Category Tag + Icon */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
                    {pillar.category}
                  </span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                    isActive 
                      ? "bg-amber-400/20 border-amber-400/50 text-amber-400" 
                      : "bg-white/5 border-white/10 text-neutral-300 group-hover:text-white"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Card Title & Description */}
                <div className="space-y-2.5">
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
                    {pillar.title}
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
                  </h3>
                  <p className="text-xs font-mono text-amber-400/90 font-medium">
                    {pillar.headline}
                  </p>
                  <p className="text-sm text-neutral-300 leading-relaxed font-sans pt-1">
                    {pillar.description}
                  </p>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/10">
                  {pillar.metrics.map((metric, mIdx) => (
                    <div key={mIdx} className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase leading-none">
                        {metric.label}
                      </div>
                      <div className="text-xs font-mono font-bold text-neutral-100 mt-1.5 truncate">
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Telemetry Ticker */}
                <div className="bg-black/60 rounded-xl px-3.5 py-2 border border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <div className="flex items-center gap-2 truncate">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">{pillar.telemetrySnippet}</span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-bold shrink-0 ml-2">ACTIVE</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Categorized Technical Stack Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#0E121B]/90 border border-white/10 rounded-3xl p-8 lg:p-10 space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 tracking-widest uppercase">
                <Code2 className="w-4 h-4" />
                <span>TECHNICAL TOOLING MATRIX</span>
              </div>
              <h4 className="text-xl font-bold text-white uppercase tracking-tight">
                Verified Production & Research Stack
              </h4>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Production Tested
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Hackathon Proven
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStackGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-3.5">
                <h5 className="text-xs font-mono font-bold text-neutral-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  {group.category}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-white/[0.04] hover:bg-amber-400/20 hover:border-amber-400/50 hover:text-amber-300 border border-white/10 rounded-xl text-xs font-mono text-neutral-200 transition-all duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}