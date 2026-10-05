'use client';

import Link from 'next/link';

/**
 * R35 crash guard (owner: "make sure the website wont down or crash"). Without app/error.tsx, app/global-error.tsx and
 * app/not-found.tsx, one exception in any client component replaced the whole site with Next.js's blank "Application
 * error" screen, and a mistyped URL showed the unstyled default 404. This is the one screen all three use, built only
 * from existing tokens: paper + dot grid, a 3 px ink card with the hard shadow, mono labels, and red because red means
 * alerts / errors (SIGNAL KEY). The way home is a real link (<a href="/"> via next/link), so it works even before / without JavaScript.
 */
export function ErrorScreen({
  code,
  title,
  detail,
  onRetry,
}: {
  code: string;
  title: string;
  detail: string;
  /** shown as "Try again" (re-renders the broken part without a reload) */
  onRetry?: () => void;
}) {
  return (
    <main
      id="main"
      className="min-h-screen-safe grid place-items-center bg-paper bg-dots px-4 py-16 text-ink"
      style={{
        paddingTop: 'max(4rem, var(--safe-top, 0px))',
        paddingBottom: 'max(4rem, var(--safe-bottom, 0px))',
      }}
    >
      <div
        role="alert"
        className="w-full max-w-md overflow-hidden rounded-[22px] border-3 border-ink bg-white shadow-brutal"
      >
        <div className="flex items-center justify-between gap-3 border-b-3 border-ink bg-pop-red px-4 py-2">
          <span className="font-mono text-xs font-extrabold tracking-[0.14em] text-ink">{code}</span>
          <span className="font-mono text-xs font-extrabold tracking-[0.14em] text-ink">HOWARD WOON</span>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <h1 className="font-display text-[clamp(1.5rem,6vw,2rem)] font-extrabold leading-tight tracking-[-0.02em]">
            {title}
          </h1>
          <p className="font-mono text-sm font-semibold leading-relaxed text-ink">{detail}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            {onRetry ? (
              <button type="button" onClick={onRetry} className="nb-btn nb-btn-ink min-h-[44px] px-5 py-2.5 text-sm">
                Try again
              </button>
            ) : null}
            <Link href="/" className="nb-btn nb-btn-white min-h-[44px] px-5 py-2.5 text-sm">
              Reload the portfolio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
