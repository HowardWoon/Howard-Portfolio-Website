import * as THREE from 'three';
import type { Exhibit, RoomContent } from '@/components/tokyo-diorama/gallery/types';
import { SIGNAL, type Signal } from '@/lib/signal';
import { Hall, wallSlots, type BuildOptions, type Place, type Room } from './hall';
import { INK, PAPER, bannerTexture, getFonts, inkBox, onFill, wrap } from './print';

/**
 * Walk-in gallery: one floor plan per section. Every plan GROWS with its content - a new project adds a kiosk and
 * lengthens the showroom, a new award adds a bay to the treasure hall - so nothing here needs touching when the page's
 * data grows. A section without a plan of its own gets `hall` (framed exhibits along the walls).
 *
 * Builders are generators: the engine draws a frame of the page between pieces (a room with 15 printed captions is
 * ~150 ms of canvas work; spread over frames it never stalls the street).
 */

export type RoomBuilder = (content: RoomContent, o: BuildOptions) => Generator<void, Room, void>;

/** R85: the visitor arrives in the corridor, 2 m in front of the doorway out, facing into the room */
const sig = (e?: Exhibit) => (e?.signal ? SIGNAL[e.signal].hex : undefined);
const spawnOf = (h: Hall) => new THREE.Vector3(0, 0, h.D / 2 + Hall.CORRIDOR - 2.1);

/* ================================================================== About: the studio */
const about: RoomBuilder = function* (room, o) {
  const ex = room.exhibits;
  const portrait = ex.find((e) => e.kind === 'portrait');
  const facts = ex.filter((e) => e.kind === 'fact');
  const used = new Set<Exhibit>([...(portrait ? [portrait] : []), ...facts]);
  const pairs = Math.ceil(facts.length / 2);
  const D = Math.max(15, 10 + pairs * 3.4);
  const h = new Hall(room.id, room.label, room.jp, { w: 16, d: D, h: 6 }, o, 0xfff7e0);
  h.shell(ex.length);
  yield;
  const north: Place = { x: 0, z: -D / 2, ry: 0 };
  // the portrait, its name card to the right, the statement to the left
  if (portrait) {
    const f = h.frame(portrait.image, north, 0, 2.55, 2.4, 3.1);
    h.pick(f.mesh, portrait.id);
    const c = h.card(
      {
        kicker: portrait.kicker,
        title: portrait.title,
        subtitle: portrait.subtitle,
        stats: portrait.stats,
        scale: 0.9,
      },
      north,
      f.w / 2 + 1.25,
      4.0,
      0.02,
      1.75,
    );
    h.pick(c.mesh, portrait.id);
    if (portrait.body?.length) {
      const s = h.card({ title: 'About', body: portrait.body, scale: 0.8 }, north, -(f.w / 2 + 1.25), 4.0, 0.02, 1.75);
      h.pick(s.mesh, portrait.id);
    }
    h.exhibitHotspot(portrait, north, 2.5, 2.4, 6.4, 2.2);
    yield;
  }
  // the Build Sheet facts: banners hanging either side of the aisle, a ceremonial walk up to the portrait
  facts.forEach((e, i) => {
    const row = Math.floor(i / 2);
    const left = i % 2 === 0;
    const z = -D / 2 + 5.4 + row * 3.4;
    const p: Place = { x: left ? -2.9 : 2.9, z, ry: left ? Math.PI / 2 : -Math.PI / 2 };
    const [a, b] = h.banner(bannerTexture(e.value ?? '', e.title, e.subtitle ?? '', sig(e)), p, 1.3, 3.25, 1.05);
    h.pick(a, e.id);
    h.pick(b, e.id);
    h.exhibitHotspot(e, p, 2.65, 1.6, 4.4, 1.9);
  });
  yield;
  // a runner down the aisle: an ink-bordered deep paper rug
  h.box('ink', { x: 0, z: 0, ry: 0 }, 0, 0, -1, 3.2, 0.012, D - 6);
  h.box('deep', { x: 0, z: 0, ry: 0 }, 0, 0.002, -1, 2.96, 0.012, D - 6.24);
  // everything else (the university plate, the resume, anything added later) along the side walls
  const slots = h.wallSlots(3.8, 2.2).filter((s) => s.ry !== 0);
  for (const e of ex) {
    if (used.has(e)) continue;
    const p = slots.shift();
    if (!p) break;
    h.wallExhibit(e, p);
    yield;
  }
  for (const [x, z] of [
    [-7.2, -D / 2 + 0.8],
    [7.2, -D / 2 + 0.8],
    [-7.2, D / 2 - 0.8],
    [7.2, D / 2 - 0.8],
  ] as const)
    h.plant({ x, z, ry: 0 });
  h.light(0xffe6c4, 22, 9, 0, 4.6, -D / 2 + 2.2);
  return h.build(spawnOf(h), Math.PI);
};

