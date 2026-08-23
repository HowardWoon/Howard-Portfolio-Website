'use client';

import React, { useState } from 'react';
import { Cpu, Terminal, Activity, Zap, Play, RotateCcw, Check } from 'lucide-react';

// 1. Slotify: Dijkstra & Min-Heap Router
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
    setLogs(['[GATE_01] Ingesting vehicle arrival...', 'Evaluating Adjacency Graph...', 'Polling Min-Heap for minimum-weight available node...']);
    setTimeout(() => {
      setAllocatedSlot('A2');
      setLogs((prev) => [...prev, '✓ Assigned Slot: A2 (Weight: 18m | Route Cost: 0.04s)']);
      setComputing(false);
    }, 700);
  };

  const reset = () => {
    setAllocatedSlot(null);
    setLogs([]);
  };

  return (
    <div className="my-3 p-4 rounded-[16px] border border-black/10 bg-white text-left">
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-xs font-mono text-slate-600">
          <Cpu className="w-4 h-4" /> Dijkstra & Min-Heap Router
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={runAllocation}
            disabled={computing || !!allocatedSlot}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-slate-100 disabled:opacity-50 text-xs font-mono text-slate-900 transition-colors shadow-sm" title="Click to simulate Dijkstra routing"
          >
            <Play className="w-3 h-3" /> {computing ? 'Routing...' : 'Route Vehicle'} <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span></span>
          </button>
          {allocatedSlot && (
            <button onClick={reset} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {slots.map((s) => (
          <div
            key={s.id}
            className={`p-3 text-center rounded-xl border text-xs font-mono transition-all ${
              allocatedSlot === s.id
                ? 'border-success text-emerald-600 bg-success/5 font-bold scale-[1.02]'
                : s.free
                ? 'border-black/10 text-slate-500'
                : 'border-black/5 text-slate-400/50 opacity-60'
            }`}
          >
            <div className="text-sm mb-1">{s.id}</div>
            <div className="text-[10px] opacity-75">{s.free ? s.dist : 'OCCUPIED'}</div>
          </div>
        ))}
      </div>

      {logs.length > 0 && (
        <div className="p-3 rounded-xl border border-black/10 bg-white font-mono text-xs space-y-1.5">
          {logs.map((l, i) => (
            <div key={i} className={l.startsWith('✓') ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>
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
  const [prompt, setPrompt] = useState('Need 50 enterprise seats with custom API integration next quarter.');
  const [result, setResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
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
    <div className="my-3 p-4 rounded-[16px] border border-black/10 bg-white text-left">
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-xs font-mono text-slate-600">
          <Terminal className="w-4 h-4" /> 5-Operator Agentic Pipeline
        </span>
        <button
          onClick={runAgent}
          disabled={running}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-slate-100 disabled:opacity-50 text-xs font-mono text-slate-900 transition-colors"
        >
          <Play className="w-3 h-3" /> {running ? 'Triaging...' : 'Run Pipeline'}
        </button>
      </div>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-mono text-slate-900 mb-4 focus:outline-none focus:border-black/20 transition-all"
      />

      {result && (
        <div className="p-3 rounded-xl border border-black/10 bg-white font-mono text-xs space-y-2">
          <div><span className="text-slate-600">Classified Intent:</span> <span className="text-slate-900">{result.intent}</span> <span className="text-slate-500">({result.confidence})</span></div>
          <div className="text-emerald-600 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> {result.action}</div>
        </div>
      )}
    </div>
  );
}

// 3. BILAHUJAN: Flood Level Telemetry Simulation
export function BLAHujanSimulator() {
  const [level, setLevel] = useState(2.2);
  const status = level > 3.5 ? 'DANGER' : level > 2.8 ? 'WARNING' : 'NORMAL';

  return (
    <div className="my-3 p-4 rounded-[16px] border border-black/10 bg-white text-left">
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-xs font-mono text-slate-600">
          <Activity className="w-4 h-4" /> River Basin Telemetry (Kajang Station)
        </span>
        <span className={`text-xs font-mono font-bold ${
          status === 'DANGER' ? 'text-rose-600' : status === 'WARNING' ? 'text-indigo-600' : 'text-emerald-600'
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
        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-4"
      />

      <div className="text-xs font-mono">
        {status === 'DANGER' ? (
          <span className="text-rose-600">⚠️ Automated SMS & Evacuation Route Dispatched to 1,200 residents.</span>
        ) : status === 'WARNING' ? (
          <span className="text-indigo-600">⚠️ Monitoring telemetry rate: rising +0.3m/hr.</span>
        ) : (
          <span className="text-emerald-600">✓ Normal flow rate. Nearest relief shelter: 1.2km away.</span>
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
    <div className="my-3 p-4 rounded-[16px] border border-black/10 bg-white text-left">
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-xs font-mono text-slate-600">
          <Zap className="w-4 h-4" /> Smart Hall Telemetry (DK1 Auditorium)
        </span>
        <span className="text-xs font-mono text-slate-900 font-bold">{powerKW} kW</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <label className="text-xs font-mono text-slate-500 shrink-0 w-32">Occupancy: {occupants}</label>
        <input
          type="range"
          min="0"
          max="120"
          value={occupants}
          onChange={(e) => setOccupants(parseInt(e.target.value, 10))}
          className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
        />
      </div>

      <div className="text-xs font-mono text-slate-500 flex justify-between pt-4 border-t border-black/10">
        <span>HVAC Load: {occupants === 0 ? 'Eco Sleep' : `${Math.round(occupants * 0.8)}% Active`}</span>
        <span className="text-slate-600 font-medium">CO₂ Reduction: {co2Saved} kg/day</span>
      </div>
    </div>
  );
}
