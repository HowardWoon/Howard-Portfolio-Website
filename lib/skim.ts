/**
 * FX-92 Skim Lens: a reading aid for a 60-second visit. Source of truth = `data-skim` on <html>; CSS does the rest
 * (globals.css "FX-92"): body copy steps back to the existing muted ink (#565656, still 7.4:1), headings and the
 * existing highlighter phrases stay full strength. No text is hidden, changed or reordered. Lasts for the session.
 */
const KEY = 'hw-skim';

export function isSkim(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.skim === 'on';
}

export function setSkim(on: boolean): void {
  const root = document.documentElement;
  if (on) root.dataset.skim = 'on';
  else delete root.dataset.skim;
  try {
    if (on) sessionStorage.setItem(KEY, '1');
    else sessionStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the setting lasts for this page view */
  }
}

/** restore the visitor's choice from this session (called once after mount) */
export function restoreSkim(): void {
  try {
    if (sessionStorage.getItem(KEY) === '1') setSkim(true);
  } catch {
    /* storage blocked */
  }
}
