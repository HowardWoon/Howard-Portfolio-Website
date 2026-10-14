import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Materials, World, resolveCircle, type Box } from './kit';
import { buildWorld, type Built, type Hotspot } from './world';
import { Traffic } from './traffic';
import { Weather } from './weather';
import { Soundscape } from './audio';
import { Input } from './input';
import { animatePerson, makePerson, resetActorTextures, disposePerson, type Person } from './actors';
import { disposeTextures } from './textures';

export type Mode = 'view' | 'walk';
export type Tier = 'low' | 'medium' | 'high';
export type { Hotspot };

export interface DioramaCallbacks {
  onReady?: () => void;
  /** walk mode: the hotspot in reach changed (null = none) */
  onHotspot?: (h: Hotspot | null) => void;
  /** a portfolio hotspot was activated (pin click / E / tap) */
  onActivate?: (h: Hotspot) => void;
  onTier?: (t: Tier) => void;
  onToast?: (text: string) => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export interface DioramaOptions extends DioramaCallbacks {
  container: HTMLElement;
  reducedMotion?: boolean;
  tier?: Tier | 'auto';
  /**
   * Optional .glb made in Blender, added on top of the built block (see BLENDER.md). Objects named `COL_*` become
   * invisible colliders; objects named `HIDE_<batchKey>` hide the built-in parts of that material (to replace them).
   */
  modelUrl?: string;
}

export interface DioramaHandle {
  setMode(m: Mode): void;
  getMode(): Mode;
  setRain(on: boolean): void;
  setSound(on: boolean): Promise<void>;
  setTier(t: Tier | 'auto'): void;
  getTier(): Tier;
  zoom(step: number): void;
  jump(): void;
  interact(): void;
  activate(id: string): void;
  bindPin(id: string, el: HTMLElement | null): void;
  resetCamera(): void;
  resize(): void;
  dispose(): void;
  /** debug + tests */
  debug: {
    player(): THREE.Vector3;
    teleport(x: number, y: number, z: number): void;
    traffic(): Traffic;
    setMove(x: number, y: number, run?: boolean): void;
    step(seconds: number, draw?: boolean): void;
    info(): Record<string, unknown>;
    orbit(theta: number, phi: number, k?: number): void;
    camYaw(y: number): void;
    census(): Record<string, number>;
    root(): THREE.Object3D;
  };
}

const PROFILES: Record<
  Tier,
  {
    dpr: number;
    bloom: boolean;
    shadows: boolean;
    shadow: number;
    drops: number;
    splash: number;
    lights: number;
    msaa: number;
  }
> = {
  high: { dpr: 2, bloom: true, shadows: true, shadow: 2048, drops: 9000, splash: 700, lights: 14, msaa: 4 },
  medium: { dpr: 1.5, bloom: true, shadows: false, shadow: 1024, drops: 5200, splash: 420, lights: 8, msaa: 0 },
  low: { dpr: 1, bloom: false, shadows: false, shadow: 512, drops: 2600, splash: 220, lights: 5, msaa: 0 },
};

export function detectTier(gl?: WebGLRenderingContext | WebGL2RenderingContext): Tier {
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  let gpu = '';
  try {
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    if (gl && ext) gpu = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
  } catch {
    /* not exposed: fine */
  }
  if (/swiftshader|llvmpipe|software|mali-4|mali-t[0-9]|adreno \(tm\) [2-4]|powervr sgx|hd graphics [2-5]/i.test(gpu))
    return 'low';
  if (coarse) {
    if (/apple/i.test(gpu)) return 'medium';
    return cores >= 6 && mem >= 4 && !/adreno \(tm\) 5|mali-g[57][0-9]?\b/i.test(gpu) ? 'medium' : 'low';
  }
  if (/apple m|rtx|radeon|geforce|arc|iris xe/i.test(gpu) || cores >= 8) return 'high';
  return 'medium';
}

const STEP = 0.36;
const RADIUS = 0.3;
const HEIGHT = 1.7;
const FIXED = 1 / 120;

export function createTokyoDiorama(opts: DioramaOptions): DioramaHandle {
  const { container } = opts;
  const calm = !!opts.reducedMotion;

  /* ------------------------------------------------------------ renderer */
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute(
    'aria-label',
    'Interactive 3D diorama of a rainy Tokyo street corner at night: a convenience store, a shrine, an izakaya, a ramen stall, an arcade and a railway crossing.',
  );
  Object.assign(canvas.style, {
    display: 'block',
    width: '100%',
    height: '100%',
    outline: 'none',
    touchAction: 'pan-y',
  });
  container.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    stencil: false,
    alpha: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let autoTier = opts.tier === undefined || opts.tier === 'auto';
  let tier: Tier = autoTier ? detectTier(renderer.getContext()) : (opts.tier as Tier);

  /* ------------------------------------------------------------ scene */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e1c);
  scene.fog = new THREE.Fog(0x0a0e1c, 90, 230);

