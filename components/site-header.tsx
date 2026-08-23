'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, FileText, ArrowUpRight } from 'lucide-react';
import { personalDetails } from '@/lib/site-data';

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: '/about', href: '#about' },
    { label: '/selected_work', href: '#selected-work' },
    { label: '/experiments', href: '#experiments' },
    { label: '/experience', href: '#experience' },
    { label: '/honors', href: '#honors' },
    { label: '/contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none flex justify-center">
      <div className="w-full max-w-6xl px-5 py-3 rounded-2xl border border-black/[0.08] bg-[#F4F4F6]/85 backdrop-blur-xl shadow-lg shadow-black/[0.03] flex items-center justify-between pointer-events-auto transition-all">
        {/* Left: Identifier */}
        <Link href="/" className="flex flex-col text-left group">
          <div className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <span>{personalDetails.name}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Systems × AI × Distributed Architecture
          </div>
        </Link>

        {/* Center/Right: Desktop Navigation & Available Pill */}
        <div className="hidden md:flex items-center gap-6 text-xs font-mono">
          <nav className="flex items-center gap-5 text-slate-600">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-black transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="h-4 w-[1px] bg-black/10" />

          {/* Socials */}
          <a
            href={personalDetails.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-black transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={personalDetails.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-black transition-colors"
          >
            GitHub
          </a>

          {/* Blunar-style Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-600/25 bg-white text-slate-900 shadow-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-sans">Available for work</span>
          </div>

          <a
            href={personalDetails.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-white font-sans font-semibold hover:bg-slate-800 transition-all text-xs shadow-md"
          >
            Resume
          </a>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-2 pointer-events-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-600/30 bg-white text-[11px] font-medium text-slate-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Available</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-700 hover:text-black hover:bg-black/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-4 right-4 p-6 rounded-2xl border border-black/10 bg-[#F4F4F6]/95 backdrop-blur-2xl shadow-xl flex flex-col gap-3 font-mono text-xs pointer-events-auto animate-in fade-in duration-150">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-slate-700 hover:text-black hover:bg-black/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="border-t border-black/10 pt-3 mt-1 flex items-center justify-between">
            <a href={personalDetails.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-700">LinkedIn</a>
            <a href={personalDetails.github} target="_blank" rel="noopener noreferrer" className="text-slate-700">GitHub</a>
            <a
              href={personalDetails.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg bg-black text-white font-sans font-medium"
            >
              Resume PDF
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

