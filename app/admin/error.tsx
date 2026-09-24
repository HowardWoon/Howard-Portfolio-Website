'use client';

import { useEffect } from 'react';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border-2 border-red-200">
        <h2 className="text-xl font-bold mb-2">Admin Action Failed</h2>
        <p className="mb-4">{error.message || 'Something went wrong.'}</p>
        <button
          onClick={() => reset()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