/* ================================================================== Projects: the showroom */
const projects: RoomBuilder = function* (room, o) {
  const ex = room.exhibits;
  const rows = Math.max(1, Math.ceil(ex.length / 2));
  const PITCH = 3.8;
  const D = Math.max(14, 5.2 + (rows - 1) * PITCH + 7);
  const W = 14;
  const h = new Hall(room.id, room.label, room.jp, { w: W, d: D, h: 5.6 }, o, 0xffffff);
  h.shell(ex.length);
  yield;
  const f = getFonts();
  ex.forEach((e, i) => {
    const row = Math.floor(i / 2);
    const left = i % 2 === 0;
    const z = D / 2 - 5.2 - row * PITCH;
    h.kiosk(e, { x: left ? -3.9 : 3.9, z, ry: left ? Math.PI / 2 : -Math.PI / 2 });
  });
  yield;
  // aisle signs hung over each pair, like the store's aisle numbers - only the real project numbers
  for (let r = 0; r < rows; r++) {
    const pair = ex.slice(r * 2, r * 2 + 2);
    const text = pair
      .map((e) => e.number ?? '')
      .filter(Boolean)
      .join(' / ');
    if (!text) continue;
    const z = D / 2 - 5.2 - r * PITCH;
    const tex = h.print(512, 160, (ctx, w, hh) => {
      inkBox(ctx, 0, 0, w, hh, PAPER, 10);
      ctx.fillStyle = INK;
      ctx.font = `800 92px ${f.display}`;
      ctx.textAlign = 'center';
      ctx.fillText(text, w / 2, 116);
    });
    const p: Place = { x: 0, z, ry: 0 };
    for (const sx of [-0.9, 0.9]) h.box('ink', p, sx, 5.0, 0, 0.025, 0.6, 0.025);
    h.plane(tex, p, 0, 4.75, 0.01, 2.2, 0.69);
    h.plane(tex, { ...p, ry: Math.PI }, 0, 4.75, 0.01, 2.2, 0.69);
    yield;
  }
  // the index board on the far wall: every project, number and title (inspect = the directory)
  const north: Place = { x: 0, z: -D / 2, ry: 0 };
  const idx = h.print(1024, 1024, (ctx, w, hh) => {
    inkBox(ctx, 0, 0, w, hh, PAPER, 14);
    ctx.fillStyle = INK;
    ctx.font = `800 66px ${f.display}`;
    ctx.fillText('Index', 56, 110);
    ctx.fillRect(56, 136, w - 112, 8);
    const n = Math.max(1, ex.length);
    const lh = Math.min(96, 800 / n);
    ex.forEach((e, i) => {
      const y = 200 + i * lh;
      const fill = sig(e);
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fillRect(56, y - lh * 0.62, 18, lh * 0.7);
      }
      ctx.fillStyle = INK;
      ctx.font = `800 ${Math.round(lh * 0.42)}px ${f.mono}`;
      ctx.fillText(e.number ?? String(i + 1).padStart(2, '0'), 96, y);
      ctx.font = `800 ${Math.round(lh * 0.5)}px ${f.display}`;
      ctx.fillText(wrap(ctx, e.title, w - 300, 1)[0] ?? '', 200, y);
    });
  });
  h.box('ink', north, 0.06, 0.95, 0.01, 2.6, 2.6, 0.02);
  const board = h.plane(idx, north, 0, 2.3, 0.04, 2.6, 2.6);
  h.pick(board, 'index');
  h.hotspot({
    id: 'index',
    label: 'Index of every project',
    kind: 'index',
    pos: h.at(north, 0, 0, 1.8),
    radius: 1.3,
    view: h.at(north, 0, 1.9, 4.4),
    focus: h.at(north, 0, 2.3, 0),
  });
  // the aisle edges: ink runners
  for (const sx of [-1.6, 1.6]) h.box('ink', { x: 0, z: 0, ry: 0 }, sx, 0, 0.5, 0.1, 0.01, D - 4);
  h.light(0xffffff, 16, 11, -3.9, 4.8, D / 2 - 6);
  return h.build(spawnOf(h), Math.PI);
};

