'use client';

import React, { useEffect, useRef, useState } from 'react';
import { m } from 'framer-motion';
import { SplitWords } from './fx/split-words';
import { DispatchRail } from './dispatch-rail';
import { BauhausSolid } from './fx/bauhaus-solid';
import dynamic from 'next/dynamic';
import { FX } from '@/lib/fx';
import {
  Mail,
  Copy,
  Check,
  Send,
  Linkedin,
  Github,
  FileText,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { personalDetails } from '@/lib/site-data';
import { SloganTape } from '@/components/marquees';
import { ShapeBurst } from '@/components/fx/shape-burst';
import { RoleProof } from '@/components/role-proof';
import { openResume } from '@/lib/resume';
import { OsWindow, WindowDesk } from '@/components/os-window';
import { PillPit, type PitBadge } from '@/components/pill-pit';
import { SIGNAL, type Signal } from '@/lib/signal';

const ROLE_SIGNAL: Record<string, Signal | undefined> = {
  'Agentic AI Pipelines': 'ai',
  'Fiscal Governance': 'leadership',
  LangGraph: 'ai',
  'Gemini · MCP': 'ai',
};
// the Target Roles below + the stack from the hero tape (facts already on the page); colour = SIGNAL meaning only
const PIT_BADGES: PitBadge[] = [
  'Distributed Backends',
  'Java 21 / Spring Boot',
  'Agentic AI Pipelines',
  'High-Throughput APIs',
  'Fiscal Governance',
  'Python',
  'FastAPI',
  'LangGraph',
  'TypeScript',
  'Next.js 15',
  'PostgreSQL',
  'Sui Move',
  'ESP32 · MQTT',
  'Gemini · MCP',
].map((label) => ({ label, fill: ROLE_SIGNAL[label] ? SIGNAL[ROLE_SIGNAL[label]!].soft : 'bg-white' }));

const MercuryField = dynamic(() => import('./fx/mercury-field').then((mod) => mod.MercuryField), { ssr: false });

const quickIntents = [
  {
    label: '💼 2026 SWE Role',
    text: 'Hi Howard, I would like to discuss a Software Engineering opportunity at our company...',
  },
  {
    label: '🤖 AI Pipeline Collab',
    text: 'Hi Howard, I saw your ZeroLag multi-agent architecture and wanted to talk about an AI system...',
  },
  { label: '🏆 Hackathon Team', text: 'Hi Howard, are you open to teaming up for an upcoming technical hackathon?' },
  {
    label: '☕ Quick Tech Chat',
    text: "Hi Howard, loved your portfolio. Let's connect for a quick virtual coffee chat!",
  },
];

// FX-91: the same loose shape check the browser's type="email" uses (x@y.z); the server still validates
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * FX-91 Postage Composer: a small Bauhaus stamp that assembles itself as the form is filled in. Circle = name,
 * square = email, triangle = message: each stamps in with its pop colour when its field is filled, and the three
 * lock together (a small turn) when all are. Decorative only (aria-hidden): the form, its labels and its
 * validation are unchanged. Reduced motion / Calm: the colours change without the stamp.
 */
function PostageStamp({ name, email, message }: { name: boolean; email: boolean; message: boolean }) {
  const all = name && email && message;
  const shape = 'fx-postage-shape border-2 border-ink';
  return (
    <span aria-hidden data-postage={all ? 'sealed' : 'open'} className="fx-postage inline-flex items-center gap-1.5">
      <span
        data-on={name || undefined}
        className={`${shape} w-5 h-5 rounded-full ${name ? 'bg-pop-yellow' : 'bg-white border-dashed'}`}
      />
      <span
        data-on={email || undefined}
        className={`${shape} w-5 h-5 ${email ? 'bg-pop-blue' : 'bg-white border-dashed'}`}
      />
      <svg data-on={message || undefined} className="fx-postage-shape w-6 h-6" viewBox="0 0 100 100">
        <polygon
          points="50,8 94,90 6,90"
          fill={message ? '#FF4B2B' : 'transparent'}
          stroke="#0A0A0A"
          strokeWidth="9"
          strokeLinejoin="round"
          strokeDasharray={message ? undefined : '14 10'}
        />
      </svg>
    </span>
  );
}

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [activeIntent, setActiveIntent] = useState<string | null>(null);
  const firstInteraction = useRef<number | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [errorText, setErrorText] = useState('');
  // One reset timer at a time. Previously a 5-second "back to idle" timer from an earlier send could
  // fire while a NEW send was in flight, re-enabling the button and allowing a double submit.
  const resetTimer = useRef<number | undefined>(undefined);
  const copyTimer = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      window.clearTimeout(resetTimer.current);
      window.clearTimeout(copyTimer.current);
    },
    [],
  );
  const settle = (status: 'success' | 'error') => {
    setFormStatus(status);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setFormStatus((s) => (s === status ? 'idle' : s)), 5000);
  };

  const emailAddress = personalDetails.email;
  const linkedInUrl = 'https://www.linkedin.com/in/howard-woon-hao-zhe-730b9337a/';
  const githubUrl = 'https://github.com/HowardWoon';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopiedEmail(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // Clipboard can be blocked (insecure context / permissions) → fall back to the mail client
      window.location.href = `mailto:${emailAddress}`;
    }
  };

  // The server drops anything "filled" in under 3 s as a bot. Start the clock at the FIRST interaction
  // anywhere in the section (the quick-intent chips sit outside the <form>), never lose a real message.
  const markStart = () => {
    firstInteraction.current ??= performance.now();
  };

  // R23: the chosen intent types its draft into the message box (typewriter; instant for reduced motion / Calm).
  // Only an untouched box (empty, or all / part of an intent draft) is drafted into: the visitor's words are never replaced.
  const typing = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearInterval(typing.current), []);
  const [drafted, setDrafted] = useState(false);
  const handleSelectIntent = (intent: (typeof quickIntents)[0]) => {
    markStart();
    setActiveIntent(intent.label);
    window.clearInterval(typing.current);
    const untouched = formData.message === '' || quickIntents.some((qi) => qi.text.startsWith(formData.message));
    setFormData((prev) => ({ ...prev, subject: intent.label.replace(/^[^\s]+\s/, '') }));
    if (!untouched) return;
    setDrafted(true);
    const instant =
      document.documentElement.dataset.motion === 'calm' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (instant) {
      setFormData((prev) => ({ ...prev, message: intent.text }));
      return;
    }
    let n = 0;
    setFormData((prev) => ({ ...prev, message: '' }));
    typing.current = window.setInterval(() => {
      n = Math.min(intent.text.length, n + 3);
      setFormData((prev) => ({ ...prev, message: intent.text.slice(0, n) }));
      if (n >= intent.text.length) window.clearInterval(typing.current);
    }, 16);
  };
  const clearDraft = () => {
    window.clearInterval(typing.current);
    setActiveIntent(null);
    setDrafted(false);
    setFormData((prev) => ({ ...prev, subject: '', message: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    if (formStatus === 'sending') return;

    window.clearTimeout(resetTimer.current);
    setErrorText('');
    setFormStatus('sending');
    markStart();
    const started = firstInteraction.current as number;
    const elapsed = performance.now() - started;
    // fast human (autofill + chip + send): wait out the bot threshold instead of having the message dropped
    if (elapsed < 3200) await new Promise((r) => setTimeout(r, 3200 - elapsed));
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hw_hp_field: honeypot,
          fillMs: Math.round(performance.now() - started),
        }),
      });

      if (res.ok) {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setActiveIntent(null);
        settle('success');
      } else {
        // Show the server's reason (e.g. "Too many requests…", "Invalid email address format.")
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setErrorText(body?.error ?? '');
        settle('error');
      }
    } catch {
      setErrorText('Network error. Please check your connection.');
      settle('error');
    }
  };

  const submitColor =
    formStatus === 'success' ? 'bg-pop-mint' : formStatus === 'error' ? 'bg-pop-red text-white' : 'bg-pop-yellow';

  return (
    <section
      id="contact"
      onPointerDownCapture={markStart}
      className="fx-tide-surface fx-dot-plane relative w-full bg-paper-cream bg-dots text-ink pt-24 sm:pt-32 pb-0 overflow-clip border-t-3 border-ink"
    >
      {/* Bauhaus composition (replaces the particle canvas, which was invisible on a light canvas
          and was also being stretched: its bitmap was viewport-sized but CSS-sized to the whole section) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* R41 (owner: "a bright spot ... so weird to see the blue circle suddenly white and bright"): no soft edge
            fade - it turned a blob crossing it into a white-to-blue glow. The blobs now stay inside the canvas instead
            (mercury-field.tsx), so every one is a flat colour with a hard ink outline */}
        {FX.mercuryField ? <MercuryField className="absolute right-0 top-0 h-[440px] w-[30%] hidden xl:block" /> : null}
        <div
          className="fx-depth absolute -left-36 top-[38%] hidden xl:block"
          style={{ '--depth': -20 } as React.CSSProperties}
        >
          {FX.solids3d ? (
            <BauhausSolid kind="coin" size={56} color="#FFC700" />
          ) : (
            <div className="w-56 h-56 rounded-full bg-pop-yellow border-3 border-ink" />
          )}
        </div>
        <div
          className="fx-depth absolute right-12 top-20 hidden lg:block"
          style={{ '--depth': 30 } as React.CSSProperties}
        >
          {FX.solids3d ? (
            <BauhausSolid kind="coin" size={24} color="#454AE5" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-pop-blue border-3 border-ink" />
          )}
        </div>
        <div
          className="fx-depth absolute right-44 top-40 hidden lg:block"
          style={{ '--depth': 12 } as React.CSSProperties}
        >
          {FX.solids3d ? (
            <BauhausSolid kind="cube" size={14} color="#FF4B2B" />
          ) : (
            <div className="w-14 h-14 bg-pop-red border-3 border-ink rotate-12" />
          )}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-14 px-4 xs:px-5 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="space-y-7">
          <m.div className="fx-rise nb-kicker">
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span>CONTACT // RECRUITER & PARTNERSHIP HUB</span>
          </m.div>

          <m.h2 className="fx-rise nb-title text-[clamp(1.7rem,9.5vw,2.4rem)] sm:text-6xl lg:text-7xl max-w-4xl leading-[0.98]">
            <SplitWords text="LET'S ARCHITECT SOMETHING SPECIAL." />
          </m.h2>
        </div>

        {/* Main 2-Column Recruiter Hub (bento) */}
        {/* R22: the two cards are OS windows on a desk (drag / raise / minimise / maximise, components/os-window.tsx) */}
        <WindowDesk className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Identity, Availability & 1-Click Recruiter Pack (5 Cols) */}
          <m.div className="fx-rise lg:col-span-5 space-y-6">
            <OsWindow id="profile" title="Profile" className="nb-card-lg" bodyClassName="p-4 xs:p-6 sm:p-8 space-y-6">
              {/* Recruiter Live Status Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#DCFAEC] border-2 border-ink text-ink text-xs font-mono font-extrabold tracking-[0.06em]">
                <span className="nb-led" aria-hidden />
                <span>AVAILABLE FOR 2026 ROLES</span>
              </div>

              {/* Profile Bio */}
              <div className="space-y-2">
                <h3 className="font-display text-[clamp(1.5rem,7.5vw,1.875rem)] font-extrabold uppercase text-ink tracking-[-0.02em] leading-none">
                  Howard Woon Hao Zhe
                </h3>
                <p className="text-sm font-mono text-pop-blue font-bold">
                  Software Engineering @ Universiti Malaya (4.00 CGPA)
                </p>
                <p className="text-[0.95rem] text-ink-soft leading-relaxed font-sans font-medium pt-1">
                  Open to full-time roles, high-impact backend engineering, distributed systems architecture, and AI
                  agent research collaborations.
                </p>
              </div>

              {/* Location & Timezone Details */}
              <div className="space-y-2 text-xs font-mono font-semibold text-ink-soft border-t-2 border-dashed border-ink pt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-ink shrink-0" strokeWidth={2.5} />
                  <span>Kajang, Selangor · Kuala Lumpur, Malaysia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ink shrink-0" strokeWidth={2.5} />
                  <span>Timezone: GMT+8 (Open to Remote / Relocation)</span>
                </div>
              </div>

              {/* 1-Click Email Clipboard Button */}
              <div className="pt-1">
                <button
                  data-copy-email
                  onClick={() => {
                    // R23: one click reveals and copies (it used to take a click to reveal and another to copy)
                    setEmailRevealed(true);
                    handleCopyEmail();
                  }}
                  aria-live="polite"
                  className={`relative w-full flex flex-wrap items-center justify-between gap-2 px-4 xs:px-5 py-3.5 rounded-2xl ${copiedEmail ? 'bg-[#DCFAEC]' : 'bg-white'} border-3 border-ink shadow-brutal-sm hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-mono font-bold text-ink transition-all group`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                    <span className="text-left [overflow-wrap:anywhere]">
                      {emailRevealed ? emailAddress : 'REVEAL EMAIL ADDRESS'}
                    </span>
                  </div>
                  {/* success = LIVE mint (the same green as OPERATIONAL), with a small burst */}
                  <ShapeBurst fire={copiedEmail} count={10} spread={70} />
                  <div
                    className={`flex items-center gap-1.5 font-extrabold shrink-0 ml-auto px-2 py-1 rounded-lg border-2 border-ink ${copiedEmail ? 'bg-pop-mint' : 'bg-pop-yellow'}`}
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                        <span>{emailRevealed ? 'COPY' : 'VIEW'}</span>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Verified Recruiter Links */}
              <div className="grid grid-cols-1 min-[420px]:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2.5 pt-1">
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nb-btn nb-btn-blue px-3 py-3 text-xs"
                >
                  <Linkedin className="w-4 h-4" strokeWidth={2.5} />
                  <span>LINKEDIN</span>
                </a>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nb-btn nb-btn-ink px-3 py-3 text-xs"
                >
                  <Github className="w-4 h-4" strokeWidth={2.5} />
                  <span>GITHUB</span>
                </a>
                <a
                  href="/resume.pdf"
                  onClick={openResume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nb-btn nb-btn-yellow px-3 py-3 text-xs"
                >
                  <FileText className="w-4 h-4" strokeWidth={2.5} />
                  <span>RESUME</span>
                </a>
              </div>

              {/* Target Engineering Specializations */}
              <div className="space-y-2.5 border-t-2 border-dashed border-ink pt-4">
                <span className="text-xs font-mono font-extrabold text-ink uppercase tracking-[0.1em] block">
                  TARGET ROLES & SPECIALIZATIONS:
                </span>
                {/* R23 skill-to-proof: each role opens the projects that prove it (components/role-proof.tsx) */}
                <RoleProof
                  roles={[
                    'Distributed Backends',
                    'Java 21 / Spring Boot',
                    'Agentic AI Pipelines',
                    'High-Throughput APIs',
                    'Fiscal Governance',
                  ]}
                  fillFor={(role) => (ROLE_SIGNAL[role] ? SIGNAL[ROLE_SIGNAL[role]!].soft : 'bg-white')}
                />
              </div>
            </OsWindow>
          </m.div>

          {/* Right Column: Interactive Dispatch Form with Quick-Intent Chips (7 Cols) */}
          <m.div className="fx-rise lg:col-span-7">
            <OsWindow id="console" title="Console" className="nb-card-lg" bodyClassName="p-4 xs:p-6 sm:p-10 space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="nb-tag bg-pop-lilac">DIRECT TRANSMISSION CONSOLE</span>
                  {FX.postageComposer ? (
                    <PostageStamp
                      name={formData.name.trim() !== ''}
                      email={EMAIL_SHAPE.test(formData.email.trim())}
                      message={formData.message.trim() !== ''}
                    />
                  ) : null}
                </div>
                <h3 className="font-display text-[clamp(1.4rem,7vw,1.875rem)] font-extrabold uppercase text-ink tracking-[-0.02em] pt-2">
                  Send a Direct Message
                </h3>
              </div>

              {/* Quick Intent Pre-Fill Chips */}
              <div className="space-y-2.5">
                <span className="text-xs font-mono font-bold text-pop-blue">{'// Select a conversation intent:'}</span>
                <div className="flex flex-wrap gap-2">
                  {quickIntents.map((intent) => (
                    <button
                      key={intent.label}
                      type="button"
                      aria-pressed={activeIntent === intent.label}
                      data-fx-stamp-target
                      onClick={() => handleSelectIntent(intent)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-mono font-bold border-2 border-ink transition-all ${
                        activeIntent === intent.label
                          ? 'bg-pop-yellow text-ink shadow-clay-pressed translate-x-[2px] translate-y-[2px]'
                          : 'bg-white text-ink shadow-brutal-xs hover:-translate-y-0.5 hover:shadow-brutal-sm'
                      }`}
                    >
                      {intent.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dispatch Form */}
              <form onSubmit={handleSubmit} onFocusCapture={markStart} className="space-y-5 pt-2">
                {/* Honeypot: filled in by spam bots only. `display:none` (not an off-screen position)
                  because Chrome/Edge autofill can fill off-screen fields named like "website",
                  which silently discarded real visitors' messages. */}
                <div aria-hidden="true" style={{ display: 'none' }}>
                  <label htmlFor="hw_hp_field">Leave this field empty</label>
                  <input
                    id="hw_hp_field"
                    name="hw_hp_field"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="nb-label">
                      YOUR NAME *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      autoComplete="name"
                      maxLength={120}
                      placeholder="Alex Mercer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="nb-field"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="nb-label">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      maxLength={200}
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="nb-field"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="nb-label">
                    MESSAGE / PROPOSAL *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    maxLength={5000}
                    placeholder="Hi Howard, let's connect regarding a software engineering role..."
                    value={formData.message}
                    onChange={(e) => {
                      window.clearInterval(typing.current); // the visitor's typing always wins over the drafter
                      setFormData({ ...formData, message: e.target.value });
                    }}
                    className="nb-field resize-y min-h-[140px]"
                  />
                  {activeIntent && formData.message ? (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={clearDraft}
                        className="nb-key inline-flex min-h-[40px] items-center gap-2 rounded-xl border-2 border-ink bg-white px-3 font-mono text-xs font-extrabold tracking-[0.12em] text-ink"
                      >
                        ↺ CLEAR DRAFT
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* R26: the form's fields as numbered steps (after React Bits Stepper) */}
                <DispatchRail
                  done={[
                    formData.name.trim() !== '',
                    EMAIL_SHAPE.test(formData.email.trim()),
                    formData.message.trim() !== '',
                    formStatus === 'success',
                  ]}
                />

                <button
                  type="submit"
                  disabled={formStatus === 'sending'}
                  data-armed={drafted && formStatus === 'idle' ? '' : undefined}
                  className={`nb-btn w-full py-4 text-sm fx-specular nb-press ${submitColor} data-[armed]:ring-4 data-[armed]:ring-pop-blue data-[armed]:ring-offset-2`}
                >
                  {formStatus === 'sending' ? (
                    <>
                      <span className="w-4 h-4 border-[3px] border-ink border-t-transparent rounded-full animate-spin" />
                      <span>DISPATCHING MESSAGE...</span>
                    </>
                  ) : formStatus === 'success' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
                      <span>TRANSMISSION RECEIVED — I WILL REPLY SHORTLY!</span>
                    </>
                  ) : formStatus === 'error' ? (
                    <>
                      <span>TRANSMISSION FAILED - TRY AGAIN</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" strokeWidth={2.75} />
                      <span>DISPATCH MESSAGE</span>
                    </>
                  )}
                </button>
                {formStatus === 'error' && errorText && (
                  <p role="alert" className="text-sm font-mono font-bold text-pop-redInk text-center">
                    {errorText}
                  </p>
                )}
              </form>
            </OsWindow>
          </m.div>
        </WindowDesk>

        {/* R22 physics badge pit: the same roles and stack as facts, dropped with gravity (components/pill-pit.tsx) */}
        <PillPit title="Specializations & stack · drag & fling" badges={PIT_BADGES} />
      </div>

      {/* Footer tapes (R21): slogan + status crossing in an X, full-bleed without the 100vw hack */}
      <div className="relative z-20">
        <SloganTape
          slogan="ENGINEERING SYSTEMS TO STAND OUT IN A NOISY WORLD"
          facts={[
            { label: 'Available for 2026 roles', kind: 'live' },
            { label: 'Systems & AI Architect', kind: 'ai' },
            { label: 'Software Engineering @ Universiti Malaya', kind: 'academic' },
            { label: 'Kajang, Selangor · Kuala Lumpur · GMT+8' },
          ]}
        />
      </div>
    </section>
  );
}
