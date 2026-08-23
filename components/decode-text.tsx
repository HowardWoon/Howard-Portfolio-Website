'use client';

import React, { useEffect, useState } from 'react';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}|:"<>?~-=[]\;,./';

export function DecodeText({ text, className }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const animate = () => {
      let iteration = 0;
      clearInterval(interval);
      
      interval = setInterval(() => {
        setDisplayText((prev) => 
          text
            .split('')
            .map((char, index) => {
              if (index < iteration) {
                return text[index];
              }
              if (char === ' ') return ' ';
              return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
            })
            .join('')
        );
        
        if (iteration >= text.length) {
          clearInterval(interval);
          setHasAnimated(true);
        }
        
        iteration += 1 / 3;
      }, 30);
    };

    // Auto animate once
    if (!hasAnimated) {
      animate();
    } else if (isHovered) {
      animate();
    }

    return () => clearInterval(interval);
  }, [text, isHovered, hasAnimated]);

  return (
    <span 
      className={className} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayText || text}
    </span>
  );
}