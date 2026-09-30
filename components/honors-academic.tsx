'use client';

import React, { useState } from 'react';
import { usePrinting } from '@/lib/use-printing';
import { Award, BookOpen, ChevronDown, Crown, Medal, Users } from 'lucide-react';

/* -------------------------------------------------------------------------------------------------
 * Academic Distinctions: structured "report card" blocks used inside the two emerald honour cards.
 * Same words as before; only the layout changed (data moved into arrays, rendered by 3 components).
 * ------------------------------------------------------------------------------------------------- */

type Grade = 'A+' | 'A';
type Course = { code: string; name: string; grade: Grade };
type Semester = { id: string; label: string; gpa: string; courses: Course[] };

export const UM_TRANSCRIPT: Semester[] = [
  {
    id: 'sem2',
    label: 'Semester 2 Core',
    gpa: '4.00',
    courses: [
      { code: 'WIA1006', name: 'Machine Learning', grade: 'A+' },
      { code: 'WIA1002', name: 'Data Structure', grade: 'A+' },
      { code: 'WIA1003', name: 'Computer System Architecture', grade: 'A' },
      { code: 'WIA1005', name: 'Network Technology Foundation', grade: 'A' },
      { code: 'GIG1012', name: 'Philosophy and Current Issues', grade: 'A+' },
      { code: 'GLT1025', name: 'Effective Oral Communication', grade: 'A+' },
    ],
  },
  {
    id: 'sem1',
    label: 'Semester 1 Core',
    gpa: '4.00',
    courses: [
      { code: 'WIX1002', name: 'Fundamentals of Programming', grade: 'A+' },
      { code: 'WIA2010', name: 'Human Computer Interaction', grade: 'A' },
      { code: 'WIX1001', name: 'Computing Mathematics I', grade: 'A' },
      { code: 'WIX1003', name: 'Computer Systems and Organization', grade: 'A' },
      { code: 'GIG1003', name: 'Basic Entrepreneurship Enculturation', grade: 'A+' },
      { code: 'GLT1024', name: 'Proficiency in English III', grade: 'A' },
    ],
  },
];

type Result = 'GOLD' | 'BRONZE' | 'FINALIST' | 'MOE' | 'PARTICIPANT';
type Entry = { name: string; scope: 'Negeri' | 'Kebangsaan'; result: Result };

export const KMNS_RESULTS: Entry[] = [
  { name: 'SUKED Ping Pong Coach', scope: 'Negeri', result: 'GOLD' },
  { name: 'Matrix eXtra Quiz Challenge', scope: 'Kebangsaan', result: 'BRONZE' },
  { name: 'SUKED Tenis Lelaki', scope: 'Negeri', result: 'BRONZE' },
  { name: 'IMONST 1 Math Olympiad', scope: 'Kebangsaan', result: 'FINALIST' },
  { name: 'Kursus Kepimpinan Generasi Madani', scope: 'Kebangsaan', result: 'MOE' },
  { name: 'Bicara Eksekutif Kenegaraan Madani', scope: 'Kebangsaan', result: 'MOE' },
  { name: 'Pertandingan Komik STEM 2024', scope: 'Negeri', result: 'PARTICIPANT' },
  { name: 'Pertandingan Poster AI', scope: 'Negeri', result: 'PARTICIPANT' },
  { name: 'Konvensyen Profesional KMNS 2024', scope: 'Negeri', result: 'PARTICIPANT' },
];

export const KMNS_ROLES: { role: string; org: string; lead?: boolean }[] = [
  { role: 'CHAIRMAN', org: 'Sukan Kampung', lead: true },
  { role: 'VICE PRESIDENT', org: 'Peer Assisted Learning (PAL)', lead: true },
  { role: 'MENTOR', org: 'Maths Support System (MSS)' },
  { role: 'FACILITATOR', org: 'Program Chemcare Sem 2' },
  { role: 'FACILITATOR', org: 'Gemersik Cakna x Pesta Tanglung' },
];

