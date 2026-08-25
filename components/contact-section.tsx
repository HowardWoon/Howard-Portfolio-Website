"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ParticleMesh } from "./particle-mesh";
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

  
  const cycleWords = ["BUILD", "SHIP", "ARCHITECT", "SCALE", "DEPLOY"];
  

  

  const emailAddress = "howardwoonhz@gmail.com";
  const linkedInUrl = "https://www.linkedin.com/in/howard-woon-hao-zhe-730b9337a/";
  const githubUrl = "https://github.com/HowardWoon";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
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

    setFormStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setActiveIntent(null);
        setTimeout(() => setFormStatus("idle"), 5000);
      } else {
        setFormStatus("error");
      }
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <section 
      id="contact" 
      className="relative w-full bg-[#090B10] text-white py-32 px-6 sm:px-10 lg:px-16 overflow-hidden border-t border-white/10 selection:bg-amber-500 selection:text-black"
    >
      {/* Ambient Glows */}
      <ParticleMesh />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-mono text-amber-300 tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CONTACT // RECRUITER & PARTNERSHIP HUB</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-4xl leading-[1.05]"
          >
            LET'S ARCHITECT SOMETHING SPECIAL.
          </motion.h2>
        </div>

        {/* Main 2-Column Recruiter Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Identity, Availability & 1-Click Recruiter Pack (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="rounded-[32px] p-8 border border-white/10 bg-[#0E121B]/95 backdrop-blur-2xl shadow-2xl space-y-6">
              
              {/* Recruiter Live Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AVAILABLE FOR 2026 ROLES</span>
              </div>

              {/* Profile Bio */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold uppercase text-white tracking-tight">
                  Howard Woon Hao Zhe
                </h3>
                <p className="text-xs font-mono text-amber-400 font-medium">
                  Software Engineering @ Universiti Malaya (4.00 CGPA)
                </p>
                <p className="text-sm text-neutral-300 leading-relaxed font-sans pt-1">
                  Open to full-time roles, high-impact backend engineering, distributed systems architecture, and AI agent research collaborations.
                </p>
              </div>

              {/* Location & Timezone Details */}
              <div className="space-y-2 text-xs font-mono text-neutral-400 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kajang, Selangor · Kuala Lumpur, Malaysia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Timezone: GMT+8 (Open to Remote / Relocation)</span>
                </div>
              </div>

              {/* 1-Click Email Clipboard Button with Toast */}
              <div className="pt-2">
                <button
                  onClick={emailRevealed ? handleCopyEmail : () => setEmailRevealed(true)}
                  className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-xs font-mono text-neutral-200 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{emailRevealed ? emailAddress : "REVEAL EMAIL ADDRESS"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold shrink-0 ml-2">
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>{emailRevealed ? "COPY" : "VIEW"}</span>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Verified Recruiter Links (Correct LinkedIn & GitHub) */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#0077B5]/20 hover:bg-[#0077B5]/30 border border-[#0077B5]/40 text-xs font-mono text-[#00E5FF] font-bold transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LINKEDIN</span>
                </a>

                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-white font-bold transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GITHUB</span>
                </a>

                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-mono text-amber-300 font-bold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>RESUME</span>
                </a>
              </div>

              {/* Target Engineering Specializations */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
                  TARGET ROLES & SPECIALIZATIONS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["Distributed Backends", "Java 21 / Spring Boot", "Agentic AI Pipelines", "High-Throughput APIs", "Fiscal Governance"].map((role) => (
                    <span key={role} className="px-2.5 py-1 bg-black/40 border border-white/5 rounded-lg text-xs font-mono text-neutral-300">
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
            className="lg:col-span-7 rounded-[32px] p-8 sm:p-10 border border-white/10 bg-[#0E121B]/95 backdrop-blur-2xl shadow-2xl space-y-6"
          >
            <div className="space-y-2">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
                DIRECT TRANSMISSION CONSOLE
              </span>
              <h3 className="text-2xl font-bold uppercase text-white tracking-tight">
                Send a Direct Message
              </h3>
            </div>

            {/* Quick Intent Pre-Fill Chips */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-amber-400/90">
                // Select a conversation intent:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickIntents.map((intent) => (
                  <button
                    key={intent.label}
                    type="button"
                    onClick={() => handleSelectIntent(intent)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                      activeIntent === intent.label
                        ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20"
                        : "bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300"
                    }`}
                  >
                    {intent.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dispatch Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                    YOUR NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Mercer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-sans text-white placeholder-neutral-600 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-sans text-white placeholder-neutral-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  MESSAGE / PROPOSAL *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Hi Howard, let's connect regarding a software engineering role..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-sans text-white placeholder-neutral-600 outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={formStatus === "sending"}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {formStatus === "sending" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>DISPATCHING MESSAGE...</span>
                  </>
                ) : formStatus === "success" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>TRANSMISSION RECEIVED — I WILL REPLY SHORTLY!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>DISPATCH MESSAGE</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

        </div>

        
        {/* Footer Marquee */}
        <div className="w-full overflow-hidden bg-[#FFC700] border-y-2 border-black py-4 mt-16 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] z-20">
          <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused] w-max">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center">
                <span className="text-base sm:text-xl md:text-2xl font-sans font-black text-black uppercase tracking-wide px-6 sm:px-8">ENGINEERING SYSTEMS TO STAND OUT IN A NOISY WORLD</span>
                <span className="text-3xl sm:text-4xl text-[#00E5FF] font-black mx-2 sm:mx-4 mt-2">*</span>
              </div>
            ))}
          </div>
        </div>

                {/* Global Footer & Functional Sitemap */}
                {/* ENGINEERING TITLE BLOCK FOOTER */}
                {/* ENGINEERING TITLE BLOCK FOOTER */}
        <footer className="relative z-10 pt-24 pb-12 mt-20">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-10">
            
            {/* Left: System of Record / Title Block */}
            <div className="flex-1 w-full border border-white/10 rounded-xl bg-[#090B10] overflow-hidden flex flex-col relative group hover:border-white/20 transition-colors shadow-2xl">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-5 gap-4">
                <span className="text-sm font-mono font-bold text-neutral-400 tracking-[0.2em] uppercase">System Handover</span>
                <span className="text-xs font-mono font-bold text-amber-400 tracking-[0.2em] bg-amber-500/10 px-3 py-1.5 rounded border border-amber-500/20 uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  OPERATIONAL
                </span>
              </div>
              
              {/* Body */}
              <div className="p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* Identity */}
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-neutral-500 tracking-[0.2em] mb-4 uppercase">System Of Record</div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider leading-none">Howard Woon Hao Zhe</h3>
                  <p className="text-sm font-mono text-amber-400 uppercase tracking-widest pt-3">Systems & AI Architect</p>
                </div>

                {/* Education */}
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-neutral-500 tracking-[0.2em] mb-4 uppercase">Academic Foundation</div>
                  <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-wider">Universiti Malaya</h3>
                  <p className="text-sm font-mono text-neutral-400">B.Comp.Sc. / Software Engineering</p>
                </div>

                {/* Metadata */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-neutral-500 tracking-[0.2em] mb-4 uppercase">Document Metadata</div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm font-mono">
                    <span className="text-neutral-500">DOCUMENT</span>
                    <span className="text-neutral-300">HWZ-2026</span>
                    <span className="text-neutral-500">REVISION</span>
                    <span className="text-neutral-300">01.04</span>
                    <span className="text-neutral-500">NODE</span>
                    <span className="text-neutral-300">KUL-MY-01</span>
                  </div>
                </div>
              </div>

              {/* Footer Bar */}
              <div className="border-t border-white/10 bg-white/[0.01] px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
                <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-[0.2em] text-center md:text-left">Engineered Systems. Autonomous Pipelines.</span>
                
                <div className="flex flex-wrap justify-center items-center gap-8">
                  <a href="https://linkedin.com/in/howardwoon" target="_blank" rel="noreferrer" className="text-sm font-mono font-bold text-neutral-400 hover:text-amber-400 transition-colors uppercase tracking-widest flex items-center gap-2.5">
                    <Linkedin className="w-5 h-5" /> LINKEDIN
                  </a>
                  <a href="https://github.com/HowardWoon" target="_blank" rel="noreferrer" className="text-sm font-mono font-bold text-neutral-400 hover:text-amber-400 transition-colors uppercase tracking-widest flex items-center gap-2.5">
                    <Github className="w-5 h-5" /> GITHUB
                  </a>
                  <a href="/resume" className="text-sm font-mono font-bold text-neutral-400 hover:text-amber-400 transition-colors uppercase tracking-widest flex items-center gap-2.5">
                    <FileText className="w-5 h-5" /> RESUME
                  </a>
                </div>
              </div>
            </div>

            {/* Right Block: Sitemap */}
            <div className="w-full lg:w-56 flex flex-col space-y-4">
              <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-[0.2em] mb-2">Index Directory</span>
              <a href="#about" className="group flex items-center gap-3 text-sm font-mono font-bold text-neutral-400 hover:text-amber-400 transition-all">
                <span className="w-6 h-px bg-white/10 group-hover:bg-amber-400 transition-colors" />
                01 // VISION
              </a>
              <a href="#projects" className="group flex items-center gap-3 text-sm font-mono font-bold text-neutral-400 hover:text-amber-400 transition-all">
                <span className="w-6 h-px bg-white/10 group-hover:bg-amber-400 transition-colors" />
                02 // ARCHITECTURE
              </a>
              <a href="#experience" className="group flex items-center gap-3 text-sm font-mono font-bold text-neutral-400 hover:text-amber-400 transition-all">
                <span className="w-6 h-px bg-white/10 group-hover:bg-amber-400 transition-colors" />
                03 // GOVERNANCE
              </a>
              <a href="#honors" className="group flex items-center gap-3 text-sm font-mono font-bold text-neutral-400 hover:text-amber-400 transition-all">
                <span className="w-6 h-px bg-white/10 group-hover:bg-amber-400 transition-colors" />
                04 // HONORS
              </a>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="group flex items-center gap-3 text-sm font-mono font-bold text-white mt-6 pt-6 border-t border-white/10 hover:text-amber-400 transition-all text-left"
              >
                <span className="w-6 h-px bg-white/20 group-hover:bg-amber-400 transition-colors" />
                BACK TO TOP
              </button>
            </div>

          </div>
        </footer>

      </div>
    </section>
  );
}