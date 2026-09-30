'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, ExternalLink, Link2, X } from 'lucide-react';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { RESUME_URL, type ResumeWindow } from '@/lib/resume';

/**
 * R23 Resume drawer (lecturer advice #4): a split-screen slide-over with the resume PDF, so recruiters can skim it
 * next to the page. Download (with the real file size), open in a new tab, copy a shareable link.
 * Rules 10-B: portal to <body>, role=dialog, focus trap, scroll lock, Escape and the backdrop close it, focus returns.
 * Touch phones get the actions without the embedded viewer (mobile browsers render PDFs in frames poorly).
 */
function Drawer({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [embed, setEmbed] = useState(false);
  useEffect(() => {
    setMounted(true);
    setEmbed(!window.matchMedia('(pointer: coarse) and (max-width: 1023px)').matches);
    fetch(RESUME_URL, { method: 'HEAD' })
      .then((r) => {
        const n = Number(r.headers.get('content-length'));
        if (n > 0) setSize(`${Math.round(n / 1024)} KB`);
      })
      .catch(() => {});
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  useFocusTrap(ref, mounted);
  useScrollLock();
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(new URL(RESUME_URL, window.location.origin).href);
      setCopied(true);
    } catch {
      window.open(RESUME_URL, '_blank', 'noopener,noreferrer');
    }
  };

  if (!mounted) return null;
  const key =
    'nb-key inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-ink px-3 font-mono text-xs font-extrabold tracking-[0.12em] text-ink';
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex justify-end" data-lenis-prevent>
      <button type="button" aria-label="Close resume" onClick={onClose} className="absolute inset-0 bg-ink/60" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Resume"
        className="resume-drawer relative flex h-screen-safe w-full max-w-[min(820px,100%)] flex-col border-l-3 border-ink bg-paper-cream pb-[var(--safe-bottom)] pr-[var(--safe-right)] pt-[var(--safe-top)]"
      >
        <div className="nb-hatch flex items-center justify-between gap-3 border-b-3 border-ink bg-paper-deep px-4 py-3">
          <span className="truncate font-mono text-xs font-extrabold uppercase tracking-[0.14em] text-ink">
            RESUME · resume.pdf{size ? ` · ${size}` : ''}
          </span>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            aria-label="Close resume"
            className="nb-key grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-white text-ink"
          >
            <X className="h-5 w-5" strokeWidth={2.75} aria-hidden />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 border-b-3 border-ink p-3">
          <a href={RESUME_URL} download className={`${key} bg-pop-mint`}>
            <Download className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            DOWNLOAD PDF{size ? ` (${size})` : ''}
          </a>
          <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className={`${key} bg-white`}>
            <ExternalLink className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            OPEN IN NEW TAB
          </a>
          <button type="button" onClick={copyLink} aria-live="polite" className={`${key} bg-white`}>
            <Link2 className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            {copied ? 'LINK COPIED' : 'COPY SHAREABLE LINK'}
          </button>
        </div>
        <div className="min-h-0 flex-1 p-3">
          {embed ? (
            <iframe
              title="Resume PDF"
              src={`${RESUME_URL}#view=FitH`}
              className="h-full w-full rounded-2xl border-3 border-ink bg-white"
            />
          ) : (
            <div className="grid h-full place-items-center rounded-2xl border-3 border-dashed border-ink/40 p-6 text-center font-mono text-sm font-bold text-ink-soft">
              Use Open in new tab to read the PDF on this device, or Download to keep it.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function ResumeDrawer() {
  const [open, setOpen] = useState(false);
  const returnTo = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const w = window as ResumeWindow;
    const onOpen = () => {
      w.__hwResumeWanted = false;
      returnTo.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    window.addEventListener('open-resume', onOpen);
    if (w.__hwResumeWanted) onOpen();
    return () => window.removeEventListener('open-resume', onOpen);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    returnTo.current?.focus?.();
  }, []);
  return open ? <Drawer onClose={close} /> : null;
}
