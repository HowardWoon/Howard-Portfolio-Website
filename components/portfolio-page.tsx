// components/portfolio-page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Github,
  ExternalLink,
  FileText,
  ArrowRight,
  Award,
  Briefcase,
  Layers,
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  personalDetails,
  metrics,
  experiences,
  projects,
  awards,
  techStack,
} from '@/lib/site-data';
import { PitchDeckModal } from '@/components/pitch-deck-modal';
import {
  SlotifySimulator,
  ZeroLagSimulator,
  BLAHujanSimulator,
  SensorSenseiSimulator,
} from '@/components/project-simulators';

export function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeDeck, setActiveDeck] = useState<{ title: string; pdfUrl: string } | null>(null);
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const categories = ['All', 'AI & Agents', 'Distributed Systems', 'Full-Stack', 'IoT'];

  const filteredProjects =
    selectedCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit message.');
      }

      setStatus('success');
      setFormState({ name: '', email: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An error occurred.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-28">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="flex flex-col items-center justify-center text-center pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Software Engineering @ Universiti Malaya (4.00 CGPA)</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 max-w-4xl leading-[1.1] mb-6">
          Building Scalable Systems & Production Software
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-8">
          Hi, I'm <span className="text-white font-medium">{personalDetails.name}</span>. I design and build backend architectures, distributed data pipelines, and agentic workflows in Java, Python, and Spring Boot.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-slate-950 font-medium text-sm hover:bg-slate-200 transition-all shadow-sm"
          >
            View Projects <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href={personalDetails.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
          >
            <Github className="w-4 h-4" /> GitHub Profile
          </a>
          <a
            href={personalDetails.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-medium text-sm hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
          >
            <FileText className="w-4 h-4" /> Resume
          </a>
        </div>

        {/* Inline Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10 w-full max-w-3xl">
          {metrics.map((m, idx) => (
            <div key={idx}>
              <div className="text-2xl sm:text-3xl font-semibold text-white font-mono">{m.value}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 2. INTERACTIVE PROJECTS ================= */}
      <section id="projects" className="space-y-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
              <Layers className="w-3.5 h-3.5" /> Shipped Architectures
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Interactive Projects</h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Clean 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#0B0F17]/85 hover:border-white/20 transition-all duration-200 backdrop-blur-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    {proj.category}
                  </span>
                  {proj.highlight && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {proj.highlight}
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{proj.title}</h3>
                <p className="text-xs font-medium text-slate-300 mb-2">{proj.tagline}</p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-2">{proj.description}</p>

                {/* Embedded Interactive Simulators */}
                {proj.id === 'proj-slotify' && <SlotifySimulator />}
                {proj.id === 'proj-zerolag' && <ZeroLagSimulator />}
                {proj.id === 'proj-bilahujan' && <BLAHujanSimulator />}
                {proj.id === 'proj-sensor-sensei' && <SensorSenseiSimulator />}
              </div>

              <div className="pt-4 border-t border-white/5 mt-4">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {proj.technologies.map((tech, i) => (
                    <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" /> Source Code <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}

                  {proj.deckUrl && (
                    <button
                      onClick={() => setActiveDeck({ title: proj.title, pdfUrl: proj.deckUrl! })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 text-xs font-medium transition-colors ml-auto"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Pitch Deck
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 3. UNIFIED EXPERIENCE & LEADERSHIP ================= */}
      <section id="experience" className="space-y-6 scroll-mt-24">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
            <Briefcase className="w-3.5 h-3.5" /> Career & Student Governance
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Experience & Leadership</h2>
        </div>

        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-6 rounded-2xl border border-white/10 bg-[#0B0F17]/85 hover:border-white/20 transition-all backdrop-blur-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-white">{exp.role}</h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
                      {exp.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-indigo-300 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exp.organization}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exp.period}</span>
                </div>
              </div>

              <ul className="space-y-1.5 mb-3.5 list-disc list-inside text-xs sm:text-sm text-slate-300 leading-relaxed">
                {exp.description.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5">
                {exp.skills.map((skill, i) => (
                  <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 4. AWARDS & HONORS ================= */}
      <section id="awards" className="space-y-6 scroll-mt-24">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
            <Award className="w-3.5 h-3.5" /> Distinctions
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Honors & Certifications</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {awards.map((award) => (
            <div
              key={award.id}
              className="p-6 rounded-2xl border border-white/10 bg-[#0B0F17]/85 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 inline-block mb-3">
                  {award.highlight}
                </span>
                <h3 className="text-base font-semibold text-white mb-1">{award.title}</h3>
                <p className="text-xs text-indigo-300 mb-2">{award.issuer}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{award.description}</p>
              </div>
              <div className="text-[11px] font-mono text-slate-500 pt-3 mt-4 border-t border-white/5">
                {award.date}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 5. TECHNICAL STACK ================= */}
      <section id="skills" className="space-y-6 scroll-mt-24">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" /> Engineering Toolchain
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Technical Skills</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {techStack.map((group, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-white/10 bg-[#0B0F17]/85">
              <h3 className="text-xs font-semibold text-indigo-300 font-mono uppercase tracking-wider mb-3.5">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 6. CONTACT SECTION ================= */}
      <section id="contact" className="space-y-6 scroll-mt-24 pt-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
            <Mail className="w-3.5 h-3.5" /> Connect
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Let’s Build Together</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Open to software engineering internships, technical collaborations, and opportunities.
          </p>
        </div>

        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0B0F17]/85 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Name</label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="Alex Mercer"
                className="w-full px-3.5 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Message</label>
              <textarea
                required
                rows={4}
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                placeholder="Hi Howard, let's discuss an engineering opportunity..."
                className="w-full px-3.5 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Message delivered successfully. I will get back to you shortly.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-white text-slate-950 font-medium text-sm hover:bg-slate-200 transition-all disabled:opacity-50 shadow-sm"
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="pt-12 pb-4 border-t border-white/10 text-center text-xs text-slate-500 font-mono">
        <p>© {new Date().getFullYear()} Howard Woon Hao Zhe. Built with Next.js 15, TypeScript & Tailwind CSS.</p>
      </footer>

      {/* Global In-App Pitch Deck Modal */}
      {activeDeck && (
        <PitchDeckModal
          isOpen={!!activeDeck}
          onClose={() => setActiveDeck(null)}
          title={activeDeck.title}
          pdfUrl={activeDeck.pdfUrl}
        />
      )}
    </div>
  );
}
