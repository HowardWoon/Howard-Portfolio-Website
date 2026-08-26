"use client";

import React, { useState } from "react";
import { FieldArchive } from "./field-archive";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCounter } from "./animated-counter";
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
      categoryLabel: "CORPORATE FINANCE",
      role: "Assistant Finance Executive & Intern",
      organization: "KRAIBURG TPE Technology (M) Sdn. Bhd.",
      location: "Kuala Lumpur, Malaysia",
      period: "Nov 2025 - Present",
      icon: Building2,
      accentColor: "amber",
      headline: "Enterprise SAP Financial Operations & Statutory Compliance",
      bullets: [
        "Executed full-cycle Accounts Payable (AP) and Accounts Receivable (AR) operations within the SAP ERP environment, managing high-volume invoice clearing and ledger reconciliations.",
        "Spearheaded vendor and customer master data migrations in SAP to ensure strict compliance with federal E-Invoice regulatory standards and data accuracy protocols.",
        "Compiled and audited statutory financial records, including LMW (Licensed Manufacturing Warehouse) listings and customer tax exemptions to support rigorous SST submissions.",
      ],
      metrics: [
        { label: "Enterprise Stack", value: "SAP ERP" },
        { label: "Regulatory Compliance", value: "100% SST Cleared" },
        { label: "Ledger Accuracy", value: "Zero Discrepancies" },
      ],
      tags: ["SAP ERP Operations", "E-Invoice Compliance", "Ledger Reconciliation", "Statutory Auditing"],
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
    location: "Kolej Matrikulasi Negeri Sembilan (Negeri Sembilan Matriculation College)",
    period: "2024",
    icon: GraduationCap,
    accentColor: "purple",
    headline: "Algorithmic Problem Solving & Object-Oriented Tutoring",
    bullets: [
      "Peer-Assisted Learning (PAL) Facilitation: Conducted interactive, student-led tutorials in Data Structures, Algorithms, and Object-Oriented Programming (Java/Python) to reinforce key concepts for matriculation cohorts.",
        "Academic Mentorship & Concept Reinforcement: Mentored 100+ students by breaking down complex theoretical course materials and building effective study strategies, resulting in top cohort distinctions.",
        "Faculty Collaboration & Community Building: Worked closely with academic coordinators and subject lecturers to foster a welcoming, anxiety-reducing learning environment that built academic confidence for incoming students.",
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
        desc: (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col gap-1">
              <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest">Duration</div>
              <div className="text-neutral-400 font-mono text-xs">February – June 2026</div>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-white font-bold text-sm uppercase tracking-wide border-b border-amber-500/20 pb-1.5">Executive Summary</h5>
              <p className="text-neutral-300">
                Directed financial planning, budget execution, and reporting for the MYTECH Career Fair 2026. Managed an unprecedented RM50,200 budget and implemented strict financial governance, successfully securing 30 corporate sponsors and RM46,200 in revenue. By enforcing an 81.5% spending cap, the event generated a record-breaking RM9,272.90 pure surplus for Persatuan Komputer Universiti Malaya (PEKOM).
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-white font-bold text-sm uppercase tracking-wide border-b border-amber-500/20 pb-1.5">Key Achievements & Metrics</h5>
              <ul className="space-y-2 text-neutral-300 list-disc list-outside ml-4">
                <li><strong className="text-amber-400 font-medium">Budget Oversight:</strong> Managed an unprecedented total budget of RM50,200.</li>
                <li><strong className="text-amber-400 font-medium">Revenue Generation:</strong> Secured RM46,200 in revenue through 30 corporate sponsorships (including partners like Garmin).</li>
                <li><strong className="text-amber-400 font-medium">Cost Control:</strong> Successfully enforced an 81.5% spending cap across all event operations.</li>
                <li><strong className="text-amber-400 font-medium">Profitability:</strong> Generated a record-breaking RM9,272.90 pure surplus for PEKOM.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="text-white font-bold text-sm uppercase tracking-wide border-b border-amber-500/20 pb-1.5">Financial Governance & Operations</h5>
              <ul className="space-y-2 text-neutral-300 list-disc list-outside ml-4">
                <li><strong className="text-amber-400 font-medium">Financial Compliance:</strong> Managed tax compliance for a student-led initiative, handling declarations of exemption for e-invoice issuance.</li>
                <li><strong className="text-amber-400 font-medium">Ledger Management:</strong> Established and maintained a comprehensive master ledger to track all expenditures, internal budgets, and receipts.</li>
                <li><strong className="text-amber-400 font-medium">Sponsor Relations:</strong> Coordinated settlement details with corporate sponsors, managed vendor data requests, and established specific payment guidelines and verification requirements to ensure smooth transactions.</li>
                <li><strong className="text-amber-400 font-medium">Committee Coordination:</strong> Directed financial planning and executed budget strategies across committee meetings to ensure all departments operated within their allocated funds.</li>
                </ul>
              </div>
              <FieldArchive archiveId="mytech" />
            </div>
          )
        },
          {
        id: "alphathon",
        name: "Treasurer | UM Alphathon 2025",
        desc: (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col gap-1">
              <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest">Duration</div>
              <div className="text-neutral-400 font-mono text-xs">2025</div>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-white font-bold text-sm uppercase tracking-wide border-b border-amber-500/20 pb-1.5">Executive Summary</h5>
              <p className="text-neutral-300">
                Directed the financial operations and budget allocations for UM Alphathon 2025, a competitive event featuring a Quantitative Finance Workshop and a major prize pool funded entirely by international partner WorldQuant. Oversaw comprehensive expenditure tracking of a RM14,150 (USD 3,369) budget, committee reimbursements, and ledger maintenance to ensure strict financial compliance and seamless event execution.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-white font-bold text-sm uppercase tracking-wide border-b border-amber-500/20 pb-1.5">Key Achievements & Metrics</h5>
              <ul className="space-y-2 text-neutral-300 list-disc list-outside ml-4">
                <li><strong className="text-amber-400 font-medium">Prize Pool Administration:</strong> Facilitated the financial oversight and planning surrounding a substantial USD 3,000 total prize pool for event participants, successfully distributing 89.2% of all funds directly into the student prize pool.</li>
                <li><strong className="text-amber-400 font-medium">Budget Oversight:</strong> Managed shared operational costs in conjunction with PEKOM CodeFest, tracking a combined expenditure of RM1,531.77 across both events and achieving an exceptional 99.87% budget accuracy rating.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="text-white font-bold text-sm uppercase tracking-wide border-b border-amber-500/20 pb-1.5">Financial Governance & Operations</h5>
              <ul className="space-y-2 text-neutral-300 list-disc list-outside ml-4">
                <li><strong className="text-amber-400 font-medium">Expense Management:</strong> Processed and documented committee expenditures, including large-scale logistics and hospitality allocations (such as RM443.55 for committee meals), as well as printing and refreshments.</li>
                <li><strong className="text-amber-400 font-medium">Ledger Maintenance:</strong> Maintained a highly detailed master ledger to record all transaction histories, ensuring complete transparency for audit and review purposes.</li>
                <li><strong className="text-amber-400 font-medium">Financial Reporting:</strong> Reviewed and finalized the "UM Alphathon 2025 Financial Implication" document to establish clear budgetary baselines and reporting standards for the organizing committee.</li>
              </ul>
            </div>
          </div>
        )
      },
          {
        id: "codefest",
        name: "Treasurer | PEKOM CodeFest 2025",
        desc: (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col gap-1">
              <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest">Duration</div>
              <div className="text-neutral-400 font-mono text-xs">2025</div>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-white font-bold text-sm uppercase tracking-wide border-b border-amber-500/20 pb-1.5">Executive Summary</h5>
              <p className="text-neutral-300">
                Directed the financial operations and budget management for PEKOM CodeFest (in conjunction with UM Alphathon 2025). Balanced a RM2,700 operational fund and oversaw all event-related expenses, achieving 100% financial reconciliation with zero deficit while ensuring streamlined reimbursement processes for the organizing committee.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-white font-bold text-sm uppercase tracking-wide border-b border-amber-500/20 pb-1.5">Key Responsibilities & Achievements</h5>
              <ul className="space-y-2 text-neutral-300 list-disc list-outside ml-4">
                <li><strong className="text-amber-400 font-medium">Budget Management & Optimization:</strong> Managed total event expenditures amounting to RM1,531.77, optimizing operational overhead to ensure exactly 66.7% of the budget was paid out as direct cash rewards to participants.</li>
                <li><strong className="text-amber-400 font-medium">Expense Tracking:</strong> Monitored operational costs across multiple categories, including roll-up bunting, certificate printing, meals, and transportation.</li>
                <li><strong className="text-amber-400 font-medium">Financial Documentation:</strong> Developed and maintained a master reimbursement spreadsheet to compile all costs, ensuring absolute transparency and efficient financial settlement.</li>
              </ul>
            </div>
          </div>
        )
      },
                {
        id: "mhw",
        name: "Treasurer | Mental Health Week & Share Your Love",
        desc: (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col gap-1">
              <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest">Duration</div>
              <div className="text-neutral-400 font-mono text-xs">September 2025 – June 2026</div>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-white font-bold text-sm uppercase tracking-wide border-b border-amber-500/20 pb-1.5">Executive Summary</h5>
              <p className="text-neutral-300">
                Directed the financial operations and budget allocations for Mental Health Week 2025 and its associated "Share Your Love" outreach initiative. Established rigorous treasury protocols to maintain accurate transaction histories, directing a RM5,830 multi-event fund to ensure complete transparency and accountability across all organizing committees.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-white font-bold text-sm uppercase tracking-wide border-b border-amber-500/20 pb-1.5">Key Responsibilities & Governance</h5>
              <ul className="space-y-2 text-neutral-300 list-disc list-outside ml-4">
                <li><strong className="text-amber-400 font-medium">Budget Allocation:</strong> Managed and distributed event funding across various outreach activities, outperforming merchandise sales targets to secure a RM346 surplus.</li>
                <li><strong className="text-amber-400 font-medium">Charity Execution:</strong> Executed the charity outreach effectively at RM11.68/pax, responsibly adjusting donations to match actual available funds.</li>
                <li><strong className="text-amber-400 font-medium">Audit Compliance:</strong> Enforced strict documentation policies, verifying that every receipt was properly accounted for to maintain a 100%-reconciled budget.</li>
                <li><strong className="text-amber-400 font-medium">Reporting Standards:</strong> Standardized the financial report formats used by the committee to maintain transparency and streamline the final administrative review process.</li>
                <li><strong className="text-amber-400 font-medium">Reimbursement Policy Management:</strong> Administered transport reimbursement guidelines for event planning, deliberately excluding the 20% penalty deduction clause to ensure fair and complete compensation for committee members' travel expenses.</li>
              </ul>
            </div>
          </div>
        )
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

  const shadowMap: Record<string, string> = {
    'bg-white': 'shadow-white/40',
    'bg-amber-400': 'shadow-amber-400/40',
    'bg-cyan-400': 'shadow-cyan-400/40',
    'bg-emerald-400': 'shadow-emerald-400/40'
  };

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
                  <span className={`w-2 h-2 rounded-full shadow-lg ${f.dotClass} ${isActive ? shadowMap[f.dotClass] + ' opacity-100' : 'opacity-40'}`} />
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

                    <div className="flex items-center gap-5 text-sm font-mono font-bold text-neutral-300 tracking-wide">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span>{item.period}</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-neutral-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-neutral-300">{item.location}</span>
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
