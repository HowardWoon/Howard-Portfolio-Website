// components/project-simulators.tsx
'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, Cpu, Check, Terminal, Activity, Zap } from 'lucide-react';

// 1. Slotify: Dijkstra Pathfinding & Min-Heap Slot Allocation
export function SlotifySimulator() {
  const [allocatedSlot, setAllocatedSlot] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const slots = [
    { id: 'A1', dist: '12m', free: false },
    { id: 'A2', dist: '18m', free: true },
    { id: 'B1', dist: '24m', free: true },
    { id: 'B2', dist: '31m', free: true },
  ];

  const runAllocation = () => {
    setComputing(true);
    setLogs(['[GATE_01] Vehicle detected. Building adjacency graph...', 'Parsing Min-Heap for lowest distance unreserved node...']);
    setTimeout(() => {
      setAllocatedSlot('A2');
      setLogs((prev) => [...prev, '✓ Assigned Slot: A2 (Weight: 18m | Congestion: 0.04)']);
      setComputing(false);
    }, 700);
  };

  const reset = () => {
    setAllocatedSlot(null);
    setLogs([]);
  };

  return (
    <div className="my-3 p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 text-left">
      <div className="flex items-center justify-between mb-2.5">
        <span className="flex items-center gap-1.5 text-xs font-mono text-indigo-300">
          <Cpu className="w-3.5 h-3.5" /> Dijkstra & Min-Heap Allocator
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={runAllocation}
            disabled={computing || !!allocatedSlot}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-[11px] font-medium text-white transition-colors"
          >
            <Play className="w-3 h-3" /> {computing ? 'Computing...' : 'Run Router'}
          </button>
          {allocatedSlot && (
            <button onClick={reset} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white">
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-2.5">
        {slots.map((s) => (
          <div
            key={s.id}
            className={`p-2 text-center rounded border text-xs font-mono transition-all ${
              allocatedSlot === s.id
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold scale-105 shadow-sm'
                : s.free
                ? 'border-white/10 bg-white/5 text-slate-300'
                : 'border-rose-500/20 bg-rose-500/10 text-rose-400/60 opacity-60'
            }`}
          >
            <div>{s.id}</div>
            <div className="text-[10px] opacity-75">{s.free ? s.dist : 'BUSY'}</div>
          </div>
        ))}
      </div>

      {logs.length > 0 && (
        <div className="p-2 rounded bg-black/60 font-mono text-[11px] space-y-0.5 text-slate-300">
          {logs.map((l, i) => (
            <div key={i} className={l.startsWith('✓') ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 2. ZeroLag: Agentic Sales Intent Classifier
export function ZeroLagSimulator() {
  const [prompt, setPrompt] = useState('We need 50 enterprise seats with custom API webhook integration.');
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const runAgent = () => {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        intent: 'Enterprise Expansion (Tier 1)',
        confidence: '98.6%',
        action: 'Dispatched Webhook to CRM Pipeline',
      });
      setRunning(false);
    }, 700);
  };

  return (
    <div className="my-3 p-3.5 rounded-xl border border-purple-500/20 bg-purple-950/20 text-left">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-xs font-mono text-purple-300">
          <Terminal className="w-3.5 h-3.5" /> 5-Operator Agentic Pipeline
        </span>
        <button
          onClick={runAgent}
          disabled={running}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-[11px] font-medium text-white transition-colors"
        >
          <Play className="w-3 h-3" /> {running ? 'Triaging...' : 'Run Pipeline'}
        </button>
      </div>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full px-2.5 py-1.5 rounded bg-black/50 border border-white/10 text-xs font-mono text-slate-200 mb-2 focus:outline-none focus:border-purple-400"
      />

      {result && (
        <div className="p-2 rounded bg-black/60 font-mono text-[11px] space-y-1 text-slate-300 border border-purple-500/20">
          <div><span className="text-purple-400">Classified Intent:</span> {result.intent} ({result.confidence})</div>
          <div className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> {result.action}</div>
        </div>
      )}
    </div>
  );
}

// 3. BILAHUJAN: Flood Level Telemetry Simulation
export function BLAHujanSimulator() {
  const [level, setLevel] = useState(2.1);
  const status = level > 3.5 ? 'DANGER' : level > 2.8 ? 'WARNING' : 'NORMAL';

  return (
    <div className="my-3 p-3.5 rounded-xl border border-blue-500/20 bg-blue-950/20 text-left">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-xs font-mono text-blue-300">
          <Activity className="w-3.5 h-3.5" /> River Basin Telemetry (Kajang Station)
        </span>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
          status === 'DANGER' ? 'bg-rose-500/20 text-rose-400' : status === 'WARNING' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
        }`}>
          {status} ({level.toFixed(1)}m)
        </span>
      </div>

      <input
        type="range"
        min="1.0"
        max="4.5"
        step="0.1"
        value={level}
        onChange={(e) => setLevel(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-2"
      />

      <div className="text-[11px] font-mono text-slate-300">
        {status === 'DANGER' ? (
          <span className="text-rose-400">🚨 Automated SMS & Evacuation Route Dispatched to 1,200 residents.</span>
        ) : status === 'WARNING' ? (
          <span className="text-amber-400">⚠️ Monitoring telemetry rate: rising +0.3m/hr.</span>
        ) : (
          <span className="text-emerald-400">✓ Normal flow rate. Nearest relief shelter: 1.2km away.</span>
        )}
      </div>
    </div>
  );
}

// 4. Sensor X Sensei: IoT Energy Governance
export function SensorSenseiSimulator() {
  const [occupants, setOccupants] = useState(40);
  const powerKW = ((occupants * 0.15) + 1.2).toFixed(2);
  const co2Saved = (occupants * 0.42).toFixed(1);

  return (
    <div className="my-3 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-left">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-300">
          <Zap className="w-3.5 h-3.5" /> Smart Hall Telemetry (DK1 Auditorium)
        </span>
        <span className="text-xs font-mono text-emerald-400 font-bold">{powerKW} kW</span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <label className="text-[11px] font-mono text-slate-400">Occupancy: {occupants} people</label>
        <input
          type="range"
          min="0"
          max="120"
          value={occupants}
          onChange={(e) => setOccupants(parseInt(e.target.value, 10))}
          className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <div className="text-[11px] font-mono text-slate-300 flex justify-between">
        <span>HVAC Load: {occupants === 0 ? 'Eco Sleep' : `${Math.round(occupants * 0.8)}% Active`}</span>
        <span className="text-emerald-400 font-medium">CO₂ Reduction: {co2Saved} kg/day</span>
      </div>
    </div>
  );
}
