import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Materials, World, resolveCircle, type Box } from './kit';
import { buildWorldSteps, type Built, type Hotspot } from './world';
import { Traffic } from './traffic';
import { Weather } from './weather';
import { Soundscape } from './audio';
import { Input } from './input';
import { Director, type StreetEvent } from './director';
import { animatePerson, makePerson, resetActorTextures, disposePerson, type Person } from './actors';
import { disposeTextures } from './textures';
import { rand, seedStreet, streetSeed } from './random';
import { Portals } from './portals';
import { StreetLife, type Season } from './life';
import { Seasons } from './season';
import { buildRoomSteps } from './rooms/layouts';
import type { Room, RoomHotspot } from './rooms/hall';
import { resolveFonts } from './rooms/print';
import type { GalleryContent } from '../gallery/types';

export type Mode = 'view' | 'walk';
export type Tier = 'low' | 'medium' | 'high';
export type { Hotspot, Season };

/**
 * Walk-in gallery (the rooms behind the section doors). `closing` = the shutter comes down (a room is being opened or
 * left), `inside` = the visitor is in room `id`, `street` = back outside.
 */
export interface RoomState {
  phase: 'closing' | 'inside' | 'street';
  id: string | null;
  label: string;
  jp: string;
}

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
  /** R85: the season changed (rolled at the start, or the season key) */
  onSeason?: (s: Season) => void;
  /** walk-in gallery: a room is being entered / left (see RoomState) */
  onRoom?: (s: RoomState) => void;
  /** walk-in gallery: an exhibit is being inspected (its id in the current room), 'index' = the room's directory, null = closed */
  onInspect?: (id: string | null) => void;
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
  /** R82: replay a visit's street (its seed is in `debug.info().seed`); omitted = a new street */
  seed?: number;
  /** walk-in gallery: what each section's room shows (gallery/content.ts); no content = the doors lead to the page */
  content?: GalleryContent;
}

export interface DioramaHandle {
  /** R73: roll a random street event now (the dice); returns which one */
  randomEvent(): StreetEvent;
  setMode(m: Mode): void;
  getMode(): Mode;
  setRain(on: boolean): void;
  /** R85: rain, sakura or snow */
  setSeason(s: Season): void;
  getSeason(): Season;
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
  /** walk-in gallery: open the room of section `id` (from anywhere: a sign, a door, the directory) */
  enterRoom(id: string): Promise<boolean>;
  /** back out to the street, in front of the room's door */
  exitRoom(): Promise<void>;
  /** the room the visitor is in (null = the street) */
  getRoom(): string | null;
  /** walk to an exhibit of the current room and inspect it ('index' = the directory) */
  inspect(id: string): void;
  closeInspect(): void;
  /** new content (live extras arrived): rooms not open are rebuilt on their next visit */
  setContent(c: GalleryContent): void;
  /** debug + tests */
  debug: {
    player(): THREE.Vector3;
    /** where the player is drawn this frame (between the last two physics steps) */
    drawn(): number[];
    /** the camera's position and its distance to what it looks at */
    cam(): {
      pos: number[];
      dist: number;
      walk?: number[];
      target?: number[];
      camD?: number;
      blend?: number;
      frames?: number;
    };
    teleport(x: number, y: number, z: number): void;
    traffic(): Traffic;
    setMove(x: number, y: number, run?: boolean): void;
    step(seconds: number, draw?: boolean): void;
    info(): Record<string, unknown>;
    orbit(theta: number, phi: number, k?: number): void;
    camYaw(y: number): void;
    census(): Record<string, number>;
    root(): THREE.Object3D;
    /** R73: what the camera sees: bloom, fog, distance, pixel ratio, multisampling */
    look(): { bloom: number; radius: number; fogNear: number; camDist: number; dpr: number; msaa: number };
    director(): { last: string | null; count: number; available: string[] };
    event(name: StreetEvent): void;
    /** no events by themselves (tests) */
    quiet(): void;
    /** R76: the optional Blender model: loaded yet, and how many COL_ boxes became colliders */
    model(): { loaded: boolean; colliders: number };
    /** R80: shaders are still being prepared (first build or a tier change): the street is not drawn yet */
    warming(): boolean;
    /** R85: each doorway: how open, how bright, armed, guided */
    portals(): { id: string; open: number; glow: number; armed: boolean; guided: boolean }[];
    /** tests that measure walking past a door: the doorways still open, but walking in does not enter (default on) */
    walkIn(on: boolean): void;
    /** walk-in gallery: the open room, its hotspots and what is inspected */
    room(): { id: string | null; hotspots: string[]; inspect: string | null; transit: boolean; cached: string[] };
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
  // R73: MED is multisampled too (it used to render the composer target without any anti-aliasing: jagged, smeared)
  // R85 (owner: "blurry, hazy, my eyes hurt"): MED draws at up to 1.75x the CSS pixels (it was 1.5)
  medium: { dpr: 1.75, bloom: true, shadows: false, shadow: 1024, drops: 5200, splash: 420, lights: 8, msaa: 4 },
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

/**
 * R80: hand the main thread back for a frame (the page paints and the visitor's scroll goes on). A timer backs up the
 * frame callback, which a browser holds back in a hidden tab.
 */
function nextFrame() {
  return new Promise<void>((done) => {
    const t = window.setTimeout(done, 50);
    requestAnimationFrame(() => {
      window.clearTimeout(t);
      window.setTimeout(done, 0);
    });
  });
}
const wait = (ms: number) => new Promise<void>((done) => window.setTimeout(done, ms));

/** R80: a stage of the build, measured (`performance.getEntriesByType('measure')`, names `diorama:*`) */
function measured<T>(name: string, run: () => T): T {
  const t0 = performance.now();
  try {
    return run();
  } finally {
    performance.measure(`diorama:${name}`, { start: t0, end: performance.now() });
  }
}

type ProgramState = { currentProgram?: { id?: number; isReady(): boolean; getUniforms(): unknown } };

/**
 * R80 (owner: "when i scroll to this part ... it start lagging, crashing"): the street used to be built in ONE task of
 * 4.3 - 4.9 s on a laptop GPU (D3D11) - 4.1 s of it compiling shaders - so the page froze in the middle of the scroll.
 * It is now built in stages one frame apart; the shaders compile in parallel (KHR_parallel_shader_compile) for the
 * render target they are really drawn into, and the textures upload in short slices. Resolves once the first frame
 * can be drawn without a stall.
 */
export async function createTokyoDiorama(opts: DioramaOptions): Promise<DioramaHandle> {
  const { container } = opts;
  const calm = !!opts.reducedMotion;
  seedStreet(opts.seed);

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
  const renderer = measured(
    'renderer',
    () =>
      new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
        alpha: false,
      }),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let autoTier = opts.tier === undefined || opts.tier === 'auto';
  let tier: Tier = autoTier ? detectTier(renderer.getContext()) : (opts.tier as Tier);
  await nextFrame();

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
  const envTex = measured('environment', () => pmrem.fromScene(envScene, 0.035).texture);
  scene.environment = envTex;
  scene.environmentIntensity = 0.55;

  const hemi = new THREE.HemisphereLight(0x5a74c4, 0x241a2a, 0.95);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xa9bcff, 0.85);
  moon.position.set(-26, 44, -7);
  moon.target.position.set(0, 0, 11);
  moon.shadow.camera.left = -36;
  moon.shadow.camera.right = 36;
  moon.shadow.camera.top = 36;
  moon.shadow.camera.bottom = -36;
  moon.shadow.camera.near = 10;
  moon.shadow.camera.far = 110;
  moon.shadow.bias = -0.0006;
  moon.shadow.normalBias = 0.03;
  scene.add(moon, moon.target);

  await nextFrame();
  const mats = new Materials();
  const world = new World();
  let built: Built;
  {
    const steps = buildWorldSteps(mats, world);
    for (let i = 0; ; i++) {
      const r = measured(`world-${i}`, () => steps.next());
      if (r.done) {
        built = r.value;
        break;
      }
      await nextFrame();
    }
  }
  scene.add(built.root);
  // R85: the walk-in doorways (one per section door)
  const portals = new Portals(built.root, world, null);
  // walk-in gallery: what is drawn and walked on right now - the street, or a room behind a section door
  let activeScene: THREE.Scene = scene;
  let aw: World = world;
  let room: Room | null = null;
  await nextFrame();

