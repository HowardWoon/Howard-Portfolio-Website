/**
 * R78 calm water for the hero portrait (owner: "i am very hate the wave effect as shown, i want like very water wave
 * clean, asmr, smooth"), a brutalist remix of React Bits PatternWaves (pond preset), written against raw WebGL2 - no
 * `ogl`, no new dependency.
 *
 * What it keeps from PatternWaves:
 *  - the cursor wake: a damped 2D wave equation in a half-float ping-pong target at 1/6 resolution, 60 steps a second,
 *    an impulse along the pointer's path only while it MOVES (a resting pointer leaves the water still), a click /
 *    tap / Spider-Sense press drops a splash;
 *  - a lit normal from that height field, printed as a halftone of paper-white dots (one dot per 8 px cell, its size
 *    from the glint) - flat water prints no dots at all;
 *  - pauses off screen and in a hidden tab, caps the pixels, respects reduced motion (the caller uses its still drop).
 * What it changes for the theme: no ambient motion, no intro fade, no edge fade, no tint - the photo stays the photo,
 * the water only bends it (refraction) and lets the Spider-Man photo through where the pointer has been (a hard edge,
 * 1 device px of anti-aliasing, never a feathered mask). When everything has settled the canvas hides and the DOM
 * photo is back, pixel for pixel.
 */

export type WaterHandle = {
  /** step the water by `dt` seconds and draw it; returns how many simulation steps ran (0 = the input is still
   *  pending: pass the same segment start and splash again next frame) */
  frame: (input: WaterInput, dt: number) => number;
  resize: (w: number, h: number, dpr: number) => void;
  /** wipe the water flat (before it shows again) */
  clear: () => void;
  destroy: () => void;
};

export type WaterInput = {
  /** pointer segment this frame, in CSS px from the frame's top-left */
  from: [number, number];
  to: [number, number];
  /** radius of the opening under the pointer (CSS px, 0 = none) */
  radius: number;
  /** wave impulse for this frame (movement + splash) */
  impulse: number;
  /** Spider-Sense flood: centre (CSS px) and radius (0 = none) */
  flood: [number, number];
  floodR: number;
};

const CELL = 6; // CSS px per simulation texel
const RATE = 60; // simulation steps per second
const DAMPING = 0.975;
const TRACE_DECAY = 0.955; // how fast the opening behind the pointer closes (per step)
const WAKE_RADIUS = 34; // CSS px, the width of the impulse
const REFRACT = 45; // CSS px of bend per unit of slope (a splash bends the photo ~8 px at its crest)
const DEPTH = 3; // slope -> normal tilt for the glints
const PITCH = 8; // CSS px between halftone dots
const PIXEL_BUDGET = 4.5e6;

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// R = height now, G = height one step ago, B = the trace of the opening (0..1)
const SIM = `#version 300 es
precision highp float;
uniform sampler2D tState;
uniform vec2 uTexel;
uniform vec2 uSize;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uImpulse;
out vec4 fragColor;
void main() {
  vec2 uv = gl_FragCoord.xy * uTexel;
  vec4 s = texture(tState, uv);
  vec4 l = texture(tState, uv - vec2(uTexel.x, 0.0));
  vec4 r = texture(tState, uv + vec2(uTexel.x, 0.0));
  vec4 d = texture(tState, uv - vec2(0.0, uTexel.y));
  vec4 u = texture(tState, uv + vec2(0.0, uTexel.y));
  float next = ((l.r + r.r + d.r + u.r) * 0.5 - s.g) * ${DAMPING.toFixed(3)};
  vec2 p = uv * uSize;
  vec2 seg = uTo - uFrom;
  float along = clamp(dot(p - uFrom, seg) / max(dot(seg, seg), 1e-4), 0.0, 1.0);
  float dist = length(p - uFrom - seg * along);
  float w = dist / ${WAKE_RADIUS.toFixed(1)};
  next -= uImpulse * exp(-w * w * 2.0);
  float trace = mix(s.b, (l.b + r.b + d.b + u.b) * 0.25, 0.3) * ${TRACE_DECAY.toFixed(3)};
  if (uRadius > 0.5) trace = max(trace, 1.0 - smoothstep(uRadius * 0.6, uRadius * 1.4, dist));
  fragColor = vec4(next, s.r, trace, 1.0);
}
`;

