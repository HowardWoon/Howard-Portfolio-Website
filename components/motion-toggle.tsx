'use client';

import { Zap, ZapOff } from 'lucide-react';
import { FX } from '@/lib/fx';
import { setCalm, useCalm } from '@/lib/motion-pref';

export function MotionToggle({ className = '' }: { className?: string }) {
  const calm = useCalm();
  if (!FX.calmMode) return null;
  return (
    <button
      type="button"
      onClick={() => setCalm(!calm)}
      aria-pressed={calm}
      aria-label={calm ? 'Turn animations back on' : 'Reduce motion'}
      title={calm ? 'Turn animations back on' : 'Reduce motion'}
      className={`grid place-items-center rounded-full border-3 border-ink bg-white shadow-brutal-sm transition-[transform,box-shadow] duration-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${className}`}
    >
      {calm ? (
        <ZapOff className="w-5 h-5 text-ink" strokeWidth={2.5} aria-hidden />
      ) : (
        <Zap className="w-5 h-5 text-ink" strokeWidth={2.5} aria-hidden />
      )}
    </button>
  );
}
