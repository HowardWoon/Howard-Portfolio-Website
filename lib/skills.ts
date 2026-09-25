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

/** Smooth-scroll to a project card, leaving room for the fixed header. */
export function scrollToProject(id: string) {
  const el = document.getElementById(`project-${id}`);
  if (!el) return;
  const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -(h + 24) });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (h + 24) });
}
