"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { FieldRecord } from "./field-archive-data";
import Image from "next/image";

interface FieldRecordViewerProps {
  records: FieldRecord[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function FieldRecordViewer({ records, currentIndex, onClose, onNavigate }: FieldRecordViewerProps) {
  const currentRecord = records[currentIndex];

  const handlePrevious = useCallback(() => {
    onNavigate((currentIndex - 1 + records.length) % records.length);
  }, [currentIndex, records.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % records.length);
  }, [currentIndex, records.length, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };
    
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, handlePrevious, handleNext]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-4 sm:p-8 bg-[#090B10]/95 backdrop-blur-2xl"
        onClick={onClose}
      >
        {/* Header / ID */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 flex flex-col gap-1 z-[10010]" onClick={e => e.stopPropagation()}>
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            FIELD RECORD // {String(currentIndex + 1).padStart(2, '0')} OF {String(records.length).padStart(2, '0')}
          </div>
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            STATUS: SECURE // {currentRecord.category}
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 sm:top-8 sm:right-8 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all z-[10010]"
        >
          <X className="w-5 h-5" />
        </button>

        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl flex flex-col lg:flex-row bg-[#0E121B] rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden max-h-[85vh]"
        >
          {/* Image Container */}
          <div className="relative flex-1 bg-black/50 aspect-video lg:aspect-auto flex items-center justify-center overflow-hidden">
            <Image
              src={currentRecord.image}
              alt={currentRecord.caption}
              fill
              className="object-contain"
              priority
            />
            
            {/* Navigation Arrows */}
            <button onClick={handlePrevious} className="absolute left-4 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all backdrop-blur-md">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNext} className="absolute right-4 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all backdrop-blur-md">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Metadata Sidebar */}
          <div className="w-full lg:w-80 bg-white/[0.02] border-t lg:border-t-0 lg:border-l border-white/10 p-6 sm:p-8 flex flex-col overflow-y-auto">
            
            {/* Mini Archive Index */}
            <div className="flex gap-1.5 mb-8">
              {records.map((_, i) => (
                <div 
                  key={i} 
                  onClick={() => onNavigate(i)}
                  className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${i === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">CATEGORY</div>
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">{currentRecord.category}</div>
              </div>
              
              <div>
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">ROLE</div>
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">{currentRecord.role}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">EVENT</div>
                <div className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">{currentRecord.event}</div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-sm text-neutral-400 leading-relaxed font-mono">
                {currentRecord.caption}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}