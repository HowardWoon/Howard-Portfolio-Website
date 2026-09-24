'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Play, Cpu, Zap, CheckCircle2, Radio } from 'lucide-react';

/** setTimeout/setInterval that are all cleared when the simulator unmounts
 *  (navigating away mid-run used to keep firing setState on an unmounted component). */
function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(
    () => () =>
      ids.current.forEach((id) => {
        clearTimeout(id);
        clearInterval(id);
      }),
    [],
  );
  return {
    timeout: (fn: () => void, ms: number) => {
      ids.current.push(window.setTimeout(fn, ms));
    },
    interval: (fn: () => void, ms: number) => {
      const id = window.setInterval(fn, ms);
      ids.current.push(id);
      return id;
    },
  };
}

/* =========================================================================
   SIMULATOR 02: ZeroLag 5-Agent Sales Triage (Supervity 2nd Place)
========================================================================= */
export function ZeroLagSimulator() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const stages = [
    { name: 'Prospect Ingestion', desc: 'Parsing metadata & LinkedIn public headers' },
    { name: 'Scraper Agent', desc: 'Synthesizing recent company announcements & funding' },
    { name: 'Sentiment Scorer', desc: 'Running zero-shot intent classifier' },
    { name: 'Lead Ranker', desc: 'Calculating conversion affinity score (0.00 - 1.00)' },
    { name: 'CRM Dispatch', desc: 'Syncing vectorized payload to Supabase & CRM' },
  ];

  const timers = useTimers();
  const DONE = stages.length + 1; // 6

  const triggerPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    let stage = 1;
    setCurrentStage(stage);
    const id = timers.interval(() => {
      stage += 1;
      setCurrentStage(stage);
      if (stage >= DONE) {
        clearInterval(id);
        setIsRunning(false);
      }
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
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
            ZeroLag 5-Agent Autonomous Intelligence Engine
          </h1>
        </div>

        <button
          onClick={triggerPipeline}
          disabled={isRunning}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'AGENTS EXECUTING...' : 'DISPATCH AGENT PIPELINE'}</span>
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
                  ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10'
                  : isDone
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-neutral-300'
                    : 'border-white/10 bg-white/[0.02] text-neutral-500'
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
                <div className={`font-mono text-xs font-bold ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                  {stage.name}
                </div>
                <div className="text-xs font-sans text-neutral-400 mt-1 leading-tight">{stage.desc}</div>
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
            {currentStage >= DONE
              ? 'Lead Qualified: Score 0.96 [High Priority] · Auto-Dispatched to Enterprise CRM.'
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
type LogLine = { t: string; msg: string };
const stamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

export function BilahujanSimulator() {
  const [logs, setLogs] = useState<LogLine[]>([
    { t: '--:--:--', msg: '[System] Firebase RTDB connected.' },
    { t: '--:--:--', msg: '[Agent] Gemini 2.0 Flash Command Agent IDLE.' },
    { t: '--:--:--', msg: 'Awaiting citizen flood reports...' },
  ]);
  const push = (...msgs: string[]) => setLogs((p) => [...p, ...msgs.map((msg) => ({ t: stamp(), msg }))]);

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [logs]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [severity, setSeverity] = useState<number | null>(null);

  const timers = useTimers();
  const triggerReport = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setLogs([{ t: stamp(), msg: '[Node] Citizen uploaded flood image at KL-007 (Ampang)' }]);
    setSeverity(null);

    timers.timeout(() => {
      push('[Vision] gemini-2.5-flash 12-pass analysis started...');
    }, 600);

    timers.timeout(() => {
      push('[Vision] Pass 5 (Rooftop Cue): DETECTED', '[Vision] Severity Override applied -> 9 (CRITICAL)');
      setSeverity(9);
    }, 1800);

    timers.timeout(() => {
      push(
        '[Agent] New node detected via get_active_nodes MCP tool',
        "[Agent] Chain-of-Thought: 'Zone KL-007 has severity 9. I will dispatch an alert to NADMA.'",
      );
    }, 3200);

    timers.timeout(() => {
      push(
        "[MCP] Executing: dispatch_alert(zone: 'KL-007', severity: 9)",
        '[System] Authority notification sent to JPS & NADMA via Firebase.',
      );
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
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
            Autonomous Command Agent Terminal
          </h1>
        </div>

        <button
          onClick={triggerReport}
          disabled={isSimulating}
          className={`px-5 py-2.5 rounded-full border text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
            isSimulating
              ? 'bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
          }`}
        >
          {isSimulating ? 'Agent Active...' : 'Simulate Citizen Report'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Swarm Map / Status */}
        <div className="lg:col-span-4 bg-black/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-2 text-xs font-mono">
            <div className="text-neutral-500">{'// Firebase Node Status'}</div>
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
          <div ref={logRef} role="log" aria-live="polite" className="space-y-2 h-[150px] overflow-y-auto pr-2">
            {logs.map((logObj, i) => {
              const log = typeof logObj === 'string' ? logObj : logObj.msg;
              const time = typeof logObj === 'string' ? '--:--:--' : logObj.t;
              const isCritical = log.includes('CRITICAL') || log.includes('NADMA');
              const isAgent = log.includes('[Agent]') || log.includes('[Vision]');
              const isMcp = log.includes('[MCP]');

              let textColor = 'text-neutral-400';
              if (isCritical) textColor = 'text-red-400';
              else if (isAgent) textColor = 'text-cyan-300';
              else if (isMcp) textColor = 'text-amber-400';

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={textColor}
                >
                  <span className="opacity-50 mr-2">{time}</span>
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
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
            Sensor X Sensei Smart Grid & Load-Shedding Lab
          </h1>
        </div>

        <button
          onClick={() => setIsOccupied(!isOccupied)}
          className={`px-5 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
            isOccupied
              ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-red-500/20 text-red-300 border border-red-500/40'
          }`}
        >
          {isOccupied ? 'SIMULATE: ROOM VACATED' : 'SIMULATE: STUDENT ENTERED'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-black/60 border border-white/10 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-neutral-400">ACTIVE POWER LOAD</span>
          <div className="text-3xl font-mono font-bold text-white">{isOccupied ? '1.84 kW' : '0.72 kW'}</div>
          <span className="text-xs font-mono text-neutral-500">HVAC + Smart Relays</span>
        </div>

        <div className="p-5 bg-black/60 border border-white/10 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-neutral-400">IDLE POWER REDUCTION</span>
          <div className="text-3xl font-mono font-bold text-emerald-400">{isOccupied ? '0.0%' : '-60.8%'}</div>
          <span className="text-xs font-mono text-neutral-500">Auto Load-Shed Activated</span>
        </div>

        <div className="p-5 bg-black/60 border border-white/10 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-neutral-400">SENSOR FUSION STATUS</span>
          <div className="text-lg font-mono font-bold text-amber-300 mt-2">
            {isOccupied ? 'PIR Active · NFC In' : 'PIR Idle · Auto Cutoff'}
          </div>
          <span className="text-xs font-mono text-neutral-500">MQTT Broker: Connected</span>
        </div>
      </div>
    </motion.div>
  );
}
