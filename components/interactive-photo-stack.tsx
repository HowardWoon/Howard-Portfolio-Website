'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const photos = [
  { src: '/images/projects/zerolag/dashboard.jpeg', alt: 'Dashboard Console', rotation: -1.5 },
  { src: '/images/projects/zerolag/ai insight.jpeg', alt: 'AI Insights Module', rotation: 2 },
  { src: '/images/projects/zerolag/ai policies.jpeg', alt: 'AI Agent Policies', rotation: -1 },
  { src: '/images/projects/zerolag/backend.jpeg', alt: 'Backend Telemetry', rotation: 1.5 },
];

export function InteractivePhotoStack() {
  const [cards, setCards] = useState(photos);

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCards((prev) => {
      const newCards = [...prev];
      const topCard = newCards.shift();
      if (topCard) newCards.push(topCard);
      return newCards;
    });
  };

  return (
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[450px] flex items-center justify-center cursor-pointer group" onClick={handleNextPhoto}>
      {cards.map((photo, index) => {
        const isTop = index === 0;
        return (
          <motion.div
            key={photo.src}
            layout
            initial={false}
            animate={{
              scale: isTop ? 1 : 1 - index * 0.04,
              y: isTop ? 0 : index * 8,
              rotate: isTop ? 0 : photo.rotation,
              zIndex: cards.length - index,
              opacity: isTop ? 1 : 1 - (index * 0.15),
            }}
            whileHover={isTop ? { scale: 1.02, rotate: -1, y: -4, transition: { duration: 0.2 } } : {}}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute w-[98%] sm:w-[96%] aspect-video bg-white p-1.5 sm:p-2 rounded-lg shadow-2xl shadow-black/60 border border-neutral-200 origin-center max-h-full"
          >
            <div className="w-full h-full relative overflow-hidden rounded bg-neutral-100 border border-neutral-300">
              <img src={photo.src} alt={photo.alt} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            </div>
            {isTop && (
              <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors pointer-events-none rounded-lg" />
            )}
          </motion.div>
        );
      })}
      
      {/* Interaction Hint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -bottom-2 lg:-bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] sm:text-xs font-mono text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full pointer-events-none border border-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity z-50"
      >
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-pulse" />
        CLICK ALBUM TO CYCLE
      </motion.div>
    </div>
  );
}