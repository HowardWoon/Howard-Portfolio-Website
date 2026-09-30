'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

/**
 * R23 Skill-to-proof (lecturer advice #2): each Target Role pill opens a "proof of work" card listing the projects
 * and roles already on this site that prove it, with a jump link. Hover / focus previews it (mouse, keyboard); a
 * click / tap pins it (touch). Shown under the pills (the Profile window clips overflow, and an inline panel works
 * on every device and for screen readers). Every line below is a fact that already appears on the page.
 */
type Proof = { text: string; href: string };

const PROOF: Record<string, Proof[]> = {
  'Distributed Backends': [
    { text: 'SLOTIFY · Spring Boot backend, 7 custom data structures', href: '#project-slotify' },
    { text: 'ZEROLAG · FastAPI orchestration with PostgreSQL write-backs', href: '#project-zerolag' },
  ],
  'Java 21 / Spring Boot': [
    { text: 'SLOTIFY · Java 21 · Spring Boot · Dijkstra routing', href: '#project-slotify' },
    { text: 'KMNS PAL · Java & Python OOP tutoring, 100+ students', href: '#experience' },
  ],
  'Agentic AI Pipelines': [
    { text: 'ZEROLAG · 2nd Place, Supervity Asia Hackathon · 5 agent operators', href: '#project-zerolag' },
    { text: 'BILAHUJAN · Gemini command agent · 7 MCP tools', href: '#project-bilahujan' },
    { text: 'PROOFPAY · Gonka Router AI evidence verification', href: '#project-proofpay' },
  ],
  'High-Throughput APIs': [
    { text: 'ZEROLAG · sub-second lead scoring pipelines', href: '#project-zerolag' },
    { text: 'SENSOR X SENSEI · live MQTT / WebSockets telemetry', href: '#project-sensor-x' },
  ],
  'Fiscal Governance': [
    { text: 'PEKOM · Finance Lead · RM 50,000+ budget · 100% audit cleared', href: '#experience' },
    { text: 'KRAIBURG · SAP ERP · 100% SST cleared', href: '#experience' },
  ],
};

export function RoleProof({ roles, fillFor }: { roles: string[]; fillFor: (role: string) => string }) {
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const shown = hover ?? pinned;
  const proof = shown ? PROOF[shown] : undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" onMouseLeave={() => setHover(null)}>
        {roles.map((role) => {
          const on = shown === role;
          return (
            <button
              key={role}
              type="button"
              aria-expanded={on}
              aria-controls="role-proof"
              onMouseEnter={() => setHover(role)}
              onFocus={() => setHover(role)}
              onBlur={() => setHover(null)}
              onClick={() => setPinned((p) => (p === role ? null : role))}
              className={`nb-chip min-h-[40px] cursor-pointer transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-brutal-xs ${
                on ? '-translate-y-0.5 shadow-brutal-xs' : ''
              } ${fillFor(role)}`}
            >
              {role}
            </button>
          );
        })}
      </div>
      <div id="role-proof" role="region" aria-live="polite" aria-label="Proof of work">
        {proof ? (
          <div className="rounded-2xl border-3 border-ink bg-white p-3 shadow-brutal-sm">
            <p className="mb-2 font-mono text-[0.66rem] font-extrabold uppercase tracking-[0.14em] text-ink">
              Proof of work // {shown}
            </p>
            <ul className="space-y-1.5">
              {proof.map((p) => (
                <li key={p.text}>
                  <a
                    href={p.href}
                    className="group flex items-start justify-between gap-2 rounded-lg px-1 py-1 font-mono text-xs font-bold text-ink-soft hover:bg-[#E3E8FF] hover:text-ink"
                  >
                    <span>{p.text}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-pop-blue" strokeWidth={2.75} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="font-mono text-[0.7rem] font-semibold text-ink-muted">
            Point at or tap a role to see the projects that prove it.
          </p>
        )}
      </div>
    </div>
  );
}
