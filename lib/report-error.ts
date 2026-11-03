/**
 * R86: send a caught crash to /api/client-error (Vercel logs). Fire and forget: a report that fails is dropped, and
 * one page view sends at most 5 (a section that throws on every render must not flood the server).
 */
let sent = 0;

export function reportError(where: string, error: unknown) {
  if (typeof window === 'undefined' || sent >= 5) return;
  sent++;
  const e = error instanceof Error ? error : new Error(String(error));
  try {
    const body = JSON.stringify({
      where,
      message: e.message,
      stack: e.stack,
      digest: (e as Error & { digest?: string }).digest,
      page: location.pathname + location.search,
    });
    void fetch('/api/client-error', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* nothing to report with */
  }
}

/** a code-split chunk from an older deploy (or a dropped connection) failed to load */
export const isChunkError = (error: unknown) =>
  error instanceof Error &&
  /ChunkLoadError|Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module/i.test(
    `${error.name} ${error.message}`,
  );
