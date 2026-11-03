'use client';

import { Component, type ComponentType, type ReactNode } from 'react';
import { ErrorScreen } from '@/components/error-screen';
import { isChunkError, reportError } from '@/lib/report-error';

const RELOADED = 'hw-chunk-reload';

/** a chunk from an older deploy: one fresh load fetches the current files (never twice in a minute: no reload loop) */
function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(RELOADED) ?? '0');
    if (Date.now() - last < 60_000) return;
    sessionStorage.setItem(RELOADED, String(Date.now()));
    location.reload();
  } catch {
    /* storage blocked: the card's own Reload button is still there */
  }
}

type Props = { name: string; silent?: boolean; children: ReactNode };

/**
 * R86 (owner's screenshot: the whole portfolio replaced by "Something broke on this page."): app/error.tsx was the only
 * boundary, so ONE throwing section took every other section down with it. Each code-split section now has its own:
 * a crash replaces only that section with the same error card (compact), the rest of the page keeps working, the error
 * goes to /api/client-error, and a chunk that failed to load reloads the page once. Client-only layers (FX, HUD,
 * dock ...) are `silent`: they simply disappear.
 */
export class SectionBoundary extends Component<Props, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
    reportError(this.props.name, error);
    if (isChunkError(error)) reloadOnce();
  }

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.silent) return null;
    return (
      <ErrorScreen
        compact
        code="ERROR"
        title="Something broke on this page."
        detail="Reload to start the portfolio again."
        onRetry={() => this.setState({ error: null })}
      />
    );
  }
}

/** tests (tests/r86.spec.ts): `?section-crash=<name>` makes that section throw while rendering, like a real crash */
function CrashTest({ name }: { name: string }) {
  if (typeof window !== 'undefined' && new URLSearchParams(location.search).get('section-crash') === name)
    throw new Error(`section-crash test: ${name}`);
  return null;
}

/** wrap a (code-split) component in its own boundary */
export function guard<P extends object>(Inner: ComponentType<P>, name: string, silent = false) {
  function Guarded(props: P) {
    return (
      <SectionBoundary name={name} silent={silent}>
        <CrashTest name={name} />
        <Inner {...props} />
      </SectionBoundary>
    );
  }
  Guarded.displayName = `Guarded(${name})`;
  return Guarded;
}
