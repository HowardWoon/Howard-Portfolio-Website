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
  Sparkles,
  ArrowUpRight,
  Wallet,
  BarChart3,
  Receipt,
  ChevronDown,
  ChevronUp
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
    id: "kmns",
    number: "03",
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


function PekomTreasurerDashboard() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const stats = [
    { label: "Total Funds", value: "RM 72,880+", icon: Wallet },
    { label: "Sponsorships", value: "RM 62,550", icon: BarChart3 },
    { label: "Net Surplus", value: "RM 9,619+", icon: TrendingUp },
    { label: "Leverage Ratio", value: "16.46x", icon: Receipt },
  ];

  const events = [
    {
      id: "mytech",
      name: "Treasurer | MYTECH Career Fair 2026",
      desc: "Managed an unprecedented RM50,200 budget, securing 30 corporate sponsors and RM46,200 in revenue. Enforced an 81.5% spending cap to generate a record-breaking RM9,272.90 pure surplus for PEKOM."
    },
    {
      id: "alphathon",
      name: "Treasurer | UM Alphathon 2025",
      desc: "Orchestrated a RM14,150 (USD 3,369) budget funded entirely by international partner WorldQuant. Achieved 99.87% budget accuracy, distributing 89.2% of all funds directly into the student prize pool."
    },
    {
      id: "codefest",
      name: "Treasurer | PEKOM CodeFest 2025",
      desc: "Balanced a RM2,700 operational fund, achieving 100% financial reconciliation with zero deficit. Optimized operational overhead to ensure exactly 66.7% of the budget was paid out as direct cash rewards."
    },
    {
      id: "mhw",
      name: "Treasurer | Mental Health Week 2025",
      desc: "Directed a RM5,830 multi-event fund, outperforming merchandise sales targets to secure a RM346 surplus. Executed charity outreach at RM11.68/pax, maintaining a 100%-reconciled budget."
    }
  ];

  return (
    <div className="mt-6 p-1 bg-amber-500/10 rounded-3xl border border-amber-500/20 shadow-inner overflow-hidden">
      <div className="bg-[#090B10] rounded-[22px] p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
          <h4 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-widest">Treasurer Event Portfolio [4]</h4>
        </div>
        
        {/* KPI Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-start p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <stat.icon className="w-4 h-4 text-amber-500/70 mb-2" />
              <div className="text-[10px] font-mono text-neutral-400 uppercase">{stat.label}</div>
              <div className="text-xs sm:text-sm font-bold text-white tracking-wide mt-1">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Interactive Event Accordion */}
        <div className="space-y-3">
          {events.map((event) => {
            const isExpanded = expandedEvent === event.id;
            return (
              <div 
                key={event.id}
                onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                className={`relative overflow-hidden cursor-pointer rounded-xl border transition-all duration-300 ${isExpanded ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.02] border-white/10 hover:border-amber-500/50 hover:bg-white/[0.04]'}`}
              >
                <div className="p-4 flex items-center justify-between">
                  <span className={`font-mono text-xs sm:text-sm font-bold tracking-wide ${isExpanded ? 'text-amber-400' : 'text-neutral-300'}`}>
                    {event.name}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  )}
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4"
                    >
                      <div className="pt-2 border-t border-amber-500/20 text-xs sm:text-sm font-sans text-neutral-300 leading-relaxed">
                        {event.desc}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ExperienceSection() {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");

  const filteredExperiences = experiences.filter(
    (exp) => selectedFilter === "all" || exp.category === selectedFilter
  );

  const filters: { id: FilterCategory; label: string; colorClass: string; dotClass: string }[] = [
    { id: "all", label: "ALL", colorClass: "text-white", dotClass: "bg-white" },
    { id: "corporate", label: "CORPORATE", colorClass: "text-amber-400", dotClass: "bg-amber-400" },
    { id: "leadership", label: "LEADERSHIP", colorClass: "text-cyan-400", dotClass: "bg-cyan-400" },
    { id: "academic", label: "MENTORSHIP", colorClass: "text-emerald-400", dotClass: "bg-emerald-400" },
  ];

  return (
    <section 
      id="experience" 
      className="relative w-full bg-[#090B10] text-white py-32 px-6 sm:px-10 lg:px-16 overflow-hidden border-t border-white/10 selection:bg-amber-500 selection:text-black"
    >
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12">
        
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

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-3xl leading-[1.05]"
          >
            EXECUTIVE LEADERSHIP & GOVERNANCE.
          </motion.h2>
        </div>

        {/* iOS-Style Segmented Filter Control */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-md w-fit"
        >
          {filters.map((f) => {
            const count = f.id === "all" ? experiences.length : experiences.filter(e => e.category === f.id).length;
            const isActive = selectedFilter === f.id;
            
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 ${
                  isActive ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-filter-pill"
                    className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full shadow-lg ${f.dotClass} ${isActive ? 'shadow-' + f.dotClass.replace('bg-', '') + '/40 opacity-100' : 'opacity-40'}`} />
                  {f.label}
                  <span className={`text-[10px] ${isActive ? "text-neutral-400" : "text-neutral-600"}`}>({count})</span>
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Interactive Timeline Spine & Bento Experience Cards */}
        <div className="relative space-y-8 min-h-[500px]">
          <AnimatePresence mode="popLayout">
            {filteredExperiences.map((item, idx) => {
              // Map the accent color string to actual Tailwind classes
              let badgeColor = "bg-amber-500/10 border-amber-500/30 text-amber-300";
              let dotColor = "bg-amber-400";
              if (item.accentColor === "cyan") {
                badgeColor = "bg-cyan-500/10 border-cyan-500/30 text-cyan-300";
                dotColor = "bg-cyan-400";
              } else if (item.accentColor === "emerald") {
                badgeColor = "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
                dotColor = "bg-emerald-400";
              } else if (item.accentColor === "purple") {
                badgeColor = "bg-purple-500/10 border-purple-500/30 text-purple-300";
                dotColor = "bg-purple-400";
              }

              return (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                  className="relative group rounded-[32px] p-8 sm:p-10 border border-white/10 bg-[#0E121B]/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:border-white/20 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Color Coding Left Border/Dot */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${dotColor} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />

                  {/* Top Bar: Number + Category Tag + Period */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-white/10 text-white font-mono text-xs font-bold flex items-center justify-center border border-white/15">
                        {item.number}
                      </span>
                      <span className={`px-3 py-1 rounded-full border text-xs font-mono tracking-widest uppercase ${badgeColor}`}>
                        {item.categoryLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{item.period}</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 text-neutral-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Role & Org */}
                  <div className="pt-6 pb-6">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors duration-300">
                          {item.role}
                        </h3>
                        <p className="text-sm font-mono text-amber-500/80 uppercase tracking-widest">
                          // {item.headline}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                        <item.icon className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm font-bold font-sans text-neutral-200">
                          {item.organization}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description Bullets */}
                  <div className="space-y-3 mb-8">
                    {item.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-3 text-sm text-neutral-300 leading-relaxed font-sans max-w-4xl">
                        <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
                          <CheckCircle2 className="w-3 h-3 text-amber-400" />
                        </div>
                        <p>{bullet}</p>
                      </div>
                    ))}
                  </div>

                  {/* Metrics & Impact Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                    {item.metrics.map((metric, mIdx) => (
                      <div key={mIdx} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">{metric.label}</span>
                        <span className="text-lg font-bold text-white tracking-tight">{metric.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Skills/Tags */}
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Specialized Dashboards */}
                  {item.id === "pekom" && <PekomTreasurerDashboard />}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
