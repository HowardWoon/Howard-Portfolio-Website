/**
 * R83 Victor's Ledger (owner: "update ... all every achievements in this whole scrolling"): every honour in the Honours
 * section, in its order, with its own callout value and issuer. tests/r83 checks each issuer against the Honours data,
 * so a new honour must be added here too (.agents/rules/50-content-updates.md D2).
 * Colour = SIGNAL: yellow podium, cyan qualifier, orange academic; the participation entry stays white.
 */
export const LEDGER: { value: string; issuer: string; fill: string }[] = [
  { value: '2nd', issuer: 'Supervity AutoPilot Asia Hackathon 2026', fill: 'bg-pop-yellow' },
  { value: '3rd', issuer: 'MUBA Blockchain Hackathon 2026', fill: 'bg-pop-yellow' },
  { value: '#1', issuer: 'UM Game Jam 2026 (PEKOM)', fill: 'bg-pop-yellow' },
  { value: 'Top 5', issuer: 'DOSM Datathon 2026', fill: 'bg-pop-yellow' },
  { value: '1st', issuer: 'Water Nexus Symposium 2026', fill: 'bg-pop-yellow' },
  { value: 'Top 15', issuer: 'UM Technothon 2026', fill: 'bg-pop-cyan' },
  { value: 'Gold', issuer: 'Hari Inovasi PPAL 4.0 (Kebangsaan)', fill: 'bg-pop-yellow' },
  { value: 'Gold', issuer: 'Chemcreative-Innovation (Digital Learning)', fill: 'bg-pop-yellow' },
  { value: 'Silver', issuer: 'Simposium Peer Assisted Learning (PAL) KPM', fill: 'bg-pop-yellow' },
  { value: '4.00', issuer: "Dean's Honours List, Universiti Malaya", fill: 'bg-pop-orange' },
  { value: '4.00', issuer: 'Kolej Matrikulasi Negeri Sembilan', fill: 'bg-pop-orange' },
  { value: 'Qual', issuer: 'Varsity Hackathon (V Hack) 2026', fill: 'bg-pop-cyan' },
  { value: '1st Yr', issuer: 'UMSIC 2025 (PEKOM)', fill: 'bg-white' },
];