  // R76: a lighter crowd on the low tier (phones without a strong graphics chip)
  const traffic = measured(
    'traffic',
    () => new Traffic(built.root, mats, world, built, calm, tier === 'low' ? 'low' : 'full'),
  );
  await nextFrame();
  const weather = measured('weather', () => new Weather(built, world, calm));
  scene.add(weather.group);
  // R85: the season of this visit - rain, sakura or snow (rolled; reduced motion keeps the classic rain)
  const seasons = measured('seasons', () => {
    const ray = new THREE.Raycaster();
    built.root.updateMatrixWorld(true);
    const solids = built.root.children.filter((o) => (o as THREE.Mesh).isMesh && o.name.startsWith('batch:'));
    return new Seasons(built, calm, (x, z) => {
      ray.set(new THREE.Vector3(x, 60, z), new THREE.Vector3(0, -1, 0));
      return ray.intersectObjects(solids, false)[0]?.point.y ?? -1;
    });
  });
  scene.add(seasons.group);
  await nextFrame();
  const audio = new Soundscape();
  const input = new Input(container, canvas);
  // R85: bicycles, dogs, cats, speech bubbles, beeping cars - on top of the R82 traffic
  const life = measured(
    'life',
    () => new StreetLife(built.root, world, traffic, audio, container, calm, tier === 'low' ? 'low' : 'full'),
  );
  // R73: each visit starts with its own rain, from a light drizzle to a heavy shower
  weather.baseLevel = weather.level = calm ? 1 : 0.55 + rand() * 0.75;
  // R85: the season (rolled per visit from the street's seed); `precip` = the rain key (rain, snow or petals falling)
  let precip = true;
  let season: Season = 'rain';
  const setSeason = (s: Season) => {
    season = s;
    seasons.set(s);
    life.season = s;
    weather.setRain(precip && s === 'rain');
    opts.onSeason?.(s);
  };
  {
    const r = rand();
    setSeason(calm ? 'rain' : r < 0.45 ? 'rain' : r < 0.75 ? 'sakura' : 'snow');
  }
  const director = new Director({
    hemi,
    moon,
    weather,
    traffic,
    built,
    audio,
    calm,
    gift: () => dropCan(),
    toast: (t) => opts.onToast?.(t),
  });

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
  // R76: found once (it was looked up by name, a walk of the whole figure, every frame)
  const playerBlob = player.group.getObjectByName('blob') ?? null;
  const P = {
    pos: built.spawn.clone(),
    // R70 (owner: 'when i walking ... the whole thing 3d here is shaking'): physics runs at 120 Hz, the screen at 60 -
    // 180 Hz, so a frame got 0, 1 or 2 steps and the player and the camera moved in uneven jumps. What is DRAWN is the
    // position between the last two physics steps (prev -> pos, by the time left over), so it moves evenly.
    prev: built.spawn.clone(),
    drawn: built.spawn.clone(),
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
  // R85: the middle of the bigger table (the south district runs to z = 40)
  controls.target.set(0, -0.5, 9.5);
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
  let idleTimer = 0;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    idleTimer = 0;
  });
  canvas.style.touchAction = 'pan-y';

  let fit = 90;
  // R73: each visit opens on its own angle of the block (reduced motion: the classic one)
  const homeTheta = calm ? -0.52 : -0.52 + (rand() - 0.5) * 1.4;
  const orbit = { theta: homeTheta, phi: 0.92, dist: 90 };
  const setOrbitFromSpherical = () => {
    const t = controls.target;
    camera.position.set(
      t.x + orbit.dist * Math.sin(orbit.phi) * Math.sin(orbit.theta),
      t.y + orbit.dist * Math.cos(orbit.phi),
      t.z + orbit.dist * Math.sin(orbit.phi) * Math.cos(orbit.theta),
    );
    camera.lookAt(t);
  };

  // R70: camD = how far behind the target the camera actually is (the wanted distance, shortened by walls)
  const walkCam = {
    // wanted (input moves these) ...
    yaw: 0,
    pitch: 0.42,
    dist: 5.6,
    // ... and shown (eased to them)
    yawNow: 0,
    pitchNow: 0.42,
    distNow: 5.6,
    camD: 5.6,
    groundY: 0.15,
    floor: 0.5,
    target: new THREE.Vector3(),
    tv: new THREE.Vector3(),
    pos: new THREE.Vector3(),
  };
  let mode: Mode = 'view';
  let blend = 0; // 0 = orbit, 1 = follow camera
  const blendFrom = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  const lookNow = new THREE.Vector3();
  // R76: scratch vectors - the frame loop used to clone three vectors every frame (garbage the phone collects mid-walk)
  const camTmp = new THREE.Vector3();
  const orbitTmp = new THREE.Vector3();

  /* ------------------------------------------------------------ post */
  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  let renderPass: RenderPass | null = null;
  let outputPass: OutputPass | null = null;
  const size = new THREE.Vector2(1, 1);

  // R73 (owner: "why it look so blur? make my eye fainted"): the bloom was strong (0.68) and wide (radius 0.5), so from
  // the VIEW camera every lit sign smeared into the next. Now a tight, low halo on the neon only.
  const BLOOM_RADIUS = 0.16;
  const bloomView = () => (tier === 'high' ? 0.34 : 0.3);
  // R76: EffectComposer.dispose() frees its own two targets but not its passes - every tier change (auto or the gauge
  // key) leaked the bloom pass' mip chain of render targets on the graphics card
  const disposeComposer = () => {
    if (composer) {
      for (const pass of composer.passes) pass.dispose();
      composer.dispose();
    }
    composer = null;
  };
  const applyTier = () => {
    const p = PROFILES[tier];
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, p.dpr));
    // R76: this read `p.shadows && !calm ? true : p.shadows` - the same value either way
    const shadows = p.shadows;
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
    disposeComposer();
    bloom = null;
    renderPass = null;
    outputPass = null;
    if (p.bloom) {
      const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: p.msaa });
      composer = new EffectComposer(renderer, rt);
      renderPass = new RenderPass(activeScene, camera);
      composer.addPass(renderPass);
      bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), bloomView(), BLOOM_RADIUS, 0.92);
      composer.addPass(bloom);
      // R80: the defines OutputPass would set on its first frame (sRGB, ACES - fixed above), set now so the warm-up
      // compiles the very program that frame uses (three 0.180.0 internals; the version is pinned)
      const output = new OutputPass();
      output.material.defines = { SRGB_TRANSFER: '', ACES_FILMIC_TONE_MAPPING: '' };
      Object.assign(output, { _outputColorSpace: renderer.outputColorSpace, _toneMapping: renderer.toneMapping });
      composer.addPass(output);
      outputPass = output;
    }
    setLook(!!room);
    resize();
    opts.onTier?.(tier);
  };

  /**
   * Walk-in gallery: the street is graded with ACES (the night neon look); the rooms with Khronos PBR Neutral, which
   * keeps the photos' and certificates' own colours. Both programs are compiled before they are first used (the room's
   * warm-up runs with the room's grade), so switching costs no shader compile.
   */
  function setLook(indoor: boolean) {
    const tm = indoor ? THREE.NeutralToneMapping : THREE.ACESFilmicToneMapping;
    renderer.toneMapping = tm;
    if (outputPass) {
      // three 0.180.0 OutputPass internals (the version is pinned): the defines its next frame would set
      outputPass.material.defines = indoor
        ? { SRGB_TRANSFER: '', NEUTRAL_TONE_MAPPING: '' }
        : { SRGB_TRANSFER: '', ACES_FILMIC_TONE_MAPPING: '' };
      outputPass.material.needsUpdate = true;
      Object.assign(outputPass, { _toneMapping: tm });
    }
  }

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
    for (const s of pinSlots) measurePin(s);
    // fit the whole table in view at any aspect ratio (phones in portrait get a farther camera)
    const vf = THREE.MathUtils.degToRad(camera.fov);
    const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
    const prev = fit;
    fit = (37 / Math.sin(Math.min(vf * 1.15, hf) / 2)) * (camera.aspect < 0.8 ? 0.62 : 0.74);
    controls.minDistance = fit * 0.42;
    controls.maxDistance = fit * 1.3;
    if (mode === 'view' && Math.abs(prev - fit) > 0.01) {
      const d = camera.position.distanceTo(controls.target);
      const nd = THREE.MathUtils.clamp((d / prev) * fit, controls.minDistance, controls.maxDistance);
      camera.position.sub(controls.target).setLength(nd).add(controls.target);
    }
  }

  /* ------------------------------------------------------------ hotspots + pins */
  type PinSlot = {
    id: string;
    el: HTMLElement;
    w: number;
    h: number;
    px: number;
    py: number;
    depth: number;
    vis: boolean;
    shown: boolean;
    lx: number;
    ly: number;
  };
  const pinSlots: PinSlot[] = [];
  const hotspotById = new Map(built.hotspots.map((h) => [h.id, h]));
  /** a sign's size, read when it is bound and on resize (never inside the frame loop) */
  const measurePin = (s: PinSlot) => {
    s.w = s.el.offsetWidth;
    s.h = s.el.offsetHeight;
  };
  let near: Hotspot | null = null;
  const tmpV = new THREE.Vector3();

  const activate = (h: Hotspot) => {
    if (h.id === 'vending') {
      dropCan();
      opts.onToast?.('ガコン！ A cold drink drops out. ¥130');
      return;
    }
    audio.click();
    // walk-in gallery: a section door opens its room (no jump to the page); exhibits open the inspect panel
    if (room) {
      const rh = room.hotspots.find((x) => x.id === h.id);
      if (rh?.kind === 'exit') void exitRoom();
      else if (rh) openInspect(rh);
      return;
    }
    if (content?.[h.id]) {
      void enterRoom(h.id);
      return;
    }
    opts.onActivate?.(h);
  };
  function dropCan() {
    {
      audio.clunk();
      const mesh = new THREE.Mesh(canGeo, canMats[cans.length % canMats.length]);
      mesh.castShadow = true;
      mesh.position.copy(built.vendingSlot);
      built.root.add(mesh);
      cans.push({
        mesh,
        vel: new THREE.Vector3((rand() - 0.5) * 0.6, 1.4, 1.5 + rand() * 0.6),
        life: 9,
        spin: 0,
      });
      if (cans.length > 6) {
        const old = cans.shift()!;
        built.root.remove(old.mesh);
      }
    }
  }

  /* ------------------------------------------------------------ player physics (fixed step) */
  const scratch: Box[] = [];
  const fwd = new THREE.Vector3();
  const right = new THREE.Vector3();
  const wish = new THREE.Vector3();
  let moveOverride: { x: number; y: number; run: boolean } | null = null;

  const physicsStep = (h: number) => {
    P.prev.copy(P.pos);
    const mx = moveOverride ? moveOverride.x : input.move.x;
    const my = moveOverride ? moveOverride.y : input.move.y;
    const run = moveOverride ? moveOverride.run : input.run;
    const active = mode === 'walk';
    // movement follows the view the visitor SEES (the eased yaw)
    fwd.set(-Math.sin(walkCam.yawNow), 0, -Math.cos(walkCam.yawNow));
    right.set(Math.cos(walkCam.yawNow), 0, -Math.sin(walkCam.yawNow));
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

    aw.query(P.pos.x, P.pos.z, RADIUS + 0.4, scratch);
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
    const g = aw.groundAt(P.pos.x, P.pos.z, P.pos.y + STEP, 0.14, scratch);
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
    P.pos.copy(room ? room.spawn : built.spawn);
    P.prev.copy(P.pos);
    P.vel.set(0, 0, 0);
    P.grounded = true;
  };

  /* ------------------------------------------------------------ cameras per frame */
  /**
   * R85 steady walk camera (owner: "the picture shakes, trembles, is blurry ... when I press W / when I land"; measured
   * in a stepped run before the change: camera jerk up to 108 mm/frame^2 strafing, 46 mm/frame steps of the collision
   * distance crossing a kerb, the ground clamp snapping 15 cm when the camera passed over a kerb or a step).
   *  - mouse / touch look moves a TARGET yaw / pitch; the camera eases to it (no frame-to-frame mouse jitter)
   *  - the camera never turns by itself while strafing or walking back (that fed back into the movement: the slow
   *    spiral); walking forward it recentres gently behind the walker after 2.5 s without a look
   *  - the follow point is a critically damped spring (no lurch when starting or stopping); its height follows the
   *    ground the walker stands on, and a jump moves it only partly (no bounce on landing)
   *  - collisions: four rays (a thin "sphere"), only walls and buildings (anything at least 1.3 m wide); in fast, out
   *    slowly, with a dead band so it does not pump; very close to a wall the camera rises over the shoulder instead
   *  - the floor under the camera is a smoothed minimum height, never a snap
   */
  const spring = (x: number, v: number, to: number, w: number, dt: number) => {
    // critically damped: exact for any dt (stable on 30 - 240 Hz screens)
    const e = Math.exp(-w * dt);
    const d = x - to;
    const t = (v + w * d) * dt;
    return { x: to + (d + t) * e, v: (v - w * t) * e };
  };
  const ray4: THREE.Vector3[] = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const camRight = new THREE.Vector3();
  const updateWalkCamera = (dt: number, instant = false) => {
    walkCam.yaw -= input.look.x;
    walkCam.pitch = THREE.MathUtils.clamp(walkCam.pitch + input.look.y, -0.1, 1.15);
    input.look.set(0, 0);
    walkCam.dist = THREE.MathUtils.clamp(walkCam.dist + input.zoom, 2.4, room ? 8 : 12);
    input.zoom = 0;
    const now = performance.now() / 1000;
    const sp = Math.hypot(P.vel.x, P.vel.z);
    const mv = moveOverride ?? input.move;
    if (sp > 0.8 && mv.y > 0.5 && now - input.lastLook > 2.5 && !inspecting) {
      let d = player.yaw + Math.PI - walkCam.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      if (Math.abs(d) < 2.0) walkCam.yaw += d * (1 - Math.exp(-dt * 0.8 * Math.min(1, sp / 3)));
    }
    // ease the view to the wanted yaw / pitch / distance
    if (instant) {
      walkCam.yawNow = walkCam.yaw;
      walkCam.pitchNow = walkCam.pitch;
      walkCam.distNow = walkCam.dist;
    } else {
      const kl = 1 - Math.exp(-dt * 16);
      let dy = walkCam.yaw - walkCam.yawNow;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      walkCam.yawNow += dy * kl;
      walkCam.pitchNow += (walkCam.pitch - walkCam.pitchNow) * kl;
      walkCam.distNow += (walkCam.dist - walkCam.distNow) * (1 - Math.exp(-dt * 8));
    }
    // follow point: xz spring on the drawn walker; y on the ground it stands on (a jump moves it 40 %)
    if (P.grounded) walkCam.groundY = P.drawn.y;
    const ty = walkCam.groundY + 1.3 + Math.max(0, P.drawn.y - walkCam.groundY) * 0.4;
    if (instant) {
      walkCam.target.set(P.drawn.x, ty, P.drawn.z);
      walkCam.tv.set(0, 0, 0);
    } else {
      const sx = spring(walkCam.target.x, walkCam.tv.x, P.drawn.x, 11, dt);
      const sz = spring(walkCam.target.z, walkCam.tv.z, P.drawn.z, 11, dt);
      const sy = spring(walkCam.target.y, walkCam.tv.y, ty, 6, dt);
      walkCam.target.set(sx.x, sy.x, sz.x);
      walkCam.tv.set(sx.v, sy.v, sz.v);
    }
    // close to a wall the camera rises (over the shoulder) instead of hugging the walker's back
    const close = THREE.MathUtils.clamp((1.8 - walkCam.camD) / 1.1, 0, 1);
    const pitch = walkCam.pitchNow + close * 0.35;
    const cp = Math.cos(pitch);
    tmpV.set(Math.sin(walkCam.yawNow) * cp, Math.sin(pitch), Math.cos(walkCam.yawNow) * cp);
    // four rays round the line (a thin sphere): an edge or a gap between two boxes cannot flick the distance
    camRight.set(Math.cos(walkCam.yawNow), 0, -Math.sin(walkCam.yawNow)).multiplyScalar(0.22);
    ray4[0].copy(walkCam.target).add(camRight);
    ray4[1].copy(walkCam.target).sub(camRight);
    ray4[2].copy(walkCam.target).setY(walkCam.target.y + 0.2);
    ray4[3].copy(walkCam.target).setY(walkCam.target.y - 0.15);
    let hit = Infinity;
    for (const o of ray4) hit = Math.min(hit, aw.raycast(o, tmpV, walkCam.distNow + 0.4, true, 1.3));
    const d = Math.max(0.9, Math.min(walkCam.distNow, hit - 0.35));
    if (instant) walkCam.camD = d;
    else if (d < walkCam.camD) walkCam.camD += (d - walkCam.camD) * (1 - Math.exp(-dt * 14));
    else if (d - walkCam.camD > 0.15) walkCam.camD += (d - 0.15 - walkCam.camD) * (1 - Math.exp(-dt * 2.2));
    const desired = camTmp.copy(tmpV).multiplyScalar(walkCam.camD).add(walkCam.target);
    // keep it above the ground (kerbs, steps, pavement: tops under the follow point), as a smoothed floor - a kerb
    // passing under the camera used to lift it 15 cm in one frame
    const gy = aw.groundAt(desired.x, desired.z, Math.min(desired.y, walkCam.target.y - 0.2), 0.05, scratch);
    const floor = (gy > -Infinity ? gy : walkCam.groundY) + 0.4;
    if (instant) walkCam.floor = floor;
    else walkCam.floor += (floor - walkCam.floor) * (1 - Math.exp(-dt * 5));
    desired.y = Math.max(desired.y, walkCam.floor);
    walkCam.pos.copy(desired);
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
  let slowWindows = 0;
  let prevBrake = false;
  let lastNear: Hotspot | null = null;

  let tickCount = 0;
  let simMs = 0;
  let renderMs = 0;
  const tick = () => {
    tickCount++;
    const dt = Math.min(0.05, clock.getDelta());
    const ts = performance.now();
    simulate(dt);
    // R85: CPU cost per frame, measured (AGENTS.md "measure smoothness"), read by debug.info().ms
    simMs += (performance.now() - ts - simMs) * 0.05;
    // R80: while new shaders compile (a tier change) the street keeps moving but is not drawn: a draw would wait for
    // them. Nor is the frame rate counted.
    if (warming > 0) return;
    // walk-in gallery: a photo that has just arrived goes to the graphics card, one per frame
    const up = uploads.shift();
    if (up) renderer.initTexture(up);
    render();
    // adaptive quality: drop a tier if the device cannot hold ~40 fps
    sinceStart += dt;
    fpsAcc += dt;
    fpsFrames++;
    fpsTime += dt;
    if (fpsTime > 2.5) {
      const fps = fpsFrames / fpsAcc;
      // R73: only after two slow windows in a row (one hitch - a tab switch, a GC - used to drop the street to LOW
      // for good, which looked blurred); and the visitor is told
      slowWindows = fps < 38 ? slowWindows + 1 : 0;
      if (autoTier && sinceStart > 4 && slowWindows >= 2 && tier !== 'low') {
        tier = tier === 'high' ? 'medium' : 'low';
        slowWindows = 0;
        director.settle();
        applyTier();
        void warmUp(activeScene); // R80: the new shaders compile without freezing the page
        opts.onToast?.(`Graphics set to ${tier === 'medium' ? 'MED' : 'LOW'} to keep it smooth.`);
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
    P.drawn.lerpVectors(P.prev, P.pos, Math.min(1, acc / FIXED));

    // player visuals
    const sp = Math.hypot(P.vel.x, P.vel.z);
    if (sp > 0.15) {
      const want = Math.atan2(P.vel.x, P.vel.z);
      let d = want - player.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      player.yaw += d * (1 - Math.exp(-dt * 12));
    }
    player.group.position.copy(P.drawn);
    player.group.rotation.y = player.yaw;
    animatePerson(player, sp, dt, !P.grounded, calm);
    const blob = playerBlob;
    if (blob) {
      const g = aw.groundAt(P.pos.x, P.pos.z, P.pos.y + 0.05, 0.05, scratch);
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
    // in a room the player is not on the street: the traffic runs on without them
    traffic.update(dt, { pos: P.pos, radius: RADIUS, active: !room });
    life.update(dt, camera, size.x, size.y, mode === 'walk' && !room ? P.pos : null, !!room || transit);
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
    // walk-in gallery: indoors the rain is heard through the walls and the train not at all
    audio.update(room ? weather.intensity * 0.3 : weather.intensity, room ? 0 : trainNear);
    void season;

    // konbini automatic doors (open for the player and for pedestrians)
    const door = built.door;
    const dc = door.center;
    let wantOpen = !room && Math.abs(P.pos.x - dc.x) < 1.6 && P.pos.z > dc.z - 2.4 && P.pos.z < dc.z + 2.2;
    for (const p of traffic.peds) if (Math.abs(p.pos.x - dc.x) < 1.6 && Math.abs(p.pos.z - dc.z) < 2) wantOpen = true;
    const before = door.open;
    door.open = THREE.MathUtils.clamp(door.open + (wantOpen ? dt / 0.45 : -dt / 0.7), 0, 1);
    if (before === 0 && door.open > 0 && wantOpen && mode === 'walk' && !room) audio.chime();
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

    if (!room) {
      weather.update(dt, camera);
      seasons.update(dt, precip && season !== 'rain', size.y * renderer.getPixelRatio(), camera.fov);
    }
    director.update(dt);
    built.led.update(calm ? dt * 0.4 : dt);
    const t = traffic.clock;
    built.tv.emissiveIntensity = calm ? 1 : 0.8 + 0.6 * Math.abs(Math.sin(t * 2.3) * Math.sin(t * 5.1));
    built.chase.forEach((m, i) => (m.emissiveIntensity = calm ? 2.5 : Math.floor(t * 6) % 3 === i ? 4 : 0.6));

    // hotspots (in a room: its exhibits and its exit; while the shutter moves or an exhibit is open: none)
    if (mode === 'walk' && !transit && !inspecting) {
      let best: Hotspot | null = null;
      let bd = Infinity;
      for (const h of room ? room.hotspots.map(roomSpot) : built.hotspots) {
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
    room?.update(dt, near && room ? (room.hotspots.find((h) => h.id === near!.id) ?? null) : null, calm, P.pos);
    // R85: walking INTO a glowing doorway goes through it (street -> room, room -> street)
    {
      const street = mode === 'walk' && !room && !transit && blend > 0.95;
      const entered = portals.update(dt, street ? P.pos : null, P.vel, street, calm);
      if (entered && content?.[entered]) void enterRoom(entered);
      if (
        room &&
        mode === 'walk' &&
        !transit &&
        !inspecting &&
        P.pos.z > room.exitZ - 0.8 &&
        Math.abs(P.pos.x) < 1.0 &&
        P.vel.z > 0.4
      )
        void exitRoom();
    }
    updateCompass();

    // cameras
    if (mode === 'walk') updateWalkCamera(dt);
    // walk-in gallery: the inspect camera eases to frame the exhibit, and back to the walk camera on close
    {
      const want = inspecting ? 1 : 0;
      inspectBlend = calm ? want : inspectBlend + THREE.MathUtils.clamp(want - inspectBlend, -dt / 0.55, dt / 0.55);
    }
    const target = mode === 'walk' ? 1 : 0;
    const prevBlend = blend;
    // R70 (the shaking, found by logging every frame): this used to read 'target > blend ? +step : -step'. With the
    // walk camera fully in (target 1, blend 1) that took a step BACK towards the orbit camera, the next frame a step
    // forward again: the camera flicked ~5 cm between the two cameras every 2 - 3 frames for as long as one walked.
    // Now it moves towards the target and stops there.
    blend = calm ? target : blend + THREE.MathUtils.clamp(target - blend, -dt / 1.1, dt / 1.1);
    if (mode === 'view') {
      if (!controls.autoRotate && !calm) {
        idleTimer += dt;
        if (idleTimer > 8) controls.autoRotate = true;
      }
      controls.update(dt);
    }
    if (blend > 0 && blend < 1) {
      const s = blend * blend * (3 - 2 * blend);
      if (mode === 'walk') {
        camera.position.lerpVectors(blendFrom.pos, walkCam.pos, s);
        lookNow.lerpVectors(blendFrom.look, walkCam.target, s);
      } else {
        setOrbitFromSpherical();
        camera.position.lerpVectors(orbitTmp.copy(camera.position), walkCam.pos, s);
        lookNow.lerpVectors(controls.target, walkCam.target, s);
      }
      camera.lookAt(lookNow);
    } else if (blend === 1) {
      if (inspectBlend > 0 && inspectPose) {
        const s = inspectBlend * inspectBlend * (3 - 2 * inspectBlend);
        framed(inspectPose);
        camera.position.lerpVectors(walkCam.pos, inspectView, s);
        lookNow.lerpVectors(walkCam.target, inspectFocus, s);
        camera.lookAt(lookNow);
      } else {
        camera.position.copy(walkCam.pos);
        camera.lookAt(walkCam.target);
      }
    } else if (prevBlend > 0 && blend === 0) {
      setOrbitFromSpherical();
      controls.update(0);
    }
    // street level fills the screen with lit surfaces: bloom eases off as the camera comes down
    if (bloom) {
      // R85: at street level the halo is very small (0.12; was 0.22) - lit signs stay crisp
      bloom.strength = THREE.MathUtils.lerp(bloomView(), 0.12, blend);
      // a bright paper room would bloom from every wall: no bloom indoors (a pass toggle, no shader change)
      bloom.enabled = !room;
    }
    // R73: the fog began 90 m from the camera - the VIEW camera is ~70 m out, so the far half of the table was in haze.
    // Now it starts behind the table's far edge, wherever the camera is; in the street it stays as it was.
    {
      const fog = scene.fog as THREE.Fog;
      const out = camera.position.distanceTo(controls.target);
      fog.near = THREE.MathUtils.lerp(out + 38, 90, blend);
      fog.far = THREE.MathUtils.lerp(out + 170, 230, blend);
    }
    renderer.toneMappingExposure = room ? 1.0 : THREE.MathUtils.lerp(1.18, 1.0, blend);
    // walk-in gallery: the walker steps out of the picture while an exhibit is inspected
    player.group.visible = inspectBlend < 0.35;
    // walk-in gallery: a wider lens indoors, wider still on a phone held upright (the room fits around the walker)
    const fovWant = mode === 'walk' ? (room ? (camera.aspect < 0.8 ? 72 : 58) : 50) : 32;
    if (Math.abs(camera.fov - fovWant) > 0.05) {
      camera.fov += (fovWant - camera.fov) * (calm ? 1 : 1 - Math.exp(-dt * 3));
      camera.updateProjectionMatrix();
    }
    weather.setViewport(size.y * renderer.getPixelRatio(), camera.fov);

    // pins follow their hotspots. R70 (owner: the signs 'dissappear' after switching to walk): in walk mode too, over
    // each building that leads to a section, once the camera has finished moving into the street
    const showPins = !room && !transit && ((mode === 'view' && blend < 0.05) || (mode === 'walk' && blend > 0.95));
    for (const slot of pinSlots) {
      const h = hotspotById.get(slot.id);
      slot.vis = false;
      if (!h || !showPins) continue;
      tmpV
        .copy(h.pos)
        .setY(h.pos.y + 2.8)
        .project(camera);
      slot.px = ((tmpV.x + 1) / 2) * size.x;
      slot.py = ((1 - tmpV.y) / 2) * size.y;
      slot.depth = tmpV.z;
      slot.vis = tmpV.z < 1 && slot.px > 56 && slot.px < size.x - 56 && slot.py > 48 && slot.py < size.y - 8;
    }
    // R76: on a narrow stage the signs were drawn on top of each other. The nearest sign wins; a sign that would
    // overlap a nearer one waits until the camera turns. (A sign sits centred above its point: translate(-50%, -100%).)
    pinSlots.sort((a, b) => a.depth - b.depth);
    for (let i = 0; i < pinSlots.length; i++) {
      const a = pinSlots[i];
      if (!a.vis) continue;
      for (let j = 0; j < i; j++) {
        const b = pinSlots[j];
        if (b.vis && Math.abs(a.px - b.px) < (a.w + b.w) / 2 + 4 && a.py - a.h < b.py + 4 && b.py - b.h < a.py + 4) {
          a.vis = false;
          break;
        }
      }
    }
    // only what changed is written (a style write per sign per frame restyled the overlay every frame)
    for (const s of pinSlots) {
      if (s.vis !== s.shown) {
        s.shown = s.vis;
        s.el.style.visibility = s.vis ? 'visible' : 'hidden';
      }
      if (s.vis && (Math.abs(s.px - s.lx) > 0.2 || Math.abs(s.py - s.ly) > 0.2)) {
        s.lx = s.px;
        s.ly = s.py;
        s.el.style.transform = `translate(${s.px.toFixed(1)}px, ${s.py.toFixed(1)}px) translate(-50%, -100%)`;
      }
    }
  }

  function render() {
    const tr = performance.now();
    if (composer) {
      if (renderPass) renderPass.scene = activeScene;
      composer.render();
    } else renderer.render(activeScene, camera);
    renderMs += (performance.now() - tr - renderMs) * 0.05;
  }

  // R80: nothing is drawn while shaders compile (a tier change, see tick); the loop starts once the first build is ready
  let warming = 0;
  let building = true;
  const setRunning = () => {
    const should = visible && pageVisible && !lost && !building && !disposed;
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
    // R82: the loop restarts here too (it waited for a scroll or a tab switch to notice); the section may still rebuild
    setRunning();
    opts.onContextRestored?.();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  measured('tier', applyTier);
  await nextFrame();
  orbit.dist = fit;
  if (camera.aspect < 0.8) orbit.phi = 0.78; // portrait phones: a little more top-down fills the frame
  setOrbitFromSpherical();
  controls.update(0);
  walkCam.yaw = Math.PI * 0.08;
  walkCam.target.copy(P.pos).add(new THREE.Vector3(0, 1.3, 0));
  updateWalkCamera(0, true);
  // optional Blender model (loader code is only downloaded when a model is configured)
  let modelGroup: THREE.Object3D | null = null;
  let modelColliders = 0;
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
            modelColliders++;
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
        // R76: the kit's Blender guide lists Draco as optional, but no Draco decoder is hosted: say so plainly
        const draco = /draco/i.test(String(err));
        console.warn(
          draco
            ? '[tokyo-diorama] the model is Draco-compressed; export it uncompressed or with Meshopt (see BLENDER.md). Using the built-in block.'
            : '[tokyo-diorama] model failed to load, using the built-in block',
          err,
        );
      }
    })();
  }
  /** R76: the model's geometries, materials and textures go with the street (they were never freed on unmount) */
  function disposeModel() {
    if (!modelGroup) return;
    modelGroup.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.geometry?.dispose();
      for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
        if (!mat) continue;
        for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
        mat.dispose();
      }
    });
    modelGroup.removeFromParent();
    modelGroup = null;
  }

  /**
   * R80: compile every shader the next frames need WITHOUT blocking, then upload the textures in short slices.
   * The old `renderer.compile(scene, camera)` compiled for the screen; with bloom the street is drawn into the composer's
   * render target (linear colour, no tone mapping = other programs), so every program was compiled a second time,
   * synchronously, on the first frame (4.1 s of shader linking on a D3D11 laptop). The bloom / output passes and the
   * vending cans are compiled too. Without KHR_parallel_shader_compile each program is linked in its own slice.
   */
  const parallel = renderer.extensions.has('KHR_parallel_shader_compile');
  /** walk-in gallery: the tier each scene's shaders were last prepared for (a tier change re-prepares on entry) */
  const warmedAt = new WeakMap<THREE.Scene, Tier>();
  const warmGeo = new THREE.PlaneGeometry(1, 1);
  const uploaded = new WeakSet<THREE.Texture>();
  /**
   * Leaves three's clipping state at `n` planes (as when a material with n planes was the last one drawn), so that
   * compile() builds the same program as the real draw: one tiny unlit draw of a clipped plain material.
   */
  const primers = new Map<number, THREE.Scene>();
  const primerMats: THREE.Material[] = [];
  function primeClipping(n: number, target: THREE.WebGLRenderTarget | null) {
    let s = primers.get(n);
    if (!s) {
      const far = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1e6);
      const mat = new THREE.MeshBasicMaterial({ clippingPlanes: Array.from({ length: n }, () => far) });
      primerMats.push(mat);
      const quad = new THREE.Mesh(warmGeo, mat);
      quad.frustumCulled = false;
      quad.scale.setScalar(1e-4);
      s = new THREE.Scene();
      s.add(quad);
      primers.set(n, s);
    }
    const auto = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setRenderTarget(target);
    renderer.render(s, camera);
    renderer.autoClear = auto;
  }
  /**
   * Waits - without blocking - until the graphics process has done everything sent so far (a WebGL2 fence, polled).
   * `gl.finish()` does not wait in Chrome: queued uploads and warm-up draws piled up there, and the page's next frame
   * waited for all of them at once (978 ms on software WebGL). WebGL1: one frame.
   */
  async function gpuDone() {
    const g = renderer.getContext();
    const sync =
      typeof WebGL2RenderingContext !== 'undefined' && g instanceof WebGL2RenderingContext
        ? g.fenceSync(g.SYNC_GPU_COMMANDS_COMPLETE, 0)
        : null;
    if (!sync) return nextFrame();
    const g2 = g as WebGL2RenderingContext;
    g2.flush();
    try {
      // a fence never signals before the page's code returns to the event loop: this always yields at least once
      while (!disposed && !lost && g2.clientWaitSync(sync, 0, 0) === g2.TIMEOUT_EXPIRED) await wait(8);
    } finally {
      g2.deleteSync(sync);
    }
  }
  async function warmUp(root: THREE.Scene = scene) {
    const street = root === scene;
    warming++;
    try {
      const t0 = performance.now();
      const drawTarget = composer ? composer.readBuffer : null;
      const passes = new THREE.Scene();
      for (const pass of composer?.passes ?? [])
        for (const v of Object.values(pass))
          for (const m of Array.isArray(v) ? v : [v])
            if (m instanceof THREE.Material) passes.add(new THREE.Mesh(warmGeo, m));
      const extras = new THREE.Scene();
      if (street) for (const m of canMats) extras.add(new THREE.Mesh(canGeo, m));
      // materials cut by clipping planes (cars and walkers at the table's edge): compile() does not apply a material's
      // own planes, so they are compiled again below with the clipping state primed to their plane count
      const clipped = new Map<number, THREE.Scene>();
      const seen = new Set<THREE.Material>();
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh || (o as THREE.InstancedMesh).isInstancedMesh) return;
        for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          const n = m.clippingPlanes?.length ?? 0;
          if (!n || m.clipIntersection || seen.has(m)) continue;
          seen.add(m);
          if (!clipped.has(n)) clipped.set(n, new THREE.Scene());
          clipped.get(n)!.add(new THREE.Mesh(mesh.geometry, m));
        }
      });
      type Job = { root: THREE.Object3D; target: THREE.WebGLRenderTarget | null; lights: THREE.Scene; planes?: number };
      const jobs: Job[] = [
        { root, target: drawTarget, lights: root },
        { root: extras, target: drawTarget, lights: root },
        // the passes draw a full-screen quad with no lights, into their own targets and (the last) onto the screen
        { root: passes, target: drawTarget, lights: passes },
        { root: passes, target: null, lights: passes },
        // last: a primed clipping state stays set until the next real draw
        ...[...clipped].map(([n, part]) => ({ root: part, target: drawTarget, lights: root, planes: n })),
      ];
      // Without KHR_parallel_shader_compile (software WebGL, some phones) the graphics process links the queued programs
      // in order and the first query waits for ALL of them (a 5.6 s task on SwiftShader): there each material is
      // compiled alone (in a scene of its own, as a copy of an object that carries it) and used at once, a few per frame.
      // With it, the requests are split the same way: one request for the whole street was a 70 - 430 ms task.
      const split = (from: THREE.Object3D): THREE.Object3D[] => {
        const parts: THREE.Object3D[] = [];
        const keys = new Set<string>();
        from.traverse((o) => {
          const r = o as THREE.Mesh;
          const drawn =
            r.isMesh || (o as THREE.Points).isPoints || (o as THREE.Line).isLine || (o as THREE.Sprite).isSprite;
          if (!drawn || !r.material) return;
          // a clipped material is compiled in its own job (with the clipping state primed)
          if (from === root && seen.has(r.material as THREE.Material)) return;
          const mat = Array.isArray(r.material) ? r.material.map((m) => m.uuid).join() : r.material.uuid;
          const key = `${o.type}|${mat}|${r.geometry?.attributes.color ? 1 : 0}|${(o as THREE.InstancedMesh).instanceColor ? 1 : 0}`;
          if (keys.has(key)) return;
          keys.add(key);
          const part = new THREE.Scene();
          part.add(o.clone(false));
          parts.push(part);
        });
        return parts;
      };
      const programs = new Set<NonNullable<ProgramState['currentProgram']>>();
      let slice = performance.now();
      for (const { root: jobRoot, target, lights, planes } of jobs) {
        for (const part of split(jobRoot)) {
          const before = renderer.getRenderTarget();
          renderer.setRenderTarget(target);
          if (planes) primeClipping(planes, target);
          const set = measured('compile-request', () => renderer.compile(part, camera, lights));
          renderer.setRenderTarget(before);
          for (const m of set) {
            const p = (renderer.properties.get(m) as ProgramState).currentProgram;
            if (!p) continue;
            if (parallel) programs.add(p);
            else measured('link', () => p.getUniforms()); // the link itself
          }
          if (performance.now() - slice > 8) {
            await nextFrame();
            if (disposed) return;
            slice = performance.now();
          }
        }
        await nextFrame();
        if (disposed) return;
        slice = performance.now();
      }
      if (parallel) while (!disposed && !lost && [...programs].some((p) => !p.isReady())) await wait(16);
      while (programs.size && !disposed) {
        const s = performance.now();
        measured('first-use', () => {
          for (const p of programs) {
            if (performance.now() - s > 8) break;
            p.getUniforms(); // first use: reads the link status and logs (instant once linked)
            programs.delete(p);
          }
        });
        if (programs.size) await nextFrame();
      }
      // textures: a few per slice, and the graphics process finishes them before the next (see gpuDone)
      const textures: THREE.Texture[] = [];
      root.traverse((o) => {
        const m = (o as THREE.Mesh).material;
        if (!m) return;
        for (const x of Array.isArray(m) ? m : [m])
          for (const v of Object.values(x)) if (v instanceof THREE.Texture && !uploaded.has(v)) textures.push(v);
      });
      let n = 0;
      for (const t of textures) {
        if (disposed) return;
        if (uploaded.has(t)) continue;
        uploaded.add(t);
        measured('texture', () => renderer.initTexture(t));
        if (++n % 4 === 0) await gpuDone();
      }
      await gpuDone();
      // A linked program is not yet a drawn one: many drivers (SwiftShader, Metal, D3D) build the real GPU code at the
      // first draw with it - a 3.5 s first frame on software WebGL. So every distinct material is drawn once, alone (its
      // object on layer 31, with the lights and the moon), into one pixel of the real target, three at a
      // time, each three finished by the graphics process before the next (gpuDone). It also builds the shadow programs (HIGH) and is exact for clipped materials.
      const WARM = 31;
      const lit: THREE.Object3D[] = [];
      const reps: THREE.Object3D[] = [];
      const keys = new Set<string>();
      root.traverse((o) => {
        if ((o as THREE.Light).isLight) lit.push(o);
        const r = o as THREE.Mesh;
        const drawn =
          r.isMesh || (o as THREE.Points).isPoints || (o as THREE.Line).isLine || (o as THREE.Sprite).isSprite;
        if (!drawn || !r.material) return;
        const mat = Array.isArray(r.material) ? r.material.map((m) => m.uuid).join() : r.material.uuid;
        // walk-in gallery: a room's many prints and photos share a handful of programs - one draw per PROGRAM there
        // (the street keeps one per material, as R80 measured it)
        const prog = street
          ? undefined
          : (renderer.properties.get(Array.isArray(r.material) ? r.material[0] : r.material) as ProgramState)
              .currentProgram?.id;
        const key = `${o.type}|${prog !== undefined ? `p${prog}` : mat}|${r.geometry?.attributes.color ? 1 : 0}|${(o as THREE.InstancedMesh).instanceColor ? 1 : 0}`;
        if (keys.has(key)) return;
        keys.add(key);
        reps.push(o);
      });
      const autoClear = renderer.autoClear;
      const view = drawTarget ? drawTarget.viewport.clone() : null;
      // its own camera, close to the object: a draw that covers no pixel never runs (nor builds) the pixel stage
      const eye = new THREE.PerspectiveCamera(50, 1, 0.01, 500);
      eye.layers.set(WARM);
      const ball = new THREE.Sphere();
      const away = new THREE.Vector3(0.35, 0.55, 1).normalize();
      lit.forEach((l) => l.layers.enable(WARM));
      renderer.autoClear = false;
      try {
        for (const o of reps) {
          if (disposed || lost) return;
          const had = o.layers.isEnabled(WARM);
          o.layers.enable(WARM);
          // hidden for now (the train between runs, a car waiting to drive in) or off camera: drawn all the same
          const hidden: THREE.Object3D[] = [];
          for (let a: THREE.Object3D | null = o; a; a = a.parent) if (!a.visible) hidden.push(a);
          hidden.forEach((a) => (a.visible = true));
          const culled = o.frustumCulled;
          o.frustumCulled = false;
          const geo = (o as THREE.Mesh).geometry;
          if (geo && !geo.boundingSphere) geo.computeBoundingSphere();
          if (geo?.boundingSphere) ball.copy(geo.boundingSphere).applyMatrix4(o.matrixWorld);
          else ball.set(o.getWorldPosition(ball.center), 1);
          eye.position.copy(ball.center).addScaledVector(away, Math.max(0.5, ball.radius * 1.6));
          eye.lookAt(ball.center);
          eye.updateMatrixWorld();
          if (drawTarget) {
            drawTarget.viewport.set(0, 0, 8, 8);
            renderer.setRenderTarget(drawTarget);
          } else {
            renderer.setRenderTarget(null);
            renderer.setViewport(0, 0, 8 / renderer.getPixelRatio(), 8 / renderer.getPixelRatio());
          }
          measured('warm-draw', () => renderer.render(root, eye));
          if (!had) o.layers.disable(WARM);
          hidden.forEach((a) => (a.visible = false));
          o.frustumCulled = culled;
          if (++n % 3 === 0) {
            // the frame between belongs to the page (a test's step(draw) may draw the street in it)
            renderer.setRenderTarget(null);
            if (view) drawTarget!.viewport.copy(view);
            await gpuDone();
          }
        }
      } finally {
        lit.forEach((l) => l.layers.disable(WARM));
        renderer.autoClear = autoClear;
        if (view) drawTarget!.viewport.copy(view);
        renderer.setRenderTarget(null);
        renderer.setViewport(0, 0, size.x, size.y);
      }
      await gpuDone();
      performance.measure('diorama:warm', { start: t0, end: performance.now() });
      warmedAt.set(root, tier);
    } finally {
      warming--;
    }
  }

  /* ------------------------------------------------------------ walk-in gallery: the rooms behind the doors */
  let content: GalleryContent | null = opts.content ?? null;
  /** built rooms, most recent last; two are kept (the one you are in and the one you just left) */
  const rooms = new Map<string, Room>();
  const roomKey = new Map<string, string>();
  let transit = false;
  let inspecting: RoomHotspot | null = null;
  let inspectPose: { view: THREE.Vector3; focus: THREE.Vector3 } | null = null;
  let inspectBlend = 0;
  /** where the visitor stood on the street before going in */
  const back = { room: '', set: false };
  /** R85: the door the visitor was guided to from a sign in WALK mode (its beacon is up, the compass points to it) */
  let guideId: string | null = null;
  const uploads: THREE.Texture[] = [];
  let roomEnv: THREE.Texture | null = null;
  const SHUTTER_MS = 520;
  const keyOf = (id: string) => JSON.stringify(content?.[id] ?? null);

  /** a bright gallery environment (white room, overhead panels) for the metals and the wet-paper floor */
  function galleryEnv() {
    if (roomEnv) return roomEnv;
    const env = new THREE.Scene();
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(30, 12, 30),
      new THREE.MeshBasicMaterial({ color: 0xf4eedc, side: THREE.BackSide }),
    );
    env.add(shell);
    const panelGeo = new THREE.PlaneGeometry(3, 10).rotateX(Math.PI / 2);
    const panelMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(5) });
    for (const x of [-8, 0, 8]) {
      const p = new THREE.Mesh(panelGeo, panelMat);
      p.position.set(x, 5.8, 0);
      env.add(p);
    }
    const ink = new THREE.Mesh(new THREE.PlaneGeometry(30, 1.2), new THREE.MeshBasicMaterial({ color: 0x0a0a0a }));
    ink.position.set(0, -5, -14.9);
    env.add(ink);
    roomEnv = pmrem.fromScene(env, 0.02).texture;
    shell.geometry.dispose();
    (shell.material as THREE.Material).dispose();
    panelGeo.dispose();
    panelMat.dispose();
    ink.geometry.dispose();
    (ink.material as THREE.Material).dispose();
    return roomEnv;
  }

  /** builds room `id` a part per frame, then prepares its shaders with the room's grade (behind the shutter) */
  async function buildRoom(id: string): Promise<Room | null> {
    const c = content?.[id];
    if (!c) return null;
    await resolveFonts();
    const steps = buildRoomSteps(c, { photoMax: tier === 'low' ? 768 : 1024, env: galleryEnv() });
    let r: Room;
    for (let i = 0; ; i++) {
      const out = measured(`room-${id}-${i}`, () => steps.next());
      if (out.done) {
        r = out.value;
        break;
      }
      await nextFrame();
      if (disposed) {
        // the generator holds a half-built room: finish it to free it
        for (let x = steps.next(); !x.done; x = steps.next());
        return null;
      }
    }
    if (disposed) {
      r.dispose();
      return null;
    }
    rooms.set(id, r);
    roomKey.set(id, keyOf(id));
    // keep two rooms; free the oldest one the visitor is not in
    for (const [k, old] of rooms) {
      if (rooms.size <= 2) break;
      if (old === room || k === id) continue;
      old.dispose();
      rooms.delete(k);
      roomKey.delete(k);
    }
    return r;
  }

  /** the street pose just outside a section's doorway, facing out (coming back out of its room) */
  function doorPose(id: string) {
    const o = portals.outside(id);
    if (!o) return { pos: built.spawn.clone(), yaw: Math.PI };
    o.portal.armed = false; // it re-arms once the walker is 2.5 m away
    return { pos: o.pos, yaw: o.yaw };
  }

  function placePlayer(pos: THREE.Vector3, yaw: number) {
    // no umbrella indoors
    if (player.umbrella) player.umbrella.visible = !room;
    P.pos.copy(pos);
    P.prev.copy(pos);
    P.drawn.copy(pos);
    P.vel.set(0, 0, 0);
    P.grounded = true;
    player.yaw = yaw;
    player.group.position.copy(pos);
    player.group.rotation.y = yaw;
    walkCam.yaw = yaw + Math.PI;
    const upright = camera.aspect < 0.8;
    walkCam.pitch = room ? (upright ? 0.42 : 0.32) : 0.42;
    walkCam.dist = room ? (upright ? 5.8 : 4.6) : 5.6;
    walkCam.target.copy(pos).add(new THREE.Vector3(0, 1.3, 0));
    updateWalkCamera(0, true);
    camera.position.copy(walkCam.pos);
    camera.lookAt(walkCam.target);
  }

  /** walk mode, already settled (no orbit -> street glide: the shutter hides the cut) */
  function forceWalk() {
    if (mode !== 'walk') {
      const off = camera.position.clone().sub(controls.target);
      orbit.dist = off.length();
      orbit.phi = Math.acos(THREE.MathUtils.clamp(off.y / orbit.dist, -1, 1));
      orbit.theta = Math.atan2(off.x, off.z);
      controls.enabled = false;
      controls.autoRotate = false;
      canvas.style.touchAction = 'none';
      canvas.style.cursor = 'grab';
      mode = 'walk';
    }
    input.enabled = !inspecting;
    blend = 1;
  }

  async function enterRoom(id: string): Promise<boolean> {
    if (transit || disposed || !content?.[id] || room?.id === id) return false;
    transit = true;
    closeInspect();
    const c = content[id];
    opts.onRoom?.({ phase: 'closing', id, label: c.label, jp: c.jp });
    const t0 = performance.now();
    try {
      let r = rooms.get(id) ?? null;
      // content changed since it was built (live extras): build it again
      if (r && roomKey.get(id) !== keyOf(id) && r !== room) {
        r.dispose();
        rooms.delete(id);
        r = null;
      }
      if (!r) r = await buildRoom(id);
      if (!r || disposed) return false;
      if (warmedAt.get(r.scene) !== tier) {
        setLook(true);
        await warmUp(r.scene);
        if (!room) setLook(false);
      }
      const left = SHUTTER_MS - (performance.now() - t0);
      if (!calm && left > 0) await wait(left);
      if (disposed) return false;
      // R85: always back out through THIS room's doorway, facing the street
      back.room = id;
      back.set = true;
      portals.guide(null);
      guideId = null;
      room = r;
      activeScene = r.scene;
      aw = r.world;
      r.scene.add(player.group);
      forceWalk();
      placePlayer(r.spawn, r.spawnYaw);
      setLook(true);
      r.loadPhotos((t) => uploads.push(t));
      audio.chime();
      opts.onRoom?.({ phase: 'inside', id, label: c.label, jp: c.jp });
      return true;
    } finally {
      transit = false;
      // a failed build lifts the shutter again
      if (!room || room.id !== id) opts.onRoom?.({ phase: 'street', id: null, label: '', jp: '' });
    }
  }

  async function exitRoom() {
    if (!room || transit || disposed) return;
    transit = true;
    closeInspect();
    opts.onRoom?.({ phase: 'closing', id: room.id, label: room.label, jp: room.jp });
    try {
      if (warmedAt.get(scene) !== tier) {
        setLook(false);
        await warmUp(scene);
        setLook(true);
      }
      if (!calm) await wait(SHUTTER_MS);
      if (disposed) return;
      room = null;
      activeScene = scene;
      aw = world;
      scene.add(player.group);
      setLook(false);
      const d = back.set ? doorPose(back.room) : { pos: built.spawn.clone(), yaw: Math.PI };
      placePlayer(d.pos, d.yaw);
      opts.onRoom?.({ phase: 'street', id: null, label: '', jp: '' });
    } finally {
      transit = false;
    }
  }

  /**
   * The inspect camera, panned so the exhibit sits in the part of the stage the card does NOT cover: left of the
   * drawer from 640 px up (the card is min(440 px, 48 %) wide on the right), above the bottom sheet on phones (the
   * card takes up to 74 % of the height; the camera also stands back a little there).
   */
  const inspectView = new THREE.Vector3();
  const inspectFocus = new THREE.Vector3();
  const panDir = new THREE.Vector3();
  function framed(pose: { view: THREE.Vector3; focus: THREE.Vector3 }) {
    inspectView.copy(pose.view);
    inspectFocus.copy(pose.focus);
    const dist = pose.view.distanceTo(pose.focus);
    const tv = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    if (size.x >= 640) {
      const panel = Math.min(440, size.x * 0.48) + 12;
      const ndc = (size.x - panel) / size.x - 1; // the centre of the free part, in -1..1
      panDir.set(-(pose.focus.z - pose.view.z), 0, pose.focus.x - pose.view.x).normalize();
      const k = -ndc * dist * tv * camera.aspect;
      inspectView.addScaledVector(panDir, k);
      inspectFocus.addScaledVector(panDir, k);
    } else {
      const back = 1.45;
      panDir.subVectors(pose.view, pose.focus);
      inspectView.copy(pose.focus).addScaledVector(panDir, back);
      const ndc = 0.74; // the centre of the free top strip (26 % of the height), in -1..1
      const k = ndc * dist * back * tv;
      inspectView.y -= k;
      inspectFocus.y -= k;
    }
  }

  /* R85: the compass - while a door is guided and off screen, an arrow on the stage edge points to it */
  const compass = document.createElement('div');
  compass.setAttribute('aria-hidden', 'true');
  compass.dataset.dioramaCompass = '';
  Object.assign(compass.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    zIndex: '6',
    display: 'none',
    pointerEvents: 'none',
    padding: '6px 10px',
    background: '#FFFFFF',
    border: '3px solid #0A0A0A',
    borderRadius: '10px',
    boxShadow: '3px 3px 0 0 #0A0A0A',
    font: '800 13px/1.1 ui-monospace, monospace',
    letterSpacing: '0.08em',
    color: '#0A0A0A',
    whiteSpace: 'nowrap',
  } satisfies Partial<CSSStyleDeclaration>);
  container.appendChild(compass);
  let compassText = '';
  const cv = new THREE.Vector3();
  function updateCompass() {
    const p = guideId ? portals.list.find((x) => x.id === guideId) : null;
    if (!p || room || mode !== 'walk' || transit) {
      if (compass.style.display !== 'none') compass.style.display = 'none';
      return;
    }
    cv.copy(p.center)
      .setY(p.center.y + 1.5)
      .project(camera);
    const behind = cv.z > 1;
    const onScreen = !behind && Math.abs(cv.x) < 0.9 && Math.abs(cv.y) < 0.9;
    const dist = Math.round(Math.hypot(p.center.x - P.pos.x, p.center.z - P.pos.z));
    if (dist < 2) {
      guideId = null;
      portals.guide(null);
    }
    let ax = behind ? -cv.x : cv.x;
    let ay = behind ? -cv.y : cv.y;
    if (onScreen) {
      ax = cv.x;
      ay = cv.y + 0.12;
    } else {
      const k = 0.86 / Math.max(Math.abs(ax), Math.abs(ay), 1e-3);
      ax *= k;
      ay *= k;
    }
    const arrow = onScreen ? '↓' : Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? '→' : '←') : ay > 0 ? '↑' : '↓';
    const text = `${arrow} ${p.label.toUpperCase()} ${dist} m`;
    if (text !== compassText) {
      compassText = text;
      compass.textContent = text;
    }
    const x = ((ax + 1) / 2) * size.x;
    const y = ((1 - ay) / 2) * size.y;
    compass.style.display = 'block';
    compass.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
  }

  function openInspect(h: RoomHotspot) {
    if (h.kind === 'exit') return;
    inspecting = h;
    inspectPose = { view: h.view, focus: h.focus };
    input.enabled = false;
    input.reset();
    opts.onInspect?.(h.id);
  }

  function closeInspect() {
    if (!inspecting) return;
    inspecting = null;
    input.enabled = mode === 'walk';
    opts.onInspect?.(null);
  }

  /** a room hotspot as the street's Hotspot shape (the React HUD shows both the same way) */
  const spotCache = new WeakMap<RoomHotspot, Hotspot>();
  function roomSpot(h: RoomHotspot): Hotspot {
    let s = spotCache.get(h);
    if (!s) {
      s = { id: h.id, label: h.label, jp: '', target: null, pos: h.pos, radius: h.radius };
      spotCache.set(h, s);
    }
    return s;
  }

  /* click / tap on an exhibit in a room: inspect it (a drag is a look, not a click) */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let press: { id: number; x: number; y: number; t: number } | null = null;
  const onDown = (e: PointerEvent) => {
    press = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
  };
  const onUp = (e: PointerEvent) => {
    const p = press;
    press = null;
    if (!p || p.id !== e.pointerId || !room || transit || inspecting) return;
    if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8 || performance.now() - p.t > 450) return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(room.pickables, false)[0];
    const id = hit?.object.userData.hotspot as string | undefined;
    const h = id ? room.hotspots.find((x) => x.id === id) : undefined;
    if (h && hit && hit.distance < 16) {
      audio.click();
      openInspect(h);
    }
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);

  await warmUp();
  building = false;
  measured('first-frame', render);
  setRunning();

  const handle: DioramaHandle = {
    randomEvent: () => director.roll(),
    setMode(m) {
      // walk-in gallery: VIEW from inside a room = back out to the street first
      if (room && m === 'view') {
        void exitRoom().then(() => !disposed && handle.setMode('view'));
        return;
      }
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
    setRain: (on) => {
      precip = on;
      weather.setRain(on && season === 'rain');
    },
    setSeason: (s) => setSeason(s),
    getSeason: () => season,
    setSound: (on) => audio.enable(on),
    setTier(t) {
      autoTier = t === 'auto';
      tier = t === 'auto' ? detectTier(renderer.getContext()) : t;
      sinceStart = 0;
      director.settle();
      applyTier();
      void warmUp(activeScene); // R80: the new shaders compile without freezing the page
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
      // R85: a sign in WALK mode GUIDES to the door (a beacon over it, a compass at the edge) - the visitor walks in;
      // in VIEW mode (or from a room) it opens the room straight away
      if (mode === 'walk' && !room && content?.[id]) {
        guideId = id;
        portals.guide(id);
        const c = content[id];
        opts.onToast?.(`Follow the blue light to the ${c.label.toUpperCase()} door and walk in.`);
        return;
      }
      const h = built.hotspots.find((x) => x.id === id);
      if (h) activate(h);
    },
    bindPin(id, el) {
      const at = pinSlots.findIndex((s) => s.id === id);
      if (at >= 0) pinSlots.splice(at, 1);
      if (!el) return;
      el.style.visibility = 'hidden';
      const slot: PinSlot = {
        id,
        el,
        w: 0,
        h: 0,
        px: 0,
        py: 0,
        depth: 1,
        vis: false,
        shown: false,
        lx: -1e9,
        ly: -1e9,
      }; // far off: the first visible frame always writes
      measurePin(slot);
      pinSlots.push(slot);
    },
    resetCamera() {
      if (mode === 'walk') {
        walkCam.yaw = player.yaw + Math.PI;
        walkCam.pitch = 0.42;
        walkCam.dist = 5.6;
        return;
      }
      orbit.theta = homeTheta;
      orbit.phi = camera.aspect < 0.8 ? 0.78 : 0.92;
      orbit.dist = fit;
      setOrbitFromSpherical();
      controls.update(0);
    },
    resize,
    enterRoom: (id) => enterRoom(id),
    exitRoom: () => exitRoom(),
    getRoom: () => room?.id ?? null,
    inspect(id) {
      if (!room || transit) return;
      const h = room.hotspots.find((x) => x.id === id);
      if (!h || h.kind === 'exit') return;
      const dx = h.focus.x - h.pos.x;
      const dz = h.focus.z - h.pos.z;
      placePlayer(h.pos, Math.atan2(dx, dz));
      openInspect(h);
    },
    closeInspect: () => closeInspect(),
    setContent(c) {
      content = c;
      // rooms not open are rebuilt on their next visit (enterRoom compares the content); the open one stays as it is
    },
    dispose() {
      disposed = true;
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      for (const r of rooms.values()) r.dispose();
      portals.dispose();
      life.dispose();
      seasons.dispose();
      compass.remove();
      rooms.clear();
      roomEnv?.dispose();
      renderer.setAnimationLoop(null);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      director.settle();
      controls.dispose();
      input.dispose();
      audio.dispose();
      traffic.dispose();
      weather.dispose();
      disposePerson(player);
      canGeo.dispose();
      warmGeo.dispose();
      primerMats.forEach((m) => m.dispose());
      canMats.forEach((m) => m.dispose());
      disposeComposer();
      disposeModel();
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
      drawn: () => P.drawn.toArray(),
      cam: () => ({
        pos: camera.position.toArray(),
        dist: camera.position.distanceTo(walkCam.target),
        walk: walkCam.pos.toArray(),
        target: walkCam.target.toArray(),
        camD: walkCam.camD,
        blend,
        frames: tickCount,
      }),
      teleport(x, y, z) {
        P.pos.set(x, y, z);
        P.prev.copy(P.pos);
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
        walkCam.yawNow = y;
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
      look: () => ({
        bloom: bloom ? bloom.strength : 0,
        radius: bloom ? bloom.radius : 0,
        fogNear: (scene.fog as THREE.Fog).near,
        camDist: camera.position.distanceTo(controls.target),
        dpr: renderer.getPixelRatio(),
        msaa: PROFILES[tier].msaa,
      }),
      director: () => ({ last: director.last, count: director.count, available: director.available() }),
      event: (name) => director.trigger(name),
      model: () => ({ loaded: !!modelGroup, colliders: modelColliders }),
      warming: () => building || warming > 0,
      walkIn: (on) => void (portals.walkIn = on),
      portals: () =>
        portals.list.map((p) => ({
          id: p.id,
          open: +p.open.toFixed(2),
          glow: +p.glow.toFixed(2),
          armed: p.armed,
          guided: p.guided,
        })),
      room: () => ({
        id: room?.id ?? null,
        hotspots: room ? room.hotspots.map((h) => h.id) : [],
        inspect: inspecting?.id ?? null,
        transit,
        cached: [...rooms.keys()],
      }),
      quiet: () => {
        director.auto = false;
      },
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
        seed: streetSeed(),
        tier,
        mode,
        drawCalls: renderer.info.render.calls,
        ms: { sim: +simMs.toFixed(2), render: +renderMs.toFixed(2) },
        triangles: renderer.info.render.triangles,
        grounded: P.grounded,
        pos: P.pos.toArray().map((v) => +v.toFixed(2)),
        light: { ew: traffic.ew, ns: traffic.ns },
        train: traffic.trainState,
        crossing: traffic.crossingActive,
        barrier: +traffic.barrierT.toFixed(2),
        door: +built.door.open.toFixed(2),
        near: near?.id ?? null,
        room: room?.id ?? null,
        input: input.enabled,
        life: life.census(),
        season,
        rain: precip,
        lights: {
          hemi: +hemi.intensity.toFixed(3),
          moon: +moon.intensity.toFixed(3),
          lamps: built.lights.map((l) => +l.light.intensity.toFixed(3)),
        },
      }),
    },
  };
  return handle;
}