  // night "neon city" environment, so wet & glossy surfaces reflect colour
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const envDisposables: { dispose(): void }[] = [];
  {
    const room = new THREE.Mesh(
      new THREE.BoxGeometry(80, 40, 80),
      new THREE.MeshBasicMaterial({ color: 0x0b1022, side: THREE.BackSide }),
    );
    envScene.add(room);
    envDisposables.push(room.geometry, room.material as THREE.Material);
    const panel = (color: number, power: number, w: number, h: number, x: number, y: number, z: number) => {
      const m = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(power),
        side: THREE.DoubleSide,
      });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
      p.position.set(x, y, z);
      p.lookAt(0, 2, 0);
      envScene.add(p);
      envDisposables.push(p.geometry, m);
    };
    panel(0xfff0dc, 4, 26, 6, -12, 5, -30);
    panel(0xff4fd8, 4, 10, 14, 30, 8, 18);
    panel(0x29e3ff, 3.5, 16, 6, 34, 10, -6);
    panel(0xff7a3a, 3.5, 18, 5, -32, 3, 16);
    panel(0x8e6bff, 2.2, 20, 10, 0, 6, 36);
    panel(0x3a4c86, 1.2, 70, 70, 0, 19, 0);
  }
  const envTex = pmrem.fromScene(envScene, 0.035).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.55;

  const hemi = new THREE.HemisphereLight(0x5a74c4, 0x241a2a, 0.95);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xa9bcff, 0.85);
  moon.position.set(-26, 44, -18);
  moon.target.position.set(0, 0, 0);
  moon.shadow.camera.left = -30;
  moon.shadow.camera.right = 30;
  moon.shadow.camera.top = 30;
  moon.shadow.camera.bottom = -30;
  moon.shadow.camera.near = 10;
  moon.shadow.camera.far = 110;
  moon.shadow.bias = -0.0006;
  moon.shadow.normalBias = 0.03;
  scene.add(moon, moon.target);

  const mats = new Materials();
  const world = new World();
  const built: Built = buildWorld(mats, world);
  scene.add(built.root);

  const traffic = new Traffic(built.root, mats, world, built, calm);
  const weather = new Weather(built, world, calm);
  scene.add(weather.group);
  const audio = new Soundscape();
  const input = new Input(container, canvas);

  /* ------------------------------------------------------------ player */
  const player: Person = makePerson({
    top: 0xffc700,
    bottom: 0x0a0a0a,
    hair: 0x15110e,
    umbrella: 0xf4f8ff,
    bag: 0x2b4bff,
  });
  player.group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && o.name !== 'blob') o.castShadow = true;
  });
  scene.add(player.group);
  const P = {
    pos: built.spawn.clone(),
    vel: new THREE.Vector3(),
    grounded: true,
    coyote: 0,
    jumpBuf: 0,
    stepIdx: 0,
  };
  player.yaw = Math.PI;

  /* ------------------------------------------------------------ vending cans */
  const canGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.17, 12).rotateZ(Math.PI / 2);
  const canMats = [0xd8291c, 0x2b4bff, 0x3ddc97, 0xffc700].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.7, roughness: 0.3 }),
  );
  const cans: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; spin: number }[] = [];

  /* ------------------------------------------------------------ cameras */
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 420);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 0.55;
  controls.minPolarAngle = 0.25;
  controls.maxPolarAngle = 1.32;
  controls.autoRotate = !calm;
  controls.autoRotateSpeed = 0.35;
  controls.target.set(0, -0.5, 1.5);
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
  let idleTimer = 0;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    idleTimer = 0;
  });
  canvas.style.touchAction = 'pan-y';

  let fit = 90;
  const orbit = { theta: -0.52, phi: 0.92, dist: 90 };
  const setOrbitFromSpherical = () => {
    const t = controls.target;
    camera.position.set(
      t.x + orbit.dist * Math.sin(orbit.phi) * Math.sin(orbit.theta),
      t.y + orbit.dist * Math.cos(orbit.phi),
      t.z + orbit.dist * Math.sin(orbit.phi) * Math.cos(orbit.theta),
    );
    camera.lookAt(t);
  };

  const walkCam = { yaw: 0, pitch: 0.42, dist: 5.6, target: new THREE.Vector3(), pos: new THREE.Vector3() };
  let mode: Mode = 'view';
  let blend = 0; // 0 = orbit, 1 = follow camera
  const blendFrom = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  const lookNow = new THREE.Vector3();

  /* ------------------------------------------------------------ post */
  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  const size = new THREE.Vector2(1, 1);

  const bloomView = () => (tier === 'high' ? 0.68 : 0.58);
  const applyTier = () => {
    const p = PROFILES[tier];
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, p.dpr));
    const shadows = p.shadows && !calm ? true : p.shadows;
    if (renderer.shadowMap.enabled !== shadows) {
      renderer.shadowMap.enabled = shadows;
      scene.traverse((o) => {
        const m = (o as THREE.Mesh).material;
        if (m) (Array.isArray(m) ? m : [m]).forEach((x) => (x.needsUpdate = true));
      });
    }
    moon.castShadow = shadows;
    moon.shadow.mapSize.set(p.shadow, p.shadow);
    moon.shadow.map?.dispose();
    moon.shadow.map = null;
    const ordered = [...built.lights].sort((a, b) => a.priority - b.priority);
    ordered.forEach((l, i) => (l.light.visible = i < p.lights));
    weather.setDensity(p.drops, p.splash);
    composer?.dispose();
    composer = null;
    bloom = null;
    if (p.bloom) {
      const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: p.msaa });
      composer = new EffectComposer(renderer, rt);
      composer.addPass(new RenderPass(scene, camera));
      bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), bloomView(), 0.5, 0.9);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
    }
    resize();
    opts.onTier?.(tier);
  };

  function resize() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    size.set(w, h);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (composer) {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(w, h);
    }
    if (bloom) bloom.resolution.set(w * 0.5, h * 0.5);
    // fit the whole table in view at any aspect ratio (phones in portrait get a farther camera)
    const vf = THREE.MathUtils.degToRad(camera.fov);
    const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
    const prev = fit;
    fit = (30 / Math.sin(Math.min(vf * 1.15, hf) / 2)) * (camera.aspect < 0.8 ? 0.62 : 0.74);
    controls.minDistance = fit * 0.42;
    controls.maxDistance = fit * 1.3;
    if (mode === 'view' && Math.abs(prev - fit) > 0.01) {
      const d = camera.position.distanceTo(controls.target);
      const nd = THREE.MathUtils.clamp((d / prev) * fit, controls.minDistance, controls.maxDistance);
      camera.position.sub(controls.target).setLength(nd).add(controls.target);
    }
  }

  /* ------------------------------------------------------------ hotspots + pins */
  const pins = new Map<string, HTMLElement>();
  let near: Hotspot | null = null;
  const tmpV = new THREE.Vector3();

  const activate = (h: Hotspot) => {
    if (h.id === 'vending') {
      audio.clunk();
      opts.onToast?.('ガコン！ A cold drink drops out. ¥130');
      const mesh = new THREE.Mesh(canGeo, canMats[cans.length % canMats.length]);
      mesh.castShadow = true;
      mesh.position.copy(built.vendingSlot);
      built.root.add(mesh);
      cans.push({
        mesh,
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.6, 1.4, 1.5 + Math.random() * 0.6),
        life: 9,
        spin: 0,
      });
      if (cans.length > 6) {
        const old = cans.shift()!;
        built.root.remove(old.mesh);
      }
      return;
    }
    audio.click();
    opts.onActivate?.(h);
  };

  /* ------------------------------------------------------------ player physics (fixed step) */
  const scratch: Box[] = [];
  const fwd = new THREE.Vector3();
  const right = new THREE.Vector3();
  const wish = new THREE.Vector3();
  let moveOverride: { x: number; y: number; run: boolean } | null = null;

  const physicsStep = (h: number) => {
    const mx = moveOverride ? moveOverride.x : input.move.x;
    const my = moveOverride ? moveOverride.y : input.move.y;
    const run = moveOverride ? moveOverride.run : input.run;
    const active = mode === 'walk';
    fwd.set(-Math.sin(walkCam.yaw), 0, -Math.cos(walkCam.yaw));
    right.set(Math.cos(walkCam.yaw), 0, -Math.sin(walkCam.yaw));
    wish.set(0, 0, 0);
    if (active) wish.addScaledVector(fwd, my).addScaledVector(right, mx);
    const speed = (run ? 5.6 : 3.1) * Math.min(1, wish.length());
    if (wish.lengthSq() > 1e-6) wish.normalize();
    const accel = P.grounded ? 24 : 7;
    const dvx = wish.x * speed - P.vel.x;
    const dvz = wish.z * speed - P.vel.z;
    const dl = Math.hypot(dvx, dvz);
    const maxDv = accel * h;
    if (dl > maxDv) {
      P.vel.x += (dvx / dl) * maxDv;
      P.vel.z += (dvz / dl) * maxDv;
    } else {
      P.vel.x += dvx;
      P.vel.z += dvz;
    }
    P.jumpBuf = Math.max(0, P.jumpBuf - h);
    P.coyote = Math.max(0, P.coyote - h);
    if (P.jumpBuf > 0 && (P.grounded || P.coyote > 0)) {
      P.vel.y = 6.9;
      P.grounded = false;
      P.coyote = 0;
      P.jumpBuf = 0;
    }
    if (!P.grounded) P.vel.y = Math.max(-30, P.vel.y - 20 * h);
    P.pos.addScaledVector(P.vel, h);

    world.query(P.pos.x, P.pos.z, RADIUS + 0.4, scratch);
    resolveCircle(P.pos, P.vel, RADIUS, HEIGHT, STEP, scratch);

    // ceiling
    if (P.vel.y > 0) {
      for (const b of scratch) {
        if (P.pos.x < b.minX || P.pos.x > b.maxX || P.pos.z < b.minZ || P.pos.z > b.maxZ) continue;
        if (b.minY > P.pos.y + STEP && b.minY < P.pos.y + HEIGHT) {
          P.pos.y = b.minY - HEIGHT;
          P.vel.y = 0;
        }
      }
    }
    const g = world.groundAt(P.pos.x, P.pos.z, P.pos.y + STEP, 0.14, scratch);
    const snap = P.grounded ? 0.26 : 0;
    if (P.vel.y <= 0 && P.pos.y <= g + snap && g > -Infinity) {
      if (!P.grounded && P.vel.y < -4) audio.land();
      P.pos.y = g;
      P.vel.y = 0;
      P.grounded = true;
      P.coyote = 0.12;
    } else if (P.pos.y > g + snap || g === -Infinity) {
      if (P.grounded) P.coyote = 0.12;
      P.grounded = false;
    }
    if (P.pos.y < -4) respawn();
  };

  const respawn = () => {
    P.pos.copy(built.spawn);
    P.vel.set(0, 0, 0);
    P.grounded = true;
  };

  /* ------------------------------------------------------------ cameras per frame */
  const updateWalkCamera = (dt: number, instant = false) => {
    walkCam.yaw -= input.look.x;
    walkCam.pitch = THREE.MathUtils.clamp(walkCam.pitch + input.look.y, -0.15, 1.25);
    input.look.set(0, 0);
    walkCam.dist = THREE.MathUtils.clamp(walkCam.dist + input.zoom, 2.4, 12);
    input.zoom = 0;
    const sp = Math.hypot(P.vel.x, P.vel.z);
    const now = performance.now() / 1000;
    if (sp > 0.8 && now - input.lastLook > 1.4) {
      const want = player.yaw + Math.PI;
      let d = want - walkCam.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      if (Math.abs(d) < 2.2) walkCam.yaw += d * (1 - Math.exp(-dt * 0.9 * Math.min(1, sp / 3)));
    }
    const k = instant ? 1 : 1 - Math.exp(-dt * 12);
    const ty = P.pos.y + 1.3;
    walkCam.target.x += (P.pos.x - walkCam.target.x) * k;
    walkCam.target.z += (P.pos.z - walkCam.target.z) * k;
    walkCam.target.y += (ty - walkCam.target.y) * (instant ? 1 : 1 - Math.exp(-dt * 7));
    const cp = Math.cos(walkCam.pitch);
    tmpV.set(Math.sin(walkCam.yaw) * cp, Math.sin(walkCam.pitch), Math.cos(walkCam.yaw) * cp);
    const hit = world.raycast(walkCam.target, tmpV, walkCam.dist + 0.3);
    const d = Math.max(0.7, Math.min(walkCam.dist, hit - 0.3));
    const desired = tmpV.clone().multiplyScalar(d).add(walkCam.target);
    const gy = world.groundAt(desired.x, desired.z, desired.y, 0.05, scratch);
    desired.y = Math.max(desired.y, (gy > -Infinity ? gy : 0) + 0.3);
    const closer = desired.distanceTo(walkCam.target) < walkCam.pos.distanceTo(walkCam.target) - 0.05;
    if (instant || closer) walkCam.pos.copy(desired);
    else walkCam.pos.lerp(desired, 1 - Math.exp(-dt * 14));
  };

  /* ------------------------------------------------------------ loop */
  const clock = new THREE.Clock();
  let acc = 0;
  let running = false;
  let visible = true;
  let pageVisible = !document.hidden;
  let ready = false;
  let fpsAcc = 0;
  let fpsFrames = 0;
  let fpsTime = 0;
  let sinceStart = 0;
  let prevBrake = false;
  let lastNear: Hotspot | null = null;

  const tick = () => {
    const dt = Math.min(0.05, clock.getDelta());
    simulate(dt);
    render();
    // adaptive quality: drop a tier if the device cannot hold ~40 fps
    sinceStart += dt;
    fpsAcc += dt;
    fpsFrames++;
    fpsTime += dt;
    if (fpsTime > 2.5) {
      const fps = fpsFrames / fpsAcc;
      if (autoTier && sinceStart > 4 && fps < 38 && tier !== 'low') {
        tier = tier === 'high' ? 'medium' : 'low';
        applyTier();
      }
      fpsAcc = fpsFrames = fpsTime = 0;
    }
    if (!ready) {
      ready = true;
      opts.onReady?.();
    }
  };

  function simulate(dt: number) {
    if (mode === 'walk') input.poll();
    if (input.jumpQueued) {
      P.jumpBuf = 0.14;
      input.jumpQueued = false;
    }
    acc += dt;
    let n = 0;
    while (acc >= FIXED && n < 8) {
      physicsStep(FIXED);
      acc -= FIXED;
      n++;
    }
    if (n === 8) acc = 0;

    // player visuals
    const sp = Math.hypot(P.vel.x, P.vel.z);
    if (sp > 0.15) {
      const want = Math.atan2(P.vel.x, P.vel.z);
      let d = want - player.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      player.yaw += d * (1 - Math.exp(-dt * 12));
    }
    player.group.position.copy(P.pos);
    player.group.rotation.y = player.yaw;
    animatePerson(player, sp, dt, !P.grounded, calm);
    const blob = player.group.getObjectByName('blob');
    if (blob) {
      const g = world.groundAt(P.pos.x, P.pos.z, P.pos.y + 0.05, 0.05, scratch);
      blob.position.y = (g > -Infinity ? g : 0) - P.pos.y + 0.012;
      const s = THREE.MathUtils.clamp(1 - (P.pos.y - g) * 0.3, 0.4, 1);
      blob.scale.setScalar(s);
    }
    if (P.grounded && sp > 0.6) {
      const idx = Math.floor(player.phase / Math.PI);
      if (idx !== P.stepIdx) {
        P.stepIdx = idx;
        audio.step(weather.intensity);
      }
    }

    // world simulation
    traffic.update(dt, { pos: P.pos, radius: RADIUS, active: true });
    if (traffic.bellTick) {
      traffic.bellTick = false;
      const L = mode === 'walk' ? P.pos : controls.target;
      audio.bell(THREE.MathUtils.clamp(1.1 - Math.hypot(L.x - 9, L.z - 15) / 45, 0.15, 1));
    }
    if (traffic.trainBrakingForPlayer && !prevBrake) {
      audio.horn(1);
      opts.onToast?.('The train stops for you. Please step off the tracks!');
    }
    prevBrake = traffic.trainBrakingForPlayer;
    for (const e of traffic.events.splice(0)) if (e === 'meow') audio.meow();
    const L = mode === 'walk' ? P.pos : controls.target;
    const trainNear =
      traffic.trainState === 'run'
        ? THREE.MathUtils.clamp(1 - Math.abs(traffic.trainX - L.x) / 40, 0, 1) * Math.min(1, traffic.trainV / 6)
        : 0;
    audio.update(weather.intensity, trainNear);

    // konbini automatic doors (open for the player and for pedestrians)
    const door = built.door;
    const dc = door.center;
    let wantOpen = Math.abs(P.pos.x - dc.x) < 1.6 && P.pos.z > dc.z - 2.4 && P.pos.z < dc.z + 2.2;
    for (const p of traffic.peds) if (Math.abs(p.pos.x - dc.x) < 1.6 && Math.abs(p.pos.z - dc.z) < 2) wantOpen = true;
    const before = door.open;
    door.open = THREE.MathUtils.clamp(door.open + (wantOpen ? dt / 0.45 : -dt / 0.7), 0, 1);
    if (before === 0 && door.open > 0 && wantOpen && mode === 'walk') audio.chime();
    const e = door.open * door.open * (3 - 2 * door.open);
    door.left.position.x = door.closedL - e * door.travel;
    door.right.position.x = door.closedR + e * door.travel;
    door.collider.off = door.open > 0.6;

    // cans
    for (let i = cans.length - 1; i >= 0; i--) {
      const c = cans[i];
      c.life -= dt;
      c.vel.y -= 20 * dt;
      c.mesh.position.addScaledVector(c.vel, dt);
      const g = world.groundAt(c.mesh.position.x, c.mesh.position.z, c.mesh.position.y + 0.1, 0.02, scratch);
      if (c.mesh.position.y < g + 0.055) {
        c.mesh.position.y = g + 0.055;
        if (c.vel.y < -1) c.vel.y *= -0.35;
        else c.vel.y = 0;
        c.vel.x *= 0.92;
        c.vel.z *= 0.92;
      }
      c.mesh.rotation.y = Math.atan2(c.vel.x, c.vel.z) + Math.PI / 2;
      c.spin += Math.hypot(c.vel.x, c.vel.z) * dt * 12;
      c.mesh.rotation.x = c.spin;
      if (c.life <= 0) {
        built.root.remove(c.mesh);
        cans.splice(i, 1);
      }
    }

    weather.update(dt, camera);
    built.led.update(calm ? dt * 0.4 : dt);
    const t = traffic.clock;
    built.tv.emissiveIntensity = calm ? 1 : 0.8 + 0.6 * Math.abs(Math.sin(t * 2.3) * Math.sin(t * 5.1));
    built.chase.forEach((m, i) => (m.emissiveIntensity = calm ? 2.5 : Math.floor(t * 6) % 3 === i ? 4 : 0.6));

    // hotspots
    if (mode === 'walk') {
      let best: Hotspot | null = null;
      let bd = Infinity;
      for (const h of built.hotspots) {
        const d = Math.hypot(h.pos.x - P.pos.x, h.pos.z - P.pos.z);
        if (d < h.radius && Math.abs(h.pos.y - P.pos.y) < 1.5 && d < bd) {
          bd = d;
          best = h;
        }
      }
      near = best;
      if (input.interactQueued && near) activate(near);
    } else near = null;
    input.interactQueued = false;
    if (near !== lastNear) {
      lastNear = near;
      opts.onHotspot?.(near);
    }

    // cameras
    if (mode === 'walk') updateWalkCamera(dt);
    const target = mode === 'walk' ? 1 : 0;
    const prevBlend = blend;
    blend = calm ? target : THREE.MathUtils.clamp(blend + (target > blend ? dt / 1.1 : -dt / 1.1), 0, 1);
    if (mode === 'view') {
      if (!controls.autoRotate && !calm) {
        idleTimer += dt;
        if (idleTimer > 8) controls.autoRotate = true;
      }
      controls.update(dt);
    }
    if (blend > 0 && blend < 1) {
      const s = blend * blend * (3 - 2 * blend);
      const orbitPos = mode === 'walk' ? blendFrom.pos : camera.position.clone();
      if (mode === 'walk') {
        camera.position.lerpVectors(orbitPos, walkCam.pos, s);
        lookNow.lerpVectors(blendFrom.look, walkCam.target, s);
      } else {
        setOrbitFromSpherical();
        camera.position.lerpVectors(camera.position.clone(), walkCam.pos, s);
        lookNow.lerpVectors(controls.target, walkCam.target, s);
      }
      camera.lookAt(lookNow);
    } else if (blend === 1) {
      camera.position.copy(walkCam.pos);
      camera.lookAt(walkCam.target);
    } else if (prevBlend > 0 && blend === 0) {
      setOrbitFromSpherical();
      controls.update(0);
    }
    // street level fills the screen with lit surfaces: bloom eases off as the camera comes down
    if (bloom) bloom.strength = THREE.MathUtils.lerp(bloomView(), 0.26, blend);
    renderer.toneMappingExposure = THREE.MathUtils.lerp(1.18, 1.0, blend);
    const fovWant = mode === 'walk' ? 50 : 32;
    if (Math.abs(camera.fov - fovWant) > 0.05) {
      camera.fov += (fovWant - camera.fov) * (calm ? 1 : 1 - Math.exp(-dt * 3));
      camera.updateProjectionMatrix();
    }
    weather.setViewport(size.y * renderer.getPixelRatio(), camera.fov);

    // pins follow their hotspots (view mode only)
    const showPins = mode === 'view' && blend < 0.05;
    for (const [id, el] of pins) {
      const h = built.hotspots.find((x) => x.id === id);
      if (!h || !showPins) {
        el.style.visibility = 'hidden';
        continue;
      }
      tmpV
        .copy(h.pos)
        .setY(h.pos.y + 2.8)
        .project(camera);
      const px = ((tmpV.x + 1) / 2) * size.x;
      const py = ((1 - tmpV.y) / 2) * size.y;
      const inside = tmpV.z < 1 && px > 56 && px < size.x - 56 && py > 48 && py < size.y - 8;
      el.style.visibility = inside ? 'visible' : 'hidden';
      el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -100%)`;
    }
  }

  function render() {
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  const setRunning = () => {
    const should = visible && pageVisible && !lost;
    if (should === running) return;
    running = should;
    if (running) {
      clock.getDelta();
      renderer.setAnimationLoop(tick);
    } else renderer.setAnimationLoop(null);
    audio.suspend(!running);
  };

  /* ------------------------------------------------------------ lifecycle */
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    setRunning();
  });
  io.observe(container);
  const onVis = () => {
    pageVisible = !document.hidden;
    setRunning();
  };
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(() => resize());
  ro.observe(container);
  let lost = false;
  let disposed = false;
  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
    setRunning();
    opts.onContextLost?.();
  };
  const onRestored = () => {
    lost = false;
    opts.onContextRestored?.();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  applyTier();
  orbit.dist = fit;
  if (camera.aspect < 0.8) orbit.phi = 0.78; // portrait phones: a little more top-down fills the frame
  setOrbitFromSpherical();
  controls.update(0);
  walkCam.yaw = Math.PI * 0.08;
  walkCam.target.copy(P.pos).add(new THREE.Vector3(0, 1.3, 0));
  updateWalkCamera(0, true);
  // optional Blender model (loader code is only downloaded when a model is configured)
  let modelGroup: THREE.Object3D | null = null;
  if (opts.modelUrl) {
    const url = opts.modelUrl;
    void (async () => {
      try {
        const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
          import('three/addons/loaders/GLTFLoader.js'),
          import('three/addons/libs/meshopt_decoder.module.js'),
        ]);
        const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url);
        if (disposed) return;
        modelGroup = gltf.scene;
        modelGroup.updateMatrixWorld(true);
        const hide: THREE.Object3D[] = [];
        modelGroup.traverse((o) => {
          const name = o.name || '';
          if (name.startsWith('COL_')) {
            const b = new THREE.Box3().setFromObject(o);
            world.addStatic({
              minX: b.min.x,
              maxX: b.max.x,
              minY: b.min.y,
              maxY: b.max.y,
              minZ: b.min.z,
              maxZ: b.max.z,
            });
            hide.push(o);
          } else if (name.startsWith('HIDE_')) {
            const target = built.root.getObjectByName(`batch:${name.slice(5).replace(/[._]\d+$/, '')}`);
            if (target) target.visible = false;
            hide.push(o);
          } else if ((o as THREE.Mesh).isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        hide.forEach((o) => (o.visible = false));
        built.root.add(modelGroup);
      } catch (err) {
        console.warn('[tokyo-diorama] model failed to load, using the built-in block', err);
      }
    })();
  }

  // shaders compile up front so the first frames don't hitch
  renderer.compile(scene, camera);
  render();
  setRunning();

  const handle: DioramaHandle = {
    setMode(m) {
      if (m === mode) return;
      if (m === 'walk') {
        // remember the orbit pose to come back to it
        const off = camera.position.clone().sub(controls.target);
        orbit.dist = off.length();
        orbit.phi = Math.acos(THREE.MathUtils.clamp(off.y / orbit.dist, -1, 1));
        orbit.theta = Math.atan2(off.x, off.z);
        blendFrom.pos.copy(camera.position);
        blendFrom.look.copy(controls.target);
        walkCam.yaw = orbit.theta;
        walkCam.target.copy(P.pos).add(new THREE.Vector3(0, 1.3, 0));
        updateWalkCamera(0, true);
        controls.enabled = false;
        controls.autoRotate = false;
        canvas.style.touchAction = 'none';
        canvas.style.cursor = 'grab';
        input.enabled = true;
      } else {
        controls.enabled = true;
        canvas.style.touchAction = 'pan-y';
        canvas.style.cursor = '';
        input.enabled = false;
        input.reset();
      }
      mode = m;
      if (calm) blend = m === 'walk' ? 1 : 0;
    },
    getMode: () => mode,
    setRain: (on) => weather.setRain(on),
    setSound: (on) => audio.enable(on),
    setTier(t) {
      autoTier = t === 'auto';
      tier = t === 'auto' ? detectTier(renderer.getContext()) : t;
      sinceStart = 0;
      applyTier();
    },
    getTier: () => tier,
    zoom(step) {
      if (mode === 'walk') {
        input.zoom += step * 1.5;
        return;
      }
      const off = camera.position.clone().sub(controls.target);
      const nd = THREE.MathUtils.clamp(
        off.length() * (step > 0 ? 1.18 : 1 / 1.18),
        controls.minDistance,
        controls.maxDistance,
      );
      camera.position.copy(controls.target).add(off.setLength(nd));
      controls.autoRotate = false;
      idleTimer = 0;
    },
    jump() {
      P.jumpBuf = 0.14;
    },
    interact() {
      if (near) activate(near);
    },
    activate(id) {
      const h = built.hotspots.find((x) => x.id === id);
      if (h) activate(h);
    },
    bindPin(id, el) {
      if (el) {
        el.style.visibility = 'hidden';
        pins.set(id, el);
      } else pins.delete(id);
    },
    resetCamera() {
      if (mode === 'walk') {
        walkCam.yaw = player.yaw + Math.PI;
        walkCam.pitch = 0.42;
        walkCam.dist = 5.6;
        return;
      }
      orbit.theta = -0.52;
      orbit.phi = camera.aspect < 0.8 ? 0.78 : 0.92;
      orbit.dist = fit;
      setOrbitFromSpherical();
      controls.update(0);
    },
    resize,
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      controls.dispose();
      input.dispose();
      audio.dispose();
      traffic.dispose();
      weather.dispose();
      disposePerson(player);
      canGeo.dispose();
      canMats.forEach((m) => m.dispose());
      composer?.dispose();
      envTex.dispose();
      pmrem.dispose();
      envDisposables.forEach((d) => d.dispose());
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry?.dispose();
        }
      });
      mats.dispose();
      built.led.texture.dispose();
      disposeTextures();
      resetActorTextures();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
    debug: {
      player: () => P.pos.clone(),
      teleport(x, y, z) {
        P.pos.set(x, y, z);
        P.vel.set(0, 0, 0);
        P.grounded = false;
      },
      traffic: () => traffic,
      setMove(x, y, run = false) {
        moveOverride = x === 0 && y === 0 && !run ? null : { x, y, run };
      },
      step(seconds, draw = true) {
        let s = seconds;
        while (s > 0) {
          const d = Math.min(1 / 60, s);
          simulate(d);
          s -= d;
        }
        if (draw) render();
      },
      camYaw(y: number) {
        walkCam.yaw = y;
      },
      orbit(theta: number, phi: number, k = 1) {
        orbit.theta = theta;
        orbit.phi = phi;
        orbit.dist = fit * k;
        controls.autoRotate = false;
        setOrbitFromSpherical();
        controls.update(0);
      },
      root: () => built.root,
      census() {
        const out: Record<string, number> = {};
        scene.traverseVisible((o) => {
          const any = o as THREE.Mesh;
          if (!(any.isMesh || (o as THREE.Points).isPoints || (o as THREE.Line).isLine || (o as THREE.Sprite).isSprite))
            return;
          let k = o.name || o.parent?.name || o.type;
          let p = o.parent;
          while (p && !p.name && p.parent) p = p.parent;
          k = `${p?.name || 'scene'}>${o.name || o.type}`;
          out[k] = (out[k] ?? 0) + 1;
        });
        return out;
      },
      info: () => ({
        tier,
        mode,
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        grounded: P.grounded,
        pos: P.pos.toArray().map((v) => +v.toFixed(2)),
        light: { ew: traffic.ew, ns: traffic.ns },
        train: traffic.trainState,
        crossing: traffic.crossingActive,
        barrier: +traffic.barrierT.toFixed(2),
        door: +built.door.open.toFixed(2),
        near: near?.id ?? null,
      }),
    },
  };
  return handle;
}
