'use client';

import dynamic from 'next/dynamic';

// Below-the-fold sections: still server-rendered (same HTML and content), but their JS leaves First Load.
export const StackedProjects = dynamic(() => import('@/components/stacked-projects'));
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

export const InteractionHud = dynamic(() => import('@/components/interaction-hud').then((mod) => mod.InteractionHud), {
  ssr: false,
});
