"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Landmark, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight,
  Filter
} from "lucide-react";

type FilterCategory = "all" | "corporate" | "leadership" | "academic";

interface ExperienceItem {
  id: string;
  number: string;
  category: FilterCategory;
  categoryLabel: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  icon: typeof Building2;
  accentColor: "amber" | "cyan" | "emerald" | "purple";
  headline: string;
  bullets: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
}

const experiences: ExperienceItem[] = [
  {
    id: "kraiburg",
    number: "01",
    category: "corporate",
    categoryLabel: "CORPORATE AUTOMATION",
    role: "Assistant Finance Executive & Intern",
    organization: "KRAIBURG TPE Technology (M) Sdn. Bhd.",
    location: "Kuala Lumpur, Malaysia",
    period: "Nov 2025 – Present",
    icon: Building2,
    accentColor: "amber",
    headline: "Automated Enterprise Ledger Reconciliation & ERP Workflows",
    bullets: [
      "Engineered automated Python reconciliation pipelines for high-volume corporate financial ledgers, eliminating manual data entry bottlenecks.",
      "Managed vendor disbursements, statutory compliance, and corporate SAP/ERP ledger workflows with strict fault tolerance.",
      "Conducted financial variance analysis to optimize cross-departmental operational expenditure.",
    ],
    metrics: [
      { label: "Audit Accuracy", value: "100% Balanced" },
      { label: "Pipeline Stack", value: "Python + ERP" },
      { label: "Efficiency Gain", value: "Zero Data Bottlenecks" },
    ],
    tags: ["Process Automation", "ERP Integration", "Financial Data Pipelines", "Statutory Compliance"],
  },
    {
      id: "pekom",
      number: "02",
      category: "leadership",
      categoryLabel: "INSTITUTIONAL LEADERSHIP",
      role: "Finance Lead & Executive Treasurer",
      organization: "Persatuan Komputer Universiti Malaya (PEKOM)",
      location: "Universiti Malaya",
      period: "2025 - Present",
      icon: Landmark,
      accentColor: "cyan",
      headline: "Led the financial architecture and resource management for Universiti Malaya's flagship technology community, driving the annual fiscal strategy to sustain student-led tech initiatives, hackathons, and professional development programs throughout the academic year.",
      bullets: [
        "Portfolio Management: Architected and oversaw the organization's comprehensive financial portfolio, utilizing strict data verification protocols to ensure 100% ledger accuracy and zero transaction discrepancies across all club operations.",
        "B2B Corporate Partnerships: Partnered cross-functionally with the Sponsorship and PR departments to secure critical funding from enterprise tech sponsors, utilizing data-driven budget models to maximize student value and operational scale.",
        "Process Automation: Spearheaded the transition from manual accounting to an automated digital claims pipeline, eliminating paperwork bottlenecks and scaling the committee's operational efficiency.",
        "Financial Governance: Enforced strict budget allocation frameworks to minimize administrative overhead, successfully delivering consistent net surpluses to fund future software engineering workshops and tech community initiatives."
      ],
      metrics: [
        { label: "Budget Oversight", value: "RM 50,000+" },
        { label: "Participant Reach", value: "500+ Engineers" },
        { label: "Governance", value: "100% Audit Cleared" },
      ],
      tags: ["Fiscal Governance", "Budget Modeling", "Capital Allocation", "Leadership"],
    },
  {
    id: "mytech",
    number: "03",
    category: "leadership",
    categoryLabel: "INSTITUTIONAL LEADERSHIP",
    role: "Treasurer & Operations Lead",
    organization: "MYTECH Career Fair 2026",
    location: "Universiti Malaya",
    period: "Feb 2026",
    icon: Briefcase,
    accentColor: "emerald",
    headline: "Corporate Sponsorship Modeling & Treasury Architecture",
    bullets: [
      "Structured tiered enterprise sponsorship models, invoicing pipelines, and payment verification for Malaysia's premier tech career fair.",
      "Managed operational expenditure, logistics procurement, and complete audit documentation.",
    ],
    metrics: [
      { label: "Corporate Partners", value: "30+ Tech Firms" },
      { label: "Treasury Status", value: "Audited & Balanced" },
      { label: "Scale", value: "Premier Tech Fair" },
    ],
    tags: ["Corporate Sponsorship", "Operations Execution", "Treasury Auditing"],
  },
  {
    id: "kmns",
    number: "04",
    category: "academic",
    categoryLabel: "ACADEMIC MENTORSHIP",
    role: "Assistant Head of Subject (Computer Science)",
    organization: "KMNS PAL Leader Club",
    location: "Kolej Matrikulasi Negeri Sembilan",
    period: "2024",
    icon: GraduationCap,
    accentColor: "purple",
    headline: "Algorithmic Problem Solving & Object-Oriented Tutoring",
    bullets: [
      "Conducted structured tutorials in Data Structures, Algorithms, and Object-Oriented Programming (Java/Python) for matriculation cohorts.",
      "Mentored 100+ students, resulting in top cohort distinctions in physical sciences and computer science.",
    ],
    metrics: [
      { label: "Distinction Rate", value: "90%+ Top Grades" },
      { label: "Students Mentored", value: "100+ Cohort" },
      { label: "Curriculum", value: "Java & Python OOP" },
    ],
    tags: ["DSA Coaching", "OOP Paradigms", "Python / Java", "Academic Mentorship"],
  },
];

