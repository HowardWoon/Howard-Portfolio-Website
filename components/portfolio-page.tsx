'use client';
import BikebearInspiredHero from '@/components/bikebear-hero';
import AboutSection from '@/components/about-section';
import StackedProjects from '@/components/stacked-projects';
import ExperienceSection from '@/components/experience-section';
import HonorsSection from '@/components/honors-section';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Github, ExternalLink, FileText, ArrowUpRight, ArrowDown, Sparkles, Building2, Calendar, Award, Layers, Send, Check, Copy, MapPin, AlertCircle, CheckCircle,
} from 'lucide-react';
import { personalDetails } from '@/lib/site-data';

import ProjectSimulators from '@/components/project-simulators';

export function PortfolioPage() {
  
    const [copied, setCopied] = useState(false);
  const [revealedEmail, setRevealedEmail] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personalDetails.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    setErrorMessage('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to transmit message.');
      }
      setFormStatus('success');
      setFormState({ name: '', email: '', message: '' });
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setFormStatus('error');
      setErrorMessage(err.message || 'An error occurred.');
    }
  };

  return (
    <div className="relative min-h-screen tech-grid-bg selection:bg-slate-900 selection:text-white">
      <BikebearInspiredHero />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 space-y-36">
        

        <AboutSection />

        <StackedProjects />

        <ProjectSimulators />

        <ExperienceSection />

        <HonorsSection />

        <section id="contact" className="space-y-10 scroll-mt-24">
          <div className="border-b border-black/[0.08] pb-4">
            <div className="inline-flex items-center border border-black/80 rounded-full px-3.5 py-1 text-xs font-mono tracking-widest uppercase bg-white mb-2">CONTACT // CONNECT</div>
<h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-black font-display">Let&apos;s build something special.</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-2 p-7 rounded-3xl border-2 border-black bg-white space-y-6 shadow-md">
              <div>
                <h3 className="text-lg font-bold text-black tracking-tight">{personalDetails.fullName}</h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">Software Engineering Undergraduate @ Universiti Malaya</p>
                <p className="text-xs text-neutral-700 mt-2.5 leading-relaxed">Open to software engineering roles, backend systems architecture, and high-impact hackathon collaborations.</p>
              </div>
              <div className="space-y-3 pt-2 border-t border-black/[0.06]">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{personalDetails.location}</span>
                </div>
                {!revealedEmail ? (
                  <button onClick={() => setRevealedEmail(true)} className="w-full py-3 px-4 rounded-xl border border-black/10 bg-[#F4F4F6] hover:bg-slate-100 text-black font-mono text-xs font-semibold transition-all text-center">
                    Reveal Email Address â†“
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-black/10 font-mono text-xs">
                    <span className="truncate text-black font-semibold">{personalDetails.email}</span>
                    <button onClick={handleCopyEmail} className="p-1 rounded hover:bg-black/5 text-neutral-700 hover:text-black transition-colors" title="Copy Email">
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 pt-1 font-mono text-xs">
                <a href={personalDetails.github} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 border border-black/[0.06] text-slate-800 hover:bg-slate-200 transition-all font-semibold">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
                <a href={personalDetails.linkedin} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-semibold">
                  LinkedIn
                </a>
              </div>
            </div>
            <div className="lg:col-span-3 p-7 rounded-3xl border-2 border-black bg-white shadow-md">
              <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1.5 uppercase tracking-wider">Your Name</label>
                    <input type="text" required value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} placeholder="Alex Mercer" className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-slate-50 text-black font-sans text-xs sm:text-sm focus:outline-none focus:border-slate-900 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input type="email" required value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })} placeholder="alex@company.com" className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-slate-50 text-black font-sans text-xs sm:text-sm focus:outline-none focus:border-slate-900 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5 uppercase tracking-wider">Message</label>
                  <textarea required rows={4} value={formState.message} onChange={(e) => setFormState({ ...formState, message: e.target.value })} placeholder="Hi Howard, let's connect regarding a software engineering role..." className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-slate-50 text-black font-sans text-xs sm:text-sm focus:outline-none focus:border-slate-900 transition-colors resize-none" />
                </div>
                {formStatus === 'error' && (
                  <div className="flex items-center gap-2 text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                {formStatus === 'success' && (
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Message received. Howard will respond promptly.</span>
                  </div>
                )}
                <button type="submit" disabled={formStatus === 'loading'} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-950 text-white font-sans font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 shadow-md active:scale-95">
                  {formStatus === 'loading' ? 'Transmitting...' : 'Send Message'} <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </section>

        <footer className="pt-10 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-700 font-mono">
          <p>Â© {new Date().getFullYear()} Howard Woon Hao Zhe. All rights reserved.</p>
          <p>Universiti Malaya â€¢ Software Engineering (4.00 CGPA)</p>
        </footer>
      </main>

      
    </div>
  );
}
