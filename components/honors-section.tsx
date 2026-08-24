"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
   
  Trophy,
  ArrowRight,
  Shield, 
  GraduationCap, 
  Gamepad2, 
  Zap, 
  Sparkles, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  Medal,
  Calendar
} from "lucide-react";
import Image from "next/image";

interface HonorItem {
  id: string;
  isFeatured?: boolean;
  badge: string;
  badgeColor: "gold" | "cyan" | "emerald" | "purple";
  title: string;
  issuingBody: string;
  period: string;
  statCallout: { value: string; label: string };
  description: string;
  highlights: string[];
  certificateUrl?: string;
  icon: any;
}

const honorsList: HonorItem[] = [
  {
    id: "supervity",
    isFeatured: true,
    badge: "REGIONAL APAC HACKATHON WINNER",
    badgeColor: "gold",
    title: "2ND PLACE WINNER - SALES INTELLIGENCE",
    issuingBody: "Supervity AutoPilot Asia Hackathon 2026",
    period: "August 2026",
    statCallout: { value: "2nd", label: "Out of 55+ APAC Teams" },
    description:
      "Architected ZeroLag, an autonomous 5-agent sales intelligence command center. Outperformed over 55 enterprise and university teams across the Asia-Pacific region with sub-second lead scoring pipelines.",
    highlights: [
      "Built deterministic LangGraph state machine orchestrating 5 AI agent operators",
      "Awarded 2nd Place in the competitive Sales Intelligence Track",
      "Integrated real-time sentiment scoring with vectorized CRM dispatch"
    ],
    certificateUrl: "/certificates/Sales Intelligence Winner - 2nd Place.png",
    icon: Trophy,
  },
  {
    id: "game-jam",
    isFeatured: true,
    badge: "NATIONAL GAME JAM CHAMPION",
    badgeColor: "gold",
    title: "1ST PLACE (PUBLIC CHOICE AWARD)",
    issuingBody: "UM Game Jam 2026 (PEKOM)",
    period: "April 2026",
    statCallout: { value: "#1", label: "Public Choice Nationwide" },
    description:
      "Engineered 'The Goofy Experience'-a psychological comedy/horror game themed around 'Losing Control'. Implemented real-time UI hijacking and cursor manipulation mechanics with 100% custom audio.",
    highlights: [
      "Voted #1 Public Choice winner among 39 universities nationwide",
      "Engineered procedural UI hijacking & auditory disorientation systems"
    ],
    certificateUrl: "/certificates/UM GAME JAM 2026 HOWARD WOON HAO ZHE.png",
    icon: Trophy,
  },
  {
    id: "technothon",
    badge: "INNOVATION FINALIST",
    badgeColor: "gold",
    title: "TOP 15 FINALIST (INNOVATION TRACK)",
    issuingBody: "UM Technothon 2026",
    period: "May 2026",
    statCallout: { value: "Top 15", label: "Innovation Track Finalist" },
    description:
      "Engineered 'Sensor X Sensei', a smart lecture hall energy management IoT system. Utilized ESP32 microcontrollers and dynamic web dashboards to optimize university power grids.",
    highlights: [
      "Engineered low-power ESP32 + MQTT sensor fusion firmware",
      "Ranked Top 15 among national university teams"
    ],
    certificateUrl: "/certificates/UM TECHNOTHON 2026.pdf",
    icon: Trophy,
  },
  {
    id: "deans-list",
    badge: "ACADEMIC DISTINCTION",
    badgeColor: "emerald",
    title: "Dean's Honours List (4.00 CGPA)",
    issuingBody: "Faculty of Computer Science & IT, Universiti Malaya",
    period: "2025 - 2026",
    statCallout: { value: "Top 1%", label: "Academic Distinction" },
    description:
      "Maintained a 4.00 CGPA across software engineering, concurrent systems, data structures, algorithms, and distributed computing coursework.",
    highlights: [
      "Straight-A academic standing across all computer science semesters",
      "Recognized on the Faculty of Computer Science & IT Dean's List"
    ],
    icon: GraduationCap,
  },
  {
    id: "kmns-distinction",
    badge: "MATRICULATION DISTINCTION",
    badgeColor: "emerald",
    title: "Academic Excellence Award (4.00 CGPA)",
    issuingBody: "Kolej Matrikulasi Negeri Sembilan",
    period: "2024",
    statCallout: { value: "4.00", label: "Physical Sciences Cohort" },
    description:
      "Graduated top of cohort in Physical Sciences & Computer Science with straight-A distinctions and perfect 4.00 GPA.",
    highlights: [
      "Highest academic honor awarded to top matriculation scholars",
      "Appointed Assistant Head of Subject for Computer Science"
    ],
    icon: GraduationCap,
  },
  {
    id: "vhack",
    badge: "V HACK 2026 QUALIFIER",
    badgeColor: "cyan",
    title: "CASE STUDY 3: FIRST RESPONDER OF THE FUTURE",
    issuingBody: "Varsity Hackathon (V Hack) 2026",
    period: "2026",
    statCallout: { value: "Qual", label: "AI First Responder" },
    description:
      "Architected BILAHUJAN, a decentralised swarm intelligence platform for flood response. Fused Gemini 2.5 Flash image triage with an MCP-orchestrated command agent.",
    highlights: [
      "Engineered decentralised swarm architecture with real-time Firebase syncing",
      "Qualified in the Preliminary Round via the Case Study 3 track"
    ],
    certificateUrl: "/certificates/V HACK 2026 QUALIFIER_HOWARD WOON HAO ZHE.pdf",
    icon: Shield,
  },
  {
    id: "umsic",
    badge: "COMPETITION PARTICIPANT",
    badgeColor: "cyan",
    title: "UMSIC 2025 PARTICIPANT",
    issuingBody: "Persatuan Komputer Universiti Malaya (PEKOM)",
    period: "December 2025",
    statCallout: { value: "1st Yr", label: "Initiation Competition" },
    description:
      "Participated in the Universiti Malaya Student Initiation Competition (UMSIC) 2025, engaging in technical challenges organized by PEKOM.",
    highlights: [
      "Collaborated in foundational software engineering problem-solving"
    ],
    certificateUrl: "/certificates/UMSIC.png",
    icon: Shield,
  }
];

