import * as THREE from 'three';

/**
 * Walk-in gallery photos. A frame is built with a printed placeholder (rooms/print.ts) and its photo is swapped in
 * when it has arrived: the room opens at once and never waits for the network. Photos are decoded off the main thread
 * (createImageBitmap) and scaled down to `max` px on their long side - a 2000 px certificate costs 16 MB of graphics
 * memory at full size, at 1024 px it costs 4 MB and still reads sharply on a wall. The inspect panel shows the
 * original file.
 *
 * Swapping the map keeps the material's program (both are sRGB textures): no shader compiles when a photo lands.
 */

const queue: (() => Promise<void>)[] = [];
let running = 0;
const PARALLEL = 3;

function pump() {
  while (running < PARALLEL && queue.length) {
    const job = queue.shift()!;
    running++;
    void job().finally(() => {
      running--;
      pump();
    });
  }
}

async function decode(
  src: string,
  signal: AbortSignal,
): Promise<CanvasImageSource & { width: number; height: number }> {
  const res = await fetch(src, { signal, credentials: 'same-origin' });
  if (!res.ok) throw new Error(`${res.status} ${src}`);
  const blob = await res.blob();
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(blob);
    } catch {
      /* some formats / old Safari: fall back to an <img> */
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const im = new Image();
    im.decoding = 'async';
    im.src = url;
    await im.decode();
    return im;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Loads `src` scaled to fit `max` px and resolves with a texture (null when it failed or the room went away).
 * `fit` = 'cover' crops to the frame's aspect (w / h) instead of keeping the whole picture.
 */
export function loadPhoto(
  src: string,
  max: number,
  signal: AbortSignal,
  crop?: { aspect: number },
): Promise<THREE.CanvasTexture | null> {
  return new Promise((resolve) => {
    queue.push(async () => {
      if (signal.aborted) return resolve(null);
      try {
        const bmp = await decode(src, signal);
        if (signal.aborted) {
          (bmp as ImageBitmap).close?.();
          return resolve(null);
        }
        let sx = 0;
        let sy = 0;
        let sw = bmp.width;
        let sh = bmp.height;
        if (crop) {
          const a = sw / sh;
          if (a > crop.aspect) {
            sw = sh * crop.aspect;
            sx = (bmp.width - sw) / 2;
          } else {
            sh = sw / crop.aspect;
            sy = (bmp.height - sh) / 2;
          }
        }
        const k = Math.min(1, max / Math.max(sw, sh));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(sw * k));
        c.height = Math.max(1, Math.round(sh * k));
        const ctx = c.getContext('2d')!;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, c.width, c.height);
        (bmp as ImageBitmap).close?.();
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        resolve(t);
      } catch {
        resolve(null);
      }
    });
    pump();
  });
}
