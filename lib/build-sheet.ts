import type { Signal } from '@/lib/signal';

// R83 Build Sheet: four facts from this page, each a link to the section that proves it. tests/r83 counts them again
// from the Projects, Honours and Experience sections, so a value cannot drift from the page.
export const LEDGER: { value: string; from: string; label: string; note: string; signal?: Signal; href: string }[] = [
  {
    value: '4.00',
    from: '0.00',
    label: 'CGPA',
    note: "Dean's Honours List, Universiti Malaya",
    signal: 'academic',
    href: '#honors',
  },
  { value: '07', from: '00', label: 'Projects built', note: 'Agents, escrow, ML, IoT', href: '#projects' },
  {
    value: '05',
    from: '00',
    label: 'Podiums in 2026',
    note: 'Supervity, MUBA, DOSM, UM Game Jam, Water Nexus',
    signal: 'podium',
    href: '#honors',
  },
  {
    value: '03',
    from: '00',
    label: 'Finance & lead roles',
    note: 'KRAIBURG TPE, PEKOM, KMNS PAL',
    signal: 'leadership',
    href: '#experience',
  },
];
