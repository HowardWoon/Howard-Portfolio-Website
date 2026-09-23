"use client";

import { useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { Command } from "cmdk";
import { Search, Code, GraduationCap, Briefcase, Download, Mail } from "lucide-react";
import { personalDetails } from "@/lib/site-data";

/** Scroll to a section through Lenis (smooth + header offset) with a native fallback. */
function goTo(hash: string) {
  const el = document.querySelector(hash);
  // On /simulators/* or /admin/* the section doesn't exist → go to the home page section instead
  // (previously the command silently did nothing there).
  if (!el) {
    window.location.href = `/${hash}`;
    return;
  }
  if (window.__lenis) {
    // Lenis applies the section's CSS scroll-margin-top (header offset) itself
    window.__lenis.scrollTo(el as HTMLElement);
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  history.replaceState(null, "", hash);
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Listen for custom event to open from button
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-command-palette", handleOpen);
    return () => window.removeEventListener("open-command-palette", handleOpen);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const itemClass =
    "flex items-center gap-3 px-3 py-3 mt-1 rounded-xl cursor-pointer border-2 border-transparent text-ink font-sans font-semibold text-[0.95rem] transition-colors aria-selected:bg-pop-yellow aria-selected:border-ink";
  const groupClass =
    "px-2 py-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-extrabold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.1em] [&_[cmdk-group-heading]]:text-ink-muted";

  return (
    <>
      {/* Non-blocking toast (replaces window.alert) */}
      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10001] nb-tag bg-pop-mint shadow-brutal-sm px-4 py-2">
          {toast}
        </div>
      )}

      {open && (
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Command Palette" className="fixed inset-0 z-[10000] flex items-start justify-center pt-[max(4.5rem,12dvh)] sm:pt-[18vh] px-3 xs:px-4 bg-ink/40 backdrop-blur-[2px]" data-lenis-prevent>
          <div className="fixed inset-0" onClick={() => setOpen(false)} />

          <Command
            label="Command Palette"
            className="relative w-full max-w-[560px] bg-white rounded-[22px] border-3 border-ink shadow-brutal-xl overflow-hidden flex flex-col font-sans"
            shouldFilter={true}
          >
            <div className="flex items-center border-b-3 border-ink px-4 py-3.5 bg-paper-cream">
              <Search className="w-5 h-5 text-ink mr-3" strokeWidth={2.75} />
              <Command.Input
                autoFocus
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-ink placeholder:text-ink-muted outline-none border-none text-base font-semibold"
              />
              <kbd className="hidden sm:inline-block nb-tag bg-white text-[0.65rem] py-0.5">ESC</kbd>
            </div>

            <Command.List className="max-h-[min(320px,50dvh)] overflow-y-auto overscroll-contain p-2">
              <Command.Empty className="py-6 text-center text-sm font-semibold text-ink-muted">
                No results found.
              </Command.Empty>

              <Command.Group heading="Navigation" className={groupClass}>
                <Command.Item onSelect={() => runCommand(() => goTo("#experience"))} className={itemClass}>
                  <Briefcase className="w-5 h-5" strokeWidth={2.5} />
                  <span>Experience</span>
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => goTo("#projects"))} className={itemClass}>
                  <Code className="w-5 h-5" strokeWidth={2.5} />
                  <span>Projects</span>
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => goTo("#honors"))} className={itemClass}>
                  <GraduationCap className="w-5 h-5" strokeWidth={2.5} />
                  <span>Honors & Awards</span>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Actions" className={`${groupClass} border-t-2 border-dashed border-ink mt-1`}>
                <Command.Item
                  onSelect={() => runCommand(async () => {
                    try {
                      await navigator.clipboard.writeText(personalDetails.email);
                      setToast("Email copied to clipboard!");
                    } catch {
                      window.location.href = `mailto:${personalDetails.email}`;
                    }
                  })}
                  className={itemClass}
                >
                  <Mail className="w-5 h-5" strokeWidth={2.5} />
                  <span>Copy Email Address</span>
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => window.open('/resume.pdf', '_blank'))} className={itemClass}>
                  <Download className="w-5 h-5" strokeWidth={2.5} />
                  <span>Download Résumé</span>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
