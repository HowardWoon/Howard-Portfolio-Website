import { RouteWipeClear, WipeLink } from '@/components/fx/route-wipe';
import React from 'react';
import type { Metadata } from 'next';
import { ZeroLagSimulator, BilahujanSimulator, SensorXSimulator } from '@/components/project-simulators';
import { PowerOn } from '@/components/fx/power-on';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Only the three pre-rendered simulators exist; anything else is a real 404
export const dynamicParams = false;

const SIMULATORS = [
  { type: 'agentic', label: 'ZeroLag' },
  { type: 'flood', label: 'BILAHUJAN' },
  { type: 'energy', label: 'Sensor X Sensei' },
] as const;

export async function generateStaticParams() {
  return SIMULATORS.map(({ type }) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const sim = SIMULATORS.find((s) => s.type === type);
  return {
    title: sim ? `${sim.label} Simulator // Howard Woon` : 'Simulator // Howard Woon',
    // own canonical URL (the root layout's canonical "/" told Google these pages were duplicates of the homepage)
    alternates: { canonical: `/simulators/${type}` },
    openGraph: {
      url: `/simulators/${type}`,
      title: sim ? `${sim.label} Simulator // Howard Woon` : 'Simulator // Howard Woon',
    },
  };
}

export default async function SimulatorPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!SIMULATORS.some((s) => s.type === type)) notFound();

  return (
    <div className="min-h-screen-safe bg-paper-cream bg-dots text-ink flex flex-col px-4 xs:px-5 sm:px-12 pt-[max(1.5rem,var(--safe-top))] pb-[max(2rem,var(--safe-bottom))] sm:py-12 font-sans">
      <RouteWipeClear />
      {/* Top Nav */}
      <header className="mb-8 sm:mb-10 flex flex-wrap items-center justify-between gap-3 max-w-6xl mx-auto w-full">
        <WipeLink href="/#projects" className="nb-btn nb-btn-white px-4 py-2.5">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.75} />
          <span>Return to Portfolio</span>
        </WipeLink>
        <span className="nb-tag bg-pop-yellow">ISOLATED SIMULATION ENVIRONMENT</span>
      </header>

      {/* Simulator switcher — /simulators/flood and /simulators/energy were previously unreachable */}
      <nav aria-label="Simulators" className="max-w-6xl mx-auto w-full mb-6 flex flex-wrap gap-2">
        {SIMULATORS.map((s) => {
          const active = s.type === type;
          return (
            <Link
              key={s.type}
              href={`/simulators/${s.type}`}
              aria-current={active ? 'page' : undefined}
              className={`px-4 py-2.5 rounded-2xl border-3 border-ink font-mono text-xs font-extrabold uppercase tracking-[0.08em] transition-all ${
                active
                  ? 'bg-ink text-white shadow-clay-pressed'
                  : 'bg-white text-ink shadow-brutal-xs hover:-translate-y-0.5 hover:shadow-brutal-sm'
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      {/* Main Simulator Area — a dark "device screen" inside the light page (skeuomorphic) */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex items-start justify-center">
        <PowerOn className="w-full bg-[#0E121B] text-white rounded-[24px] sm:rounded-[32px] border-3 border-ink p-4 xs:p-6 sm:p-12 shadow-brutal-lg sm:shadow-brutal-xl relative overflow-hidden">
          <div className="relative z-10 w-full">
            {type === 'agentic' && <ZeroLagSimulator />}
            {type === 'flood' && <BilahujanSimulator />}
            {type === 'energy' && <SensorXSimulator />}
          </div>
        </PowerOn>
      </main>
    </div>
  );
}