/* ================================================================== Experience: the timeline corridor */
const experience: RoomBuilder = function* (room, o) {
  const ex = room.exhibits;
  const PITCH = 3.6;
  const D = Math.max(15, 5 + (ex.length - 1) * PITCH + 6);
  const W = 11;
  const h = new Hall(room.id, room.label, room.jp, { w: W, d: D, h: 5.4 }, o, 0xfff7e0);
  h.shell(ex.length);
  yield;
  const f = getFonts();
  const firstZ = D / 2 - 5;
  const lastZ = firstZ - (ex.length - 1) * PITCH;
  // the timeline painted down the corridor, from the door to the far wall
  h.box('ink', { x: 0, z: 0, ry: 0 }, 0, 0, (firstZ + 1.5 + (lastZ - 2)) / 2, 0.12, 0.012, firstZ + 1.5 - (lastZ - 2));
  ex.forEach((e, i) => {
    const left = i % 2 === 0;
    const z = firstZ - i * PITCH;
    const p: Place = { x: left ? -W / 2 : W / 2, z, ry: left ? Math.PI / 2 : -Math.PI / 2 };
    // the booth: a deep paper panel, a SIGNAL stripe at its edge, the photo, the logo plate, the caption
    h.box('deep', p, 0, 0.16, 0.02, 3.3, 3.9, 0.04);
    h.box('ink', p, 0, 0.16, 0.01, 3.42, 4.02, 0.02);
    if (e.signal) h.box(`sig:${e.signal}`, p, -1.62, 0.16, 0.05, 0.14, 3.9, 0.02);
    const fr = h.frame(e.image ?? e.logo, p, -0.55, 2.55, 1.75, 1.5, 0.05);
    h.pick(fr.mesh, e.id);
    if (e.logo && e.image) {
      const lf = h.frame(e.logo, p, -0.55, 1.15, 1.1, 0.42, 0.05);
      h.pick(lf.mesh, e.id);
    }
    (e.images ?? []).slice(1, 4).forEach((im, k) => {
      const tf = h.frame(im, p, -1.2 + k * 0.66, 3.95, 0.56, 0.42, 0.05);
      h.pick(tf.mesh, e.id);
    });
    const c = h.card(
      {
        number: e.number,
        kicker: e.kicker,
        title: e.title,
        subtitle: e.subtitle,
        band: sig(e),
        stats: e.stats?.slice(0, 3),
        scale: 0.72,
      },
      p,
      0.98,
      3.75,
      0.06,
      1.15,
      2.4,
    );
    h.pick(c.mesh, e.id);
    h.exhibitHotspot(e, p, 2.4, 1.7, 4.4, 1.9);
    // the date on the floor beside the timeline dot
    h.cyl('ink', { x: 0, z, ry: 0 }, 0, 0, 0, 0.22, 0.016, 'cyl20');
    if (e.signal) h.cyl(`sig:${e.signal}`, { x: 0, z, ry: 0 }, 0, 0, 0, 0.15, 0.02, 'cyl20');
    if (e.period) {
      const tex = h.print(768, 160, (ctx, w, hh) => {
        inkBox(ctx, 0, 0, w, hh, PAPER, 10);
        ctx.fillStyle = INK;
        ctx.font = `800 64px ${f.mono}`;
        ctx.fillText(wrap(ctx, e.period!.toUpperCase(), w - 70, 1)[0] ?? '', 36, 104);
      });
      // read from the corridor: the label lies beside the dot, its text running along the walker's view
      h.decal(tex, left ? 1.25 : -1.25, z, 1.8, 0.375, 0);
    }
  });
  yield;
  h.light(0xfff1dc, 14, 12, 0, 4.6, lastZ);
  return h.build(spawnOf(h), Math.PI);
};

