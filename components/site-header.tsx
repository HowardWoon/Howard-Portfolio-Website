"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 sm:px-10 lg:px-16 py-4 z-[9999] bg-[#090B10]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4"
      >
        <img src="/images/profile-icon.jpg" alt="Howard Woon" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-lg shadow-amber-500/20 border border-white/10" />
        <div>
          <h1 className="font-black text-lg sm:text-2xl tracking-wide uppercase leading-none text-white flex items-center gap-2">
            HOWARD WOON
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </h1>
          <p className="text-sm sm:text-base font-mono text-neutral-400 tracking-wider mt-1.5 font-semibold">
            SYSTEMS & AI ARCHITECT
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4 sm:gap-6"
      >
        <div className="hidden sm:flex items-center gap-2.5 bg-white/[0.04] backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-mono font-bold tracking-wider text-neutral-300">
            AVAILABLE FOR HIRE 2026
          </span>
        </div>

        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-sm font-mono font-black uppercase tracking-widest px-7 py-3.5 rounded-full shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
        >
          <span>RESUME</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </motion.div>
    </header>
  );
}