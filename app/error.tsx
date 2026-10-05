'use client';

import { useEffect } from 'react';
import { ErrorScreen } from '@/components/error-screen';

/** R35: a page (home, simulators, admin) that throws while rendering shows this instead of a blank screen */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <ErrorScreen
      code="ERROR"
      title="Something broke on this page."
      detail="Reload to start the portfolio again."
      onRetry={reset}
    />
  );
}
