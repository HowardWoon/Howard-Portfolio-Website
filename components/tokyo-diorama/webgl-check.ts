/**
 * WebGL checks shared by the street's page (tokyo-diorama-section.tsx) and the home teaser's live preview
 * (diorama-preview.tsx). Each test context is let go at once: a browser keeps ~16 live contexts and drops the oldest -
 * maybe the street's (R80).
 */
export function prefersCalm() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true ||
    document.documentElement.dataset.motion === 'calm'
  );
}

/**
 * R70: true when WebGL is drawn by the CPU (SwiftShader, llvmpipe, Microsoft Basic Render Driver: no graphics chip, or
 * graphics turned off). The street runs at a few frames a second there and slows the whole page down, so it waits for
 * the visitor to start it.
 */
export function softwareWebgl() {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
  } catch {
    return false;
  }
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}
