'use client';

import React, { useState } from 'react';
import { FieldArchive } from './field-archive';
import { TraceRail } from './fx/trace-rail';
import { SplitWords } from './fx/split-words';
import { m, AnimatePresence, LayoutGroup } from 'framer-motion';
import { FX, SPRING_STAMP } from '@/lib/fx';
import {
  Building2,
  Landmark,
  GraduationCap,
  Calendar,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Wallet,
  BarChart3,
  Receipt,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type FilterCategory = 'all' | 'corporate' | 'leadership' | 'academic';

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
  accentColor: 'amber' | 'cyan' | 'emerald' | 'purple';
  headline: string;
  bullets: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
}

const experiences: ExperienceItem[] = [
  {
    id: 'kraiburg',
    number: '01',
    category: 'corporate',
    categoryLabel: 'CORPORATE FINANCE',
    role: 'Assistant Finance Executive & Intern',
    organization: 'KRAIBURG TPE Technology (M) Sdn. Bhd.',
    location: 'Kuala Lumpur, Malaysia',
    period: 'Nov 2025 - Present',
    icon: Building2,
    accentColor: 'amber',
    headline: 'Enterprise SAP Financial Operations & Statutory Compliance',
    bullets: [
      'Executed full-cycle Accounts Payable (AP) and Accounts Receivable (AR) operations within the SAP ERP environment, managing high-volume invoice clearing and ledger reconciliations.',
      'Spearheaded vendor and customer master data migrations in SAP to ensure strict compliance with federal E-Invoice regulatory standards and data accuracy protocols.',
      'Compiled and audited statutory financial records, including LMW (Licensed Manufacturing Warehouse) listings and customer tax exemptions to support rigorous SST submissions.',
    ],
    metrics: [
      { label: 'Enterprise Stack', value: 'SAP ERP' },
      { label: 'Regulatory Compliance', value: '100% SST Cleared' },
      { label: 'Ledger Accuracy', value: 'Zero Discrepancies' },
    ],
    tags: ['SAP ERP Operations', 'E-Invoice Compliance', 'Ledger Reconciliation', 'Statutory Auditing'],
  },
  {
    id: 'pekom',
    number: '02',
    category: 'leadership',
    categoryLabel: 'INSTITUTIONAL LEADERSHIP',
    role: 'Finance Lead & Executive Treasurer',
    organization: 'Persatuan Komputer Universiti Malaya (PEKOM)',
    location: 'Universiti Malaya',
    period: '2025 - Present',
    icon: Landmark,
    accentColor: 'cyan',
    headline:
      "Led the financial architecture and resource management for Universiti Malaya's flagship technology community, driving the annual fiscal strategy to sustain student-led tech initiatives, hackathons, and professional development programs throughout the academic year.",
    bullets: [
      "Portfolio Management: Architected and oversaw the organization's comprehensive financial portfolio, utilizing strict data verification protocols to ensure 100% ledger accuracy and zero transaction discrepancies across all club operations.",
      'B2B Corporate Partnerships: Partnered cross-functionally with the Sponsorship and PR departments to secure critical funding from enterprise tech sponsors, utilizing data-driven budget models to maximize student value and operational scale.',
      "Process Automation: Spearheaded the transition from manual accounting to an automated digital claims pipeline, eliminating paperwork bottlenecks and scaling the committee's operational efficiency.",
      'Financial Governance: Enforced strict budget allocation frameworks to minimize administrative overhead, successfully delivering consistent net surpluses to fund future software engineering workshops and tech community initiatives.',
    ],
    metrics: [
      { label: 'Budget Oversight', value: 'RM 50,000+' },
      { label: 'Participant Reach', value: '500+ Engineers' },
      { label: 'Governance', value: '100% Audit Cleared' },
    ],
    tags: ['Fiscal Governance', 'Budget Modeling', 'Capital Allocation', 'Leadership'],
  },
  {
    id: 'kmns',
    number: '03',
    category: 'academic',
    categoryLabel: 'ACADEMIC MENTORSHIP',
    role: 'Assistant Head of Subject (Computer Science)',
    organization: 'KMNS PAL Leader Club',
    location: 'Kolej Matrikulasi Negeri Sembilan (Negeri Sembilan Matriculation College)',
    period: '2024',
    icon: GraduationCap,
    accentColor: 'purple',
    headline: 'Algorithmic Problem Solving & Object-Oriented Tutoring',
    bullets: [
      'Peer-Assisted Learning (PAL) Facilitation: Conducted interactive, student-led tutorials in Data Structures, Algorithms, and Object-Oriented Programming (Java/Python) to reinforce key concepts for matriculation cohorts.',
      'Academic Mentorship & Concept Reinforcement: Mentored 100+ students by breaking down complex theoretical course materials and building effective study strategies, resulting in top cohort distinctions.',
      'Faculty Collaboration & Community Building: Worked closely with academic coordinators and subject lecturers to foster a welcoming, anxiety-reducing learning environment that built academic confidence for incoming students.',
    ],
    metrics: [
      { label: 'Distinction Rate', value: '90%+ Top Grades' },
      { label: 'Students Mentored', value: '100+ Cohort' },
      { label: 'Curriculum', value: 'Java & Python OOP' },
    ],
    tags: ['DSA Coaching', 'OOP Paradigms', 'Python / Java', 'Academic Mentorship'],
  },
];

