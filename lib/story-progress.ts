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

/**
 * R31 Crest Scan beat (owner: "lengthen it and add a section in the middle that shows the UM logo, scanned and
 * expanding"). The story's authored timeline ("story time", the numbers in build-story.tsx) gets a gap inserted at
 * STORY_GAP_AT, after the terminal has finished typing and before the blueprint lands. storyTime() maps story time to
 * the playhead; gapTime(f) gives the playhead at fraction f (0..1) of the gap. The track grows by the same factor
 * (globals.css .bs-track), so every old scene keeps its scroll length.
 */
export const STORY_GAP_AT = 0.36;
export const STORY_GAP = 0.12;
export const storyTime = (x: number) => (x <= STORY_GAP_AT ? x : x + STORY_GAP) / (1 + STORY_GAP);
export const gapTime = (f: number) => (STORY_GAP_AT + f * STORY_GAP) / (1 + STORY_GAP);
