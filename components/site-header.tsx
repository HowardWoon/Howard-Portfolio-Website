// components/site-header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, FileText, Sparkles } from 'lucide-react';
import { personalDetails } from '@/lib/site-data';

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Honors', href: '#awards' },
    { label: 'Toolchain', href: '#skills' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-3 sm:p-5 pointer-events-none">
      <div className="w-full max-w-5xl px-4 sm:px-6 py-2.5 rounded-2xl border border-white/10 bg-[#080C14]/85 backdrop-blur-xl shadow-2xl shadow-black/60 flex items-center justify-between pointer-events-auto transition-all">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/50 transition-all">
            <Image
              src={personalDetails.avatarUrl}
              alt={personalDetails.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm text-white tracking-tight flex items-center gap-1.5 group-hover:text-indigo-300 transition-colors">
              <span>{personalDetails.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[10px] font-mono text-slate-400">Software Engineer</div>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href={personalDetails.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-xs transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" /> Resume
          </a>
        </nav>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-2">
          <a
            href={personalDetails.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-medium"
          >
            Resume
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-4 right-4 p-5 rounded-2xl border border-white/10 bg-[#080C14]/95 backdrop-blur-2xl shadow-2xl flex flex-col gap-3 text-center text-sm font-medium text-slate-300 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
