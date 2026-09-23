"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  CheckCircle2
} from "lucide-react";
import { personalDetails } from "@/lib/site-data";


const quickIntents = [
  { label: "💼 2026 SWE Role", text: "Hi Howard, I would like to discuss a Software Engineering opportunity at our company..." },
  { label: "🤖 AI Pipeline Collab", text: "Hi Howard, I saw your ZeroLag multi-agent architecture and wanted to talk about an AI system..." },
  { label: "🏆 Hackathon Team", text: "Hi Howard, are you open to teaming up for an upcoming technical hackathon?" },
  { label: "☕ Quick Tech Chat", text: "Hi Howard, loved your portfolio. Let's connect for a quick virtual coffee chat!" }
];


export default function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [activeIntent, setActiveIntent] = useState<string | null>(null);
  const firstInteraction = useRef<number | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const startedAt = useRef<number>(Date.now()); // bots submit instantly; the API ignores sends < 2.5s
  const [errorText, setErrorText] = useState("");
  // One reset timer at a time. Previously a 5-second "back to idle" timer from an earlier send could
  // fire while a NEW send was in flight, re-enabling the button and allowing a double submit.
  const resetTimer = useRef<number | undefined>(undefined);
  const copyTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => { window.clearTimeout(resetTimer.current); window.clearTimeout(copyTimer.current); }, []);
  const settle = (status: "success" | "error") => {
    setFormStatus(status);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setFormStatus((s) => (s === status ? "idle" : s)), 5000);
  };

  const emailAddress = personalDetails.email;
  const linkedInUrl = "https://www.linkedin.com/in/howard-woon-hao-zhe-730b9337a/";
  const githubUrl = "https://github.com/HowardWoon";

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

  const handleSelectIntent = (intent: typeof quickIntents[0]) => {
    setActiveIntent(intent.label);
    setFormData((prev) => ({
      ...prev,
      subject: intent.label.replace(/^[^\s]+\s/, ""),
      message: intent.text
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    if (formStatus === "sending") return;

    window.clearTimeout(resetTimer.current);
    setErrorText("");
    setFormStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, hw_hp_field: honeypot, startedAt: startedAt.current }),
      });

      if (res.ok) {
        setFormData({ name: "", email: "", subject: "", message: "" });
        setActiveIntent(null);
        settle("success");
      } else {
        // Show the server's reason (e.g. "Too many requests…", "Invalid email address format.")
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setErrorText(body?.error ?? "");
        settle("error");
      }
    } catch {
      setErrorText("Network error. Please check your connection.");
      settle("error");
    }
  };

  const submitColor =
    formStatus === "success" ? "bg-pop-mint" : formStatus === "error" ? "bg-pop-red text-white" : "bg-pop-yellow";

  return (
    <section
      id="contact"
      className="relative w-full bg-paper-cream bg-dots text-ink pt-24 sm:pt-32 pb-0 overflow-hidden border-t-3 border-ink"
    >
      {/* Bauhaus composition (replaces the particle canvas, which was invisible on a light canvas
          and was also being stretched: its bitmap was viewport-sized but CSS-sized to the whole section) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-36 top-[38%] w-56 h-56 rounded-full bg-pop-yellow border-3 border-ink hidden xl:block" />
        <div className="absolute right-12 top-20 w-24 h-24 rounded-full bg-pop-blue border-3 border-ink hidden lg:block" />
        <div className="absolute right-44 top-40 w-14 h-14 bg-pop-red border-3 border-ink rotate-12 hidden lg:block" />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-14 px-4 xs:px-5 sm:px-10 lg:px-16">

        {/* Section Header */}
        <div className="space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="nb-kicker"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span>CONTACT // RECRUITER & PARTNERSHIP HUB</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="nb-title text-[clamp(1.7rem,9.5vw,2.4rem)] sm:text-6xl lg:text-7xl max-w-4xl leading-[0.98]"
          >
            LET&apos;S ARCHITECT SOMETHING SPECIAL.
          </motion.h2>
        </div>

        {/* Main 2-Column Recruiter Hub (bento) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Left Column: Identity, Availability & 1-Click Recruiter Pack (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="nb-card-lg p-4 xs:p-6 sm:p-8 space-y-6">

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
                  Open to full-time roles, high-impact backend engineering, distributed systems architecture, and AI agent research collaborations.
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
                  onClick={emailRevealed ? handleCopyEmail : () => setEmailRevealed(true)}
                  aria-live="polite"
                  className="w-full flex flex-wrap items-center justify-between gap-2 px-4 xs:px-5 py-3.5 rounded-2xl bg-white border-3 border-ink shadow-brutal-sm hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-mono font-bold text-ink transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                    <span className="text-left [overflow-wrap:anywhere]">{emailRevealed ? emailAddress : "REVEAL EMAIL ADDRESS"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-extrabold shrink-0 ml-auto px-2 py-1 rounded-lg border-2 border-ink bg-pop-yellow">
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                        <span>{emailRevealed ? "COPY" : "VIEW"}</span>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Verified Recruiter Links */}
              <div className="grid grid-cols-1 min-[420px]:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2.5 pt-1">
                <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-blue px-3 py-3 text-xs">
                  <Linkedin className="w-4 h-4" strokeWidth={2.5} />
                  <span>LINKEDIN</span>
                </a>
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-ink px-3 py-3 text-xs">
                  <Github className="w-4 h-4" strokeWidth={2.5} />
                  <span>GITHUB</span>
                </a>
                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-yellow px-3 py-3 text-xs">
                  <FileText className="w-4 h-4" strokeWidth={2.5} />
                  <span>RESUME</span>
                </a>
              </div>

              {/* Target Engineering Specializations */}
              <div className="space-y-2.5 border-t-2 border-dashed border-ink pt-4">
                <span className="text-xs font-mono font-extrabold text-ink uppercase tracking-[0.1em] block">
                  TARGET ROLES & SPECIALIZATIONS:
                </span>
                <div className="flex flex-wrap gap-2">
                  {["Distributed Backends", "Java 21 / Spring Boot", "Agentic AI Pipelines", "High-Throughput APIs", "Fiscal Governance"].map((role, i) => (
                    <span key={role} className={`nb-chip ${["bg-[#FFF3C4]", "bg-[#D9FBFF]", "bg-[#EEE9FF]", "bg-[#DCFAEC]", "bg-[#FFE1EF]"][i % 5]}`}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right Column: Interactive Dispatch Form with Quick-Intent Chips (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 nb-card-lg p-4 xs:p-6 sm:p-10 space-y-6"
          >
            <div className="space-y-2">
              <span className="nb-tag bg-pop-lilac">
                DIRECT TRANSMISSION CONSOLE
              </span>
              <h3 className="font-display text-[clamp(1.4rem,7vw,1.875rem)] font-extrabold uppercase text-ink tracking-[-0.02em] pt-2">
                Send a Direct Message
              </h3>
            </div>

            {/* Quick Intent Pre-Fill Chips */}
            <div className="space-y-2.5">
              <span className="text-xs font-mono font-bold text-pop-blue">
                {"// Select a conversation intent:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {quickIntents.map((intent) => (
                  <button
                    key={intent.label}
                    type="button"
                    aria-pressed={activeIntent === intent.label}
                    onClick={() => handleSelectIntent(intent)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border-2 border-ink transition-all ${
                      activeIntent === intent.label
                        ? "bg-pop-yellow text-ink shadow-clay-pressed translate-x-[2px] translate-y-[2px]"
                        : "bg-white text-ink shadow-brutal-xs hover:-translate-y-0.5 hover:shadow-brutal-sm"
                    }`}
                  >
                    {intent.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dispatch Form */}
            <form onSubmit={handleSubmit} onFocusCapture={() => { firstInteraction.current ??= performance.now(); }} className="space-y-5 pt-2">
              {/* Honeypot: filled in by spam bots only. `display:none` (not an off-screen position)
                  because Chrome/Edge autofill can fill off-screen fields named like "website",
                  which silently discarded real visitors' messages. */}
              <div aria-hidden="true" style={{ display: "none" }}>
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
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="nb-field resize-y min-h-[140px]"
                />
              </div>

              <button
                type="submit"
                disabled={formStatus === "sending"}
                className={`nb-btn w-full py-4 text-sm ${submitColor}`}
              >
                {formStatus === "sending" ? (
                  <>
                    <span className="w-4 h-4 border-[3px] border-ink border-t-transparent rounded-full animate-spin" />
                    <span>DISPATCHING MESSAGE...</span>
                  </>
                ) : formStatus === "success" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
                    <span>TRANSMISSION RECEIVED — I WILL REPLY SHORTLY!</span>
                  </>
                ) : formStatus === "error" ? (
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
              {formStatus === "error" && errorText && (
                <p role="alert" className="text-sm font-mono font-bold text-pop-redInk text-center">
                  {errorText}
                </p>
              )}
            </form>
          </motion.div>

        </div>
      </div>

      {/* Footer Marquee (full-bleed without the 100vw hack, which overflowed by the scrollbar width on Windows) */}
      <div className="w-full overflow-hidden bg-pop-yellow border-y-3 border-ink py-4 sm:py-5 mt-24 relative z-20 rotate-[0.6deg] scale-[1.02]">
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] w-max">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center" aria-hidden={i > 0}>
              <span className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold text-ink uppercase tracking-[-0.01em] px-6 sm:px-8">ENGINEERING SYSTEMS TO STAND OUT IN A NOISY WORLD</span>
              <span aria-hidden className="inline-block w-5 h-5 sm:w-6 sm:h-6 bg-pop-red border-3 border-ink rotate-45 mx-2 sm:mx-4" />
            </div>
          ))}
        </div>
      </div>

      {/* ENGINEERING TITLE BLOCK FOOTER */}
      <footer data-dark-surface className="relative z-10 bg-ink text-white mt-0 pt-16 sm:pt-20 pb-[max(3.5rem,calc(var(--safe-bottom)+2rem))] px-4 xs:px-5 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-14 lg:gap-10">

          {/* Left: System of Record / Title Block (blueprint-style drawing frame) */}
          <div className="flex-1 w-full border-3 border-white rounded-[22px] overflow-hidden flex flex-col relative shadow-[5px_5px_0_0_#FFC700] sm:shadow-[8px_8px_0_0_#FFC700]">
            {/* Header Bar */}
            <div className="flex flex-wrap items-center justify-between border-b-3 border-white bg-white/[0.04] px-6 py-5 gap-4">
              <span className="text-sm font-mono font-extrabold text-white tracking-[0.12em] uppercase">System Handover</span>
              <span className="text-xs font-mono font-extrabold text-ink tracking-[0.1em] bg-pop-mint px-3 py-1.5 rounded-lg border-2 border-white uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
                OPERATIONAL
              </span>
            </div>

            {/* Body */}
            <div className="p-4 xs:p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {/* Identity */}
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold text-white/60 tracking-[0.12em] mb-4 uppercase">System Of Record</div>
                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white uppercase tracking-[-0.01em] leading-none">Howard Woon Hao Zhe</h3>
                <p className="text-sm font-mono font-bold text-pop-yellow uppercase tracking-[0.12em] pt-3">Systems & AI Architect</p>
              </div>

              {/* Education */}
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold text-white/60 tracking-[0.12em] mb-4 uppercase">Academic Foundation</div>
                <h3 className="font-display text-lg md:text-xl font-extrabold text-white uppercase">Universiti Malaya</h3>
                <p className="text-sm font-mono font-semibold text-white/80">B.Comp.Sc. / Software Engineering</p>
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-white/60 tracking-[0.12em] mb-4 uppercase">Document Metadata</div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 xs:gap-x-6 gap-y-3 text-sm font-mono font-semibold [overflow-wrap:anywhere]">
                  <span className="text-white/60">DOCUMENT</span>
                  <span className="text-white">HWZ-2026</span>
                  <span className="text-white/60">REVISION</span>
                  <span className="text-white">01.04</span>
                  <span className="text-white/60">NODE</span>
                  <span className="text-white">KUL-MY-01</span>
                </div>
              </div>
            </div>

            {/* Footer Bar */}
            <div className="border-t-3 border-white px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
              <span className="text-xs font-mono font-bold text-white/70 uppercase tracking-[0.12em] text-center md:text-left">Engineered Systems. Autonomous Pipelines.</span>

              <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-1 sm:gap-8">
                <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-mono font-extrabold text-white hover:text-pop-yellow active:text-pop-yellow transition-colors uppercase tracking-[0.1em] flex items-center gap-2.5 min-h-[44px]">
                  <Linkedin className="w-5 h-5" strokeWidth={2.5} /> LINKEDIN
                </a>
                <a href="https://github.com/HowardWoon" target="_blank" rel="noopener noreferrer" className="text-sm font-mono font-extrabold text-white hover:text-pop-yellow active:text-pop-yellow transition-colors uppercase tracking-[0.1em] flex items-center gap-2.5 min-h-[44px]">
                  <Github className="w-5 h-5" strokeWidth={2.5} /> GITHUB
                </a>
                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="text-sm font-mono font-extrabold text-white hover:text-pop-yellow active:text-pop-yellow transition-colors uppercase tracking-[0.1em] flex items-center gap-2.5 min-h-[44px]">
                  <FileText className="w-5 h-5" strokeWidth={2.5} /> RESUME
                </a>
              </div>
            </div>
          </div>

          {/* Right Block: Sitemap */}
          <nav aria-label="Index Directory" className="w-full lg:w-60 flex flex-col space-y-1">
            <span className="text-xs font-mono font-bold text-white/60 uppercase tracking-[0.12em] mb-2">Index Directory</span>
            {[
              ["#about", "01 // VISION"],
              ["#projects", "02 // ARCHITECTURE"],
              ["#experience", "03 // GOVERNANCE"],
              ["#honors", "04 // HONORS"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="group flex items-center gap-3 min-h-[44px] text-sm font-mono font-extrabold text-white/85 hover:text-pop-yellow active:text-pop-yellow transition-colors">
                <span className="w-6 h-[3px] bg-white/30 group-hover:w-10 group-hover:bg-pop-yellow transition-all" />
                {label}
              </a>
            ))}
            <button
              onClick={() => (window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' }))}
              className="group flex items-center gap-3 text-sm font-mono font-extrabold text-ink bg-pop-yellow mt-6 px-4 py-3 rounded-xl border-3 border-white shadow-[4px_4px_0_0_#FFFFFF] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-left"
            >
              <span className="w-6 h-[3px] bg-ink" />
              BACK TO TOP
            </button>
          </nav>

        </div>
      </footer>
    </section>
  );
}
