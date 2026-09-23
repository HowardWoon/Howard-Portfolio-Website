"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { FieldRecord } from "./field-archive-data";
import Image from "next/image";

interface FieldRecordViewerProps {
  records: FieldRecord[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/**
 * Bug fix: this modal used to render *inside* the experience card, whose framer-motion `layout`
 * transform + overflow-hidden turned `position: fixed` into "fixed to the card" → the lightbox was
 * clipped inside the card. It is now portaled to <body>.
 */
export function FieldRecordViewer({ records, currentIndex, onClose, onNavigate }: FieldRecordViewerProps) {
  const [mounted, setMounted] = useState(false);
  const touchX = useRef<number | null>(null);
  const currentRecord = records[currentIndex];

  const handlePrevious = useCallback(() => {
    onNavigate((currentIndex - 1 + records.length) % records.length);
  }, [currentIndex, records.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % records.length);
  }, [currentIndex, records.length, onNavigate]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, handlePrevious, handleNext]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-label={currentRecord.event}
      data-lenis-prevent
      className="fixed inset-0 z-[10000] flex flex-col h-screen-safe bg-ink/85 backdrop-blur-sm pt-[max(0.75rem,var(--safe-top))] pb-[max(0.75rem,var(--safe-bottom))] pl-[max(0.75rem,var(--safe-left))] pr-[max(0.75rem,var(--safe-right))] sm:p-8"
      onClick={onClose}
    >
      {/* Top bar (in normal flow, so it can never overlap the photo on small screens) */}
      <div className="flex items-start justify-between gap-3 mb-3 sm:mb-5 shrink-0 w-full max-w-6xl mx-auto" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-start gap-1.5 min-w-0">
          <div className="nb-tag bg-pop-yellow">
            FIELD RECORD // {String(currentIndex + 1).padStart(2, '0')} OF {String(records.length).padStart(2, '0')}
          </div>
          <div className="nb-tag bg-white text-[0.7rem] max-w-full">
            STATUS: SECURE // {currentRecord.category}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          autoFocus
          className="shrink-0 w-12 h-12 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-red hover:text-white active:bg-pop-red active:text-white transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>

      <motion.div
        initial={{ scale: 0.97, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl mx-auto flex-1 min-h-0 flex flex-col lg:flex-row landscape-short:flex-row bg-white rounded-[22px] sm:rounded-[26px] border-3 border-ink shadow-brutal-lg sm:shadow-brutal-xl overflow-hidden"
      >
        {/* Image — fixed share of the height on phones (it used to collapse to 0px inside the flex column) */}
        <div
          className="relative shrink-0 lg:shrink lg:flex-1 h-[42%] min-h-[180px] landscape-short:h-auto landscape-short:flex-1 lg:h-auto bg-paper-deep flex items-center justify-center overflow-hidden touch-pan-y"
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            // swipe left/right to browse on phones
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 45) (dx < 0 ? handleNext : handlePrevious)();
            touchX.current = null;
          }}
        >
          <Image
            src={currentRecord.image}
            alt={currentRecord.caption}
            fill
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="object-contain"
            priority
          />

          {/* Navigation Arrows */}
          <button onClick={handlePrevious} aria-label="Previous" className="absolute left-2 sm:left-3 w-11 h-11 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-yellow active:bg-pop-yellow transition-colors">
            <ChevronLeft className="w-5 h-5" strokeWidth={3} />
          </button>
          <button onClick={handleNext} aria-label="Next" className="absolute right-2 sm:right-3 w-11 h-11 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-yellow active:bg-pop-yellow transition-colors">
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Metadata Sidebar (scrolls on its own if the screen is short) */}
        <div className="flex-1 min-h-0 lg:flex-none w-full lg:w-80 landscape-short:w-72 landscape-short:flex-none bg-paper-cream border-t-3 lg:border-t-0 lg:border-l-3 landscape-short:border-t-0 landscape-short:border-l-3 border-ink p-4 xs:p-6 sm:p-8 flex flex-col overflow-y-auto overscroll-contain">

          {/* Mini Archive Index (44px tap areas around small dots) */}
          <div className="flex -mx-1.5 mb-5 sm:mb-8">
            {records.map((r, i) => (
              <button
                key={i}
                aria-label={`${r.recordId}`}
                aria-current={i === currentIndex}
                onClick={() => onNavigate(i)}
                className="p-1.5 grid place-items-center min-h-[32px]"
              >
                <span className={`block h-3 rounded-full border-2 border-ink transition-all duration-300 ${i === currentIndex ? 'w-8 bg-pop-yellow' : 'w-3 bg-white'}`} />
              </button>
            ))}
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div>
              <div className="text-[0.7rem] font-mono font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">CATEGORY</div>
              <div className="text-sm font-mono font-extrabold text-ink uppercase tracking-[0.04em]">{currentRecord.category}</div>
            </div>

            <div>
              <div className="text-[0.7rem] font-mono font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">ROLE</div>
              <div className="inline-block text-sm font-mono font-extrabold text-ink uppercase tracking-[0.04em] bg-pop-mint border-2 border-ink rounded-md px-2 py-0.5">{currentRecord.role}</div>
            </div>

            <div>
              <div className="text-[0.7rem] font-mono font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">EVENT</div>
              <div className="text-sm font-mono font-extrabold text-ink uppercase tracking-[0.04em]">{currentRecord.event}</div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-dashed border-ink">
            <p className="text-sm text-ink-soft leading-relaxed font-sans font-medium">
              {currentRecord.caption}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}