'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
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
    { label: '/work', href: '#selected-work' },
    { label: '/experiments', href: '#experiments' },
    { label: '/experience', href: '#experience' },
    { label: '/honors', href: '#honors' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none flex justify-center">
      <div className="w-full max-w-4xl px-5 py-3 rounded-2xl border border-black/[0.08] bg-[#F4F4F6]/85 backdrop-blur-xl shadow-lg shadow-black/[0.03] flex items-center justify-between pointer-events-auto transition-all">
        
        {/* Left: Identifier */}
        <Link href="/" className="text-sm font-bold tracking-tight text-slate-900 hover:text-emerald-700 transition-colors">
          Howard Woon
        </Link>
        
        <span className="hidden md:block text-neutral-300">·</span>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-600">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-black transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <span className="hidden md:block text-neutral-300">·</span>

        {/* Right: Active Pill & CV */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
          </div>

          <a
            href={personalDetails.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-black transition-colors"
          >
            [CV]
          </a>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-3 pointer-events-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
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
            <a
              href={personalDetails.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-lg text-slate-700 hover:text-black"
            >
              [CV] Resume
            </a>
          </div>
        </div>
      )}
    </header>
  );
}