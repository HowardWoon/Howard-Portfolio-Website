'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
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
      <div className="w-full max-w-5xl px-4 sm:px-6 py-3 rounded-2xl bg-surface/80 backdrop-blur-md border border-line flex items-center justify-between pointer-events-auto transition-all">
        {/* Brand */}
        <a href="/" className="flex items-center gap-3 group outline-none">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-line group-hover:border-line-strong transition-colors">
            <Image
              src={personalDetails.avatarUrl}
              alt={personalDetails.name}
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <div className="text-left flex flex-col justify-center">
            <div className="font-semibold text-sm text-ink tracking-tight flex items-center gap-1.5 transition-colors">
              <span>{personalDetails.name}</span>
            </div>
          </div>
        </a>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-ink transition-colors outline-none focus-visible:text-signal"
            >
              {link.label}
            </a>
          ))}
          <a
            href={personalDetails.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-ink text-canvas hover:opacity-90 font-semibold text-sm transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            Resume
          </a>
        </nav>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-3">
          <a
            href={personalDetails.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-ink text-canvas font-semibold text-xs transition-opacity outline-none"
          >
            Resume
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-ink-2 hover:text-ink hover:bg-surface-2 outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-4 right-4 p-5 rounded-2xl border border-line bg-surface/95 backdrop-blur-xl shadow-2xl flex flex-col gap-2 text-center text-sm font-medium text-ink-2 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 hover:text-ink rounded-lg hover:bg-surface-2 transition-colors outline-none"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
