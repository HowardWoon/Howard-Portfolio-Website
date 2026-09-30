import type { MouseEvent } from 'react';

/**
 * R23 Resume drawer (lecturer advice #4). A plain click on any RESUME link opens the drawer instead of leaving the
 * page; Ctrl / Cmd / Shift / middle clicks stay native (new tab / window). Queued like the command palette, so a
 * click before the drawer has mounted is not lost.
 */
export const RESUME_URL = '/resume.pdf';

export type ResumeWindow = Window & { __hwResumeWanted?: boolean };

export function openResume(e?: MouseEvent) {
  if (e && (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
  e?.preventDefault();
  (window as ResumeWindow).__hwResumeWanted = true;
  window.dispatchEvent(new Event('open-resume'));
}