/* ================================================================== Honors: the treasure hall */
const honors: RoomBuilder = function* (room, o) {
  const ex = room.exhibits;
  const W = 17;
  const PITCH = 3.7;
  let D = 14;
  // grow the hall until every honour has a bay
  while (wallSlots(W, D, PITCH, 2.1).length < ex.length && D < 120) D += PITCH;
  const h = new Hall(room.id, room.label, room.jp, { w: W, d: D, h: 6 }, o, 0xfff7e0);
  h.shell(ex.length);
  yield;
  const f = getFonts();
  const slots = h.wallSlots(PITCH, 2.1);
  for (const e of ex) {
    const p = slots.shift();
    if (!p) break;
    const band = sig(e);
    if (e.image) {
      const fr = h.frame(e.image, p, 0, 2.75, 2.3, 2.0);
      h.pick(fr.mesh, e.id);
    } else {
      const c = h.card(
        { kicker: e.kicker, title: e.title, subtitle: e.subtitle, body: e.body?.slice(0, 1), band, scale: 0.85 },
        p,
        0,
        3.8,
        0.02,
        1.7,
        1.0,
      );
      h.pick(c.mesh, e.id);
    }
    const front = h.at(p, 0, 0, 1.45);
    h.plinth(e, { x: front.x, z: front.z, ry: p.ry });
    h.exhibitHotspot(e, p, 2.1, 2.65, 5.2, 2.0);
    yield;
  }
  // the centre column: the tally of what is on show, counted from the exhibits' own SIGNAL meanings
  const counts = new Map<Signal, number>();
  for (const e of ex) if (e.signal) counts.set(e.signal, (counts.get(e.signal) ?? 0) + 1);
  if (counts.size) {
    const rows = [...counts.entries()];
    const tex = h.print(512, 768, (ctx, w, hh) => {
      inkBox(ctx, 0, 0, w, hh, PAPER, 12);
      ctx.fillStyle = INK;
      ctx.font = `800 54px ${f.display}`;
      ctx.fillText('On show', 40, 92);
      ctx.fillRect(40, 116, w - 80, 6);
      rows.forEach(([s, n], i) => {
        const y = 170 + i * 98;
        inkBox(ctx, 40, y, w - 80, 80, SIGNAL[s].hex, 6);
        ctx.fillStyle = onFill(SIGNAL[s].hex);
        ctx.font = `800 30px ${f.mono}`;
        ctx.fillText(SIGNAL[s].label, 64, y + 52);
        ctx.font = `800 52px ${f.display}`;
        ctx.textAlign = 'right';
        ctx.fillText(String(n), w - 64, y + 58);
        ctx.textAlign = 'left';
      });
    });
    const c: Place = { x: 0, z: 0, ry: 0 };
    h.solid('ink', c, 0, 0, 0, 1.3, 2.6, 1.3);
    h.plane(tex, { x: 0, z: 0.66, ry: 0 }, 0, 1.7, 0, 1.1, 1.65);
    h.plane(tex, { x: 0, z: -0.66, ry: Math.PI }, 0, 1.7, 0, 1.1, 1.65);
  }
  h.light(0xffe6c4, 18, 12, 0, 5, -D / 2 + 3);
  return h.build(spawnOf(h), Math.PI);
};