const DRAW = `#version 300 es
precision highp float;
uniform sampler2D tState;
uniform sampler2D tBase;
uniform sampler2D tOther;
uniform vec2 uSize;
uniform vec2 uSim;
uniform float uDpr;
uniform vec4 uCover;
uniform vec2 uFlood;
uniform float uFloodR;
uniform vec3 uHalf;
out vec4 fragColor;

vec2 slope(vec2 p) {
  vec2 uv = p / uSize;
  vec2 t = 1.0 / uSim;
  float l = texture(tState, uv - vec2(t.x, 0.0)).r;
  float r = texture(tState, uv + vec2(t.x, 0.0)).r;
  float d = texture(tState, uv - vec2(0.0, t.y)).r;
  float u = texture(tState, uv + vec2(0.0, t.y)).r;
  return vec2(r - l, u - d) * 0.5;
}

// the portrait's own CSS filters: contrast(1.05) then saturate(1.15)
vec3 grade(vec3 c) {
  c = (c - 0.5) * 1.05 + 0.5;
  float s = 1.15;
  mat3 m = mat3(
    0.213 + 0.787 * s, 0.213 - 0.213 * s, 0.213 - 0.213 * s,
    0.715 - 0.715 * s, 0.715 + 0.285 * s, 0.715 - 0.715 * s,
    0.072 - 0.072 * s, 0.072 - 0.072 * s, 0.072 + 0.928 * s
  );
  return clamp(m * c, 0.0, 1.0);
}

void main() {
  vec2 p = gl_FragCoord.xy / uDpr; // CSS px, y up
  vec2 g = slope(p);
  vec2 off = g * ${REFRACT.toFixed(1)};
  vec4 here = texture(tState, (p + off * 0.6) / uSize);
  float trace = here.b;
  float aa = max(fwidth(trace), 1e-3);
  float open = smoothstep(0.5 - aa, 0.5 + aa, trace);
  if (uFloodR > 0.0) {
    float edge = length(p - uFlood) - uFloodR - here.r * 6.0;
    open = max(open, clamp(0.5 - edge * uDpr, 0.0, 1.0));
  }
  vec2 q = p + off;
  vec2 img = (vec2(q.x, uSize.y - q.y) - uCover.xy) / uCover.zw;
  vec3 col = grade(mix(texture(tBase, img).rgb, texture(tOther, img).rgb, open));

  // halftone glints: one paper-white dot per cell, sized by the light caught at the cell's centre
  vec2 cell = (floor(p / ${PITCH.toFixed(1)}) + 0.5) * ${PITCH.toFixed(1)};
  vec3 n = normalize(vec3(-slope(cell) * ${DEPTH.toFixed(1)}, 1.0));
  // flat water faces the light at 0.90: only a crest tilted well towards it catches a glint
  float level = smoothstep(0.955, 0.998, dot(n, uHalf));
  if (level > 0.0) {
    float rad = 0.5 * ${PITCH.toFixed(1)} * 0.75 * sqrt(level);
    float cover = clamp(0.5 - (length(p - cell) - rad) * uDpr, 0.0, 1.0);
    col = mix(col, vec3(1.0), cover);
  }
  fragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGL2RenderingContext, frag: string) {
  const prog = gl.createProgram();
  const make = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    gl.attachShader(prog, s);
    return s;
  };
  const v = make(gl.VERTEX_SHADER, VERT);
  const f = make(gl.FRAGMENT_SHADER, frag);
  gl.bindAttribLocation(prog, 0, 'position');
  gl.linkProgram(prog);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    return null;
  }
  const cache = new Map<string, WebGLUniformLocation | null>();
  const loc = (name: string) => {
    if (!cache.has(name)) cache.set(name, gl.getUniformLocation(prog, name));
    return cache.get(name)!;
  };
  return { prog, loc };
}

function photoTexture(gl: WebGL2RenderingContext, img: HTMLImageElement) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

/** the DPR a canvas of w x h CSS px gets (capped at 2 and at the pixel budget) */
export function waterDpr(w: number, h: number) {
  return Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / Math.max(1, w * h)));
}

/**
 * Builds the water on `canvas`, showing `base` and, where it opens, `other` (both laid out object-cover /
 * object-top like the DOM photos). Returns null when WebGL2 or half-float render targets are missing.
 */
export function createWater(
  canvas: HTMLCanvasElement,
  base: HTMLImageElement,
  other: HTMLImageElement,
): WaterHandle | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  });
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) return null;
  const sim = compile(gl, SIM);
  const draw = compile(gl, DRAW);
  if (!sim || !draw) return null;

  // one triangle that covers the screen
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const texBase = photoTexture(gl, base);
  const texOther = photoTexture(gl, other);
  const iw = base.naturalWidth || 1;
  const ih = base.naturalHeight || 1;

  type Target = { tex: WebGLTexture; fb: WebGLFramebuffer };
  let targets: Target[] = [];
  let simW = 1;
  let simH = 1;
  let w = 1;
  let h = 1;
  let dpr = 1;
  let clock = 0;

  const makeTarget = (): Target => {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, simW, simH, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex, fb };
  };
  const dropTargets = () => {
    for (const t of targets) {
      gl.deleteFramebuffer(t.fb);
      gl.deleteTexture(t.tex);
    }
    targets = [];
  };
  const clear = () => {
    gl.clearColor(0, 0, 0, 0);
    for (const t of targets) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    clock = 0;
  };

  const resize = (cw: number, ch: number, d: number) => {
    w = Math.max(1, cw);
    h = Math.max(1, ch);
    dpr = d;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    const sw = Math.min(512, Math.max(4, Math.ceil(w / CELL)));
    const sh = Math.min(512, Math.max(4, Math.ceil(h / CELL)));
    if (sw !== simW || sh !== simH || !targets.length) {
      dropTargets();
      simW = sw;
      simH = sh;
      targets = [makeTarget(), makeTarget()];
      clear();
    }
  };

  // light from the pond preset's direction (35 deg + 180)
  const a = ((35 + 180) * Math.PI) / 180;
  const L = [Math.cos(a) * 0.78, Math.sin(a) * 0.78, 0.62];
  const H = [L[0], L[1], L[2] + 1];
  const hl = Math.hypot(H[0], H[1], H[2]);

  const frame = (input: WaterInput, dt: number) => {
    let steps = 0;
    // y up inside GL
    const from = [input.from[0], h - input.from[1]];
    const to = [input.to[0], h - input.to[1]];
    clock = Math.min(clock + dt * RATE, 4);
    let impulse = input.impulse;
    gl.useProgram(sim.prog);
    gl.viewport(0, 0, simW, simH);
    gl.uniform2f(sim.loc('uTexel'), 1 / simW, 1 / simH);
    gl.uniform2f(sim.loc('uSize'), w, h);
    gl.uniform2f(sim.loc('uFrom'), from[0], from[1]);
    gl.uniform2f(sim.loc('uTo'), to[0], to[1]);
    gl.uniform1f(sim.loc('uRadius'), input.radius);
    gl.uniform1i(sim.loc('tState'), 0);
    gl.activeTexture(gl.TEXTURE0);
    while (clock >= 1) {
      clock -= 1;
      gl.uniform1f(sim.loc('uImpulse'), impulse);
      gl.bindTexture(gl.TEXTURE_2D, targets[0].tex);
      gl.bindFramebuffer(gl.FRAMEBUFFER, targets[1].fb);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      targets.reverse();
      impulse = 0;
      steps++;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(draw.prog);
    const s = Math.max(w / iw, h / ih);
    gl.uniform2f(draw.loc('uSize'), w, h);
    gl.uniform2f(draw.loc('uSim'), simW, simH);
    gl.uniform1f(draw.loc('uDpr'), canvas.width / w);
    gl.uniform4f(draw.loc('uCover'), (w - iw * s) / 2, 0, iw * s, ih * s);
    gl.uniform2f(draw.loc('uFlood'), input.flood[0], h - input.flood[1]);
    gl.uniform1f(draw.loc('uFloodR'), input.floodR);
    gl.uniform3f(draw.loc('uHalf'), H[0] / hl, H[1] / hl, H[2] / hl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, targets[0].tex);
    gl.uniform1i(draw.loc('tState'), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texBase);
    gl.uniform1i(draw.loc('tBase'), 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texOther);
    gl.uniform1i(draw.loc('tOther'), 2);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return steps;
  };

  return {
    frame,
    resize,
    clear,
    destroy() {
      dropTargets();
      gl.deleteTexture(texBase);
      gl.deleteTexture(texOther);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(sim.prog);
      gl.deleteProgram(draw.prog);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
