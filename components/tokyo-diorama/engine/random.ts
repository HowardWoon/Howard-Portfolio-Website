import { rng } from './textures';

/* R82 (owner: the street is "not very stable, secure, logic"): ONE random source per visit. Every roll of the street
   (fleet, paint, lanes, drivers, lights, walkers, train, events, rain) comes from it, so a visit is still never the same
   as the last one, but a visit that went wrong can be replayed: its seed is in `debug.info().seed`, and
   `?street-seed=<n>` opens the same street again (the same fleet, crowd, clothes and opening lights; what happens
   after that also depends on the length of each real frame). Only one street exists at a time; a rebuild seeds
   again. */
let draw: () => number = Math.random;
let seed = 0;

/** start a visit: the given seed (a replay) or a fresh one */
export function seedStreet(given?: number) {
  seed = (given ?? crypto.getRandomValues(new Uint32Array(1))[0]) >>> 0;
  draw = rng(seed);
  return seed;
}

export const streetSeed = () => seed;
/** 0 <= x < 1 */
export const rand = () => draw();
export const rnd = (a: number, b: number) => a + draw() * (b - a);
export const pick = <T>(list: readonly T[]): T => list[Math.floor(draw() * list.length)];
export const chance = (p: number) => draw() < p;
