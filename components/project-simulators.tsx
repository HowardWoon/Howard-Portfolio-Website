// components/project-simulators.tsx
'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, Cpu, Check, Terminal } from 'lucide-react';

// Demo 1: Slotify Graph & Priority Queue Simulator
export function SlotifySimulator() {
  const [allocatedSlot, setAllocatedSlot] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  const [stepLog, setStepLog] = useState<string[]>([]);

  const slots = [
    { id: 'A1', distance: 12, available: false },
    { id: 'A2', distance: 18, available: true },
    { id: 'B1', distance: 24, available: true },
    { id: 'B2', distance: 30, available: true },
  ];

  const handleRunDijkstra = () => {
    setComputing(true);
    setStepLog(['Ingesting entry node [GATE_01]...', 'Evaluating Graph Adjacency List...', 'Extracting min-distance available node from Min-Heap...']);
    setTimeout(() => {
      setAllocatedSlot('A2');
      setStepLog((prev) => [...prev, '✓ Optimal Slot Assigned: A2 (Weight: 18m, Congestion: 0.04)']);
      setComputing(false);
    }, 900);
  };

  const handleReset = () => {
    setAllocatedSlot(null);
    setStepLog([]);
  };

  return (
    <div className="mt-4 p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 text-left">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
          <Cpu className="w-3.5 h-3.5" /> Interactive Dijkstra & Min-Heap Router
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunDijkstra}
            disabled={computing || !!allocatedSlot}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-[11px] font-medium text-white transition-colors"
          >
            <Play className="w-3 h-3" /> {computing ? 'Routing...' : 'Route Vehicle'}
          </button>
          {allocatedSlot && (
            <button
              onClick={handleReset}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {slots.map((s) => (
          <div
            key={s.id}
            className={`p-2 text-center rounded border text-xs font-mono transition-all ${
              allocatedSlot === s.id
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 scale-105 shadow-md shadow-emerald-500/10'
                : s.available
                ? 'border-white/10 bg-white/5 text-slate-300'
                : 'border-rose-500/20 bg-rose-500/10 text-rose-400/60 opacity-60'
            }`}
          >
            <div className="font-bold">{s.id}</div>
            <div className="text-[10px] opacity-75">{s.available ? `${s.distance}m` : 'OCCUPIED'}</div>
          </div>
        ))}
      </div>

      {/* Terminal Log */}
      {stepLog.length > 0 && (
        <div className="p-2.5 rounded bg-black/60 font-mono text-[11px] text-slate-300 space-y-1">
          {stepLog.map((log, idx) => (
            <div key={idx} className={log.startsWith('✓') ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Demo 2: ZeroLag Agentic Intent Classifier
export function ZeroLagSimulator() {
  const [sampleInput, setSampleInput] = useState('We need 50 enterprise seats with custom SSO setup next quarter.');
  const [triageResult, setTriageResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const handleTriage = () => {
    setRunning(true);
    setTriageResult(null);
    setTimeout(() => {
      setTriageResult({
        intent: 'Enterprise Expansion (High Priority)',
        score: '98.4%',
        action: 'Dispatched Webhook to CRM & Sales Director',
      });
      setRunning(false);
    }, 800);
  };

  return (
    <div className="mt-4 p-4 rounded-xl border border-purple-500/20 bg-purple-950/20 text-left">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-mono text-purple-300">
          <Terminal className="w-3.5 h-3.5" /> Agentic Intent Triage
        </div>
        <button
          onClick={handleTriage}
          disabled={running}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-[11px] font-medium text-white transition-colors"
        >
          <Play className="w-3 h-3" /> {running ? 'Analyzing...' : 'Run Pipeline'}
        </button>
      </div>

      <input
        type="text"
        value={sampleInput}
        onChange={(e) => setSampleInput(e.target.value)}
        className="w-full px-2.5 py-1.5 rounded bg-black/50 border border-white/10 text-xs font-mono text-slate-200 mb-2.5 focus:outline-none focus:border-purple-400"
      />

      {triageResult && (
        <div className="p-2.5 rounded bg-black/60 font-mono text-[11px] space-y-1 text-slate-300 border border-purple-500/20">
          <div><span className="text-purple-400">Classified Intent:</span> {triageResult.intent} ({triageResult.score})</div>
          <div className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> {triageResult.action}</div>
        </div>
      )}
    </div>
  );
}
