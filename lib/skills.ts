/**
 * Evidence Trail helpers. A skill name in the About "Tooling Matrix" and a tag on a project card refer to the
 * same technology when their keys match: "Java 21" = "Java 21", "Python 3.12" = "Python",
 * "SQL (PostgreSQL)" = "PostgreSQL", "Next.js 15" = "Next.js". Derived from existing text only.
 */
export function skillKey(name: string): string {
  let x = name.trim();
  const paren = x.match(/\(([^)]+)\)/);
  if (paren && !/[/+]/.test(paren[1])) x = paren[1]; // "SQL (PostgreSQL)" -> "PostgreSQL"; keeps "Firmware (C/C++)"
  x = x.replace(/\s+\d[\d.]*$/, ''); // drop trailing versions: "Java 21", "Python 3.12", "Next.js 15"
  return x.toLowerCase().trim().replace(/\s+/g, '-');
}

/** Project cards expose their skill keys as `data-project-skills="java spring-boot …"`. */
export function projectsWithSkill(key: string): string[] {
  if (typeof document === 'undefined') return [];
  return Array.from(document.querySelectorAll<HTMLElement>('[data-project-skills]'))
    .filter((el) => (el.dataset.projectSkills ?? '').split(' ').includes(key))
    .map((el) => el.dataset.projectId ?? '')
    .filter(Boolean);
}

/**
 * Smooth-scroll to a project card. R17 P1-02: targets the card's untransformed shell, whose CSS scroll-margin-top
 * leaves room for the fixed header (Lenis and scrollIntoView both honour it; a JS offset on top doubled it).
 */
export function scrollToProject(id: string) {
  const card = document.getElementById(`project-${id}`);
  if (!card) return;
  const el = card.closest<HTMLElement>('[data-project-shell]') ?? card;
  if (window.__lenis) window.__lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
