import { SECTIONS } from '@/lib/sections';

/**
 * R112 / R114 (owner: "you put 01 here but no 02, 03 ... I want all of them numbered, in order"): a section's number at
 * poster scale, outlined ink (`.ground-index`), read from lib/sections.ts - the order of the page's sections - so a
 * new or moved section is numbered by itself (AGENTS.md 7.5: sections are never hardcoded).
 */
export function SectionIndex({ id, className = '' }: { id: (typeof SECTIONS)[number]['id']; className?: string }) {
  const n = SECTIONS.findIndex((s) => s.id === id) + 1;
  if (!n) return null;
  return (
    <span aria-hidden data-section-index={id} className={`ground-index ${className}`}>
      {String(n).padStart(2, '0')}
    </span>
  );
}
