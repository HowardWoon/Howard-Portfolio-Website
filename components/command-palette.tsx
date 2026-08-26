"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Home, Code, GraduationCap, Briefcase, Download, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
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

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4 backdrop-blur-sm bg-black/40">
      <div className="fixed inset-0" onClick={() => setOpen(false)} />
      
      <Command 
        className="relative w-full max-w-[560px] bg-[#0E121B] rounded-2xl border border-white/10 shadow-2xl shadow-black overflow-hidden flex flex-col font-sans"
        shouldFilter={true}
      >
        <div className="flex items-center border-b border-white/10 px-4 py-3">
          <Search className="w-4 h-4 text-neutral-400 mr-3" />
          <Command.Input 
            autoFocus
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-white placeholder-neutral-500 outline-none border-none text-sm font-medium"
          />
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-none">
          <Command.Empty className="py-6 text-center text-sm text-neutral-400">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="text-xs font-mono text-neutral-500 px-2 py-2">
            <Command.Item 
              onSelect={() => runCommand(() => window.location.hash = "#experience")}
              className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg cursor-pointer aria-selected:bg-white/10 text-neutral-200 aria-selected:text-white transition-colors text-sm"
            >
              <Briefcase className="w-4 h-4 text-neutral-400" />
              <span>Experience</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => window.location.hash = "#projects")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-white/10 text-neutral-200 aria-selected:text-white transition-colors text-sm"
            >
              <Code className="w-4 h-4 text-neutral-400" />
              <span>Projects</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => window.location.hash = "#honors")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-white/10 text-neutral-200 aria-selected:text-white transition-colors text-sm"
            >
              <GraduationCap className="w-4 h-4 text-neutral-400" />
              <span>Honors & Awards</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Actions" className="text-xs font-mono text-neutral-500 px-2 py-2 border-t border-white/5 mt-1">
            <Command.Item 
              onSelect={() => runCommand(() => {
                navigator.clipboard.writeText("contact@howardwoon.com");
                alert("Email copied to clipboard!");
              })}
              className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg cursor-pointer aria-selected:bg-white/10 text-neutral-200 aria-selected:text-white transition-colors text-sm"
            >
              <Mail className="w-4 h-4 text-neutral-400" />
              <span>Copy Email Address</span>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => window.open('/resume.pdf', '_blank'))}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-white/10 text-neutral-200 aria-selected:text-white transition-colors text-sm"
            >
              <Download className="w-4 h-4 text-neutral-400" />
              <span>Download Résumé</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}