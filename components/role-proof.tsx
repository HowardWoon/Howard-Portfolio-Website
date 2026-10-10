'use client';

import { useState } from 'react';
import { ArrowUpRight, Route } from 'lucide-react';
import { startTrail } from '@/lib/interaction-store';

/**
 * R23 Skill-to-proof (lecturer advice #2): each Target Role pill opens a "proof of work" card listing the projects
 * and roles already on this site that prove it, with a jump link. Hover / focus previews it (mouse, keyboard); a
 * click / tap pins it (touch). Shown under the pills (the Profile window clips overflow, and an inline panel works
 * on every device and for screen readers). Every line below is a fact that already appears on the page.
 */
/**
 * R37 Role-to-Proof Circuit (lecturer): the Trace key on a role's proof card starts the existing Evidence Trail over
 * exactly these proof items, in this order, and the shared HUD steps through them (prev / next / clear, J / K, Esc).
 * `stop` = the trail stop: a project card ("#project-x" -> "x") or, where the line names an Experience role, that
 * card ("exp:<id>", experience-section data-folder). Only relationships the proof text itself states.
 */
type Proof = { text: string; href: string; stop?: string };
const stopOf = (p: Proof) => p.stop ?? p.href.replace('#project-', '');

const PROOF: Record<string, Proof[]> = {
  'Distributed Backends': [
    { text: 'SLOTIFY · Spring Boot backend, 7 custom data structures', href: '#project-slotify' },
    { text: 'ZEROLAG · FastAPI orchestration with PostgreSQL write-backs', href: '#project-zerolag' },
  ],
  'Java 21 / Spring Boot': [
    { text: 'SLOTIFY · Java 21 · Spring Boot · Dijkstra routing', href: '#project-slotify' },
    { text: 'KMNS PAL · Java & Python OOP tutoring, 100+ students', href: '#experience', stop: 'exp:kmns' },
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
    {
      text: 'PEKOM · Finance Lead · RM 50,000+ budget · 100% audit cleared',
      href: '#experience',
      stop: 'exp:pekom',
    },
    { text: 'KRAIBURG · SAP ERP · 100% SST cleared', href: '#experience', stop: 'exp:kraiburg' },
  ],
};

export function RoleProof({ roles, fillFor }: { roles: string[]; fillFor: (role: string) => string }) {
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const shown = hover ?? pinned;
  const proof = shown ? PROOF[shown] : undefined;

  return (
    // R37: the mouse may travel from a role chip into its proof card (to the Trace key) without the card closing.
    // R38: keyboard too - the card closes only when focus leaves the whole widget (it used to close on the chip's
    // blur, so Tab from a chip dropped focus to <body> and the Trace key / proof links were unreachable); the mouse
    // leaving does not close a card that holds the keyboard focus
    <div
      className="space-y-3"
      onMouseLeave={(e) => {
        if (!e.currentTarget.contains(document.activeElement)) setHover(null);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHover(null);
      }}
    >
      {/* R54: equal columns (the keys used to wrap 2 / 2 / 1 at three different widths); an odd last key spans the row */}
      <div className="grid grid-cols-1 gap-2 min-[440px]:grid-cols-2">
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
              onClick={() => setPinned((p) => (p === role ? null : role))}
              className={`nb-chip min-h-[44px] w-full justify-center text-center cursor-pointer transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-brutal-xs min-[440px]:last:odd:col-span-2 ${
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
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-mono text-xs font-extrabold uppercase tracking-[0.14em] text-ink">
                Proof of work // {shown}
              </p>
              {/* R37 Trace key: icon only (the HUD's Evidence Trail icon), named like the About "Trace <skill>" keys */}
              <button
                type="button"
                data-trace-role={shown}
                aria-label={`Trace ${shown}`}
                title={`Trace ${shown}`}
                onClick={() => {
                  const stops = [...new Set(proof.map(stopOf))];
                  startTrail(`role:${shown}`, shown!, stops);
                }}
                className="nb-key grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-ink bg-white text-pop-blue"
              >
                <Route className="h-4 w-4" strokeWidth={2.75} aria-hidden />
              </button>
            </div>
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
          <p className="font-mono text-xs font-semibold text-ink-muted">
            Point at or tap a role to see the projects that prove it.
          </p>
        )}
      </div>
    </div>
  );
}
