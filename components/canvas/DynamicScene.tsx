'use client';

import dynamic from 'next/dynamic';

export const DynamicScene = dynamic(
  () => import('./Scene'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 -z-10 bg-[#0A0A0A] transition-opacity duration-1000" />
    ),
  }
);
