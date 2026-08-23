'use client';

import React, { useEffect } from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

interface PitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string;
}

export function PitchDeckModal({ isOpen, onClose, title, pdfUrl }: PitchDeckModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-[24px] border border-line bg-canvas shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-surface">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-ink-2" />
            <h3 className="font-semibold text-ink text-sm sm:text-base tracking-tight truncate max-w-md">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-line hover:bg-surface-2 text-ink-2 hover:text-ink text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <ExternalLink className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Open in Tab</span>
            </a>
            <a
              href={pdfUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-line hover:bg-surface-2 text-ink-2 hover:text-ink text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded PDF Frame */}
        <div className="flex-1 w-full h-full bg-canvas">
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
            className="w-full h-full border-none"
            title={`${title} Document`}
          />
        </div>
      </div>
    </div>
  );
}
