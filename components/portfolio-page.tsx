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
  Sparkles,
  MapPin,
  Terminal,
  Cpu,
  Database,
  Cloud,
  Copy,
  Check,
} from 'lucide-react';
import {
  personalDetails,
  heroMetrics,
  experiences,
  projects,
  awards,
  techMatrix,
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
  const [copiedEmail, setCopiedEmail] = useState(false);

  const categories = ['All', 'Agentic AI & Systems', 'Distributed Backends', 'Mobile & Cloud IoT'];

  const filteredProjects =
    selectedCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personalDetails.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

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
    <div className="relative min-h-screen bg-[#05070B] text-slate-100 overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[35%] right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-32">
        {/* ================= 1. HERO COMMAND CENTER ================= */}
        <section className="flex flex-col items-center justify-center text-center space-y-8">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Software Engineering @ Universiti Malaya (4.00 CGPA)</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 leading-[1.08]">
              Building Scalable Systems & Production Software
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
              Hi, I'm <span className="text-white font-semibold">{personalDetails.name}</span>. I design and build backend architectures, distributed data pipelines, and agentic workflows in Java, Python, and Spring Boot.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 font-semibold text-sm hover:bg-slate-200 transition-all shadow-lg shadow-white/10 active:scale-95"
            >
              View Projects <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={personalDetails.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm active:scale-95"
            >
              <Github className="w-4 h-4" /> GitHub Profile
            </a>
            <a
              href={personalDetails.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium text-sm hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm active:scale-95"
            >
              <FileText className="w-4 h-4" /> Resume
            </a>
          </div>

          {/* Premium Organized Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 w-full max-w-4xl pt-8">
            {heroMetrics.map((m, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#080C14]/75 backdrop-blur-md hover:border-indigo-500/40 hover:bg-[#0B101C]/80 transition-all group text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    {m.label}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/40 group-hover:bg-indigo-400 transition-colors" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight group-hover:text-indigo-200 transition-colors">
                    {m.value}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate font-medium">
                    {m.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 2. GROUPED PROJECTS ARCHITECTURE ================= */}
        <section id="projects" className="space-y-8 scroll-mt-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
                <Layers className="w-3.5 h-3.5" /> Shipped Architectures
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                Interactive Systems & Projects
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-white text-slate-950 shadow-sm font-semibold'
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
                className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#080C14]/80 hover:border-indigo-500/30 hover:bg-[#0B101C]/90 transition-all duration-300 backdrop-blur-md shadow-lg group"
              >
                <div>
                  {/* Card Header Tagging */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                      {proj.category}
                    </span>
                    {proj.highlight && (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {proj.highlight}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-200 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-300 mb-3">{proj.tagline}</p>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-3">{proj.description}</p>

                  {/* System Architecture Box */}
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono text-slate-300 mb-3 flex items-start gap-2">
                    <span className="text-indigo-400 shrink-0 font-bold">ARCH:</span>
                    <span>{proj.architectureHighlight}</span>
                  </div>

                  {/* Embedded Interactive Simulators */}
                  {proj.id === 'proj-slotify' && <SlotifySimulator />}
                  {proj.id === 'proj-zerolag' && <ZeroLagSimulator />}
                  {proj.id === 'proj-bilahujan' && <BLAHujanSimulator />}
                  {proj.id === 'proj-sensor-sensei' && <SensorSenseiSimulator />}
                </div>

                <div className="pt-4 border-t border-white/5 mt-4">
                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.technologies.map((tech, i) => (
                      <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Card Action Row */}
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-medium transition-all ml-auto active:scale-95"
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

        {/* ================= 3. GROUPED EXPERIENCE & LEADERSHIP ================= */}
        <section id="experience" className="space-y-8 scroll-mt-28">
          <div className="border-b border-white/10 pb-5">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
              <Briefcase className="w-3.5 h-3.5" /> Career & Governance
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Experience & Leadership Matrix
            </h2>
          </div>

          <div className="space-y-4">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#080C14]/80 hover:border-indigo-500/30 hover:bg-[#0B101C]/90 transition-all backdrop-blur-md shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-white">{exp.role}</h3>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-semibold">
                        {exp.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-indigo-300 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exp.organization}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 text-xs">{exp.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exp.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-4 list-disc list-inside text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {exp.description.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
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
        <section id="awards" className="space-y-8 scroll-mt-28">
          <div className="border-b border-white/10 pb-5">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
              <Award className="w-3.5 h-3.5" /> Verified Distinctions
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Honors & Academic Awards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {awards.map((award) => (
              <div
                key={award.id}
                className="p-6 rounded-2xl border border-white/10 bg-[#080C14]/80 hover:border-amber-500/30 hover:bg-[#0B101C]/90 transition-all flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
                      {award.highlight}
                    </span>
                    {award.stats && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {award.stats}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-200 transition-colors">
                    {award.title}
                  </h3>
                  <p className="text-xs text-indigo-300 font-medium mb-2">{award.issuer}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{award.description}</p>
                </div>

                <div className="text-[11px] font-mono text-slate-500 pt-3 mt-4 border-t border-white/5">
                  {award.date}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 5. TECHNICAL TOOLCHAIN MATRIX ================= */}
        <section id="skills" className="space-y-8 scroll-mt-28">
          <div className="border-b border-white/10 pb-5">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
              <Layers className="w-3.5 h-3.5" /> Core Competencies
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Technical Engineering Toolchain
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {techMatrix.map((group, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-white/10 bg-[#080C14]/80 backdrop-blur-md shadow-md"
              >
                <div className="flex items-center gap-2 mb-4">
                  {group.icon === 'Terminal' && <Terminal className="w-4 h-4 text-indigo-400" />}
                  {group.icon === 'Cpu' && <Cpu className="w-4 h-4 text-purple-400" />}
                  {group.icon === 'Database' && <Database className="w-4 h-4 text-emerald-400" />}
                  {group.icon === 'Cloud' && <Cloud className="w-4 h-4 text-blue-400" />}
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    {group.domain}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 6. CONTACT & RECRUITER DESK ================= */}
        <section id="contact" className="space-y-8 scroll-mt-28 pt-4">
          <div className="border-b border-white/10 pb-5">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
              <Mail className="w-3.5 h-3.5" /> Communications
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Get in Touch
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Contact Details Card */}
            <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#080C14]/80 backdrop-blur-md space-y-6 shadow-md">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Howard Woon Hao Zhe</h3>
                <p className="text-xs text-indigo-300 font-mono">Software Engineering Undergraduate</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Open to software engineering internships, technical collaborations, and full-time opportunities.
                </p>
              </div>

              <div className="space-y-3 pt-2 text-xs font-mono text-slate-300 border-t border-white/5">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{personalDetails.location}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/10">
                  <span className="truncate text-slate-300">{personalDetails.email}</span>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={personalDetails.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
                <a
                  href={personalDetails.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-all"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Direct Form */}
            <div className="lg:col-span-3 p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#080C14]/80 backdrop-blur-md shadow-md">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="Alex Mercer"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="Hi Howard, let's connect regarding an engineering role..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {status === 'success' && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Message received. I will get back to you promptly.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-all disabled:opacity-50 shadow-md active:scale-95"
                >
                  {status === 'loading' ? 'Sending Message...' : 'Send Message'}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="pt-12 pb-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} Howard Woon Hao Zhe. All rights reserved.</p>
          <p>Universiti Malaya • Software Engineering</p>
        </footer>
      </div>

      {/* Pitch Deck In-App Modal */}
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