export default function ExperienceSection() {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");

  const filteredExperiences = experiences.filter(
    (exp) => selectedFilter === "all" || exp.category === selectedFilter
  );

  return (
    <section 
      id="experience" 
      className="relative w-full bg-[#090B10] text-white py-32 px-6 sm:px-10 lg:px-16 overflow-hidden border-t border-white/10 selection:bg-amber-500 selection:text-black"
    >
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-mono text-amber-300 tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>EXPERIENCE // CAREER & INSTITUTIONAL GOVERNANCE</span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-3xl leading-[1.05]"
            >
              EXECUTIVE LEADERSHIP & GOVERNANCE.
            </motion.h2>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-md">
              {[
                { id: "all", label: "ALL" },
                { id: "corporate", label: "CORPORATE" },
                { id: "leadership", label: "LEADERSHIP" },
                { id: "academic", label: "MENTORSHIP" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id as FilterCategory)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
                    selectedFilter === f.id
                      ? "bg-amber-400 text-black shadow-lg shadow-amber-500/20"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Timeline Spine & Bento Experience Cards */}
        <div className="relative space-y-8">
          
          <AnimatePresence mode="wait">
            {filteredExperiences.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative group rounded-[32px] p-8 sm:p-10 border border-white/10 bg-[#0E121B]/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:border-amber-400/40 hover:-translate-y-1"
                >
                  {/* Top Bar: Number + Category Tag + Period */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-white/10 text-white font-mono text-xs font-bold flex items-center justify-center border border-white/15">
                        {item.number}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase">
                        {item.categoryLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.period}</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 text-neutral-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Role & Organization Title */}
                  <div className="pt-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white flex items-center gap-2.5">
                        {item.role}
                        <ArrowUpRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <div className="text-sm font-mono text-neutral-300 font-bold">
                        {item.organization}
                      </div>
                    </div>

                    <p className="text-xs font-mono text-amber-400 font-medium tracking-wide">
                      // {item.headline}
                    </p>
                  </div>

                  {/* Narrative Bullets */}
                  <div className="py-4 space-y-2.5">
                    {item.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-3 text-xs sm:text-sm font-sans text-neutral-300 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quantified Metrics Ribbon */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
                    {item.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="bg-black/40 border border-white/5 rounded-2xl p-3.5">
                        <div className="text-[10px] font-mono text-neutral-400 uppercase">
                          {m.label}
                        </div>
                        <div className="text-sm font-mono font-bold text-white mt-1">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tag Badges */}
                  <div className="flex flex-wrap gap-2 pt-5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-neutral-300 hover:text-white transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}