/* ================================================================== Contact: the post office */
const contact: RoomBuilder = function* (room, o) {
  const ex = room.exhibits;
  const letter = ex.find((e) => e.id === 'letter');
  const rest = ex.filter((e) => e !== letter);
  const W = 13;
  let D = 13;
  while (wallSlots(W, D, 3.6, 2.2).filter((s) => s.ry !== 0).length < rest.length && D < 120) D += 3.6;
  const h = new Hall(room.id, room.label, room.jp, { w: W, d: D, h: 5 }, o, 0xffffff);
  h.shell(ex.length);
  yield;
  const f = getFonts();
  const north: Place = { x: 0, z: -D / 2, ry: 0 };
  // the counter and the pigeonholes behind it
  h.solid('wood', north, 0, 0, 1.5, 8.2, 1.05, 0.8);
  h.box('ink', north, 0, 1.05, 1.5, 8.4, 0.08, 0.96);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 10; c++)
      h.box(c % 3 === r % 2 ? 'paper' : 'deep', north, -3.6 + c * 0.8, 1.6 + r * 0.62, 0.05, 0.7, 0.52, 0.12);
  h.box('ink', north, 0, 1.52, 0.02, 8.2, 1.96, 0.06);
  yield;
  // the postbox: a letter dropped here goes to the same inbox as the page's contact form
  if (letter) {
    const p: Place = { x: 0, z: -D / 2 + 3.9, ry: 0 };
    h.solid('red', p, 0, 0, 0, 0.66, 1.25, 0.6);
    h.cyl('red', p, 0, 1.25, 0, 0.33, 0.06);
    h.box('ink', p, 0, 0.98, 0.301, 0.4, 0.06, 0.01);
    h.box('ink', p, 0, 0, 0, 0.74, 0.08, 0.68);
    const plate = h.print(256, 256, (ctx, w, hh) => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, w, hh);
      ctx.fillStyle = INK;
      ctx.font = `800 150px ${f.display}`;
      ctx.textAlign = 'center';
      ctx.fillText('〒', w / 2, 180);
    });
    const pm = h.plane(plate, p, 0, 0.62, 0.302, 0.34, 0.34);
    h.pick(pm, letter.id);
    // its sign: a printed card on an ink easel beside the box
    const easel: Place = { x: -1.35, z: p.z + 0.2, ry: 0.25 };
    h.box('ink', easel, 0, 0, -0.04, 0.08, 1.6, 0.08);
    h.box('ink', easel, 0, 0, 0, 1.1, 0.06, 0.4);
    const c = h.card(
      { kicker: letter.kicker, title: letter.title, subtitle: letter.subtitle, scale: 0.8 },
      easel,
      0,
      1.95,
      0.02,
      1.0,
      1.0,
    );
    h.pick(c.mesh, letter.id);
    h.hotspot({
      id: letter.id,
      label: letter.title,
      kind: 'exhibit',
      exhibit: letter,
      pos: h.at(p, 0, 0, 1.2),
      radius: 1.3,
      view: h.at(p, 0, 1.75, 3.2),
      focus: h.at(p, 0, 1.0, 0),
    });
  }
  const slots = h.wallSlots(3.6, 2.2).filter((s) => s.ry !== 0);
  for (const e of rest) {
    const p = slots.shift();
    if (!p) break;
    h.wallExhibit(e, p);
    yield;
  }
  h.plant({ x: -W / 2 + 0.8, z: D / 2 - 0.9, ry: 0 });
  h.plant({ x: W / 2 - 0.8, z: D / 2 - 0.9, ry: 0 });
  return h.build(spawnOf(h), Math.PI);
};

/* ================================================================== any other section: a gallery hall */
const hall: RoomBuilder = function* (room, o) {
  const ex = room.exhibits;
  const W = 14;
  let D = 13;
  while (wallSlots(W, D, 3.8, 2).length < ex.length && D < 120) D += 3.8;
  const h = new Hall(room.id, room.label, room.jp, { w: W, d: D, h: 5.4 }, o, 0xfff7e0);
  h.shell(ex.length);
  yield;
  const slots = h.wallSlots(3.8, 2);
  for (const e of ex) {
    const p = slots.shift();
    if (!p) break;
    h.wallExhibit(e, p);
    yield;
  }
  return h.build(spawnOf(h), Math.PI);
};

/** one plan per section id; any other section (a new one in lib/sections.ts with a door) gets the gallery hall */
export const ROOM_BUILDERS: Record<string, RoomBuilder> = { about, projects, experience, honors, contact };
export const buildRoomSteps = (content: RoomContent, o: BuildOptions) =>
  (ROOM_BUILDERS[content.id] ?? hall)(content, o);