/* ---------------------------------------------- shared shell */
function Panel({
  title,
  meta,
  icon: Icon,
  children,
}: {
  title: string;
  meta: React.ReactNode;
  icon: typeof Award;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border-3 border-ink bg-white shadow-brutal-sm overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2.5 bg-pop-orange border-b-3 border-ink">
        <h4 className="flex items-center gap-2 min-w-0 font-mono text-xs font-extrabold uppercase tracking-[0.1em] text-ink">
          <Icon className="w-4 h-4 shrink-0" strokeWidth={2.75} aria-hidden />
          <span className="[overflow-wrap:anywhere]">{title}</span>
        </h4>
        <div className="shrink-0">{meta}</div>
      </header>
      {children}
    </section>
  );
}

/* ---------------------------------------------- 1. transcript (one panel, one table per semester) */
export function Transcript({ semesters = UM_TRANSCRIPT }: { semesters?: Semester[] }) {
  const cgpa = semesters[0]?.gpa ?? '';
  return (
    <Panel
      title="Transcript"
      icon={BookOpen}
      meta={
        <span className="inline-flex items-center rounded-md border-2 border-ink bg-white px-2 py-0.5 font-mono text-[0.7rem] font-extrabold text-ink">
          CGPA: {cgpa}
        </span>
      }
    >
      <div className="divide-y-3 divide-ink">
        {semesters.map((sem) => {
          const plus = sem.courses.filter((c) => c.grade === 'A+').length;
          return (
            <div key={sem.id} className="px-3 pb-2 pt-3">
              <div className="flex items-center justify-between gap-2 px-1 pb-1.5">
                <h5 className="font-mono text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-ink">
                  {sem.label}
                </h5>
                <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                  GPA: {sem.gpa} · {plus}× A+
                </span>
              </div>
              <ul className="divide-y-2 divide-dashed divide-ink/15">
                {sem.courses.map((c) => (
                  <li
                    key={c.code}
                    className="grid grid-cols-[1fr_auto] min-[360px]:grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1.5 py-2"
                  >
                    <span className="col-span-2 min-[360px]:col-span-1 justify-self-start rounded-md border-2 border-ink bg-paper-deep px-1.5 py-0.5 font-mono text-[0.72rem] font-extrabold tracking-[0.02em] text-ink tabular-nums">
                      {c.code}
                    </span>
                    <span className="min-w-0 text-sm font-sans font-semibold leading-snug text-ink-soft [overflow-wrap:break-word]">
                      {c.name}
                    </span>
                    <span
                      className={`grid h-7 w-9 place-items-center rounded-lg border-2 border-ink font-mono text-xs font-extrabold text-ink ${
                        c.grade === 'A+' ? 'bg-[#FFE8C7] shadow-brutal-xs' : 'bg-white'
                      }`}
                    >
                      <span className="sr-only">Grade </span>
                      {c.grade}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ---------------------------------------------- 2. results board (podium + list) */
const RESULT_STYLE: Record<Result, { chip: string; label: string }> = {
  GOLD: { chip: 'bg-pop-yellow', label: 'GOLD' },
  BRONZE: { chip: 'bg-[#E0A86B]', label: 'BRONZE' }, // the metal, not ACADEMIC orange
  FINALIST: { chip: 'bg-pop-cyan', label: 'FINALIST' }, // QUALIFIER
  MOE: { chip: 'bg-white', label: 'MOE' },
  PARTICIPANT: { chip: 'bg-white border-dashed', label: 'PARTICIPANT' },
};

function ScopeTag({ scope }: { scope: Entry['scope'] }) {
  return (
    <span
      className={`inline-flex rounded border-[1.5px] border-ink px-1 font-mono text-[0.7rem] font-extrabold uppercase tracking-[0.06em] ${
        scope === 'Kebangsaan' ? 'bg-ink text-white' : 'bg-white text-ink'
      }`}
    >
      {scope}
    </span>
  );
}

export function ResultsBoard({
  entries = KMNS_RESULTS,
  collapsedCount = 4,
}: {
  entries?: Entry[];
  collapsedCount?: number;
}) {
  const podium = entries.filter((e) => e.result === 'GOLD' || e.result === 'BRONZE');
  const rest = entries.filter((e) => e.result !== 'GOLD' && e.result !== 'BRONZE');
  const [open, setOpen] = useState(false);
  const printing = usePrinting(); // FX-70: the full list prints
  const shown = open || printing ? rest : rest.slice(0, collapsedCount);

  return (
    <Panel
      title="National & State Excellence"
      icon={Medal}
      meta={<span className="font-mono text-[0.7rem] font-extrabold text-ink">KMNS 2024/2025</span>}
    >
      {/* podium tiles */}
      <ul className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2 p-3 pb-2">
        {podium.map((e) => (
          <li
            key={e.name}
            className={`flex flex-col justify-between gap-2 rounded-xl border-2 border-ink p-2.5 shadow-brutal-xs ${RESULT_STYLE[e.result].chip}`}
          >
            <span className="inline-flex items-center gap-1 font-mono text-[0.7rem] font-extrabold tracking-[0.1em] text-ink">
              <Award className="w-3.5 h-3.5" strokeWidth={2.75} aria-hidden />
              {RESULT_STYLE[e.result].label}
            </span>
            <span className="text-[0.82rem] font-sans font-bold leading-snug text-ink [overflow-wrap:break-word]">
              {e.name}
            </span>
            <span className="self-start">
              <ScopeTag scope={e.scope} />
            </span>
          </li>
        ))}
      </ul>

      {/* everything else */}
      <ul data-results-rest className="mx-3 divide-y-2 divide-dashed divide-ink/15 border-t-2 border-ink/15">
        {shown.map((e) => (
          <li key={e.name} className="grid grid-cols-[1fr_auto] items-center gap-3 py-2">
            <span className="min-w-0">
              <span className="block text-sm font-sans font-semibold leading-snug text-ink-soft [overflow-wrap:break-word]">
                {e.name}
              </span>
              <ScopeTag scope={e.scope} />
            </span>
            <span
              className={`rounded-md border-2 border-ink px-1.5 py-0.5 font-mono text-[0.7rem] font-extrabold tracking-[0.06em] text-ink ${RESULT_STYLE[e.result].chip}`}
            >
              {RESULT_STYLE[e.result].label}
            </span>
          </li>
        ))}
      </ul>
      {rest.length > collapsedCount ? (
        <div className="p-3 pt-2 print:hidden">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="nb-chip nb-press min-h-[36px] [@media(pointer:coarse)]:min-h-[40px] w-full justify-center cursor-pointer font-extrabold"
          >
            {open ? 'SHOW LESS' : `SHOW ALL ${rest.length}`}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
              strokeWidth={3}
              aria-hidden
            />
          </button>
        </div>
      ) : (
        <div className="h-3" />
      )}
    </Panel>
  );
}

/* ---------------------------------------------- 3. roles grid */
export function RolesGrid({ roles = KMNS_ROLES }: { roles?: typeof KMNS_ROLES }) {
  return (
    <Panel
      title="Leadership & Mentorship Roles"
      icon={Users}
      meta={<span className="font-mono text-[0.7rem] font-extrabold text-ink">KEY POSITIONS</span>}
    >
      <ul className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2 p-3">
        {roles.map((r) => (
          <li
            key={r.org}
            className={`flex flex-col gap-1.5 rounded-xl border-2 border-ink p-2.5 ${r.lead ? 'bg-[#FFE3F1] shadow-brutal-xs' : 'bg-white'}`}
          >
            <span className="inline-flex items-center gap-1 self-start rounded-md border-2 border-ink bg-white px-1.5 py-0.5 font-mono text-[0.7rem] font-extrabold tracking-[0.08em] text-ink">
              {r.lead ? <Crown className="w-3 h-3" strokeWidth={3} aria-hidden /> : null}
              {r.role}
            </span>
            <span className="text-[0.82rem] font-sans font-semibold leading-snug text-ink-soft [overflow-wrap:break-word]">
              {r.org}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
