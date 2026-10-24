import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SECTIONS } from '@/lib/sections';
import { FACE, SECTION_DOORS, SECTION_JP, type SectionDoor } from './doors';
import { World, box, type Box } from './kit';
import { canvasTexture, JP_FONT } from './textures';

/**
 * R85 walk-in doors (owner: "when I come close the door should open for me and glow, then I walk in - like Roblox, not
 * a button"). One doorway per section with a door (doors.ts), built into its facade:
 *
 *  - a thick ink frame standing out of the wall, the section's name plate above it (the street's own sign words)
 *  - two paper panels that SLIDE apart on a spring (mass-spring-damper: they overshoot a touch and settle, and close
 *    again behind you); the konbini keeps its real automatic doors
 *  - behind them a light curtain in SIGNAL blue (blue = the interactive thing on this site), scanning bands moving
 *    upward; it brightens as you come closer, and a printed mat on the ground says IN
 *  - a beacon (a column of blue light) over the door that the visitor is being guided to
 *
 * Walking INTO the open doorway (towards the wall, within the opening) enters the room. A doorway re-arms only once the
 * walker has stepped 2.5 m away from it, so coming back out never sends you straight in again.
 */

export interface Portal {
  id: string;
  label: string;
  jp: string;
  /** the doorway's middle on the facade (ground level) and its outward direction */
  center: THREE.Vector3;
  out: THREE.Vector3;
  width: number;
  kind: 'slide' | 'konbini';
  open: number;
  vel: number;
  glow: number;
  armed: boolean;
  /** the guide beacon is up (a sign was pressed in WALK mode) */
  guided: boolean;
  leaves: THREE.Object3D[];
  leafTravel: number;
  curtain: THREE.ShaderMaterial | null;
  mat: THREE.MeshBasicMaterial;
  beacon: THREE.Mesh;
  collider: Box | null;
}

const BLUE = new THREE.Color(0x2b4bff);

function plateTexture(label: string, jp: string) {
  return canvasTexture(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(12, 12, w - 24, h - 24);
    ctx.fillStyle = '#0A0A0A';
    ctx.font = `800 112px ${getComputedStyle(document.documentElement).getPropertyValue('--font-display') || 'system-ui'}, system-ui, sans-serif`;
    ctx.fillText(label.toUpperCase(), 48, 150);
    ctx.font = `700 58px ${JP_FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText(jp, w - 48, 150);
    ctx.font = `800 30px ui-monospace, monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('WALK IN', 50, 214);
    ctx.textAlign = 'right';
    ctx.fillText('入口  →', w - 50, 214);
  });
}

function leafTexture() {
  return canvasTexture(256, 512, (ctx, w, h) => {
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10, 10, w - 20, h - 20);
    // a hard porthole slot and a push plate, printed
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(w / 2 - 50, 90, 100, 150);
    ctx.fillStyle = '#F4EEDC';
    ctx.fillRect(w / 2 - 40, 100, 80, 130);
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(w / 2 - 34, 300, 68, 14);
  });
}

function matTexture() {
  return canvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2B4BFF';
    ctx.fillRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 96px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('IN ↑', w / 2, 160);
  });
}

const CURTAIN_VS = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// hard bands, no soft gradient: a printed scan of light moving up the doorway
const CURTAIN_FS = /* glsl */ `
  uniform float uTime, uGlow;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float band = step(0.5, fract(vUv.y * 9.0 - uTime * 0.9));
    float edge = step(0.06, vUv.x) * step(vUv.x, 0.94);
    vec3 c = mix(uColor * 0.55, uColor + vec3(0.25), band) * edge + vec3(0.04) * (1.0 - edge);
    gl_FragColor = vec4(c * (0.35 + uGlow * 2.6), 1.0);
  }`;

export class Portals {
  list: Portal[] = [];
  /** debug (tests): false = the doorways open but walking in does not enter */
  walkIn = true;
  private disposables: { dispose(): void }[] = [];
  private time = 0;

