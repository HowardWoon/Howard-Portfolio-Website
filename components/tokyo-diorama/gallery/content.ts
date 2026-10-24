/**
 * Walk-in gallery content, built from the SAME data the page sections render. Nothing is typed twice: add an award to
 * `honorsList` (components/honors-section.tsx), a project to `projects` (stacked-projects.tsx) or a role to
 * `experiences` (experience-section.tsx) and the 3D rooms show it on the next build. Exhibits that should live only in
 * 3D, or that must appear without a code change, come from public/gallery/gallery.json and the admin page
 * (gallery/live.ts) and are merged on top.
 *
 * Every room is keyed by a section id of lib/sections.ts (AGENTS.md 7.5: sections are never hardcoded). A section
 * without a builder below still gets a room: the engine falls back to a generic hall for its exhibits.
 */
import { isValidElement, type ReactNode } from 'react';
import { SECTIONS } from '@/lib/sections';
import { personalDetails } from '@/lib/site-data';
import { LEDGER } from '@/components/about-section';
import { honorsList, CERT_SIZE, CERT_PREVIEW } from '@/components/honors-section';
import { projects } from '@/components/stacked-projects';
import { experiences } from '@/components/experience-section';
import { photos as zerolagPhotos } from '@/components/interactive-photo-stack';
import { ORG_LOGOS } from '@/components/org-logo';
import { SECTION_DOORS, SECTION_JP } from '../engine/doors';
import type { Exhibit, GalleryContent, GalleryImage, GalleryLink, RoomContent } from './types';

/** plain text out of a React node (honours keep some descriptions as JSX); components without children give '' */
export function toText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(toText).join('');
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    const inner = toText(props.children);
    // block elements end a sentence; inline ones flow on
    const tag = typeof node.type === 'string' ? node.type : '';
    return /^(p|div|li|h[1-6])$/.test(tag) ? `${inner}\n` : inner;
  }
  return '';
}

