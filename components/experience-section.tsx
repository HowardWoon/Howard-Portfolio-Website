'use client';

import React, { useState } from 'react';
import { FieldArchive } from './field-archive';
import { TraceRail } from './fx/trace-rail';
import { SplitWords } from './fx/split-words';
import { m, AnimatePresence, LayoutGroup } from 'framer-motion';
import { FX, SPRING_STAMP } from '@/lib/fx';
import { SIGNAL, type Signal } from '@/lib/signal';
import { SignalKey } from './signal-key';
import { usePrinting } from '@/lib/use-printing';
import { useInteractionSelect } from '@/lib/interaction-store';
import { InteractivePhotoStack } from './interactive-photo-stack';
import { InstitutionSeal } from './institution-seal';
import { LocationMap } from './location-map';
import { OrgLogo, type OrgLogoKey } from './org-logo';
import { PinKey } from './press/pin-key';
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
  Camera,
} from 'lucide-react';
import { SectionBackdrop } from './fx/section-backdrop';

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
  /** SIGNAL KEY meaning of this track (lib/signal.ts) */
  signal: Signal;
  headline: string;
  bullets: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
  galleryPhotos?: { src: string; alt: string; rotation: number; w: number; h: number }[];
  /** R38: a VIEW ON MAP key for this organisation (Google Maps search text) */
  map?: string;
  /** R37: the gallery desk's heading (each card names its own gallery; default "Mentorship gallery") */
  galleryLabel?: string;
  /** R29: the issuing institution's crest, printed as an Issuer Seal in the organisation plate */
  crest?: 'kmns';
  /** R48: the organisation's own wordmark, shown on a white window in the organisation plate */
  logo?: OrgLogoKey;
}

export const experiences: ExperienceItem[] = [
  {
    id: 'kraiburg',
    number: '01',
    category: 'corporate',
    categoryLabel: 'CORPORATE FINANCE',
    role: 'Assistant Finance Executive & Intern',
    organization: 'KRAIBURG TPE Technology (M) Sdn Bhd',
    // R38 (owner): VIEW ON MAP opens Google Maps for this place (searched by the owner-supplied full name)
    map: 'KRAIBURG TPE Technology (M) Sdn Bhd',
    logo: 'kraiburg',
    location: 'Kuala Lumpur, Malaysia',
    period: 'Nov 2025 - Present',
    icon: Building2,
    signal: 'industry',
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
    // R37 (owner upload "kraiburg finance"): photos with colleagues first, then Howard on his own (AGENTS.md 6.1);
    // w / h = the files' real pixel sizes (sharp)
    galleryLabel: 'Corporate finance gallery',
    galleryPhotos: [
      {
        src: '/images/experiences/kraiburg/kraiburg_01.jpg',
        alt: 'With a KRAIBURG TPE colleague in front of the KRAIBURG TPE office glass',
        rotation: -2,
        w: 1280,
        h: 960,
      },
      {
        src: '/images/experiences/kraiburg/kraiburg_02.jpg',
        alt: 'With the KRAIBURG TPE team outside the Block-B building under the KRAIBURG TPE sign',
        rotation: 2.5,
        w: 960,
        h: 1280,
      },
      {
        src: '/images/experiences/kraiburg/kraiburg_03.jpg',
        alt: 'Team photo with KRAIBURG TPE colleagues in the office',
        rotation: -1,
        w: 960,
        h: 1280,
      },
      {
        src: '/images/experiences/kraiburg/kraiburg_04.jpg',
        alt: 'Selfie with two KRAIBURG TPE colleagues holding a cake in the office',
        rotation: 1.5,
        w: 1280,
        h: 960,
      },
      {
        src: '/images/experiences/kraiburg/kraiburg_05.jpg',
        alt: 'Standing beside the KRAIBURG TPE office glass',
        rotation: -3,
        w: 960,
        h: 1280,
      },
      {
        src: '/images/experiences/kraiburg/kraiburg_06.jpg',
        alt: 'Seated in front of the KRAIBURG TPE office glass',
        rotation: 2,
        w: 960,
        h: 1280,
      },
      {
        src: '/images/experiences/kraiburg/kraiburg_07.jpg',
        alt: 'At the finance department file shelves',
        rotation: -1.5,
        w: 960,
        h: 1280,
      },
      {
        src: '/images/experiences/kraiburg/kraiburg_08.jpg',
        alt: 'In the KRAIBURG TPE office by the window',
        rotation: 1,
        w: 960,
        h: 1280,
      },
    ],
  },
  {
    id: 'pekom',
    number: '02',
    category: 'leadership',
    categoryLabel: 'INSTITUTIONAL LEADERSHIP',
    role: 'Finance Lead & Executive Treasurer',
    organization: 'Persatuan Komputer Universiti Malaya (PEKOM)',
    location: 'Universiti Malaya',
    // R48 (owner: every card in a section has the same functions): VIEW ON MAP by the place already on this card
    map: 'Universiti Malaya',
    logo: 'pekom',
    period: '2025 - Present',
    icon: Landmark,
    signal: 'leadership',
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
    // R48: VIEW ON MAP by the college's own name (the Malay name already in this card's location line)
    map: 'Kolej Matrikulasi Negeri Sembilan',
    period: '2024',
    icon: GraduationCap,
    crest: 'kmns',
    // R50 (owner): the plate shows the plain logo, no seal frame (the crest key stays for anything that still seals it)
    logo: 'kmns',
    signal: 'academic',
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
    galleryPhotos: [
      // R29: w / h = the files' real pixel sizes (four were declared with the wrong shape)
      {
        src: '/images/experiences/kmns/kmns_01.jpg',
        alt: 'Group photo of the PAL leaders at the Simposium Peer Assisted Learning (PAL)',
        rotation: -2,
        w: 1280,
        h: 960,
      },
      {
        src: '/images/experiences/kmns/kmns_02.jpg',
        alt: 'PAL leaders with the KMNS flag in the college hall',
        rotation: 3,
        w: 1280,
        h: 960,
      },
      {
        src: '/images/experiences/kmns/kmns_03.jpg',
        alt: 'On stage with medals at the Simposium Peer Assisted Learning (PAL)',
        rotation: -1,
        w: 960,
        h: 1280,
      },
      {
        src: '/images/experiences/kmns/kmns_04.jpg',
        alt: 'Holding the KMNS flag outside the college',
        rotation: 1.5,
        w: 1280,
        h: 960,
      },
      {
        src: '/images/experiences/kmns/kmns_05.jpg',
        alt: 'On stage with gift hampers at the Simposium Peer Assisted Learning (PAL)',
        rotation: -3,
        w: 1280,
        h: 718,
      },
      {
        src: '/images/experiences/kmns/kmns_06.jpg',
        alt: 'KMNS PAL leaders with their medals and team banner at the symposium',
        rotation: 2,
        w: 1280,
        h: 960,
      },
    ],
  },
];

