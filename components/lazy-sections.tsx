'use client';

import dynamic from 'next/dynamic';
import { installEarlyClickReplay } from '@/lib/early-clicks';

// R24: this module is in the root bundle, so the replay is listening before the sections below hydrate; a tap on a
// server-rendered but not yet hydrated button is replayed instead of being dropped (lib/early-clicks.ts)
installEarlyClickReplay();

// Below-the-fold sections: still server-rendered (same HTML and content), but their JS leaves First Load.
export const StackedProjects = dynamic(() => import('@/components/stacked-projects'));
// R21 "The Build": scroll-scrubbed storyboard between About and Projects (self-contained, no section id)
export const BuildStory = dynamic(() => import('@/components/build-story'));
// R22: System Status Bar (KL clock, ping, X-ray mode) under the hero tape
export const SystemStatusBar = dynamic(() => import('@/components/system-status-bar'));
// R23: the resume drawer (client only; mounted right away so RESUME works before the idle mounts)
export const ResumeDrawer = dynamic(() => import('@/components/resume-drawer'), { ssr: false });
export const ExperienceSection = dynamic(() => import('@/components/experience-section'));
export const HonorsSection = dynamic(() => import('@/components/honors-section'));
export const ContactSection = dynamic(() => import('@/components/contact-section'));

// Round 10: the interaction HUD (trail / focus / tour / shortcuts) is client-only and never needed for first paint.
// Imported from THIS client module (not from the server component portfolio-page.tsx), because next/dynamic only
// splits client components into their own chunk when it is called from a client module.
// Round 13: kicker decode + press stamp (FX-55, FX-56). Client-only, after first paint, own chunk.
export const AmbientFx = dynamic(() => import('@/components/fx/ambient-fx').then((mod) => mod.AmbientFx), {
  ssr: false,
});

// Round 16: the tide canvas (FX-76) and the frame governor (FX-93) are client-only and never needed for first paint.
export const TideCanvas = dynamic(() => import('@/components/fx/tide-canvas').then((mod) => mod.TideCanvas), {
  ssr: false,
});
export const FrameGovernor = dynamic(() => import('@/components/fx/frame-governor').then((mod) => mod.FrameGovernor), {
  ssr: false,
});
// Round 16 sessions 2-5 (FX-83, 84, 86, 87, 89, 92): one client-only chunk
export const DeskFx = dynamic(() => import('@/components/fx/desk-fx').then((mod) => mod.DeskFx), {
  ssr: false,
});

export const InteractionHud = dynamic(() => import('@/components/interaction-hud').then((mod) => mod.InteractionHud), {
  ssr: false,
});

// R17 P2-07: these were next/dynamic calls inside the server component portfolio-page.tsx, which does not split them
// (see the note above), so they sat in First Load JS (189 / 190 kB). Client-only, after first paint.
export const SectionSpine = dynamic(() => import('@/components/section-spine').then((mod) => mod.SectionSpine), {
  ssr: false,
});
export const SectionDock = dynamic(() => import('@/components/section-dock').then((mod) => mod.SectionDock), {
  ssr: false,
});
export const CommandPalette = dynamic(() => import('@/components/command-palette').then((mod) => mod.CommandPalette), {
  ssr: false,
});
export const OffscreenPause = dynamic(
  () => import('@/components/fx/offscreen-pause').then((mod) => mod.OffscreenPause),
  {
    ssr: false,
  },
);
export const PointerField = dynamic(() => import('@/components/fx/pointer-field').then((mod) => mod.PointerField), {
  ssr: false,
});
export const EasterEgg = dynamic(() => import('@/components/fx/easter-egg').then((mod) => mod.EasterEgg), {
  ssr: false,
});

// R40 Press Run: plates, feed marks, touch inspect, run log + the Proof Tray (client-only, after the boot gate)
export const PressFx = dynamic(() => import('@/components/press/press-fx').then((mod) => mod.PressFx), {
  ssr: false,
});
export const ProofTray = dynamic(() => import('@/components/press/proof-tray').then((mod) => mod.ProofTray), {
  ssr: false,
});

// R18 FX-95: the Section Clock engine (client-only, after first paint)
export const SectionClock = dynamic(() => import('@/components/fx/section-clock').then((mod) => mod.SectionClock), {
  ssr: false,
});
