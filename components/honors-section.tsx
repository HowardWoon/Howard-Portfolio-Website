"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
   
  Trophy, 
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
  rankMetric: string;
  description: string;
  highlights: string[];
  certificateUrl?: string;
  icon: typeof Trophy;
}

const honorsList: HonorItem[] = [
  {
    id: "supervity",
    isFeatured: true,
    badge: "REGIONAL APAC HACKATHON WINNER",
    badgeColor: "gold",
    title: "2ND PLACE WINNER — SALES INTELLIGENCE",
    issuingBody: "Supervity AutoPilot Asia Hackathon 2026",
    period: "August 2026",
    rankMetric: "2nd / 50+ Regional APAC Teams",
    description:
      "Architected ZeroLag, an autonomous 5-agent sales intelligence command center. Outperformed over 50 enterprise and university teams across the Asia-Pacific region with sub-second lead scoring pipelines.",
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
    badge: "NATIONAL GAME JAM CHAMPION",
    badgeColor: "cyan",
    title: "1ST PLACE (PUBLIC CHOICE AWARD)",
    issuingBody: "UM Game Jam 2026 (PEKOM)",
    period: "April 2026",
    rankMetric: "Public Choice / 39 Universities Nationwide",
    description:
      "Engineered 'The Goofy Experience'—a psychological comedy/horror game themed around 'Losing Control'. Implemented real-time UI hijacking and cursor manipulation mechanics with 100% custom audio.",
    highlights: [
      "Voted #1 Public Choice winner among 39 universities nationwide",
      "Engineered procedural UI hijacking & auditory disorientation systems"
    ],
    certificateUrl: "/certificates/UM GAME JAM 2026 HOWARD WOON HAO ZHE.png",
    icon: Gamepad2,
  },
  {
    id: "technothon",
    badge: "INNOVATION FINALIST",
    badgeColor: "purple",
    title: "TOP 15 FINALIST (INNOVATION TRACK)",
    issuingBody: "UM Technothon 2026",
    period: "May 2026",
    rankMetric: "Status: Top 15 Finalist Nationwide",
    description:
      "Engineered 'Sensor X Sensei', a smart lecture hall energy management IoT system. Utilized ESP32 microcontrollers and dynamic web dashboards to optimize university power grids.",
    highlights: [
      "Engineered low-power ESP32 + MQTT sensor fusion firmware",
      "Ranked Top 15 among national university teams"
    ],
    certificateUrl: "/certificates/UM TECHNOTHON 2026.pdf",
    icon: Zap,
  },
  {
    id: "deans-list",
    badge: "ACADEMIC DISTINCTION",
    badgeColor: "emerald",
    title: "Dean's Honours List (4.00 CGPA)",
    issuingBody: "Faculty of Computer Science & IT, Universiti Malaya",
    period: "2025 - 2026",
    rankMetric: "Top 1% Academic Distinction",
    description:
      "Maintained a 4.00 CGPA across software engineering, concurrent systems, data structures, algorithms, and distributed computing coursework.",
    highlights: [
      "Straight-A academic standing across all computer science semesters",
      "Recognized on the Faculty of Computer Science & IT Dean's List"
    ],
    icon: GraduationCap,
  },
  {
    id: "vhack",
    badge: "CYBERSECURITY QUALIFIER",
    badgeColor: "cyan",
    title: "PRELIMINARY ROUND QUALIFIER",
    issuingBody: "Varsity Hackathon (V Hack) 2026",
    period: "2026",
    rankMetric: "National Cybersecurity Qualifier",
    description:
      "Competed in the V Hack 2026 Preliminary Round, demonstrating proficiency in cybersecurity challenges and secure systems engineering.",
    highlights: [
      "Participated in national-level cybersecurity technical challenges"
    ],
    certificateUrl: "/certificates/V HACK 2026 QUALIFIER_HOWARD WOON HAO ZHE.pdf",
    icon: Sparkles,
  },
  {
    id: "kmns-distinction",
    badge: "MATRICULATION DISTINCTION",
    badgeColor: "gold",
    title: "Academic Excellence Award (4.00 CGPA)",
    issuingBody: "Kolej Matrikulasi Negeri Sembilan",
    period: "2024",
    rankMetric: "Top of Cohort - Physical Sciences",
    description:
      "Graduated top of cohort in Physical Sciences & Computer Science with straight-A distinctions and perfect 4.00 GPA.",
    highlights: [
      "Highest academic honor awarded to top matriculation scholars",
      "Appointed Assistant Head of Subject for Computer Science"
    ],
    icon: Medal,
  },
  {
    id: "umsic",
    badge: "COMPETITION PARTICIPANT",
    badgeColor: "emerald",
    title: "UMSIC 2025 PARTICIPANT",
    issuingBody: "Persatuan Komputer Universiti Malaya (PEKOM)",
    period: "December 2025",
    rankMetric: "Active Participant",
    description:
      "Participated in the Universiti Malaya Student Initiation Competition (UMSIC) 2025, engaging in technical challenges organized by PEKOM.",
    highlights: [
      "Engaged in faculty-level technical challenges"
    ],
    certificateUrl: "/certificates/UMSIC HOWARD_WOON_HAO_ZHE.pdf",
    icon: Medal,
  },
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

        {/* High-Prestige Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {honorsList.map((item, idx) => {
            const Icon = item.icon;
            const isFeatured = item.isFeatured;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative group rounded-[32px] p-8 border border-white/10 bg-[#0E121B]/95 backdrop-blur-2xl shadow-2xl flex flex-col justify-between space-y-6 transition-all duration-300 hover:border-amber-400/50 hover:-translate-y-1.5 ${
                  isFeatured ? "md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#121622] via-[#0E121B] to-[#0A0D14]" : ""
                }`}
              >
                {/* Top Card Bar: Badge + Period */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono tracking-wider border ${badgeColorMap[item.badgeColor]}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.badge}</span>
                  </span>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
                    <span>{item.period}</span>
                  </div>
                </div>

                {/* Title & Issuing Body */}
                <div className="space-y-2">
                  <h3 className={`font-extrabold uppercase tracking-tight text-white ${isFeatured ? "text-2xl sm:text-3xl" : "text-xl"}`}>
                    {item.title}
                  </h3>
                  <p className="text-xs font-mono text-amber-400 font-medium">
                    {item.issuingBody}
                  </p>
                  <p className="text-sm text-neutral-300 font-sans leading-relaxed pt-1">
                    {item.description}
                  </p>
                </div>

                {/* Key Technical Highlights */}
                {isFeatured && (
                  <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-white/5">
                    {item.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2.5 text-xs font-sans text-neutral-200">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Bar: Metric Badge + Certificate Preview Trigger */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs font-mono text-neutral-200 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{item.rankMetric}</span>
                  </div>

                  {item.certificateUrl && (
                    <button
                      onClick={() => setSelectedCert(item.certificateUrl || null)}
                      className="flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider transition-colors"
                    >
                      <span>VIEW CERTIFICATE</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Framer Motion Fixed Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl p-4 sm:p-8 flex items-center justify-center overflow-y-auto"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0 }}
              className="relative w-full max-w-4xl bg-[#0E121B] border border-white/20 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-mono text-neutral-300 uppercase tracking-widest">
                  OFFICIAL CREDENTIAL VERIFICATION
                </span>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
  
              <div className="relative w-full h-[65vh] mt-4 rounded-2xl overflow-hidden bg-black/50 flex items-center justify-center">
                {selectedCert.endsWith(".pdf") ? (
                  <iframe src={selectedCert} className="w-full h-full rounded-2xl" />
                ) : (
                  <Image
                    src={selectedCert}
                    alt="Verified Certificate"
                    fill
                    className="object-contain"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}