function PekomTreasurerDashboard() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const printing = usePrinting(); // FX-70: every event prints expanded

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
      <div className="nb-hatch flex items-center gap-2.5 px-5 sm:px-6 py-3 border-b-3 border-ink bg-pop-pink">
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
        <div className="grid grid-cols-1 min-[412px]:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-start p-3.5 rounded-2xl border-3 border-ink shadow-brutal-sm min-w-0 ${
                i === 0 ? 'bg-ink text-white' : 'bg-white text-ink'
              }`}
            >
              <stat.icon className="w-5 h-5 mb-2" strokeWidth={2.5} />
              <div className="text-xs font-mono font-bold opacity-75 uppercase tracking-normal [overflow-wrap:anywhere]">
                {stat.label}
              </div>
              <div className="font-display text-lg sm:text-xl font-extrabold mt-0.5 leading-tight [overflow-wrap:anywhere]">
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
            const isExpanded = printing || expandedEvent === event.id;
            const panelId = `pekom-event-${event.id}`;
            return (
              <div
                key={event.id}
                data-pekom-event
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
                  onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                  className={`w-full text-left p-4 flex items-center justify-between gap-3 rounded-[13px] ${isExpanded ? 'bg-[#FFE3F1] border-b-3 border-ink rounded-b-none' : ''}`}
                >
                  <span className="font-mono text-xs sm:text-sm font-extrabold tracking-[0.02em] text-ink">
                    {event.name}
                  </span>
                  <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full border-2 border-ink bg-white">
                    {/* FX-72: one chevron that turns, instead of two icons swapping */}
                    <ChevronDown
                      className={`fx-morph w-4 h-4 text-ink ${isExpanded ? 'rotate-180' : ''}`}
                      strokeWidth={3}
                      aria-hidden
                    />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <m.div
                      id={panelId}
                      initial={printing ? false : { height: 0, opacity: 0 }}
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
  // R37 Role-to-Proof Circuit: an Experience card on the active trail gets the Evidence Trail outline
  const trailIds = useInteractionSelect((s) => s.trail?.ids ?? null);

  const filteredExperiences = experiences.filter((exp) => selectedFilter === 'all' || exp.category === selectedFilter);

  // R39 lecturer brief (dossier tabs): Left / Right / Home / End move between the folder tabs that are on the page
  // (wrapping round), Enter / Space still press the focused one. Up / Down stay with the page scroll.
  const onFolderTabKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: 0, End: 0 };
    if (!(e.key in keys) || e.altKey || e.ctrlKey || e.metaKey) return;
    const tabs = Array.from(
      e.currentTarget.closest('section')?.querySelectorAll<HTMLButtonElement>('button.nb-folder-tab') ?? [],
    );
    const i = tabs.indexOf(e.currentTarget);
    if (i < 0 || tabs.length < 2) return;
    e.preventDefault();
    const n = tabs.length;
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + keys[e.key] + n) % n;
    tabs[next].focus();
  };

  // R21: filter dots are the SIGNAL KEY colours of the cards they filter
  const filters: { id: FilterCategory; label: string; dotClass: string }[] = [
    { id: 'all', label: 'ALL', dotClass: 'bg-white' },
    { id: 'corporate', label: 'CORPORATE', dotClass: SIGNAL.industry.fill },
    { id: 'leadership', label: 'LEADERSHIP', dotClass: SIGNAL.leadership.fill },
    { id: 'academic', label: 'MENTORSHIP', dotClass: SIGNAL.academic.fill },
  ];

  return (
    <section
      id="experience"
      className="fx-tide-surface fx-dot-plane fx-sheet relative w-full bg-paper-cream bg-dots text-ink py-24 sm:py-32 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-clip border-t-3 border-ink"
    >
      <SectionBackdrop layout="c" />
      {/* Bauhaus accents */}
      <div
        aria-hidden
        className="fx-drift pointer-events-none absolute -left-40 top-[45%] w-72 h-72 rounded-full border-3 border-dashed border-ink/40 hidden xl:block"
      />
      <svg
        aria-hidden
        className="fx-drift-rev pointer-events-none absolute right-10 top-24 w-24 h-24 hidden lg:block"
        viewBox="0 0 100 100"
      >
        <polygon points="50,6 96,92 4,92" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="6" strokeLinejoin="round" />
      </svg>

      <div className="relative max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="space-y-7">
          <m.div className="fx-rise nb-kicker">
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span>EXPERIENCE // CAREER & INSTITUTIONAL GOVERNANCE</span>
          </m.div>

          <m.h2 className="fx-rise nb-title text-[clamp(1.55rem,8.2vw,2.1rem)] sm:text-5xl lg:text-6xl max-w-3xl leading-[1.02]">
            <SplitWords text="EXECUTIVE LEADERSHIP & GOVERNANCE." />
          </m.h2>
        </div>

        {/* Segmented Filter Control — physical key row. R21: labelled "TRACK", swatches = SIGNAL KEY, key beside it */}
        <div className="fx-rise flex flex-col items-start gap-3">
          <m.div
            role="group"
            aria-label="Filter experience"
            className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 p-2 bg-white border-3 border-ink rounded-[22px] shadow-brutal-sm w-full sm:w-fit max-w-full"
          >
            <span
              aria-hidden
              className="col-span-full sm:col-span-1 flex items-center gap-2 self-stretch rounded-2xl bg-ink px-3 py-2 font-mono text-xs font-extrabold tracking-[0.16em] text-white"
            >
              TRACK
            </span>
            <LayoutGroup id="exp-filter">
              {filters.map((f) => {
                const count =
                  f.id === 'all' ? experiences.length : experiences.filter((e) => e.category === f.id).length;
                const isActive = selectedFilter === f.id;

                return (
                  <button
                    key={f.id}
                    aria-pressed={isActive}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`relative min-h-[44px] px-3 sm:px-4 py-2.5 rounded-2xl text-xs font-mono font-extrabold uppercase tracking-[0.08em] border-2 transition-all duration-150 ${
                      isActive
                        ? 'text-white border-ink'
                        : 'bg-white text-ink border-transparent hover:border-ink hover:bg-[#E3E8FF]'
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
                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                      <span
                        aria-hidden
                        className={`h-3.5 w-3.5 shrink-0 rounded-[3px] border-2 ${isActive ? 'border-white' : 'border-ink'} ${f.dotClass}`}
                      />
                      {f.label}
                      <span className={`text-xs ${isActive ? 'text-white/70' : 'text-ink-muted'}`}>({count})</span>
                    </span>
                  </button>
                );
              })}
            </LayoutGroup>
          </m.div>
          <SignalKey only={['industry', 'leadership', 'academic']} className="w-full sm:w-fit max-w-full" />
        </div>

        {/* Experience Cards */}
        <div className="relative space-y-10 min-h-[500px]">
          <TraceRail />
          <AnimatePresence mode="popLayout">
            {filteredExperiences.map((item) => {
              const a = SIGNAL[item.signal];
              // R22 dossier tabs: each folder's tab sits at its own place along the cabinet (by its number)
              const slot = experiences.findIndex((e) => e.id === item.id);
              const only = selectedFilter === item.category;
              const onFill = a.text ?? 'text-ink';
              const longHeadline = item.headline.length > 90;
              const g = item.galleryPhotos;

              return (
                <m.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.97, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -20 }}
                  transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                  data-folder={item.id}
                  data-trail-stop={trailIds?.includes(`exp:${item.id}`) ? '' : undefined}
                  className={`relative ${trailIds?.includes(`exp:${item.id}`) ? 'fx-trail-hit rounded-[28px]' : ''}`}
                >
                  {/* R22 folder tab (lecturer pattern 3): pressing it slides this folder to the front (filters to its
                      track); pressing it again brings every folder back.
                      R36 (owner: tabs "cropped" on phones): the offset is a spacer that shrinks when the tab would
                      pass the card's right edge (an absolute `left` pushed tabs 02 / 03 off a 360 px screen); the
                      28 px end spacer keeps the tab off the card's rounded corner; the 3 px overlap opens the tab
                      into the card; the 280 px Fold wraps the label instead of cutting it */}
                  <div data-folder-tabrow className="pointer-events-none relative z-10 -mb-[3px] flex">
                    {/* R48 (owner: the first card's top-left looked "corrupted"): the first tab started at x 0, on
                        the card's 30 px rounded corner, so the curve showed behind it. The same 28 px that keeps a
                        tab off the right corner now keeps every tab off the left one */}
                    <span aria-hidden className="w-7 shrink-0" />
                    <span
                      aria-hidden
                      className="min-w-0 shrink"
                      style={{ flexBasis: `min(${slot} * 26%, ${slot} * 15rem)` }}
                    />
                    <button
                      type="button"
                      aria-pressed={only}
                      aria-label={only ? 'Show all experience folders' : `Show only the ${item.categoryLabel} folder`}
                      onClick={() => setSelectedFilter(only ? 'all' : item.category)}
                      onKeyDown={onFolderTabKey}
                      className={`nb-folder-tab pointer-events-auto flex min-h-[43px] max-w-[calc(100%-56px)] shrink-0 items-center gap-2 rounded-t-2xl border-3 border-b-0 border-ink px-4 py-2 text-left font-mono text-xs font-extrabold uppercase leading-snug tracking-[0.12em] ${a.fill} ${onFill}`}
                    >
                      <span className="min-w-0">
                        {item.number} {'//'} {item.categoryLabel}
                      </span>
                    </button>
                    <span aria-hidden className="w-7 shrink-0" />
                  </div>
                  <div
                    data-crop
                    className="relative group rounded-[30px] border-3 border-ink bg-white shadow-brutal-lg overflow-hidden"
                  >
                    <span aria-hidden className="fx-crop" />
                    {/* Top Bar: Number + Category Tag + Period */}
                    <div
                      data-plate
                      className={`nb-hatch flex flex-wrap items-center justify-between gap-3 sm:gap-4 px-4 xs:px-6 sm:px-10 py-3 sm:py-4 border-b-3 border-ink ${a.fill}`}
                    >
                      <div className="flex flex-wrap items-center gap-2 xs:gap-3 min-w-0">
                        {/* R48: on a dark plate (INDUSTRY ink) the ink disc had no edge - only the number showed. A
                            white ring gives it one; on the light plates it keeps its ink ring */}
                        <span className={`nb-num ${a.text ? '!border-white' : ''}`}>{item.number}</span>
                        <span className="rounded-md border-2 border-ink bg-white px-1.5 py-0.5 font-mono text-xs font-extrabold tracking-[0.14em] text-ink shadow-brutal-xs">
                          {a.label}
                        </span>
                        <span className={`font-mono text-xs font-extrabold uppercase tracking-[0.12em] ${onFill}`}>
                          {item.categoryLabel}
                        </span>
                      </div>

                      <div
                        className={`flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-mono font-extrabold ${onFill}`}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" strokeWidth={2.5} />
                          <span>{item.period}</span>
                        </div>
                        <div className="flex basis-full sm:basis-auto items-start gap-2 max-w-[26rem]">
                          <MapPin className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2.5} />
                          <span>{item.location}</span>
                        </div>
                        <PinKey
                          className="!text-ink"
                          facts={{
                            id: `e:${item.id}`,
                            kind: 'e',
                            title: `${item.role} · ${item.organization}`,
                            meta: item.period,
                            href: '#experience',
                          }}
                        />
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
                          {/* R48 organisation plate (owner: "you must have a standard when designing this whole section,
                              make sure all card must have the same function"). Every card carries the same three
                              parts in the same order: the organisation's mark on a white window (its wordmark, or its
                              Registrar Seal), its full name, and the R38 VIEW ON MAP key. One plate, not a pill that
                              differed card to card and left the corner empty. */}
                          <div
                            data-org-plate
                            className={`flex w-full shrink-0 flex-col items-stretch gap-3 self-start rounded-2xl border-3 border-ink p-3 shadow-brutal-sm sm:flex-row sm:items-center lg:w-[25rem] ${a.soft}`}
                          >
                            <span
                              data-org-mark
                              className="relative grid h-[5.5rem] w-full shrink-0 place-items-center rounded-xl border-2 border-ink bg-white sm:w-[8.5rem]"
                            >
                              {item.logo ? (
                                <OrgLogo org={item.logo} bare />
                              ) : item.crest ? (
                                <InstitutionSeal crest={item.crest} size="stamp" />
                              ) : (
                                <item.icon className="h-8 w-8 text-ink" strokeWidth={2.25} />
                              )}
                            </span>
                            <div className="flex min-w-0 flex-col gap-2.5">
                              <span className="text-sm font-extrabold font-sans leading-snug text-ink [overflow-wrap:anywhere]">
                                {item.organization}
                              </span>
                              {item.map ? <LocationMap place={item.map} /> : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* R29: with a gallery the card is two columns on >= 1024 px, like the project cards - the
                          story (bullets, metrics, tags) on the left, the gallery desk on the right. Without one, the
                          wrappers are `display: contents` and the card is exactly as before. */}
                      <div className={g ? 'grid gap-8 lg:grid-cols-12 lg:items-start' : 'contents'}>
                        <div className={g ? 'lg:col-span-7 min-w-0' : 'contents'}>
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
                                  <CheckCircle2 className={`w-3.5 h-3.5 ${onFill}`} strokeWidth={3} />
                                </div>
                                <p>{bullet}</p>
                              </div>
                            ))}
                          </div>

                          {/* Metrics & Impact Grid (beside a gallery the column is too narrow for three: they stack) */}
                          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 ${g ? 'lg:grid-cols-1' : ''}`}>
                            {item.metrics.map((metric, mIdx) => (
                              <div
                                key={mIdx}
                                className={`rounded-2xl p-4 border-3 border-ink shadow-brutal-sm flex flex-col justify-center ${mIdx === 1 ? 'bg-ink text-white' : 'bg-white text-ink'}`}
                              >
                                <span
                                  className={`text-xs font-mono font-bold uppercase tracking-[0.08em] mb-1 ${mIdx === 1 ? 'text-white/75' : 'text-ink/70'}`}
                                >
                                  {metric.label}
                                </span>
                                <span className="font-display text-xl font-extrabold tracking-[-0.01em]">
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
                        </div>

                        {/* R29 gallery desk: a compact 5-column desk like the project galleries (capped and centred
                            below 1024 px, so tablets and phones get a desk, not a poster) */}
                        {g && (
                          <div
                            data-gallery-desk
                            className="lg:col-span-5 min-w-0 w-full max-w-md mx-auto lg:max-w-none rounded-[26px] border-3 border-ink bg-paper-deep bg-dots p-3 sm:p-5 space-y-4 shadow-[inset_0_3px_0_rgba(0,0,0,0.06)]"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-ink pb-3">
                              <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-ink">
                                <Camera className="w-4 h-4" strokeWidth={2.5} aria-hidden />
                                <span className="uppercase tracking-[0.1em]">
                                  {item.galleryLabel ?? 'Mentorship gallery'}
                                </span>
                              </div>
                              <span className="nb-tag bg-[#E3E8FF]">INTERACTIVE</span>
                            </div>
                            <InteractivePhotoStack
                              customPhotos={g}
                              galleryId={item.id}
                              label={item.galleryLabel ?? 'Mentorship gallery'}
                              captions
                              filmstrip
                            />
                          </div>
                        )}
                      </div>

                      {/* Specialized Dashboards */}
                      {item.id === 'pekom' && <PekomTreasurerDashboard />}
                    </div>
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
