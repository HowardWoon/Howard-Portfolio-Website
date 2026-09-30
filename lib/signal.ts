/**
 * R21 SIGNAL KEY: one meaning per colour, shared by the marquees, Projects, Experience, Honours and The Build.
 * Rule for every future change: a pop colour is only used for the meaning below. If something has no meaning,
 * it stays white / paper / ink. Never use two signal colours for the same meaning, or one colour for two meanings.
 *   yellow  PODIUM      a placement or award that was won
 *   cyan    QUALIFIER   reached a finalist / qualifier stage
 *   orange  ACADEMIC    coursework, grades, university
 *   pink    LEADERSHIP  roles, mentoring, community
 *   lilac   AI          AI / agent systems
 *   mint    LIVE        shipped, deployed, operational, live links
 *   ink     INDUSTRY    work in industry (white text on it)
 *   blue    (interactive controls and links only, never a category)
 *   red     (alerts / hazards only, never a category)
 */
export type Signal = 'podium' | 'qualifier' | 'academic' | 'leadership' | 'ai' | 'live' | 'industry';

export const SIGNAL: Record<
  Signal,
  { label: string; meaning: string; fill: string; soft: string; hex: string; text?: string }
> = {
  podium: {
    label: 'PODIUM',
    meaning: 'Placement or award won',
    fill: 'bg-pop-yellow',
    soft: 'bg-[#FFF3C4]',
    hex: '#FFC700',
  },
  qualifier: {
    label: 'QUALIFIER',
    meaning: 'Finalist or qualifier',
    fill: 'bg-pop-cyan',
    soft: 'bg-[#D9FBFF]',
    hex: '#00E5FF',
  },
  academic: {
    label: 'ACADEMIC',
    meaning: 'Coursework, grades, university',
    fill: 'bg-pop-orange',
    soft: 'bg-[#FFE8C7]',
    hex: '#FF9F1C',
  },
  leadership: {
    label: 'LEADERSHIP',
    meaning: 'Roles, mentoring, community',
    fill: 'bg-pop-pink',
    soft: 'bg-[#FFE3F1]',
    hex: '#FF9ECF',
  },
  ai: { label: 'AI', meaning: 'AI and agent systems', fill: 'bg-pop-lilac', soft: 'bg-[#EEE9FF]', hex: '#B8A4FF' },
  live: {
    label: 'LIVE',
    meaning: 'Shipped, deployed, live',
    fill: 'bg-pop-mint',
    soft: 'bg-[#DCFAEC]',
    hex: '#3DDC97',
  },
  industry: {
    label: 'INDUSTRY',
    meaning: 'Work in industry',
    fill: 'bg-ink',
    soft: 'bg-[#EDEDED]',
    hex: '#0A0A0A',
    text: 'text-white',
  },
};
