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

/**
 * R37 Role-to-Proof Circuit: a trail step is a project id ("zerolag") or an Experience card ("exp:kraiburg", the
 * card's data-folder). An Experience card carries its own CSS scroll-margin-top (globals.css); when a folder filter
 * has hidden it, the step lands on the Experience section instead.
 */
export function scrollToEvidence(id: string) {
  let el: HTMLElement | null;
  if (id.startsWith('exp:')) {
    el = document.querySelector<HTMLElement>(`[data-folder="${id.slice(4)}"]`) ?? document.getElementById('experience');
  } else {
    const card = document.getElementById(`project-${id}`);
    el = card?.closest<HTMLElement>('[data-project-shell]') ?? card;
  }
  if (!el) return;
  // the LAYOUT position (offsetTop chain), not the box on screen: a stop that is still mid scroll-reveal (translated
  // 85-160 px down) used to be targeted where it was drawn, then slid up under the header once it settled
  const target = el;
  const layoutTop = () => {
    let y = 0;
    for (let n: HTMLElement | null = target; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
    return Math.max(0, y - (parseFloat(getComputedStyle(target).scrollMarginTop) || 0));
  };
  const top = layoutTop();
  // reduced motion / Calm: land at once, no glide
  const still =
    document.documentElement.dataset.motion === 'calm' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis = window.__lenis;
  if (lenis) {
    // R40: the page above can still change height during the glide (lazy images, settling sections): a stop landed
    // 6-13 px short and its folder tab sat under the header (r36). Re-measure on arrival and correct the drift.
    lenis.scrollTo(top, {
      force: true,
      immediate: still,
      onComplete: () => {
        const again = layoutTop();
        if (Math.abs(again - window.scrollY) > 2) lenis.scrollTo(again, { force: true, immediate: true });
      },
    });
  } else window.scrollTo({ top, behavior: still ? 'instant' : 'smooth' });
}
