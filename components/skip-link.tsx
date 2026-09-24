'use client';
export function SkipLink() {
  return (
    <a
      href="#main-content"
      onClick={(e) => {
        const target = document.getElementById('main-content');
        if (!target) return;
        e.preventDefault();
        target.focus({ preventScroll: true });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (w.__lenis) w.__lenis.scrollTo(target, { immediate: true });
        else target.scrollIntoView();
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999999] focus:px-4 focus:py-2 focus:bg-pop-yellow focus:text-ink focus:font-mono focus:font-bold focus:border-3 focus:border-ink focus:rounded-lg focus:shadow-brutal-sm"
    >
      Skip to content
    </a>
  );
}
