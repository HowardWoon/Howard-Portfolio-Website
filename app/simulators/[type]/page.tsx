import React from "react";
import { ZeroLagSimulator, BilahujanSimulator, SensorXSimulator } from "@/components/project-simulators";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  return [
    { type: 'agentic' },
    { type: 'flood' },
    { type: 'energy' }
  ];
}

export default async function SimulatorPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col p-6 sm:p-12 font-sans selection:bg-amber-500/30">
      
      {/* Top Nav */}
      <div className="mb-12 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-amber-400 transition-colors text-sm font-mono tracking-wider uppercase">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Portfolio</span>
        </Link>
        <span className="text-xs font-mono text-neutral-600 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">
          ISOLATED SIMULATION ENVIRONMENT
        </span>
      </div>

      {/* Main Simulator Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-center">
        <div className="w-full bg-[#0E121B] rounded-[32px] border border-white/10 p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 w-full">
            {type === 'agentic' && <ZeroLagSimulator />}
            {type === 'flood' && <BilahujanSimulator />}
            {type === 'energy' && <SensorXSimulator />}
          </div>
        </div>
      </main>
    </div>
  );
}
