'use client';
import { HeroSection } from '@/components/hero-section';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Github, ExternalLink, FileText, ArrowUpRight, ArrowDown, Sparkles, Building2, Calendar, Award, Layers, Send, Check, Copy, MapPin, AlertCircle, CheckCircle,
} from 'lucide-react';
import { personalDetails, heroStats, projects, experiences, awards } from '@/lib/site-data';
import { PitchDeckModal } from '@/components/pitch-deck-modal';
import { SlotifySimulator, ZeroLagSimulator, BLAHujanSimulator, SensorSenseiSimulator } from '@/components/project-simulators';

export function PortfolioPage() {
  const [activeDeck, setActiveDeck] = useState<{ title: string; pdfUrl: string } | null>(null);
  const [activeLabTab, setActiveLabTab] = useState<string>('slotify');
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
      <HeroSection />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 space-y-36">
        

        <section id="about" className="space-y-10 scroll-mt-24">
          <div className="space-y-4 max-w-4xl">
            <div className="text-xs font-mono text-slate-600 uppercase tracking-widest">/about</div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1] font-display">
              I architect resilient backend systems and engineer autonomous agentic pipelines from 0 to 1.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              Studying Software Engineering at Universiti Malaya (4.00 CGPA). Combining low-latency algorithmic backend design (Spring Boot, Graph algorithms, Min-Heaps) with real-time AI automation and corporate financial governance.
            </p>
          </div>
          <div className="rounded-3xl border border-black/[0.08] bg-[#EBEBED]/90 p-4 sm:p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative aspect-square rounded-2xl bg-white border border-black/[0.06] p-4 flex flex-col items-center justify-center text-center overflow-hidden group shadow-sm hover:scale-[1.02] hover:shadow-md transition-all cursor-default">
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border border-black/20" />
                <div className="absolute inset-4 rounded-full border border-black/[0.05] flex items-center justify-center">
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-400 to-transparent dial-spin-a" />
                </div>
                <div className="relative z-10 w-9 h-9 rounded-full bg-slate-100 border border-black/10 flex items-center justify-center font-mono font-bold text-xs text-slate-800 mb-2 shadow-inner">A</div>
                <div className="relative z-10 text-xs font-bold text-slate-900 tracking-tight">Backend Systems</div>
                <div className="relative z-10 text-[10px] font-mono text-slate-500 mt-0.5">Spring Boot & Java 21</div>
              </div>
              <div className="relative aspect-square rounded-2xl bg-white border border-black/[0.06] p-4 flex flex-col items-center justify-center text-center overflow-hidden group shadow-sm hover:scale-[1.02] hover:shadow-md transition-all cursor-default">
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border border-black/20" />
                <div className="absolute inset-4 rounded-full border border-black/[0.05] flex items-center justify-center">
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent dial-spin-b" />
                </div>
                <div className="relative z-10 w-9 h-9 rounded-full bg-slate-100 border border-black/10 flex items-center justify-center font-mono font-bold text-xs text-slate-800 mb-2 shadow-inner">B</div>
                <div className="relative z-10 text-xs font-bold text-slate-900 tracking-tight">Agentic AI</div>
                <div className="relative z-10 text-[10px] font-mono text-slate-500 mt-0.5">5-Operator Pipelines</div>
              </div>
              <div className="relative aspect-square rounded-2xl bg-[#E4E0DB] border border-black/[0.08] p-4 flex flex-col items-center justify-center text-center overflow-hidden group shadow-sm hover:scale-[1.02] hover:shadow-md transition-all cursor-default">
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border border-black/30" />
                <div className="absolute inset-4 rounded-full border border-black/[0.08] flex items-center justify-center">
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-600 to-transparent dial-spin-c" />
                </div>
                <div className="relative z-10 w-9 h-9 rounded-full bg-white border border-black/15 flex items-center justify-center font-mono font-bold text-xs text-slate-900 mb-2 shadow-inner">C</div>
                <div className="relative z-10 text-xs font-bold text-slate-900 tracking-tight">Graph Algorithms</div>
                <div className="relative z-10 text-[10px] font-mono text-slate-700 mt-0.5">Dijkstra & Min-Heaps</div>
              </div>
              <div className="relative aspect-square rounded-2xl bg-white border border-black/[0.06] p-4 flex flex-col items-center justify-center text-center overflow-hidden group shadow-sm hover:scale-[1.02] hover:shadow-md transition-all cursor-default">
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border border-black/20" />
                <div className="absolute inset-4 rounded-full border border-black/[0.05] flex items-center justify-center">
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-400 to-transparent dial-spin-d" />
                </div>
                <div className="relative z-10 w-9 h-9 rounded-full bg-slate-100 border border-black/10 flex items-center justify-center font-mono font-bold text-xs text-slate-800 mb-2 shadow-inner">D</div>
                <div className="relative z-10 text-xs font-bold text-slate-900 tracking-tight">Fiscal Governance</div>
                <div className="relative z-10 text-[10px] font-mono text-slate-500 mt-0.5">PEKOM Finance Lead</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-t border-black/[0.08] pt-4 font-mono text-xs">
              <div className="md:col-span-6 flex items-center justify-between px-3 py-2 rounded-xl bg-white/70 border border-black/[0.05]">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px]">Systems</span>
                </div>
                <span className="text-slate-300">~</span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-[11px]">AI Pipelines</span>
                </div>
                <span className="text-slate-300">~</span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[11px]">IoT Telemetry</span>
                </div>
              </div>
              <div className="md:col-span-6 flex items-center justify-end gap-2 flex-wrap text-[11px] text-slate-600">
                <span className="text-slate-400 mr-1">Stack:</span>
                {['Java 21', 'Spring Boot', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Next.js 15'].map((w, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white border border-black/[0.06] text-slate-800 shadow-2xs font-semibold hover:border-black/20 hover:bg-slate-200 transition-colors cursor-default">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="selected-work" className="space-y-10 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-black/[0.08] pb-4">
            <div>
              <div className="text-xs font-mono text-slate-600 uppercase tracking-widest">/selected_work</div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display mt-1">Featured Systems & Production Engineering</h2>
            </div>
            <span className="font-mono text-xs text-slate-600">01 – 04 Projects</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="p-7 rounded-3xl border border-black/[0.08] bg-white hover:border-black/25 hover:shadow-xl transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-4 text-xs font-mono">
                    <span className="text-slate-400">{proj.index} {"//"} {proj.year}</span>
                    {proj.highlight && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-black/[0.08] text-slate-800 font-semibold text-[11px]">
                        {proj.highlight}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-display group-hover:text-indigo-600 transition-colors">{proj.title}</h3>
                  <p className="text-xs font-medium text-slate-600 mt-1 mb-3">{proj.tagline}</p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">{proj.description}</p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-black/[0.05] text-xs font-mono text-slate-700 mb-4 flex items-start gap-2">
                    <span className="text-slate-900 font-bold shrink-0">ARCH:</span>
                    <span>{proj.architectureHighlight}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-black/[0.06] space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((tech, i) => (
                      <span key={i} className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-black/[0.04] hover:border-black/20 hover:bg-slate-200 transition-colors cursor-default">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 font-mono text-xs">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all active:scale-95">
                        <Github className="w-3.5 h-3.5" /> Source Code
                      </a>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      {proj.deckUrl && (
                        <button onClick={() => setActiveDeck({ title: proj.title, pdfUrl: proj.deckUrl! })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all active:scale-95">
                          <FileText className="w-3.5 h-3.5" /> Pitch Deck
                        </button>
                      )}
                      {proj.certificateUrl && (
                        <button onClick={() => setActiveDeck({ title: proj.title, pdfUrl: proj.certificateUrl! })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all active:scale-95">
                          <Award className="w-3.5 h-3.5" /> Certificate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="experiments" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-black/[0.08] pb-4">
            <div>
              <div className="text-xs font-mono text-slate-600 uppercase tracking-widest">/experiments & prototypes</div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display mt-1">Interactive Engineering Lab</h2>
            </div>
            <p className="text-xs font-mono text-slate-500">Ideating & prototyping functional systems live.</p>
          </div>
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white border border-black/[0.08] w-fit shadow-sm">
            {[
              { id: 'slotify', label: '01 / Slotify Dijkstra Router' },
              { id: 'zerolag', label: '02 / ZeroLag AI Triage' },
              { id: 'bilahujan', label: '03 / BILAHUJAN IoT Gauge' },
              { id: 'sensor-sensei', label: '04 / Sensor X Sensei Load' },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveLabTab(tab.id)} className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${activeLabTab === tab.id ? 'bg-slate-900 text-white font-bold shadow-md' : 'text-slate-600 hover:text-black'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6 sm:p-8 rounded-3xl border border-black/[0.08] bg-white shadow-xl">
            {activeLabTab === 'slotify' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base font-display">Slotify Graph Routing Engine</h4>
                    <p className="text-xs font-mono text-slate-500">Dijkstra Shortest Path & Spot Allocation Simulation</p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">Java 21 / Spring Boot</span>
                </div>
                <SlotifySimulator />
              </div>
            )}
            {activeLabTab === 'zerolag' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base font-display">ZeroLag 5-Operator Agentic Pipeline</h4>
                    <p className="text-xs font-mono text-slate-500">Autonomous Sales Intent Extraction & Webhook Dispatch</p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">Supervity 2nd Place</span>
                </div>
                <ZeroLagSimulator />
              </div>
            )}
            {activeLabTab === 'bilahujan' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base font-display">BILAHUJAN Flood Telemetry Network</h4>
                    <p className="text-xs font-mono text-slate-500">Predictive Water Sensor & SMS Evacuation Alert Engine</p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">KitaHack 2026</span>
                </div>
                <BLAHujanSimulator />
              </div>
            )}
            {activeLabTab === 'sensor-sensei' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base font-display">Sensor X Sensei HVAC Governance</h4>
                    <p className="text-xs font-mono text-slate-500">Commercial Power Load Shedding & Telemetry Estimator</p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">UM Technothon Finalist</span>
                </div>
                <SensorSenseiSimulator />
              </div>
            )}
          </div>
        </section>

        <section id="experience" className="space-y-8 scroll-mt-24">
          <div className="border-b border-black/[0.08] pb-4">
            <div className="text-xs font-mono text-slate-600 uppercase tracking-widest">/experience & leadership</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display mt-1">Career & Institutional Governance</h2>
          </div>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="p-6 sm:p-7 rounded-2xl border border-black/[0.08] bg-white hover:border-black/20 transition-all shadow-sm flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-400">{exp.index}</span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">{exp.role}</h3>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">{exp.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-mono mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exp.organization}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{exp.location}</span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-500">{exp.period}</div>
                </div>
                <ul className="space-y-1.5 mb-4 list-disc list-inside text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {exp.description.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-black/[0.05]">
                  {exp.skills.map((skill, i) => (
                    <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:border-black/20 hover:bg-slate-200 transition-colors cursor-default border border-black/[0.04]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="honors" className="space-y-8 scroll-mt-24">
          <div className="border-b border-black/[0.08] pb-4">
            <div className="text-xs font-mono text-slate-600 uppercase tracking-widest">/honors & distinctions</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display mt-1">Academic & Competition Honors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {awards.map((award) => (
              <div key={award.id} className="p-6 rounded-2xl border border-black/[0.08] bg-white hover:border-amber-600/40 transition-all flex flex-col justify-between group shadow-sm hover:scale-[1.02] hover:shadow-md transition-all cursor-default">
                <div>
                  <div className="flex items-center justify-between mb-4 font-mono text-xs">
                    <span className="text-slate-400">{award.index}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-600/20 text-amber-800 font-semibold text-[11px]">{award.highlight}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-amber-800 transition-colors">{award.title}</h3>
                  <p className="text-xs text-slate-600 font-mono mb-2">{award.issuer}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{award.description}</p>
                </div>
                <div className="text-[11px] font-mono text-slate-400 pt-3 mt-4 border-t border-black/[0.05] flex items-center justify-between">
                  <span>{award.date}</span>
                  <div className="flex items-center gap-2">
                    {award.stats && <span className="text-slate-700 font-semibold">{award.stats}</span>}
                    {award.certificateUrl && (
                      <button onClick={() => setActiveDeck({ title: award.title, pdfUrl: award.certificateUrl! })} className="p-1 rounded hover:bg-black/5 text-slate-900 transition-all ml-auto">
                        <Award className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="space-y-10 scroll-mt-24">
          <div className="border-b border-black/[0.08] pb-4">
            <div className="text-xs font-mono text-slate-600 uppercase tracking-widest">/new_project</div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 font-display mt-1">Let&apos;s build something special.</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-2 p-7 rounded-3xl border border-black/[0.08] bg-white space-y-6 shadow-md">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{personalDetails.fullName}</h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">Software Engineering Undergraduate @ Universiti Malaya</p>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">Open to software engineering roles, backend systems architecture, and high-impact hackathon collaborations.</p>
              </div>
              <div className="space-y-3 pt-2 border-t border-black/[0.06]">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{personalDetails.location}</span>
                </div>
                {!revealedEmail ? (
                  <button onClick={() => setRevealedEmail(true)} className="w-full py-3 px-4 rounded-xl border border-black/10 bg-[#F4F4F6] hover:bg-slate-100 text-slate-900 font-mono text-xs font-semibold transition-all text-center">
                    Reveal Email Address ↓
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-black/10 font-mono text-xs">
                    <span className="truncate text-slate-900 font-semibold">{personalDetails.email}</span>
                    <button onClick={handleCopyEmail} className="p-1 rounded hover:bg-black/5 text-slate-600 hover:text-black transition-colors" title="Copy Email">
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
            <div className="lg:col-span-3 p-7 rounded-3xl border border-black/[0.08] bg-white shadow-md">
              <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1.5 uppercase tracking-wider">Your Name</label>
                    <input type="text" required value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} placeholder="Alex Mercer" className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-slate-50 text-slate-900 font-sans text-xs sm:text-sm focus:outline-none focus:border-slate-900 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input type="email" required value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })} placeholder="alex@company.com" className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-slate-50 text-slate-900 font-sans text-xs sm:text-sm focus:outline-none focus:border-slate-900 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5 uppercase tracking-wider">Message</label>
                  <textarea required rows={4} value={formState.message} onChange={(e) => setFormState({ ...formState, message: e.target.value })} placeholder="Hi Howard, let's connect regarding a software engineering role..." className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-slate-50 text-slate-900 font-sans text-xs sm:text-sm focus:outline-none focus:border-slate-900 transition-colors resize-none" />
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

        <footer className="pt-10 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-mono">
          <p>© {new Date().getFullYear()} Howard Woon Hao Zhe. All rights reserved.</p>
          <p>Universiti Malaya • Software Engineering (4.00 CGPA)</p>
        </footer>
      </main>

      {activeDeck && (
        <PitchDeckModal isOpen={!!activeDeck} onClose={() => setActiveDeck(null)} title={activeDeck.title} pdfUrl={activeDeck.pdfUrl} />
      )}
    </div>
  );
}
