'use client';

import React, { useState } from 'react';
import {
  Github,
  ExternalLink,
  ArrowRight,
  Send,
  CheckCircle,
  AlertCircle,
  MapPin,
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
  const [activeDeck, setActiveDeck] = useState<{ title: string; pdfUrl: string } | null>(null);
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

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
    <div className="relative min-h-screen bg-canvas text-ink overflow-x-hidden selection:bg-signal-dim selection:text-signal">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 pt-40 pb-32 space-y-40">
        
        {/* ================= 1. HERO ================= */}
        <section className="flex flex-col items-start text-left space-y-12 w-full">
          <div className="space-y-6 max-w-4xl">
            <h1 className="text-5xl sm:text-6xl md:text-[5rem] font-bold tracking-tight text-ink leading-[1.05]">
              Building Scalable Systems <br className="hidden md:block"/>& Production Software.
            </h1>
            <p className="text-lg sm:text-xl text-ink-2 max-w-2xl leading-relaxed font-normal">
              Hi, I'm {personalDetails.name}. I design backend architectures, distributed data pipelines, and agentic workflows using Java, Python, and Spring Boot.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-canvas font-medium text-sm hover:opacity-90 transition-opacity"
            >
              View Projects <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={personalDetails.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-line bg-transparent text-ink font-medium text-sm hover:border-line-strong hover:bg-surface transition-all"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>

          {/* Linear-style plain text stat row */}
          <div className="flex flex-wrap gap-8 sm:gap-16 pt-12 border-t border-line w-full">
            {heroMetrics.map((m, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="text-3xl font-mono tracking-tight text-ink mb-1">{m.value}</div>
                <div className="text-xs text-ink-3 font-medium uppercase tracking-wider">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 2. PROJECTS ================= */}
        <section id="projects" className="space-y-12 scroll-mt-32">
          <div className="border-b border-line pb-6">
            <h2 className="text-3xl font-bold tracking-tight text-ink">
              Interactive Systems & Projects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="flex flex-col justify-between p-8 rounded-[24px] border border-line bg-surface hover:border-line-strong hover:bg-surface-2 transition-colors duration-300 group"
              >
                <div>
                  {/* Card Header Mono Tag */}
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-xs font-mono text-ink-3 uppercase tracking-wider">
                      {proj.category}
                    </span>
                    {proj.metrics && (
                      <span className="text-xs font-mono text-ink-3">
                        {proj.metrics.label}: <span className="text-ink">{proj.metrics.value}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-ink mb-2">
                    {proj.title}
                  </h3>
                  <p className="text-sm font-medium text-ink-2 mb-4">{proj.tagline}</p>
                  <p className="text-sm text-ink-3 leading-relaxed mb-8">{proj.description}</p>

                  {/* Mono Callout Box (Restrained) */}
                  <div className="p-4 rounded-xl border border-line bg-canvas text-xs font-mono text-ink-2 mb-8 leading-relaxed">
                    <span className="text-ink font-semibold">ARCH:</span> {proj.architectureHighlight}
                  </div>

                  {/* Embedded Interactive Simulators */}
                  <div className="mb-8">
                    {proj.id === 'proj-slotify' && <SlotifySimulator />}
                    {proj.id === 'proj-zerolag' && <ZeroLagSimulator />}
                    {proj.id === 'proj-bilahujan' && <BLAHujanSimulator />}
                    {proj.id === 'proj-sensor-sensei' && <SensorSenseiSimulator />}
                  </div>
                </div>

                <div className="pt-6 border-t border-line flex flex-col gap-6">
                  {/* Quiet Tech Stack String */}
                  <div className="text-xs font-mono text-ink-3 leading-relaxed">
                    {proj.technologies.join(' · ')}
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center gap-4">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-ink text-canvas font-medium text-sm hover:opacity-90 transition-opacity flex-1"
                      >
                        Source Code
                      </a>
                    )}

                    {proj.deckUrl && (
                      <button
                        onClick={() => setActiveDeck({ title: proj.title, pdfUrl: proj.deckUrl! })}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-line text-ink font-medium text-sm hover:bg-surface-2 transition-colors flex-1"
                      >
                        Pitch Deck
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 3. EXPERIENCE ================= */}
        <section id="experience" className="space-y-12 scroll-mt-32">
          <div className="border-b border-line pb-6">
            <h2 className="text-3xl font-bold tracking-tight text-ink">
              Experience & Leadership
            </h2>
          </div>

          <div className="space-y-6">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-8 rounded-[24px] border border-line bg-surface hover:border-line-strong hover:bg-surface-2 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-ink mb-1">{exp.role}</h3>
                    <div className="flex items-center gap-2 text-sm text-ink-2">
                      <span>{exp.organization}</span>
                      <span className="text-line-strong">•</span>
                      <span>{exp.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-ink-3 uppercase tracking-wider">{exp.category}</span>
                    <span className="text-xs font-mono text-ink-3">{exp.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6 list-none text-sm text-ink-2 leading-relaxed">
                  {exp.description.map((bullet, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-line-strong">—</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-xs font-mono text-ink-3 pt-6 border-t border-line">
                  {exp.skills.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 4. AWARDS ================= */}
        <section id="awards" className="space-y-12 scroll-mt-32">
          <div className="border-b border-line pb-6">
            <h2 className="text-3xl font-bold tracking-tight text-ink">
              Honors & Awards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {awards.map((award) => (
              <div
                key={award.id}
                className="p-8 rounded-[24px] border border-line bg-surface hover:border-line-strong hover:bg-surface-2 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4 text-xs font-mono text-ink-3 uppercase tracking-wider">
                    {award.highlight}
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-2">
                    {award.title}
                  </h3>
                  <p className="text-sm font-medium text-ink-2 mb-3">{award.issuer}</p>
                  <p className="text-sm text-ink-3 leading-relaxed">{award.description}</p>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-line">
                  <span className="text-xs font-mono text-ink-3">{award.date}</span>
                  {award.stats && (
                     <span className="text-xs font-mono text-ink-3">{award.stats}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 5. TECHNICAL TOOLCHAIN ================= */}
        <section id="skills" className="space-y-12 scroll-mt-32">
          <div className="border-b border-line pb-6">
            <h2 className="text-3xl font-bold tracking-tight text-ink">
              Technical Toolchain
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {techMatrix.map((group, idx) => (
              <div
                key={idx}
                className="p-8 rounded-[24px] border border-line bg-surface hover:border-line-strong transition-colors"
              >
                <h3 className="text-xs font-bold text-ink font-mono uppercase tracking-wider mb-6">
                  {group.domain}
                </h3>
                <div className="text-sm font-mono text-ink-2 leading-loose">
                  {group.skills.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 6. CONTACT ================= */}
        <section id="contact" className="space-y-12 scroll-mt-32 pt-8">
          <div className="border-b border-line pb-6">
            <h2 className="text-3xl font-bold tracking-tight text-ink">
              Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="p-8 rounded-[24px] border border-line bg-surface space-y-8">
              <div>
                <h3 className="text-xl font-bold text-ink mb-2">Howard Woon Hao Zhe</h3>
                <p className="text-sm text-ink-3 font-mono">Software Engineering Undergraduate</p>
                <p className="text-sm text-ink-2 mt-4 leading-relaxed">
                  Open to software engineering internships, technical collaborations, and full-time opportunities.
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t border-line text-sm font-mono text-ink-2">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-ink-3 shrink-0" />
                  <span>{personalDetails.location}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                  <span className="truncate text-ink">{personalDetails.email}</span>
                  <button
                    onClick={handleCopyEmail}
                    className="p-2 rounded-lg hover:bg-surface-2 text-ink-3 hover:text-ink transition-colors shrink-0"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <a
                  href={personalDetails.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-line text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
                <a
                  href={personalDetails.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-line text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="p-8 rounded-[24px] border border-line bg-surface">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-ink-3 mb-2 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-none focus:border-line-strong focus:ring-1 focus:ring-line-strong transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-ink-3 mb-2 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-none focus:border-line-strong focus:ring-1 focus:ring-line-strong transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-ink-3 mb-2 uppercase tracking-wider">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-none focus:border-line-strong focus:ring-1 focus:ring-line-strong transition-all resize-none"
                  />
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-sm text-danger bg-danger/10 p-4 rounded-xl border border-danger/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {status === 'success' && (
                  <div className="flex items-center gap-2 text-sm text-success bg-success/10 p-4 rounded-xl border border-success/20">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Message received. I will get back to you promptly.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-ink text-canvas font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending Message...' : 'Send Message'}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="pt-16 pb-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-3 font-mono">
          <p>© {new Date().getFullYear()} Howard Woon Hao Zhe.</p>
          <p>Universiti Malaya</p>
        </footer>
      </div>

      {/* Pitch Deck Modal */}
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