  constructor(
    private root: THREE.Object3D,
    private world: World,
    /** the konbini's automatic doors (its own leaves and collider), driven by the engine */
    private konbini: { left: THREE.Object3D; right: THREE.Object3D } | null,
  ) {
    const leafTex = leafTexture();
    const matTex = matTexture();
    const ink = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.55 });
    const leafMat = new THREE.MeshStandardMaterial({ map: leafTex, roughness: 0.7 });
    const matMat = new THREE.MeshBasicMaterial({ map: matTex });
    const beaconMat = new THREE.MeshBasicMaterial({
      color: BLUE,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.disposables.push(ink, leafMat, matMat, beaconMat);
    for (const sec of SECTIONS) {
      const d: SectionDoor | undefined = SECTION_DOORS[sec.id];
      if (!d) continue;
      this.list.push(this.build(sec.id, sec.label, SECTION_JP[sec.id] ?? '', d, ink, leafMat, matMat, beaconMat));
    }
  }

  private build(
    id: string,
    label: string,
    jp: string,
    d: SectionDoor,
    ink: THREE.Material,
    leafMat: THREE.Material,
    matMat: THREE.Material,
    beaconMat: THREE.MeshBasicMaterial,
  ): Portal {
    const D = d.door;
    const [ox, oz] = FACE[D.face];
    const out = new THREE.Vector3(ox, 0, oz);
    const center = new THREE.Vector3(D.x, D.y, D.z);
    const kind = D.kind ?? 'slide';
    const W = D.width;
    const H = 2.5;
    const g = new THREE.Group();
    g.name = `portal:${id}`;
    g.position.copy(center);
    // the group's +z looks out of the wall
    g.rotation.y = Math.atan2(ox, oz);
    this.root.add(g);
    const add = (geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
      this.disposables.push(geo);
      return mesh;
    };
    // the light curtain (behind the leaves, just proud of the wall)
    const curtainMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uGlow: { value: 0 }, uColor: { value: BLUE.clone() } },
      vertexShader: CURTAIN_VS,
      fragmentShader: CURTAIN_FS,
    });
    this.disposables.push(curtainMat);
    const leaves: THREE.Object3D[] = [];
    let collider: Box | null = null;
    if (kind === 'slide') {
      // frame: two jambs + a header, standing 0.36 m out of the wall, and the shadow slab the site draws under cards
      const J = 0.3;
      // (one mesh: one draw per doorway frame)
      const parts = [
        new THREE.BoxGeometry(J, H + 0.3, 0.36).translate(-(W / 2 + J / 2), (H + 0.3) / 2, 0.18),
        new THREE.BoxGeometry(J, H + 0.3, 0.36).translate(W / 2 + J / 2, (H + 0.3) / 2, 0.18),
        new THREE.BoxGeometry(W + 2 * J, 0.3, 0.36).translate(0, H + 0.15, 0.18),
      ];
      const frame = mergeGeometries(parts, false);
      parts.forEach((x) => x.dispose());
      if (frame) add(frame, ink, 0, 0, 0);
      add(new THREE.PlaneGeometry(W, H), curtainMat, 0, H / 2, 0.04);
      for (const s of [-1, 1]) {
        const leaf = add(new THREE.BoxGeometry(W / 2, H, 0.06), leafMat, (s * W) / 4, H / 2, 0.12);
        leaves.push(leaf);
      }
      // the colliders: the jambs; the closed leaves block (until they open)
      const c = new THREE.Vector3();
      for (const s of [-1, 1]) {
        c.set(s * (W / 2 + J / 2), 0, 0.18)
          .applyEuler(g.rotation)
          .add(center);
        const hw = Math.abs(ox) > 0 ? 0.18 : J / 2;
        const hd = Math.abs(ox) > 0 ? J / 2 : 0.18;
        this.world.addStatic(box(c.x - hw, c.x + hw, 0, D.y + H + 0.3, c.z - hd, c.z + hd, { noCam: true }));
      }
      c.set(0, 0, 0.12).applyEuler(g.rotation).add(center);
      const hw = Math.abs(ox) > 0 ? 0.06 : W / 2;
      const hd = Math.abs(ox) > 0 ? W / 2 : 0.06;
      collider = this.world.addDynamic(
        box(c.x - hw, c.x + hw, 0, D.y + H, c.z - hd, c.z + hd, { tag: 'portal', noCam: true }),
      );
    } else {
      // the konbini: its own sliding doors; the curtain sits just inside them
      add(new THREE.PlaneGeometry(W, 2.6), curtainMat, 0, 1.45, -0.25);
    }
    // the name plate over the door
    const plate = plateTexture(label, jp);
    const plateMat = new THREE.MeshBasicMaterial({ map: plate });
    this.disposables.push(plateMat, plate);
    const pw = Math.max(W + 0.6, 2.2);
    add(
      new THREE.PlaneGeometry(pw, pw / 4),
      plateMat,
      0,
      (kind === 'slide' ? H + 0.3 : 3.0) + pw / 8 + 0.06,
      kind === 'slide' ? 0.37 : 0.14,
    );
    // the mat on the ground
    const mat = add(new THREE.PlaneGeometry(W + 0.2, 0.9).rotateX(-Math.PI / 2), matMat, 0, 0.012, 0.9);
    mat.castShadow = false;
    // the guide beacon
    const beacon = add(new THREE.CylinderGeometry(0.35, 0.35, 30, 16, 1, true), beaconMat.clone(), 0, 15, 1.2);
    beacon.castShadow = false;
    beacon.visible = false;
    this.disposables.push(beacon.material as THREE.Material);
    return {
      id,
      label,
      jp,
      center,
      out,
      width: W,
      kind,
      open: 0,
      vel: 0,
      glow: 0,
      armed: true,
      guided: false,
      leaves,
      leafTravel: W / 2 - 0.05,
      curtain: curtainMat,
      mat: matMat as THREE.MeshBasicMaterial,
      beacon,
      collider,
    };
  }

  guide(id: string | null) {
    for (const p of this.list) p.guided = p.id === id;
  }

  /**
   * Per frame. `pos` / `vel` = the walker (null in a room or in VIEW). Returns the id of a door the walker has just
   * walked into, or null.
   */
  update(
    dt: number,
    pos: THREE.Vector3 | null,
    vel: THREE.Vector3 | null,
    walking: boolean,
    calm: boolean,
  ): string | null {
    this.time += dt;
    let entered: string | null = null;
    for (const p of this.list) {
      let dist = Infinity;
      let depth = Infinity;
      let lateral = Infinity;
      if (pos) {
        const dx = pos.x - p.center.x;
        const dz = pos.z - p.center.z;
        dist = Math.hypot(dx, dz);
        depth = dx * p.out.x + dz * p.out.z; // how far in front of the facade
        lateral = Math.abs(dx * -p.out.z + dz * p.out.x);
        if (!p.armed && dist > 2.5) p.armed = true;
      }
      const near =
        walking && dist < 3.4 && depth > (p.kind === 'konbini' ? -2.5 : -0.2) && Math.abs(pos!.y - p.center.y) < 1.2;
      // the leaves: a spring to open / shut (k 70, c 11: they overshoot a little and settle)
      const want = near ? 1 : 0;
      if (calm) {
        p.open = want;
        p.vel = 0;
      } else {
        const acc = 70 * (want - p.open) - 11 * p.vel;
        p.vel += acc * dt;
        p.open += p.vel * dt;
        p.open = THREE.MathUtils.clamp(p.open, -0.05, 1.08);
      }
      const o = Math.max(0, p.open);
      p.leaves.forEach((l, i) => (l.position.x = (i === 0 ? -1 : 1) * (p.width / 4 + o * p.leafTravel)));
      if (p.collider) p.collider.off = o > 0.7;
      // the glow follows how close the walker is; a guided door pulses
      const closeness = walking && pos ? THREE.MathUtils.clamp((7 - dist) / 6, 0, 1) : 0.25;
      const pulse = p.guided && !calm ? 0.5 + 0.5 * Math.sin(this.time * 5) : 0;
      const g = Math.max(closeness, p.guided ? 0.6 + 0.4 * pulse : 0);
      p.glow += (g - p.glow) * (1 - Math.exp(-dt * 6));
      if (p.curtain) {
        p.curtain.uniforms.uTime.value = calm ? 0 : this.time;
        p.curtain.uniforms.uGlow.value = p.glow;
      }
      p.mat.color.setScalar(0.6 + p.glow * 0.8);
      p.beacon.visible = p.guided;
      (p.beacon.material as THREE.MeshBasicMaterial).opacity = p.guided ? 0.18 + 0.12 * pulse : 0;
      // walked in: inside the opening, against the facade, going in
      if (
        this.walkIn &&
        pos &&
        vel &&
        walking &&
        p.armed &&
        (p.kind === 'konbini' || o > 0.6) &&
        lateral < p.width / 2 &&
        depth < (p.kind === 'konbini' ? -0.05 : 0.75) &&
        depth > -1.2 &&
        vel.x * -p.out.x + vel.z * -p.out.z > 0.4
      ) {
        p.armed = false;
        entered = p.id;
      }
    }
    return entered;
  }

  /** the doorway pose just outside a door (for coming back out of its room) */
  outside(id: string) {
    const p = this.list.find((x) => x.id === id);
    if (!p) return null;
    return { pos: p.center.clone().addScaledVector(p.out, 1.3), yaw: Math.atan2(p.out.x, p.out.z), portal: p };
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
    for (const p of this.list) this.root.getObjectByName(`portal:${p.id}`)?.removeFromParent();
    void this.konbini;
  }
}
