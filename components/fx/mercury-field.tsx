'use client';

import { useEffect, useRef } from 'react';
import { FX, prefersReducedMotion } from '@/lib/fx';

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// 2D signed-distance-style metaballs. f > 1.0 = inside (flat colour), 0.78..1.0 = ink outline band.
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPtr;
out vec4 outColor;

float ball(vec2 p, vec2 c, float r) {
  vec2 d = p - c;
  return (r * r) / max(dot(d, d), 1e-5);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float aspect = uRes.x / uRes.y;
  float t = uTime * 0.22;
  vec2 c1 = vec2(sin(t * 1.3) * 0.32 * aspect, cos(t * 0.9) * 0.20);
  vec2 c2 = vec2(cos(t * 0.7 + 1.7) * 0.36 * aspect, sin(t * 1.1 + 0.4) * 0.22);
  vec2 c3 = vec2(sin(t * 0.5 + 3.1) * 0.28 * aspect, sin(t * 1.7 + 2.2) * 0.18);
  vec2 c4 = vec2(uPtr.x * 0.45 * aspect, -uPtr.y * 0.45);
  float f1 = ball(p, c1, 0.15);
  float f2 = ball(p, c2, 0.12);
  float f3 = ball(p, c3, 0.10);
  float f4 = ball(p, c4, 0.08);
  float f = f1 + f2 + f3 + f4;
  float w = fwidth(f);
  float body = smoothstep(1.0 - w, 1.0 + w, f);
  float edge = smoothstep(0.78 - w, 0.78 + w, f);
  vec3 yellow = vec3(1.0, 0.780, 0.0);
  vec3 blue = vec3(0.169, 0.294, 1.0);
  vec3 red = vec3(1.0, 0.294, 0.169);
  vec3 ink = vec3(0.039, 0.039, 0.039);
  float m = max(max(f1, f2), max(f3, f4));
  vec3 solid = (m == f2) ? blue : ((m == f3) ? red : yellow);
  vec3 col = mix(ink, solid, body);
  outColor = vec4(col * edge, edge); // premultiplied alpha
}`;

/** FX-34 Mercury Field. Pauses off-screen / in background tabs; static frame under reduced motion/Calm. */
export function MercuryField({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!FX.mercuryField || !canvas) return;
    if (getComputedStyle(canvas).display === 'none') return; // hidden breakpoint: never create a context
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    if (!gl) return; // no WebGL2: the static Bauhaus shapes remain, which is the current design

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // one big triangle
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uPtr = gl.getUniformLocation(prog, 'uPtr');

    const root = document.documentElement;
    const still = prefersReducedMotion();
    const t0 = performance.now();
    let raf = 0;
    let visible = false;
    let lost = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const draw = (now: number) => {
      raf = 0;
      if (lost) return;
      const px = parseFloat(root.style.getPropertyValue('--px')) || 0; // written by FX-01, no extra listener
      const py = parseFloat(root.style.getPropertyValue('--py')) || 0;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, still ? 14 : (now - t0) / 1000);
      gl.uniform2f(uPtr, px, py);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      if (visible) kick();
    });
    io.observe(canvas);
    const onVisibility = () => {
      if (!document.hidden) kick();
    };
    document.addEventListener('visibilitychange', onVisibility);
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    canvas.addEventListener('webglcontextlost', onLost);

    resize();
    kick();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none block ${className}`} />;
}
