/** The home-page sections, in page order. Shared by the Section Spine (desktop) and the Section Dock (mobile). */
export const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'honors', label: 'Honors' },
  { id: 'contact', label: 'Contact' },
] as const;

export const SECTION_IDS = SECTIONS.map((s) => s.id);