const paragraphs = (node: ReactNode) =>
  toText(node)
    .split(/\n+/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

const img = (src: string, alt: string, w: number, h: number): GalleryImage => ({ src, alt, w, h });

/* ------------------------------------------------------------------ About */
function aboutRoom(): Exhibit[] {
  const p = personalDetails;
  const out: Exhibit[] = [
    {
      id: 'portrait',
      kind: 'portrait',
      kicker: p.title,
      title: p.fullName,
      subtitle: `${p.degree}, ${p.university}`,
      image: img(p.avatarUrl, `Portrait of ${p.name}`, 682, 1024), // real pixel size (PIL)
      body: [p.statement],
      stats: [
        { label: 'University', value: p.university },
        { label: 'CGPA', value: p.cgpa },
        { label: 'Based in', value: p.location },
      ],
    },
  ];
  // the four Build Sheet facts become four hanging banners (same values, same SIGNAL meaning, same proof link)
  LEDGER.forEach((f, i) =>
    out.push({
      id: `fact-${i + 1}`,
      kind: 'fact',
      value: f.value,
      title: f.label,
      subtitle: f.note,
      signal: f.signal,
      links: [{ label: 'See the proof', href: f.href, kind: 'internal' }],
    }),
  );
  out.push({
    id: 'university',
    kind: 'plaque',
    signal: 'academic',
    kicker: p.faculty,
    title: p.university,
    subtitle: p.degree,
    logo: img('/images/logos/um_crest.png', '', 640, 640),
    stats: [{ label: 'CGPA', value: p.cgpa }],
  });
  out.push({
    id: 'resume',
    kind: 'resume',
    title: 'Resume',
    subtitle: p.fullName,
    links: [{ label: 'Open the resume (PDF)', href: p.resumeUrl, kind: 'file' }],
  });
  return out;
}

/* ------------------------------------------------------------------ Projects */
const SIMULATOR: Record<string, string | undefined> = { agentic: 'agentic', flood: 'flood', energy: 'energy' };

function projectsRoom(): Exhibit[] {
  return projects.map((pr) => {
    const gallery = pr.galleryPhotos ?? (pr.id === 'zerolag' ? zerolagPhotos : []);
    const images = gallery.map((g) => img(g.src, g.alt, g.w, g.h));
    const links: GalleryLink[] = [];
    if (pr.prototypeUrl) links.push({ label: 'Open the prototype', href: pr.prototypeUrl, kind: 'external' });
    if (pr.dashboardUrl) links.push({ label: 'Open the live dashboard', href: pr.dashboardUrl, kind: 'external' });
    if (pr.orchestratorUrl) links.push({ label: 'Open the orchestrator', href: pr.orchestratorUrl, kind: 'external' });
    if (pr.colabUrl) links.push({ label: 'Open the notebook', href: pr.colabUrl, kind: 'external' });
    if (pr.githubUrl) links.push({ label: 'Source on GitHub', href: pr.githubUrl, kind: 'external' });
    if (pr.deckUrl) links.push({ label: 'Pitch deck (PDF)', href: pr.deckUrl, kind: 'file' });
    const sim = SIMULATOR[pr.telemetryType];
    if (sim) links.push({ label: 'Run the simulator', href: `/simulators/${sim}`, kind: 'internal' });
    return {
      id: pr.id,
      kind: 'project',
      number: pr.number,
      kicker: pr.badge,
      signal: pr.signal,
      title: pr.title,
      subtitle: pr.subtitle,
      body: [pr.description],
      bullets: pr.architecturePoints,
      stats: pr.metrics,
      tags: pr.tags,
      image: images[0],
      images,
      links,
    } satisfies Exhibit;
  });
}

/* ------------------------------------------------------------------ Experience */
function experienceRoom(): Exhibit[] {
  return experiences.map((ex) => {
    const images = (ex.galleryPhotos ?? []).map((g) => img(g.src, g.alt, g.w, g.h));
    const logo = ex.logo ? ORG_LOGOS[ex.logo] : undefined;
    const links: GalleryLink[] = [];
    if (ex.map)
      links.push({
        label: 'View on map',
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ex.map)}`,
        kind: 'external',
      });
    return {
      id: ex.id,
      kind: 'experience',
      number: ex.number,
      kicker: ex.categoryLabel,
      signal: ex.signal,
      title: ex.role,
      subtitle: `${ex.organization} · ${ex.location}`,
      period: ex.period,
      body: [ex.headline],
      bullets: ex.bullets,
      stats: ex.metrics,
      tags: ex.tags,
      image: images[0],
      images,
      logo: logo ? img(logo.src, '', logo.w, logo.h) : undefined,
      links,
    } satisfies Exhibit;
  });
}

/* ------------------------------------------------------------------ Honors */
function honorsRoom(): Exhibit[] {
  return honorsList.map((h) => {
    const url = h.certificateUrl;
    const size = url ? CERT_SIZE[url] : undefined;
    const preview = url ? CERT_PREVIEW[url] : undefined;
    const image = preview
      ? img(preview.src, `Certificate: ${h.title}`, preview.w, preview.h)
      : size && url
        ? img(url, `Certificate: ${h.title}`, size[0], size[1])
        : undefined;
    return {
      id: h.id,
      kind: 'honor',
      emblem: h.emblem,
      kicker: h.badge,
      signal: h.signal,
      title: h.title,
      subtitle: h.issuingBody,
      period: h.period,
      stats: [h.statCallout],
      body: paragraphs(h.description),
      bullets: h.highlights,
      image,
      links: url ? [{ label: 'Open the certificate', href: url, kind: 'file' }] : [],
    } satisfies Exhibit;
  });
}

/* ------------------------------------------------------------------ Contact */
function contactRoom(): Exhibit[] {
  const p = personalDetails;
  return [
    {
      id: 'letter',
      kind: 'contact',
      kicker: 'Post a letter',
      title: 'Send me a message',
      subtitle: 'It arrives in my inbox, like the form on the page.',
    },
    {
      id: 'email',
      kind: 'contact',
      kicker: 'Email',
      title: p.email,
      links: [{ label: 'Write an email', href: `mailto:${p.email}`, kind: 'mailto' }],
    },
    {
      id: 'linkedin',
      kind: 'contact',
      kicker: 'LinkedIn',
      title: p.fullName,
      links: [{ label: 'Open LinkedIn', href: p.linkedin, kind: 'external' }],
    },
    {
      id: 'github',
      kind: 'contact',
      kicker: 'GitHub',
      title: p.github.replace(/^https?:\/\//, ''),
      links: [{ label: 'Open GitHub', href: p.github, kind: 'external' }],
    },
    {
      id: 'location',
      kind: 'contact',
      kicker: 'Based in',
      title: p.location,
    },
  ];
}

/** per-section builders; a section with a door but no builder gets an empty room (filled by gallery.json / admin) */
const BUILDERS: Record<string, () => Exhibit[]> = {
  about: aboutRoom,
  projects: projectsRoom,
  experience: experienceRoom,
  honors: honorsRoom,
  contact: contactRoom,
};

/** the whole gallery, one room per section that has a door in the street */
export function buildGalleryContent(): GalleryContent {
  const out: GalleryContent = {};
  for (const s of SECTIONS) {
    if (!(s.id in SECTION_DOORS)) continue;
    const room: RoomContent = {
      id: s.id,
      label: s.label,
      jp: SECTION_JP[s.id] ?? '',
      exhibits: BUILDERS[s.id]?.() ?? [],
    };
    out[s.id] = room;
  }
  return out;
}
