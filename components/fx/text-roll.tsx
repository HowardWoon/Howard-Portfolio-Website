import React from 'react';

export function TextRoll({ children }: { children: string }) {
  if (typeof children !== 'string') return <>{children}</>;

  const chars = children.split('');

  return (
    <span className="relative inline-flex overflow-hidden">
      {/* Primary text (moves up and out) */}
      <span className="inline-flex">
        {chars.map((char, i) => (
          <span
            key={`primary-${i}`}
            className="inline-block whitespace-pre transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.1,1)] group-hover:-translate-y-full"
            style={{ transitionDelay: `${i * 15}ms` }}
          >
            {char}
          </span>
        ))}
      </span>
      {/* Secondary text (moves up and in from below) */}
      <span className="absolute inset-0 inline-flex">
        {chars.map((char, i) => (
          <span
            key={`secondary-${i}`}
            className="inline-block whitespace-pre translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.1,1)] group-hover:translate-y-0"
            style={{ transitionDelay: `${i * 15}ms` }}
          >
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}
