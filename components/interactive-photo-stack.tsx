'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Maximize2 } from 'lucide-react';

const photos = [
  { src: '/images/projects/zerolag/dashboard.jpeg', alt: 'Dashboard Console', rotation: -1.5 },
  { src: '/images/projects/zerolag/agent-flow.png', alt: 'Agent Architecture Flow', rotation: 3 },
  { src: '/images/projects/zerolag/ai insight.jpeg', alt: 'AI Insights Module', rotation: 2 },
  { src: '/images/projects/zerolag/ai policies.jpeg', alt: 'AI Agent Policies', rotation: -1 },
  { src: '/images/projects/zerolag/backend.jpeg', alt: 'Backend Telemetry', rotation: 1.5 },
];

/**
 * Skeuomorphic polaroid stack: taped prints on a desk.
 * A11y: the stack is a real button (Enter/Space cycles), current photo is announced.
 */
export function InteractivePhotoStack({ customPhotos }: { customPhotos?: { src: string, alt: string, rotation: number }[] }) {
  const [cards, setCards] = useState(customPhotos || photos);

  const cycle = () => {
    setCards((prev) => {
      const newCards = [...prev];
      const topCard = newCards.shift();
      if (topCard) newCards.push(topCard);
      return newCards;
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={cards[0]?.alt}
      onClick={(e) => { e.stopPropagation(); cycle(); }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycle(); }
      }}
      className="relative w-full h-full min-h-[280px] sm:min-h-[380px] lg:min-h-[420px] flex items-center justify-center cursor-pointer group rounded-2xl"
    >
      {cards.map((photo, index) => {
        const isTop = index === 0;
        return (
          <motion.div
            key={photo.src}
            layout
            initial={false}
            animate={{
              scale: isTop ? 1 : 1 - index * 0.04,
              y: isTop ? 0 : index * 9,
              rotate: isTop ? 0 : photo.rotation * 1.4,
              zIndex: cards.length - index,
              opacity: index > 3 ? 0 : 1,
            }}
            whileHover={isTop ? { scale: 1.02, rotate: -1.2, y: -5, transition: { duration: 0.2 } } : {}}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute w-[94%] aspect-video bg-white p-2 sm:p-2.5 pb-6 sm:pb-8 rounded-md border-3 border-ink shadow-brutal origin-center max-h-full"
          >
            {isTop && <span className="tape" aria-hidden />}
            <div className="w-full h-full relative overflow-hidden rounded-sm bg-paper-deep border-2 border-ink">
              {/* next/image: phones get a resized WebP/AVIF instead of the full 300–900 KB PNG screenshot */}
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 1024px) 92vw, 40vw"
                className="object-contain pointer-events-none"
              />
              {isTop && (
                <button
                  onClick={(e) => { e.stopPropagation(); window.open(photo.src, '_blank'); }}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 p-1.5 sm:p-2 bg-white border-2 border-ink rounded-lg shadow-brutal-xs hover:bg-pop-yellow hover:-translate-y-0.5 active:translate-y-0 transition-all text-ink flex items-center justify-center group/expand"
                  title="View full resolution"
                  aria-label="View full resolution"
                >
                  <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 group-hover/expand:scale-110 transition-transform" strokeWidth={2.5} />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Interaction Hint */}
      <div className="absolute -bottom-3 lg:-bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 nb-tag bg-white shadow-brutal-xs pointer-events-none z-50 max-w-[92%] text-center justify-center">
        <span className="w-2 h-2 rounded-full bg-pop-red border border-ink animate-pulse" />
        CLICK ALBUM TO CYCLE
      </div>
    </div>
  );
}