function PekomTreasurerDashboard() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const stats = [
    { label: 'Total Funds', value: 'RM 72,880+', icon: Wallet },
    { label: 'Sponsorships', value: 'RM 62,550', icon: BarChart3 },
    { label: 'Net Surplus', value: 'RM9,287.00', icon: TrendingUp },
    { label: 'Leverage Ratio', value: '16.46x', icon: Receipt },
  ];

  const events = [
    {
      id: 'mytech',
      name: 'Treasurer | MYTECH Career Fair 2026',
      desc: (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col gap-1">
            <div className="text-pop-blue font-mono text-xs font-extrabold uppercase tracking-[0.1em]">Duration</div>
            <div className="text-ink-soft font-mono text-xs font-semibold">February – June 2026</div>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Executive Summary
            </h5>
            <p className="text-ink-soft">
              Directed financial planning, budget execution, and reporting for the MYTECH Career Fair 2026. Managed an
              unprecedented RM50,200 budget and implemented strict financial governance, successfully securing 30
              corporate sponsors and RM46,200 in revenue. By enforcing an 79.9% spending cap, the event generated a
              record-breaking RM9,287.00 pure surplus for Persatuan Komputer Universiti Malaya (PEKOM).
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Key Achievements & Metrics
            </h5>
            <ul className="space-y-2 text-ink-soft list-disc list-outside ml-5 marker:text-ink">
              <li>
                <strong className="text-ink font-extrabold">Budget Oversight:</strong> Managed an unprecedented total
                budget of RM50,200.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Revenue Generation:</strong> Secured RM46,200 in revenue
                through 30 corporate sponsorships (including partners like Garmin).
              </li>
              <li>
                <strong className="text-ink font-extrabold">Cost Control:</strong> Successfully enforced an 81.5%
                spending cap across all event operations.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Profitability:</strong> Generated a record-breaking
                RM9,287.00 pure surplus for PEKOM.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Financial Governance & Operations
            </h5>
            <ul className="space-y-2 text-ink-soft list-disc list-outside ml-5 marker:text-ink">
              <li>
                <strong className="text-ink font-extrabold">Financial Compliance:</strong> Managed tax compliance for a
                student-led initiative, handling declarations of exemption for e-invoice issuance.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Ledger Management:</strong> Established and maintained a
                comprehensive master ledger to track all expenditures, internal budgets, and receipts.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Sponsor Relations:</strong> Coordinated settlement details
                with corporate sponsors, managed vendor data requests, and established specific payment guidelines and
                verification requirements to ensure smooth transactions.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Committee Coordination:</strong> Directed financial planning
                and executed budget strategies across committee meetings to ensure all departments operated within their
                allocated funds.
              </li>
            </ul>
          </div>
          <FieldArchive archiveId="mytech" />
        </div>
      ),
    },
    {
      id: 'alphathon',
      name: 'Treasurer | UM Alphathon 2025',
      desc: (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col gap-1">
            <div className="text-pop-blue font-mono text-xs font-extrabold uppercase tracking-[0.1em]">Duration</div>
            <div className="text-ink-soft font-mono text-xs font-semibold">2025</div>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Executive Summary
            </h5>
            <p className="text-ink-soft">
              Directed the financial operations and budget allocations for UM Alphathon 2025, a competitive event
              featuring a Quantitative Finance Workshop and a major prize pool funded entirely by international partner
              WorldQuant. Oversaw comprehensive expenditure tracking of a RM14,150 (USD 3,369) budget, committee
              reimbursements, and ledger maintenance to ensure strict financial compliance and seamless event execution.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Key Achievements & Metrics
            </h5>
            <ul className="space-y-2 text-ink-soft list-disc list-outside ml-5 marker:text-ink">
              <li>
                <strong className="text-ink font-extrabold">Prize Pool Administration:</strong> Facilitated the
                financial oversight and planning surrounding a substantial USD 3,000 total prize pool for event
                participants, successfully distributing 89.05% of all funds directly into the student prize pool.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Budget Oversight:</strong> Managed shared operational costs
                in conjunction with PEKOM CodeFest, tracking event expenditures effectively across both events and
                achieving an exceptional 99.87% budget accuracy rating.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Financial Governance & Operations
            </h5>
            <ul className="space-y-2 text-ink-soft list-disc list-outside ml-5 marker:text-ink">
              <li>
                <strong className="text-ink font-extrabold">Expense Management:</strong> Processed and documented
                committee expenditures, including large-scale logistics and hospitality allocations (such as RM443.55
                for committee meals), as well as printing and refreshments.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Ledger Maintenance:</strong> Maintained a highly detailed
                master ledger to record all transaction histories, ensuring complete transparency for audit and review
                purposes.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Financial Reporting:</strong> Reviewed and finalized the
                &quot;UM Alphathon 2025 Financial Implication&quot; document to establish clear budgetary baselines and
                reporting standards for the organizing committee.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'codefest',
      name: 'Treasurer | PEKOM CodeFest 2025',
      desc: (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col gap-1">
            <div className="text-pop-blue font-mono text-xs font-extrabold uppercase tracking-[0.1em]">Duration</div>
            <div className="text-ink-soft font-mono text-xs font-semibold">2025</div>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Executive Summary
            </h5>
            <p className="text-ink-soft">
              Directed the financial operations and budget management for PEKOM CodeFest (in conjunction with UM
              Alphathon 2025). Balanced a RM2,700 operational fund and oversaw all event-related expenses, achieving
              100% financial reconciliation with zero deficit while ensuring streamlined reimbursement processes for the
              organizing committee.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Key Responsibilities & Achievements
            </h5>
            <ul className="space-y-2 text-ink-soft list-disc list-outside ml-5 marker:text-ink">
              <li>
                <strong className="text-ink font-extrabold">Budget Management & Optimization:</strong> Managed total
                event expenditures amounting to RM1,531.77 (CodeFest Spend), optimizing operational overhead to ensure
                exactly 66.7% of the budget was paid out as direct cash rewards to participants.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Expense Tracking:</strong> Monitored operational costs
                across multiple categories, including roll-up bunting, certificate printing, meals, and transportation.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Financial Documentation:</strong> Developed and maintained a
                master reimbursement spreadsheet to compile all costs, ensuring absolute transparency and efficient
                financial settlement.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'mhw',
      name: 'Treasurer | Mental Health Week & Share Your Love',
      desc: (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col gap-1">
            <div className="text-pop-blue font-mono text-xs font-extrabold uppercase tracking-[0.1em]">Duration</div>
            <div className="text-ink-soft font-mono text-xs font-semibold">September 2025 – June 2026</div>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Executive Summary
            </h5>
            <p className="text-ink-soft">
              Directed the financial operations and budget allocations for Mental Health Week 2025 and its associated
              &quot;Share Your Love&quot; outreach initiative. Established rigorous treasury protocols to maintain
              accurate transaction histories, directing a RM5,830 multi-event fund to ensure complete transparency and
              accountability across all organizing committees.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Key Responsibilities & Governance
            </h5>
            <ul className="space-y-2 text-ink-soft list-disc list-outside ml-5 marker:text-ink">
              <li>
                <strong className="text-ink font-extrabold">Budget Allocation:</strong> Managed and distributed event
                funding across various outreach activities, outperforming merchandise sales targets to secure a RM346
                surplus.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Charity Execution:</strong> Executed the charity outreach
                effectively at RM11.68/pax, responsibly adjusting donations to match actual available funds.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Audit Compliance:</strong> Enforced strict documentation
                policies, verifying that every receipt was properly accounted for to maintain a 100%-reconciled budget.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Reporting Standards:</strong> Standardized the financial
                report formats used by the committee to maintain transparency and streamline the final administrative
                review process.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Reimbursement Policy Management:</strong> Administered
                transport reimbursement guidelines for event planning, deliberately excluding the 20% penalty deduction
                clause to ensure fair and complete compensation for committee members&apos; travel expenses.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-8 rounded-[22px] sm:rounded-[26px] border-3 border-ink bg-paper-cream shadow-brutal-sm sm:shadow-brutal overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2.5 px-5 sm:px-6 py-3 border-b-3 border-ink bg-pop-cyan">
        <span className="relative inline-flex w-2.5 h-2.5" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-pop-red animate-ping opacity-60" />
          <span className="relative w-2.5 h-2.5 rounded-full bg-pop-red border border-ink" />
        </span>
        <h4 className="text-sm font-mono font-extrabold text-ink uppercase tracking-[0.12em]">
          Treasurer Event Portfolio [4]
        </h4>
      </div>

      <div className="p-3 xs:p-5 sm:p-6">
        {/* KPI Dashboard (bento) */}
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-start p-3.5 rounded-2xl border-3 border-ink shadow-brutal-sm ${
                ['bg-pop-yellow', 'bg-white', 'bg-pop-mint', 'bg-pop-lilac'][i % 4]
              }`}
            >
              <stat.icon className="w-5 h-5 text-ink mb-2" strokeWidth={2.5} />
              <div className="text-[0.7rem] font-mono font-bold text-ink/70 uppercase tracking-normal [overflow-wrap:anywhere]">
                {stat.label}
              </div>
              <div className="font-display text-lg sm:text-xl font-extrabold text-ink mt-0.5 leading-tight">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Event Accordion
            Bug fix: only the header toggles now. Previously the whole card was the click target,
            so clicking a photo in the Field Archive (or anywhere inside the open panel) collapsed it. */}
        <div className="space-y-3">
          {events.map((event) => {
            const isExpanded = expandedEvent === event.id;
            const panelId = `pekom-event-${event.id}`;
            return (
              <div
                key={event.id}
                className={`relative rounded-2xl border-3 border-ink transition-[box-shadow,transform,background-color] duration-200 ${
                  isExpanded
                    ? 'bg-white shadow-brutal'
                    : 'bg-white shadow-brutal-xs hover:-translate-y-0.5 hover:shadow-brutal-sm'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={isExpanded ? panelId : undefined}
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  className={`w-full text-left p-4 flex items-center justify-between gap-3 rounded-[13px] ${isExpanded ? 'bg-pop-yellow border-b-3 border-ink rounded-b-none' : ''}`}
                >
                  <span className="font-mono text-xs sm:text-sm font-extrabold tracking-[0.02em] text-ink">
                    {event.name}
                  </span>
                  <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full border-2 border-ink bg-white">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-ink" strokeWidth={3} />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-ink" strokeWidth={3} />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <m.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 xs:px-4 sm:px-5 pb-5 text-sm font-sans font-medium text-ink-soft leading-relaxed">
                        {event.desc}
                      </div>
                    </m.div>
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
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');

  const filteredExperiences = experiences.filter((exp) => selectedFilter === 'all' || exp.category === selectedFilter);

  // Filter dot colours now match the card accents (MENTORSHIP was green in the filter but purple on the card)
  const filters: { id: FilterCategory; label: string; dotClass: string }[] = [
    { id: 'all', label: 'ALL', dotClass: 'bg-white' },
    { id: 'corporate', label: 'CORPORATE', dotClass: 'bg-pop-yellow' },
    { id: 'leadership', label: 'LEADERSHIP', dotClass: 'bg-pop-cyan' },
    { id: 'academic', label: 'MENTORSHIP', dotClass: 'bg-pop-lilac' },
  ];

  const accentFill: Record<ExperienceItem['accentColor'], { fill: string; soft: string }> = {
    amber: { fill: 'bg-pop-yellow', soft: 'bg-[#FFF3C4]' },
    cyan: { fill: 'bg-pop-cyan', soft: 'bg-[#D9FBFF]' },
    emerald: { fill: 'bg-pop-mint', soft: 'bg-[#DCFAEC]' },
    purple: { fill: 'bg-pop-lilac', soft: 'bg-[#EEE9FF]' },
  };

  return (
    <section
      id="experience"
      className="relative w-full bg-paper-cream bg-dots text-ink py-24 sm:py-32 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-hidden border-t-3 border-ink"
    >
      {/* Bauhaus accents */}
      <div
        aria-hidden
        className="fx-drift pointer-events-none absolute -left-40 top-[45%] w-72 h-72 rounded-full border-3 border-ink bg-pop-yellow hidden xl:block"
      />
      <svg
        aria-hidden
        className="fx-drift-rev pointer-events-none absolute right-10 top-24 w-24 h-24 hidden lg:block"
        viewBox="0 0 100 100"
      >
        <polygon points="50,6 96,92 4,92" fill="#FF4B2B" stroke="#0A0A0A" strokeWidth="6" strokeLinejoin="round" />
      </svg>

      <div className="relative max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="space-y-7">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="nb-kicker"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span>EXPERIENCE // CAREER & INSTITUTIONAL GOVERNANCE</span>
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="nb-title text-[clamp(1.55rem,8.2vw,2.1rem)] sm:text-5xl lg:text-6xl max-w-3xl leading-[1.02]"
          >
            <SplitWords text="EXECUTIVE LEADERSHIP & GOVERNANCE." />
          </m.h2>
        </div>

        {/* Segmented Filter Control — physical key row */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          role="group"
          aria-label="Filter experience"
          className="flex flex-wrap items-center gap-2 p-2 bg-white border-3 border-ink rounded-[22px] shadow-brutal-sm w-fit max-w-full"
        >
          <LayoutGroup id="exp-filter">
            {filters.map((f) => {
              const count = f.id === 'all' ? experiences.length : experiences.filter((e) => e.category === f.id).length;
              const isActive = selectedFilter === f.id;

              return (
                <button
                  key={f.id}
                  aria-pressed={isActive}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`relative px-4 py-2.5 rounded-2xl text-xs font-mono font-extrabold uppercase tracking-[0.08em] border-2 transition-all duration-150 ${
                    isActive ? 'text-white border-ink' : 'bg-white text-ink border-transparent hover:border-ink'
                  }`}
                >
                  {isActive ? (
                    <m.span
                      layoutId="exp-filter-pill"
                      aria-hidden
                      className="absolute inset-0 rounded-2xl bg-ink shadow-clay-pressed"
                      transition={FX.jellyTabs ? SPRING_STAMP : { duration: 0 }}
                    />
                  ) : null}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <span className={`nb-dot ${f.dotClass}`} />
                    {f.label}
                    <span className={`text-[0.7rem] ${isActive ? 'text-white/70' : 'text-ink-muted'}`}>({count})</span>
                  </span>
                </button>
              );
            })}
          </LayoutGroup>
        </m.div>

        {/* Experience Cards */}
        <div className="relative space-y-10 min-h-[500px]">
          <TraceRail />
          <AnimatePresence mode="popLayout">
            {filteredExperiences.map((item) => {
              const a = accentFill[item.accentColor];
              const longHeadline = item.headline.length > 90;

              return (
                <m.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.97, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -20 }}
                  transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                  className="relative group rounded-[30px] border-3 border-ink bg-white shadow-brutal-lg overflow-hidden"
                >
                  {/* Top Bar: Number + Category Tag + Period */}
                  <div
                    className={`flex flex-wrap items-center justify-between gap-3 sm:gap-4 px-4 xs:px-6 sm:px-10 py-3 sm:py-4 border-b-3 border-ink ${a.fill}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 xs:gap-3 min-w-0">
                      <span className="nb-num">{item.number}</span>
                      <span className="nb-tag bg-white">{item.categoryLabel}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-mono font-extrabold text-ink">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" strokeWidth={2.5} />
                        <span>{item.period}</span>
                      </div>
                      <div className="hidden sm:flex items-start gap-2 max-w-[26rem]">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 xs:p-6 sm:p-10">
                    {/* Main Role & Org */}
                    <div className="pb-7">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        <div className="space-y-3 max-w-3xl">
                          <h3 className="font-display text-[clamp(1.45rem,7.4vw,1.875rem)] sm:text-4xl font-extrabold uppercase tracking-[-0.03em] leading-[1] text-ink">
                            {item.role}
                          </h3>
                          {/* Long narrative headlines are set in sentence-case sans (uppercase mono paragraphs were unreadable) */}
                          <p
                            className={
                              longHeadline
                                ? 'text-base font-sans font-semibold text-ink-soft leading-relaxed border-l-4 border-pop-blue pl-4'
                                : 'text-sm font-mono font-extrabold text-pop-blue uppercase tracking-[0.06em]'
                            }
                          >
                            {'// '}
                            {item.headline}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-3 border-ink shadow-brutal-sm shrink-0 self-start ${a.soft}`}
                        >
                          <item.icon className="w-5 h-5 text-ink" strokeWidth={2.5} />
                          <span className="text-sm font-extrabold font-sans text-ink">{item.organization}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description Bullets */}
                    <div className="space-y-3.5 mb-8">
                      {item.bullets.map((bullet, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-start gap-3 text-[0.95rem] text-ink-soft leading-relaxed font-sans font-medium max-w-4xl"
                        >
                          <div
                            className={`w-6 h-6 rounded-full grid place-items-center shrink-0 mt-0.5 border-2 border-ink ${a.fill}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-ink" strokeWidth={3} />
                          </div>
                          <p>{bullet}</p>
                        </div>
                      ))}
                    </div>

                    {/* Metrics & Impact Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                      {item.metrics.map((metric, mIdx) => (
                        <div
                          key={mIdx}
                          className={`rounded-2xl p-4 border-3 border-ink shadow-brutal-sm flex flex-col justify-center ${mIdx === 1 ? a.fill : 'bg-white'}`}
                        >
                          <span className="text-[0.7rem] font-mono font-bold text-ink/70 uppercase tracking-[0.08em] mb-1">
                            {metric.label}
                          </span>
                          <span className="font-display text-xl font-extrabold text-ink tracking-[-0.01em]">
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Skills/Tags */}
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="nb-tag bg-paper-deep">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Specialized Dashboards */}
                    {item.id === 'pekom' && <PekomTreasurerDashboard />}
                  </div>
                </m.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
