/**
 * R79 boot-gate exhaust: the brutalist remix of React Bits FlyingButton's smoke (owner: "Initialize System" must fly).
 * A small WebGL2 stable-fluids sim (splat -> curl -> vorticity -> divergence -> pressure -> gradient -> advect), the
 * same passes as the original, drawn as an INK HALFTONE SCREEN instead of soft smoke: one hard-edged dot per cell
 * (45 degree screen), its radius from the smoke density - printed exhaust on the yellow gate, no blur, no glow, no
 * gradient (AGENTS.md law 5: soft rendering may only live inside a canvas, and this one is not soft either).
 *
 * Loaded with import() only when the visitor reaches for the key (hover / focus / press, or idle time): it is not
 * part of the first-load JS. Runs only for its short life (the climb + the drift), then frees the GL context.
 * Never started for reduced motion, Calm or the lite tier (components/boot-sequence.tsx decides).
 */

/** a thruster: nozzle position in CSS px (viewport, y down), exhaust direction (unit, y down), power 0..1 */
export type Jet = { x: number; y: number; dx: number; dy: number; power: number };

const MAX_JETS = 2;
const INK = [10 / 255, 10 / 255, 10 / 255];

const VERT = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 outColor;
`;

// jets push velocity along their axis and lay down smoke; below the pad (uFloor) the plume is turned sideways
const SPLAT_V = `${HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uDye;
uniform vec2 uWorld;
uniform float uDt;
uniform float uFloor;
uniform float uBuoy;
uniform float uR;
uniform vec4 uJetA[${MAX_JETS}];
uniform vec2 uJetB[${MAX_JETS}];
void main() {
  vec2 p = vUv * uWorld;
  vec2 v = texture(uVelocity, vUv).xy;
  float d = texture(uDye, vUv).x;
  v.y += uBuoy * d * uDt;
  for (int i = 0; i < ${MAX_JETS}; i++) {
    float pw = uJetB[i].x;
    if (pw <= 0.0) continue;
    vec2 dir = uJetA[i].zw;
    vec2 rel = p - uJetA[i].xy;
    float along = dot(rel, dir);
    float reach = uJetB[i].y;
    vec2 off = rel - dir * clamp(along, 0.0, reach);
    float w = exp(-dot(off, off) / (uR * uR)) * step(-4.0, along);
    v = mix(v, dir * 560.0 * pw, clamp(w * pw * 0.9, 0.0, 1.0));
  }
  if (p.y < uFloor && v.y < 0.0) {
    float down = -v.y;
    v.y = 0.0;
    float side = 0.0;
    for (int i = 0; i < ${MAX_JETS}; i++) if (uJetB[i].x > 0.0) side += sign(p.x - uJetA[i].x + 0.001);
    v.x += clamp(side, -1.0, 1.0) * down * 0.8;
  }
  outColor = vec4(v, 0.0, 1.0);
}`;

const SPLAT_D = `${HEAD}
uniform sampler2D uDye;
uniform vec2 uWorld;
uniform float uDt;
uniform float uR;
uniform vec4 uJetA[${MAX_JETS}];
uniform vec2 uJetB[${MAX_JETS}];
void main() {
  vec2 p = vUv * uWorld;
  float d = texture(uDye, vUv).x;
  for (int i = 0; i < ${MAX_JETS}; i++) {
    float pw = uJetB[i].x;
    if (pw <= 0.0) continue;
    vec2 dir = uJetA[i].zw;
    vec2 rel = p - uJetA[i].xy;
    float along = dot(rel, dir);
    vec2 off = rel - dir * clamp(along, 0.0, uJetB[i].y);
    d += exp(-dot(off, off) / (1.3 * uR * uR)) * step(-4.0, along) * pw * 9.0 * uDt;
  }
  outColor = vec4(min(d, 1.6), 0.0, 0.0, 1.0);
}`;

const CURL = `${HEAD}
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float L = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float R = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float B = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  outColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const VORTICITY = `${HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexel;
uniform float uStrength;
uniform float uDt;
void main() {
  float L = texture(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uCurl, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture(uCurl, vUv + vec2(0.0, uTexel.y)).x;
  float C = texture(uCurl, vUv).x;
  vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  f /= length(f) + 1e-4;
  f *= uStrength * C;
  f.y *= -1.0;
  vec2 v = texture(uVelocity, vUv).xy + f * uDt;
  outColor = vec4(clamp(v, -2000.0, 2000.0), 0.0, 1.0);
}`;

const DIVERGENCE = `${HEAD}
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float L = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
  float T = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
  outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const PRESSURE = `${HEAD}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexel;
void main() {
  float L = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float div = texture(uDivergence, vUv).x;
  outColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `${HEAD}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float L = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  vec2 v = texture(uVelocity, vUv).xy - 0.5 * vec2(R - L, T - B);
  outColor = vec4(v, 0.0, 1.0);
}`;

const ADVECT = `${HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uWorld;
uniform float uDt;
uniform float uKeep;
void main() {
  vec2 v = texture(uVelocity, vUv).xy;
  outColor = texture(uSource, vUv - uDt * v / uWorld) * uKeep;
}`;

// halftone: a 45 degree screen of hard ink dots; dot radius ~ sqrt(density) so the tone reads linearly
const RENDER = `${HEAD}
uniform sampler2D uDye;
uniform vec2 uRes;
uniform float uCell;
uniform vec3 uInk;
void main() {
  const float k = 0.70710678;
  vec2 f = gl_FragCoord.xy;
  vec2 q = vec2(k * f.x - k * f.y, k * f.x + k * f.y);
  vec2 cq = (floor(q / uCell) + 0.5) * uCell;
  vec2 c = vec2(k * cq.x + k * cq.y, -k * cq.x + k * cq.y);
  float d = texture(uDye, c / uRes).x;
  float r = uCell * 0.44 * sqrt(clamp(d, 0.0, 1.0));
  float on = r > 0.9 ? step(length(q - cq), r) : 0.0;
  outColor = vec4(uInk * on, on);
}`;

type Target = { tex: WebGLTexture; fb: WebGLFramebuffer };
type Pair = { read: Target; write: Target; swap(): void };

/**
 * Start the exhaust on `canvas` (fixed, full screen). `jets()` is read every frame (the craft's flight loop writes it).
 * `floorY` = the launch pad's top in CSS px (y down). Returns null when WebGL2 or float render targets are missing:
 * the flight then runs with its printed jets only.
 */
export function startExhaust(
  canvas: HTMLCanvasElement,
  jets: () => Jet[],
  { floorY, lifeMs = 3200 }: { floorY: number; lifeMs?: number },
): { stop(): void } | null {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false, stencil: false });
  if (!gl) return null;
  // WebGL drawn by the CPU (SwiftShader, llvmpipe, Basic Render: no graphics chip, and CI) runs this sim at a few frames
  // a second and holds the whole gate up with it (30-design-system E43): the printed jets fire without the smoke there
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  if (
    /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer) ||
    (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float'))
  ) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }

  const cssW = Math.max(1, window.innerWidth);
  const cssH = Math.max(1, window.innerHeight);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  const vert = compile(gl.VERTEX_SHADER, VERT);
  const programs: WebGLProgram[] = [];
  const make = (src: string) => {
    const p = gl.createProgram()!;
    gl.attachShader(p, vert);
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, src));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
    programs.push(p);
    const loc = new Map<string, WebGLUniformLocation | null>();
    return {
      p,
      u(name: string) {
        if (!loc.has(name)) loc.set(name, gl.getUniformLocation(p, name));
        return loc.get(name) ?? null;
      },
    };
  };

  const buildAll = () => ({
    splatV: make(SPLAT_V),
    splatD: make(SPLAT_D),
    curl: make(CURL),
    vort: make(VORTICITY),
    div: make(DIVERGENCE),
    pres: make(PRESSURE),
    grad: make(GRADIENT),
    adv: make(ADVECT),
    render: make(RENDER),
  });
  let prog: ReturnType<typeof buildAll>;
  try {
    prog = buildAll();
  } catch {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }

  // square cells: the long side of the screen gets LONG cells
  const LONG = cssW < 640 ? 96 : 128;
  const scale = LONG / Math.max(cssW, cssH);
  // a jet is at least ~1.6 cells wide, or a coarse desktop grid draws it as a hairline
  const jetR = Math.max(7, 1.6 / scale);
  const simW = Math.max(16, Math.round(cssW * scale));
  const simH = Math.max(16, Math.round(cssH * scale));
  const textures: WebGLTexture[] = [];
  const fbs: WebGLFramebuffer[] = [];
  const target = (): Target => {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, simW, simH, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    textures.push(tex);
    fbs.push(fb);
    return { tex, fb };
  };
  const pair = (): Pair => {
    const o = {
      read: target(),
      write: target(),
      swap() {
        const t = o.read;
        o.read = o.write;
        o.write = t;
      },
    };
    return o;
  };
  const vel = pair();
  const dye = pair();
  const pres = pair();
  const curl = target();
  const div = target();
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.disable(gl.BLEND);

  const texel = [1 / simW, 1 / simH] as const;
  const world = [cssW, cssH] as const;
  type Prog = (typeof prog)[keyof typeof prog];
  const run = (
    pg: Prog,
    textures2: Record<string, WebGLTexture>,
    uniforms: Record<string, number[] | number>,
    out: Target | null,
  ) => {
    gl.useProgram(pg.p);
    let unit = 0;
    for (const [name, tex] of Object.entries(textures2)) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(pg.u(name), unit++);
    }
    for (const [name, v] of Object.entries(uniforms)) {
      const l = pg.u(name);
      if (typeof v === 'number') gl.uniform1f(l, v);
      else if (v.length === 2) gl.uniform2fv(l, v);
      else if (v.length === 3) gl.uniform3fv(l, v);
      else gl.uniform4fv(l, v);
    }
    if (out) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, out.fb);
      gl.viewport(0, 0, simW, simH);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  // jets arrays: A = (x, y, dirX, dirY) in sim-world px with y UP, B = (power, reach)
  const jetA = new Float32Array(MAX_JETS * 4);
  const jetB = new Float32Array(MAX_JETS * 2);
  const setJets = (pg: Prog) => {
    gl.useProgram(pg.p);
    gl.uniform4fv(pg.u('uJetA[0]'), jetA);
    gl.uniform2fv(pg.u('uJetB[0]'), jetB);
  };

  const t0 = performance.now();
  let last = t0;
  let raf = 0;
  let stopped = false;
  let slow = 0;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    for (const t of textures) gl.deleteTexture(t);
    for (const f of fbs) gl.deleteFramebuffer(f);
    for (const p of programs) gl.deleteProgram(p);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.width = 1;
    canvas.height = 1;
  };

  const frame = (now: number) => {
    raf = 0;
    if (stopped) return;
    if (now - t0 > lifeMs) return stop();
    // a GPU that cannot keep up (four frames in a row over 80 ms, after the first-use shader builds of the first half
    // second) gives the frames back to the flight and the boot log; one stalled frame is not a slow GPU
    if (now - last > 80 && now - t0 > 500) {
      if (++slow >= 4) return stop();
    } else slow = 0;
    const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
    last = now;
    jetA.fill(0);
    jetB.fill(0);
    jets()
      .slice(0, MAX_JETS)
      .forEach((j, i) => {
        jetA.set([j.x, cssH - j.y, j.dx, -j.dy], i * 4);
        jetB.set([Math.max(0, Math.min(1, j.power)), 10 + 26 * j.power], i * 2);
      });
    // the last second thins out: the smoke goes faster so the screen is clear before the canvas is freed
    const fade = Math.max(0, (now - t0 - (lifeMs - 1000)) / 1000);

    setJets(prog.splatV);
    run(
      prog.splatV,
      { uVelocity: vel.read.tex, uDye: dye.read.tex },
      { uWorld: [...world], uDt: dt, uFloor: cssH - floorY, uBuoy: 150, uR: jetR },
      vel.write,
    );
    vel.swap();
    setJets(prog.splatD);
    run(prog.splatD, { uDye: dye.read.tex }, { uWorld: [...world], uDt: dt, uR: jetR }, dye.write);
    dye.swap();
    run(prog.curl, { uVelocity: vel.read.tex }, { uTexel: [...texel] }, curl);
    run(
      prog.vort,
      { uVelocity: vel.read.tex, uCurl: curl.tex },
      { uTexel: [...texel], uStrength: 22, uDt: dt },
      vel.write,
    );
    vel.swap();
    run(prog.div, { uVelocity: vel.read.tex }, { uTexel: [...texel] }, div);
    for (let i = 0; i < 14; i++) {
      run(prog.pres, { uPressure: pres.read.tex, uDivergence: div.tex }, { uTexel: [...texel] }, pres.write);
      pres.swap();
    }
    run(prog.grad, { uPressure: pres.read.tex, uVelocity: vel.read.tex }, { uTexel: [...texel] }, vel.write);
    vel.swap();
    run(
      prog.adv,
      { uVelocity: vel.read.tex, uSource: vel.read.tex },
      { uWorld: [...world], uDt: dt, uKeep: Math.exp(-dt * 0.9) },
      vel.write,
    );
    vel.swap();
    run(
      prog.adv,
      { uVelocity: vel.read.tex, uSource: dye.read.tex },
      { uWorld: [...world], uDt: dt, uKeep: Math.exp(-dt * (0.5 + 4 * fade)) },
      dye.write,
    );
    dye.swap();
    run(prog.render, { uDye: dye.read.tex }, { uRes: [canvas.width, canvas.height], uCell: 7 * dpr, uInk: INK }, null);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return { stop };
}
