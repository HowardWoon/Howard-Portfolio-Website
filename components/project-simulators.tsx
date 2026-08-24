"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  Play, 
  RefreshCw, 
  Activity, 
  Cpu, 
  GitBranch, 
  Zap, 
  Droplets, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Sparkles,
  Radio
} from "lucide-react";

type TabType = "slotify" | "zerolag" | "bilahujan" | "sensorx";

export default function ProjectSimulators() {
  const [activeTab, setActiveTab] = useState<TabType>("slotify");

  return (
    <section 
      id="simulators" 
      className="relative w-full bg-[#090B10] text-white py-28 px-6 sm:px-10 lg:px-16 overflow-hidden border-t border-white/10 selection:bg-amber-500 selection:text-black"
    >
      {/* Background Gradients */}
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-mono text-amber-300 tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>LAB // EXPERIMENTS & INTERACTIVE PROTOYPES</span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-3xl leading-[1.05]"
            >
              INTERACTIVE ENGINEERING LAB.
            </motion.h2>
            <p className="text-neutral-400 text-sm font-mono max-w-md leading-relaxed">
              Test and benchmark functional algorithmic routing engines, multi-agent AI pipelines, and IoT grid automation live in the browser.
            </p>
          </div>
        </div>

        {/* High-Tech Tab Bar */}
        <div className="flex flex-wrap items-center gap-3 p-2 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl">
          {[
            
            { id: "zerolag", num: "02", label: "ZeroLag 5-Agent Pipeline" },
            { id: "bilahujan", num: "03", label: "BILAHUJAN Flood Mesh" },
            { id: "sensorx", num: "04", label: "Sensor X Smart Grid" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? "text-black font-bold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeLabTab"
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl shadow-lg shadow-amber-500/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 opacity-75">{tab.num} /</span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Workbench */}
        <div className="w-full bg-[#0E121B]/95 border border-white/15 rounded-[36px] p-6 sm:p-10 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === "slotify" && <SlotifySimulator key="slotify" />}
            {activeTab === "zerolag" && <ZeroLagSimulator key="zerolag" />}
            {activeTab === "bilahujan" && <BilahujanSimulator key="bilahujan" />}
            {activeTab === "sensorx" && <SensorXSimulator key="sensorx" />}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

/* =========================================================================
   SIMULATOR 01: Slotify Graph Routing Engine
========================================================================= */
function SlotifySimulator() {
  const [isRouting, setIsRouting] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<string>("A2");
  const [logs, setLogs] = useState<string[]>([
    "Graph initialized with 6 vertices and 9 weighted bidirectional edges.",
    "Ready for vehicle entry point allocation.",
  ]);

  const runDijkstra = () => {
    setIsRouting(true);
    setLogs(["[0.0ms] Vehicle detected at Entry Gate A.", "[0.4ms] Initializing Min-Heap Priority Queue..."]);
    
    setTimeout(() => {
      setLogs((prev) => [...prev, "[0.9ms] Relaxing edges for Vertex A1 (Occupied, weight: ∞)"]);
    }, 400);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        "[1.2ms] Evaluated Spot A2 (Weight: 18m) - Selected as global minimum.",
        "[1.4ms] Optimal Route Assigned: Entry -> A2 (Total Latency: 1.42ms)",
      ]);
      setSelectedSpot("A2");
      setIsRouting(false);
    }, 900);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Workbench Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 tracking-wider uppercase">
            <GitBranch className="w-4 h-4" />
            <span>ALGORITHMIC GRAPH SIMULATION · JAVA 21 & SPRING BOOT</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
            Slotify Dijkstra Shortest Path Router
          </h3>
        </div>

        <button
          onClick={runDijkstra}
          disabled={isRouting}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 ${isRouting ? "animate-spin" : ""}`} />
          <span>{isRouting ? "CALCULATING PATH..." : "EXECUTE DIJKSTRA"}</span>
        </button>
      </div>

      {/* Main Grid: Interactive Map + Live Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Visual Parking Graph Matrix */}
        <div className="lg:col-span-7 bg-black/60 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>SPATIAL PARKING GRAPH NODES</span>
            <span className="text-amber-400 font-bold">Complexity: O(E + V log V)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { id: "A1", status: "OCCUPIED", dist: "Occupied", color: "red" },
              { id: "A2", status: "OPTIMAL", dist: "18m (Selected)", color: "amber" },
              { id: "B1", status: "FREE", dist: "24m", color: "neutral" },
              { id: "B2", status: "FREE", dist: "31m", color: "neutral" },
            ].map((spot) => {
              const isSelected = selectedSpot === spot.id;
              return (
                <div
                  key={spot.id}
                  className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                    isSelected
                      ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10"
                      : spot.status === "OCCUPIED"
                      ? "border-red-500/20 bg-red-500/5 text-neutral-500"
                      : "border-white/10 bg-white/[0.02] text-neutral-300"
                  }`}
                >
                  <div className="text-xl font-mono font-black text-white">{spot.id}</div>
                  <div className={`text-xs font-mono mt-1 font-bold ${
                    isSelected ? "text-amber-400" : spot.status === "OCCUPIED" ? "text-red-400" : "text-neutral-400"
                  }`}>
                    {spot.status}
                  </div>
                  <div className="text-xs font-mono text-neutral-400 mt-1">{spot.dist}</div>
                </div>
              );
            })}
          </div>

          {/* Quick Architecture Specs */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-mono">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-neutral-400 block">EXECUTION TIME</span>
              <span className="font-bold text-amber-300">1.42 ms</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-neutral-400 block">PRIORITY QUEUE</span>
              <span className="font-bold text-emerald-400">Min-Heap</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-neutral-400 block">ACTIVE THREADS</span>
              <span className="font-bold text-amber-400">Virtual Threads</span>
            </div>
          </div>
        </div>

        {/* Right: Live Telemetry Output Console */}
        <div className="lg:col-span-5 bg-black rounded-2xl border border-white/10 p-5 font-mono text-xs space-y-3 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-neutral-400 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>ROUTING_STREAM.LOG</span>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
            </span>
          </div>

          <div className="space-y-1.5 text-neutral-300 text-xs overflow-y-auto max-h-48 py-1">
            {logs.map((log, lIdx) => (
              <div key={lIdx} className={log.includes("Selected") ? "text-amber-300 font-bold" : ""}>
                &gt; {log}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-neutral-500">
            <span>BACKEND: Spring Boot 3 / Java 21</span>
            <span className="text-amber-400">STATUS: READY</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

/* =========================================================================
   SIMULATOR 02: ZeroLag 5-Agent Sales Triage (Supervity 2nd Place)
========================================================================= */
export function ZeroLagSimulator() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const stages = [
    { name: "Prospect Ingestion", desc: "Parsing metadata & LinkedIn public headers" },
    { name: "Scraper Agent", desc: "Synthesizing recent company announcements & funding" },
    { name: "Sentiment Scorer", desc: "Running zero-shot intent classifier" },
    { name: "Lead Ranker", desc: "Calculating conversion affinity score (0.00 - 1.00)" },
    { name: "CRM Dispatch", desc: "Syncing vectorized payload to Supabase & CRM" },
  ];

  const triggerPipeline = () => {
    setIsRunning(true);
    setCurrentStage(1);
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= 5) {
          clearInterval(interval);
          setIsRunning(false);
          return 5;
        }
        return prev + 1;
      });
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 tracking-wider uppercase">
            <Cpu className="w-4 h-4" />
            <span>AGENTIC WORKFLOW · 2ND PLACE SUPERVITY APAC HACKATHON</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
            ZeroLag 5-Agent Autonomous Intelligence Engine
          </h3>
        </div>

        <button
          onClick={triggerPipeline}
          disabled={isRunning}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
          <span>{isRunning ? "AGENTS EXECUTING..." : "DISPATCH AGENT PIPELINE"}</span>
        </button>
      </div>

      {/* 5-Agent Pipeline Visualizer */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {stages.map((stage, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStage > stepNum;
          const isCurrent = currentStage === stepNum;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 ${
                isCurrent
                  ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10"
                  : isDone
                  ? "border-emerald-500/40 bg-emerald-500/5 text-neutral-300"
                  : "border-white/10 bg-white/[0.02] text-neutral-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-neutral-400">0{stepNum}</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-neutral-700" />
                )}
              </div>
              <div>
                <div className={`font-mono text-xs font-bold ${isCurrent ? "text-amber-300" : "text-white"}`}>
                  {stage.name}
                </div>
                <div className="text-xs font-sans text-neutral-400 mt-1 leading-tight">
                  {stage.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Output Log Banner */}
      <div className="bg-black rounded-2xl border border-white/10 p-4 font-mono text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-neutral-300">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>
            {currentStage === 5 
              ? "Lead Qualified: Score 0.96 [High Priority] · Auto-Dispatched to Enterprise CRM." 
              : isRunning 
              ? `Executing Node #${currentStage}: ${stages[currentStage - 1]?.name}...` 
              : "System Idle. Click 'Dispatch Agent Pipeline' to execute state machine."}
          </span>
        </div>
        <span className="text-xs text-amber-400 uppercase font-bold">LangGraph Orchestrator</span>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   SIMULATOR 03: BILAHUJAN Flood Mesh
========================================================================= */
export function BilahujanSimulator() {
  const [logs, setLogs] = useState<string[]>([
    "[System] Firebase RTDB connected.",
    "[Agent] Gemini 2.0 Flash Command Agent IDLE.",
    "Awaiting citizen flood reports..."
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [severity, setSeverity] = useState<number | null>(null);

  const triggerReport = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setLogs(["[Node] Citizen uploaded flood image at KL-007 (Ampang)"]);
    setSeverity(null);
    
    setTimeout(() => {
      setLogs(p => [...p, "[Vision] gemini-2.5-flash 12-pass analysis started..."]);
    }, 600);

    setTimeout(() => {
      setLogs(p => [...p, "[Vision] Pass 5 (Rooftop Cue): DETECTED", "[Vision] Severity Override applied -> 9 (CRITICAL)"]);
      setSeverity(9);
    }, 1800);

    setTimeout(() => {
      setLogs(p => [...p, "[Agent] New node detected via get_active_nodes MCP tool", "[Agent] Chain-of-Thought: 'Zone KL-007 has severity 9. I will dispatch an alert to NADMA.'"]);
    }, 3200);

    setTimeout(() => {
      setLogs(p => [...p, "[MCP] Executing: dispatch_alert(zone: 'KL-007', severity: 9)", "[System] Authority notification sent to JPS & NADMA via Firebase."]);
      setIsSimulating(false);
    }, 4800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase">
            <Radio className="w-4 h-4" />
            <span>SWARM INTELLIGENCE + MCP TOOLS — V HACK 2026</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
            Autonomous Command Agent Terminal
          </h3>
        </div>

        <button
          onClick={triggerReport}
          disabled={isSimulating}
          className={`px-5 py-2.5 rounded-full border text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
            isSimulating
              ? "bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed"
              : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
          }`}
        >
          {isSimulating ? "Agent Active..." : "Simulate Citizen Report"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Swarm Map / Status */}
        <div className="lg:col-span-4 bg-black/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-2 text-xs font-mono">
            <div className="text-neutral-500">// Firebase Node Status</div>
            <div className="flex justify-between items-center text-neutral-300">
              <span>Active Citizen Nodes</span>
              <span className="text-cyan-400 font-bold">144 Nodes</span>
            </div>
            <div className="flex justify-between items-center text-neutral-300">
              <span>Network Health</span>
              <span className="text-emerald-400 font-bold">100% ONLINE</span>
            </div>
            <div className="flex justify-between items-center text-neutral-300 pt-4 border-t border-white/5">
              <span>Current Incident Severity</span>
              {severity ? (
                <span className="text-red-400 font-bold animate-pulse">Level {severity} CRITICAL</span>
              ) : (
                <span className="text-neutral-500">Waiting for data</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Terminal */}
        <div className="lg:col-span-8 bg-[#0C0E14] rounded-2xl border border-white/10 p-5 font-mono text-[11px] sm:text-xs">
          <div className="text-neutral-500 mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>Command_Agent_Mission_Log.sh</span>
          </div>
          <div className="space-y-2 h-[150px] overflow-y-auto pr-2 custom-scrollbar">
            {logs.map((log, i) => {
              const isHighlight = log.includes("Severity Override") || log.includes("Authority notification sent");
              const isAgent = log.includes("[Agent]");
              const isVision = log.includes("[Vision]");
              const isMCP = log.includes("[MCP]");
              
              let textColor = "text-neutral-300";
              if (isHighlight) textColor = "text-red-400 font-bold";
              else if (isAgent) textColor = "text-amber-300";
              else if (isVision) textColor = "text-cyan-300";
              else if (isMCP) textColor = "text-purple-400";
              else if (log.includes("[System]")) textColor = "text-emerald-400";

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={textColor}
                >
                  <span className="opacity-50 mr-2">{new Date().toISOString().split("T")[1].slice(0, 8)}</span>
                  {log}
                </motion.div>
              );
            })}
            {isSimulating && (
              <div className="flex items-center gap-2 text-neutral-500 pt-2">
                <span className="animate-pulse">_</span>
                <span>Agent processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   SIMULATOR 04: Sensor X Sensei Smart Energy Grid
========================================================================= */
export function SensorXSimulator() {
  const [isOccupied, setIsOccupied] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 tracking-wider uppercase">
            <Zap className="w-4 h-4" />
            <span>ESP32 FIRMWARE + MQTT PROTOCOL · UM TECHNOTHON 2026</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
            Sensor X Sensei Smart Grid & Load-Shedding Lab
          </h3>
        </div>

        <button
          onClick={() => setIsOccupied(!isOccupied)}
          className={`px-5 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
            isOccupied 
              ? "bg-emerald-400 text-black shadow-lg shadow-emerald-500/20" 
              : "bg-red-500/20 text-red-300 border border-red-500/40"
          }`}
        >
          {isOccupied ? "SIMULATE: ROOM VACATED" : "SIMULATE: STUDENT ENTERED"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-black/60 border border-white/10 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-neutral-400">ACTIVE POWER LOAD</span>
          <div className="text-3xl font-mono font-bold text-white">
            {isOccupied ? "1.84 kW" : "0.72 kW"}
          </div>
          <span className="text-xs font-mono text-neutral-500">HVAC + Smart Relays</span>
        </div>

        <div className="p-5 bg-black/60 border border-white/10 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-neutral-400">IDLE POWER REDUCTION</span>
          <div className="text-3xl font-mono font-bold text-emerald-400">
            {isOccupied ? "0.0%" : "-60.8%"}
          </div>
          <span className="text-xs font-mono text-neutral-500">Auto Load-Shed Activated</span>
        </div>

        <div className="p-5 bg-black/60 border border-white/10 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-neutral-400">SENSOR FUSION STATUS</span>
          <div className="text-lg font-mono font-bold text-amber-300 mt-2">
            {isOccupied ? "PIR Active · NFC In" : "PIR Idle · Auto Cutoff"}
          </div>
          <span className="text-xs font-mono text-neutral-500">MQTT Broker: Connected</span>
        </div>
      </div>
    </motion.div>
  );
}