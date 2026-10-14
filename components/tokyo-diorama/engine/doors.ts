/**
 * R73: where each section of the site (lib/sections.ts) has its door in the Tokyo street. Kept free of three.js so the
 * section component can read it without pulling the 3D engine into the page bundle. A section with no door here simply
 * has no sign in the street; its label and link always come from the registry.
 */
/** where each section's door stands in the street (x, z), how close counts as "at the door", and a raised step */
export const SECTION_DOORS: Record<string, { x: number; z: number; radius: number; lift?: number }> = {
  about: { x: -17.4, z: -8.6, radius: 1.9 },
  projects: { x: -5.5, z: -7.7, radius: 2.0 },
  experience: { x: -17, z: 5.9, radius: 2.0 },
  honors: { x: 18.2, z: -12.6, radius: 2.0, lift: 0.4 },
  contact: { x: 12.9, z: 7.4, radius: 1.7 },
};
/** the Japanese line under each sign */
export const SECTION_JP: Record<string, string> = {
  about: '自己紹介',
  projects: 'プロジェクト',
  experience: '経験',
  honors: '受賞',
  contact: '連絡',
};
