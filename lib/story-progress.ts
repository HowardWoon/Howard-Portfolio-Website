/**
 * R28: The Build's playhead (0..1) for components inside the story that need it in JS (the Field Reels' projector
 * gate). build-story.tsx publishes it from its frame (only when it changes); subscribers do arithmetic and write only
 * when their own state changes. No layout reads.
 */
type Listener = (p: number) => void;
const listeners = new Set<Listener>();
let last = 0;

export function publishStoryProgress(p: number) {
  last = p;
  listeners.forEach((l) => l(p));
}

export function onStoryProgress(l: Listener): () => void {
  listeners.add(l);
  l(last);
  return () => listeners.delete(l);
}
