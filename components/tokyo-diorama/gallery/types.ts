/**
 * Walk-in gallery: the data the 3D rooms show. Plain data only (no three.js, no React), so the page bundle can build
 * it and hand it to the engine, and a JSON file or a database row can carry the very same shape.
 *
 * One ROOM per section of `lib/sections.ts` that has a door in the street (`engine/doors.ts`). A room holds EXHIBITS:
 * every exhibit is one thing a visitor can walk up to and inspect (a framed certificate, a project kiosk, a banner).
 */
import type { Signal } from '@/lib/signal';

export type ExhibitKind =
  | 'portrait' // About: the big framed portrait
  | 'fact' // About: a hanging banner with one figure (4.00 CGPA)
  | 'statement' // About: a printed text panel
  | 'plaque' // an institution / organisation plate
  | 'resume' // About: the lectern with the resume
  | 'project' // Projects: a kiosk
  | 'experience' // Experience: a booth
  | 'honor' // Honors: a plinth + (optional) framed certificate
  | 'contact' // Contact: a channel (email, LinkedIn, GitHub, letter)
  | 'custom'; // anything added later through gallery.json or the admin page

export interface GalleryImage {
  src: string;
  alt: string;
  /** the file's real pixel size (the frame takes its shape from it) */
  w: number;
  h: number;
}

export interface GalleryLink {
  label: string;
  href: string;
  /** internal = a section or route of this site, file = a PDF / image on this site, external = another site */
  kind: 'internal' | 'file' | 'external' | 'mailto';
}

export interface Exhibit {
  /** unique inside its room (used for the directory, deep links and tests) */
  id: string;
  kind: ExhibitKind;
  title: string;
  subtitle?: string;
  /** a short line above the title (a badge, a category) */
  kicker?: string;
  /** the SIGNAL KEY meaning of this exhibit (lib/signal.ts); none = neutral ink / paper */
  signal?: Signal;
  /** shown on the wall / kiosk / frame in 3D */
  image?: GalleryImage;
  /** more photos, shown in the inspect panel */
  images?: GalleryImage[];
  /** an organisation wordmark / crest, printed on the exhibit's plate */
  logo?: GalleryImage;
  /** paragraphs */
  body?: string[];
  bullets?: string[];
  stats?: { label: string; value: string }[];
  tags?: string[];
  links?: GalleryLink[];
  period?: string;
  /** a real sequence number from the content (project 01, 02 ...), never invented */
  number?: string;
  /** for 'fact': the figure itself */
  value?: string;
  /** Honors: the trophy form on the plinth (the page's HonorEmblem kinds) */
  emblem?: 'gold' | 'silver' | 'bronze' | 'star' | 'finalist' | 'seal' | 'ticket' | 'badge';
  /** sort key for exhibits added later (lower first); built-in exhibits keep the page's order */
  order?: number;
}

export interface RoomContent {
  /** a section id of lib/sections.ts */
  id: string;
  label: string;
  /** the Japanese line on the sign (engine/doors.ts SECTION_JP) */
  jp: string;
  exhibits: Exhibit[];
}

export type GalleryContent = Record<string, RoomContent>;

/** an exhibit that lives outside the code (public/gallery/gallery.json or the Supabase table `gallery_items`) */
export interface ExtraExhibit extends Exhibit {
  /** which room it goes into (a section id) */
  room: string;
  /** hide it without deleting it */
  hidden?: boolean;
}
