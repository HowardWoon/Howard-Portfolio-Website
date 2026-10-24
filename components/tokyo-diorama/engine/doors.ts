/**
 * R73: where each section of the site (lib/sections.ts) has its door in the Tokyo street. Kept free of three.js so the
 * section component can read it without pulling the 3D engine into the page bundle. A section with no door here simply
 * has no sign in the street; its label and link always come from the registry.
 *
 * R85 (owner: "I want to walk INTO the door ... the door opens for me and glows, then I go in", "like Roblox"): every
 * door is a real doorway in a facade. `door` = the middle of the doorway ON the facade (metres, ground level `y`),
 * `face` = the way the facade looks (outward: N = -z, S = +z, E = +x, W = -x), `width` = the opening. Walking into the
 * open, glowing doorway enters the room (engine/portals.ts). `x` / `z` / `radius` = where the sign hangs and the old
 * "in reach" circle (kept for the signs, the E key and keyboard visitors).
 */
export type Face = 'N' | 'S' | 'E' | 'W';
export interface SectionDoor {
  x: number;
  z: number;
  radius: number;
  lift?: number;
  door: { x: number; z: number; y: number; face: Face; width: number; kind?: 'slide' | 'konbini' };
}
export const SECTION_DOORS: Record<string, SectionDoor> = {
  // the apartment 雨音ハイツ: its lobby door
  about: { x: -17.4, z: -8.3, radius: 1.9, door: { x: -17.4, z: -9.5, y: 0.15, face: 'S', width: 1.5 } },
  // the konbini: its own automatic doors are the way in
  projects: {
    x: -5.5,
    z: -7.4,
    radius: 2.0,
    door: { x: -5.5, z: -8.5, y: 0.15, face: 'S', width: 1.8, kind: 'konbini' },
  },
  // the izakaya 鳥よし: behind the noren
  experience: { x: -17, z: 6.1, radius: 2.0, door: { x: -17, z: 7.0, y: 0.15, face: 'N', width: 1.7 } },
  // the shrine hall, up the steps (the offering box stands to one side)
  honors: { x: 18.2, z: -13.0, radius: 2.0, lift: 0.6, door: { x: 18.2, z: -14.2, y: 0.75, face: 'S', width: 1.6 } },
  // the arcade's side door on the N-S road
  contact: { x: 13.9, z: 11.8, radius: 1.7, door: { x: 15.0, z: 11.8, y: 0.15, face: 'W', width: 1.5 } },
};
/** the outward unit vector of a facade */
export const FACE: Record<Face, [number, number]> = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
/** the Japanese line under each sign */
export const SECTION_JP: Record<string, string> = {
  about: '自己紹介',
  projects: 'プロジェクト',
  experience: '経験',
  honors: '受賞',
  contact: '連絡',
};
