import * as THREE from 'three';
import type { Soundscape } from './audio';
import type { Traffic } from './traffic';
import type { Weather } from './weather';
import type { Built } from './world';

/**
 * R73 (owner: "make more variables, make more random events"): the street director. Every 14 - 30 s something
 * happens on the block - thunder, a downpour or a drizzle, a gust through the cherry tree, a street lamp on the blink,
 * an express train, a free drink, the cat's zoomies - picked at random and never the same twice in a row. The
 * DICE button in the title bar rolls one at once.
 *
 * Reduced motion: nothing happens by itself, and the dice never flashes a light (no thunder, no flicker).
 * Flashes stay under three a second (WCAG 2.3.1): the lightning is two hard steps 0.22 s apart, the lamp blinks at 3 Hz.
 */
export type StreetEvent = 'thunder' | 'downpour' | 'drizzle' | 'gust' | 'flicker' | 'express' | 'gift' | 'zoomies';
export const STREET_EVENTS: StreetEvent[] = [
  'thunder',
  'downpour',
  'drizzle',
  'gust',
  'flicker',
  'express',
  'gift',
  'zoomies',
];
const FLASHY: StreetEvent[] = ['thunder', 'flicker'];

const LINES: Record<StreetEvent, string> = {
  thunder: 'ゴロゴロ… Thunder rolls over the block.',
  downpour: 'The rain comes down harder.',
  drizzle: 'The rain eases to a drizzle.',
  gust: 'A gust shakes the cherry tree.',
  flicker: 'A street lamp starts to blink.',
  express: 'An express train is coming. Mind the crossing.',
  gift: 'ガコン！ The vending machine drops a free drink.',
  zoomies: 'The cat suddenly sprints off.',
};

export interface DirectorDeps {
  hemi: THREE.HemisphereLight;
  moon: THREE.DirectionalLight;
  weather: Weather;
  traffic: Traffic;
  built: Built;
  audio: Soundscape;
  calm: boolean;
  gift(): void;
  toast(text: string): void;
}

export class Director {
  /** seconds until the next event happens by itself */
  next: number;
  last: StreetEvent | null = null;
  count = 0;
  /** false = only the dice starts an event */
  auto = true;
  private flashT = -1;
  private thunderAt = -1;
  private lamp: { light: THREE.PointLight; base: number; t: number } | null = null;
  private readonly hemiBase: number;
  private readonly moonBase: number;

  constructor(private d: DirectorDeps) {
    this.next = 10 + Math.random() * 8;
    this.hemiBase = d.hemi.intensity;
    this.moonBase = d.moon.intensity;
  }

  /** the events that can happen right now */
  available(): StreetEvent[] {
    return STREET_EVENTS.filter((e) => {
      if (this.d.calm && FLASHY.includes(e)) return false;
      if (!this.d.weather.rainOn && (e === 'thunder' || e === 'downpour' || e === 'drizzle')) return false;
      if (e === 'express' && this.d.traffic.trainState !== 'idle') return false;
      if (e === 'flicker' && this.lamp) return false;
      return true;
    });
  }

  roll(): StreetEvent {
    const pool = this.available().filter((e) => e !== this.last);
    const e = pool[Math.floor(Math.random() * pool.length)] ?? 'gift';
    this.trigger(e);
    return e;
  }

  trigger(e: StreetEvent) {
    const { weather, traffic, built, audio } = this.d;
    this.last = e;
    this.count++;
    this.next = 14 + Math.random() * 16;
    switch (e) {
      case 'thunder':
        this.flashT = 0;
        this.thunderAt = 0.7 + Math.random() * 0.8;
        weather.surge(1.5, 8);
        break;
      case 'downpour':
        weather.surge(1.7, 12 + Math.random() * 6);
        break;
      case 'drizzle':
        weather.surge(0.3, 14 + Math.random() * 6);
        break;
      case 'gust':
        weather.gust(4.5);
        audio.wind();
        break;
      case 'flicker': {
        const lit = built.lights.filter((l) => l.light.visible);
        const pick = lit[Math.floor(Math.random() * lit.length)];
        if (pick) this.lamp = { light: pick.light, base: pick.light.intensity, t: 0 };
        break;
      }
      case 'express':
        traffic.trainWait = Math.min(traffic.trainWait, 0.6);
        break;
      case 'gift':
        this.d.gift();
        break;
      case 'zoomies':
        traffic.catDash(); // it meows on its own
        break;
    }
    this.d.toast(LINES[e]);
  }

  update(dt: number) {
    if (!this.d.calm && this.auto) {
      this.next -= dt;
      if (this.next <= 0) this.roll();
    }
    // lightning: two hard white steps, then the thunder a moment later
    if (this.flashT >= 0) {
      this.flashT += dt;
      const t = this.flashT;
      const on = t < 0.07 || (t > 0.22 && t < 0.3);
      this.d.hemi.intensity = this.hemiBase * (on ? 3.2 : 1);
      this.d.moon.intensity = this.moonBase * (on ? 4 : 1);
      if (t > 0.3) {
        this.flashT = -1;
        this.d.hemi.intensity = this.hemiBase;
        this.d.moon.intensity = this.moonBase;
      }
    }
    if (this.thunderAt >= 0) {
      this.thunderAt -= dt;
      if (this.thunderAt < 0) this.d.audio.thunder();
    }
    // a lamp on the blink: off / on at 3 Hz for 2.4 s, then steady again
    if (this.lamp) {
      const l = this.lamp;
      l.t += dt;
      l.light.intensity = l.t > 2.4 || Math.floor(l.t * 6) % 2 === 1 ? l.base : l.base * 0.08;
      if (l.t > 2.4) this.lamp = null;
    }
  }

  /** put every light back (tier change, dispose) */
  settle() {
    this.d.hemi.intensity = this.hemiBase;
    this.d.moon.intensity = this.moonBase;
    if (this.lamp) this.lamp.light.intensity = this.lamp.base;
    this.flashT = -1;
    this.lamp = null;
  }
}