export default function HonorsSection() {
  const [selectedCert, setSelectedCert] = useState<string | null>(null);

  


  const badgeColorMap = {
    gold: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    cyan: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    purple: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  };

  return (
    <section 
      id="honors" 
      className="relative w-full bg-[#090B10] text-white py-32 px-6 sm:px-10 lg:px-16 overflow-hidden border-t border-white/10 selection:bg-amber-500 selection:text-black"
    >
      
      

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
            <span>HONORS // ACADEMIC & COMPETITION DISTINCTIONS</span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-3xl leading-[1.05]"
            >
              HONORS & COMPETITIVE ACHIEVEMENTS.
            </motion.h2>

            <p className="text-neutral-400 text-sm font-mono max-w-md">
              A curated log of regional hackathon podiums, 4.00 CGPA academic distinctions, and engineering competition finals.
            </p>
          </div>
        </div>

        {/* High-Prestige Bento Grid (Categorized Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { key: "gold", items: honorsList.filter(i => i.badgeColor === "gold") },
            { key: "emerald", items: honorsList.filter(i => i.badgeColor === "emerald") },
            { key: "cyan", items: honorsList.filter(i => i.badgeColor === "cyan") }
          ].map((column, colIdx) => (
            <div key={column.key} className="flex flex-col gap-6">
              {column.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isFeatured = item.isFeatured;

                const badgeStyles = {
                  gold: "bg-amber-500/10 border-amber-500/30 text-amber-300",
                  cyan: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
                  emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
                  purple: "bg-purple-500/10 border-purple-500/30 text-purple-300",
                };

                const glowStyles = {
                  gold: "bg-amber-500/5 group-hover:bg-amber-500/10",
                  cyan: "bg-cyan-500/5 group-hover:bg-cyan-500/10",
                  emerald: "bg-emerald-500/5 group-hover:bg-emerald-500/10",
                  purple: "bg-purple-500/5 group-hover:bg-purple-500/10",
                };

                // Calculate global index for staggered animation
                const globalIdx = (colIdx * 3) + itemIdx;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: globalIdx * 0.1 }}
                    className={`relative group rounded-[32px] p-6 sm:p-8 border border-white/10 bg-[#0E121B]/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full ${
                      isFeatured ? "hover:border-amber-400/40" : "hover:border-white/20"
                    }`}
                  >
                    {/* Background Ambient Glow */}
                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-colors ${glowStyles[item.badgeColor]}`} />

                    {/* Featured Watermark */}
                    {isFeatured && (
                      <div className="absolute -right-8 -top-8 opacity-[0.03] pointer-events-none rotate-12 group-hover:rotate-6 transition-transform duration-700 group-hover:opacity-[0.05]">
                        <Trophy className="w-64 h-64" />
                      </div>
                    )}

                    <div className="relative z-10 flex flex-col flex-1">
                      {/* Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] sm:text-xs font-mono tracking-widest uppercase ${badgeStyles[item.badgeColor]}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.badge}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{item.period}</span>
                        </div>
                      </div>

                      {/* Title & Body */}
                      <div className="space-y-2 mb-4">
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white group-hover:text-white/90 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm font-mono text-neutral-400">
                          {item.issuingBody}
                        </p>
                      </div>

                      <p className="text-sm text-neutral-300 leading-relaxed font-sans mb-6">
                        {item.description}
                      </p>

                      <div className="space-y-2.5 mb-8">
                        {item.highlights.map((hl, hlIdx) => (
                          <div key={hlIdx} className="flex items-start gap-2.5 text-xs text-neutral-400 font-sans">
                            <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                              <CheckCircle2 className="w-2.5 h-2.5 text-neutral-500" />
                            </div>
                            <p>{hl}</p>
                          </div>
                        ))}
                      </div>

                      {/* Spacer to push metrics to bottom */}
                      <div className="flex-1" />

                      {/* Footer: Stat Callout & Certificate Link */}
                      <div className="mt-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        
                        {/* Big Stat Callout */}
                        <div className="flex flex-col">
                          <span className="text-3xl font-black text-white tracking-tighter">
                            {item.statCallout.value}
                          </span>
                          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest mt-1">
                            {item.statCallout.label}
                          </span>
                        </div>

                        {/* Certificate Action Link */}
                        {item.certificateUrl && (
                          <button
                            onClick={() => setSelectedCert(item.certificateUrl!)}
                            className={`group/btn flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
                              item.badgeColor === 'gold' ? 'text-amber-400 hover:text-amber-300' :
                              item.badgeColor === 'cyan' ? 'text-cyan-400 hover:text-cyan-300' :
                              'text-emerald-400 hover:text-emerald-300'
                            }`}
                          >
                            <span className="relative">
                              VIEW CERTIFICATE
                              <span className="absolute left-0 right-0 -bottom-1 h-px bg-current scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-300" />
                            </span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                          </button>
                        )}
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Certificate Preview Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedCert(null)}
          >
            <div className="absolute top-6 right-6">
              <button
                onClick={() => setSelectedCert(null)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl aspect-auto max-h-[85vh] bg-[#0E121B] rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex items-center justify-center"
            >
              {selectedCert.endsWith(".pdf") ? (
                <iframe
                  src={`${selectedCert}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-[85vh] border-0"
                  title="Certificate Preview"
                />
              ) : (
                <img
                  src={selectedCert}
                  alt="Certificate"
                  className="w-full h-full object-contain"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}