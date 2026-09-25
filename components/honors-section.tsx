'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { BauhausSolid } from './fx/bauhaus-solid';
import { SplitWords } from './fx/split-words';
import { FX } from '@/lib/fx';
import { AnimatedCounter } from './animated-counter';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useLatest } from '@/lib/use-latest';
import { useScrollLock } from '@/lib/use-scroll-lock';
import {
  Trophy,
  ArrowRight,
  Shield,
  GraduationCap,
  Sparkles,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  ExternalLink,
  FileText,
  type LucideIcon,
} from 'lucide-react';

interface HonorItem {
  id: string;
  isFeatured?: boolean;
  badge: string;
  badgeColor: 'gold' | 'cyan' | 'emerald' | 'purple';
  title: string;
  issuingBody: string;
  period: string;
  statCallout: { value: string; label: string };
  description: React.ReactNode;
  highlights: string[];
  certificateUrl?: string;
  icon: LucideIcon;
}

const honorsList: HonorItem[] = [
  {
    id: 'supervity',
    isFeatured: true,
    badge: 'REGIONAL APAC HACKATHON WINNER',
    badgeColor: 'gold',
    title: '2ND PLACE WINNER - SALES INTELLIGENCE',
    issuingBody: 'Supervity AutoPilot Asia Hackathon 2026',
    period: 'August 2026',
    statCallout: { value: '2nd', label: 'Out of 55+ APAC Teams' },
    description:
      'Architected ZeroLag, an autonomous 5-agent sales intelligence command center. Outperformed over 55 enterprise and university teams across the Asia-Pacific region with sub-second lead scoring pipelines.',
    highlights: [
      'Built deterministic HubSpot orchestrating 5 AI agent operators',
      'Awarded 2nd Place in the competitive Sales Intelligence Track',
      'Integrated Supervity Master Orchestrator',
    ],
    certificateUrl: '/certificates/Sales_Intelligence_Winner_-_2nd_Place.png',
    icon: Trophy,
  },
  {
    id: 'proofpay',
    isFeatured: true,
    badge: 'GLOBAL BLOCKCHAIN HACKATHON WINNER',
    badgeColor: 'gold',
    title: '2ND RUNNER UP (PAYMENTS & STABLECOINS)',
    issuingBody: 'MUBA Blockchain Hackathon 2026',
    period: '2026',
    statCallout: { value: '3rd', label: 'Sui Foundation track Track' },
    description:
      'Developed ProofPay, a delivery-linked B2B escrow and settlement platform built on Sui. Addressed B2B trust deadlocks using smart contract milestone releases and AI-driven evidence verification via Gonka Router.',
    highlights: [
      'Awarded 2nd Runner Up out of global participants in the Sui Foundation track',
      'Ranked Top 6 in the AI For Society track (Gonka Router AI)',
    ],
    icon: Trophy,
  },
  {
    id: 'game-jam',
    isFeatured: true,
    badge: 'NATIONAL GAME JAM PUBLIC CHOICE',
    badgeColor: 'gold',
    title: '1ST PLACE (PUBLIC CHOICE AWARD)',
    issuingBody: 'UM Game Jam 2026 (PEKOM)',
    period: 'April 2026',
    statCallout: { value: '#1', label: 'Public Choice Nationwide' },
    description:
      "Engineered 'The Goofy Experience'-a psychological comedy/horror game themed around 'Losing Control'. Implemented real-time UI hijacking and cursor manipulation mechanics with 100% custom audio.",
    highlights: [
      'Voted #1 Public Choice winner among 39 universities nationwide',
      'Engineered procedural UI hijacking & auditory disorientation systems',
    ],
    certificateUrl: '/certificates/UM_GAME_JAM_2026_HOWARD_WOON_HAO_ZHE.png',
    icon: Trophy,
  },
  {
    id: 'technothon',
    badge: 'INNOVATION FINALIST',
    badgeColor: 'gold',
    title: 'TOP 15 FINALIST (INNOVATION TRACK)',
    issuingBody: 'UM Technothon 2026',
    period: 'May 2026',
    statCallout: { value: 'Top 15', label: 'Innovation Track Finalist' },
    description:
      "Engineered 'Sensor X Sensei', a smart lecture hall energy management IoT system. Utilized ESP32 microcontrollers and dynamic web dashboards to optimize university power grids.",
    highlights: [
      'Engineered low-power ESP32 + MQTT sensor fusion firmware',
      'Ranked Top 15 among national university teams',
    ],
    certificateUrl: '/certificates/UM_TECHNOTHON_2026.pdf',
    icon: Trophy,
  },
  {
    id: 'hari-inovasi',
    badge: 'NATIONAL INNOVATION GOLD',
    badgeColor: 'gold',
    title: 'GOLD MEDALIST (EMAS)',
    issuingBody: 'Hari Inovasi PPAL 4.0 (Kebangsaan)',
    period: '2024',
    statCallout: { value: 'Gold', label: 'National Champion' },
    description:
      'Achieved the Gold Medal (Emas) at the national-level Hari Inovasi PPAL 4.0, demonstrating exceptional problem-solving and technical innovation among top matriculation cohorts nationwide.',
    highlights: [
      'Awarded National Gold Medal for technical excellence',
      'Recognized for outstanding presentation and innovative methodologies',
    ],
    certificateUrl: '/certificates/HARI_INOVASI_PPAL_PENCAPAIAN_CERT.pdf',
    icon: Trophy,
  },
  {
    id: 'chemcreative',
    badge: 'STATE DIGITAL INNOVATION',
    badgeColor: 'gold',
    title: 'GOLD MEDALIST (EMAS)',
    issuingBody: 'Chemcreative-Innovation (Digital Learning)',
    period: '2024',
    statCallout: { value: 'Gold', label: 'State Champion' },
    description:
      'Secured the Gold Medal at the state-level Chemcreative-Innovation competition, engineering advanced digital learning methodologies and interactive frameworks for scientific education.',
    highlights: [
      'Awarded State Gold Medal for Digital Learning Innovation',
      'Pioneered interactive and highly effective digital education frameworks',
    ],
    certificateUrl: '/certificates/chem_creative.png',
    icon: Trophy,
  },
  {
    id: 'simposium-pal',
    badge: 'NATIONAL ACADEMIC SYMPOSIUM',
    badgeColor: 'gold',
    title: 'SILVER MEDALIST (PERAK)',
    issuingBody: 'Simposium Peer Assisted Learning (PAL) KPM',
    period: '2024',
    statCallout: { value: 'Silver', label: 'National Podium' },
    description:
      'Awarded the Silver Medal (Perak) at the prestigious national Simposium Peer Assisted Learning (PAL) organized by the Ministry of Education (KPM), showcasing exemplary peer-mentorship strategies.',
    highlights: [
      'Awarded National Silver Medal by the Ministry of Education (KPM)',
      'Presented highly effective academic mentorship and leadership frameworks',
    ],
    certificateUrl: '/certificates/HowardWoonHaoZhe-PERAK-SIMPOSIUM_PEER_ASSISTED_LEARNING_PROGRAM_MATRIKULASI_KPM.pdf',
    icon: Trophy,
  },
  {
    id: 'deans-list',
    badge: 'ACADEMIC DISTINCTION',
    badgeColor: 'emerald',
    title: "Dean's Honours List (4.00 CGPA)",
    issuingBody: 'Faculty of Computer Science & IT, Universiti Malaya',
    period: '2025 - 2026',
    statCallout: { value: 'Top 1%', label: 'Academic Distinction' },
    description: (
      <div className="space-y-4 pt-1">
        <p className="text-[0.95rem] text-ink-soft font-medium pb-2">
          Engineered a flawless 4.00 CGPA algorithmic academic record, securing straight-A distinctions across all
          advanced computer science and systems architecture modules.
        </p>

        <div className="bg-white border-2 border-ink rounded-xl overflow-hidden">
          <div className="bg-pop-mint px-3 py-2 border-b-2 border-ink flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
            <span className="text-xs font-mono font-extrabold uppercase tracking-[0.08em] text-ink">
              Semester 2 Core
            </span>
            <span className="text-xs font-mono font-bold text-ink">GPA: 4.00</span>
          </div>
          <div className="p-3 grid grid-cols-1 gap-2 text-xs font-mono font-medium">
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIA1006</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Machine Learning</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-extrabold shrink-0">A+</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIA1002</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Data Structure</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-extrabold shrink-0">A+</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIA1003</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Computer System Architecture</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-bold shrink-0">A</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIA1005</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Network Technology Foundation</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-bold shrink-0">A</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">GIG1012</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Philosophy and Current Issues</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-extrabold shrink-0">A+</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">GLT1025</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Effective Oral Communication</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-extrabold shrink-0">A+</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-ink rounded-xl overflow-hidden">
          <div className="bg-pop-mint px-3 py-2 border-b-2 border-ink flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
            <span className="text-xs font-mono font-extrabold uppercase tracking-[0.08em] text-ink">
              Semester 1 Core
            </span>
            <span className="text-xs font-mono font-bold text-ink">GPA: 4.00</span>
          </div>
          <div className="p-3 grid grid-cols-1 gap-2 text-xs font-mono font-medium">
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIX1002</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Fundamentals of Programming</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-extrabold shrink-0">A+</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIA2010</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Human Computer Interaction</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-bold shrink-0">A</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIX1001</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Computing Mathematics I</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-bold shrink-0">A</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIX1003</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Computer Systems and Organization</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-bold shrink-0">A</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">GIG1003</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Basic Entrepreneurship Enculturation</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-extrabold shrink-0">A+</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">GLT1024</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Proficiency in English III</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-bold shrink-0">A</span>
            </div>
          </div>
        </div>
      </div>
    ),
    highlights: [],
    icon: GraduationCap,
  },
  {
    id: 'kmns-distinction',
    badge: 'MATRICULATION DISTINCTION',
    badgeColor: 'emerald',
    title: 'Academic Excellence Award (4.00 CGPA)',
    issuingBody: 'Kolej Matrikulasi Negeri Sembilan',
    period: '2024',
    statCallout: { value: '4.00', label: 'Physical Sciences Cohort' },
    description: (
      <div className="space-y-4 pt-1">
        <p className="text-[0.95rem] text-ink-soft font-medium pb-2">
          Graduated top of cohort in Physical Sciences & Computer Science with a perfect 4.00 GPA, alongside an
          exceptional track record of national-level technical competitions and extensive leadership in academic
          mentorship programs.
        </p>

        <div className="bg-white border-2 border-ink rounded-xl overflow-hidden">
          <div className="bg-pop-mint px-3 py-2 border-b-2 border-ink flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
            <span className="text-xs font-mono font-extrabold uppercase tracking-[0.08em] text-ink">
              National & State Excellence
            </span>
            <span className="text-xs font-mono font-bold text-ink">KMNS 2024/2025</span>
          </div>
          <div className="p-3 grid grid-cols-1 gap-2 text-xs font-mono font-medium">
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                SUKED Ping Pong Coach (Negeri)
              </span>
              <span className="w-24 text-right text-[#8A5A00] font-extrabold shrink-0">GOLD</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Matrix eXtra Quiz Challenge (Kebangsaan)
              </span>
              <span className="w-24 text-right text-[#B4531A] font-extrabold shrink-0">BRONZE</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                SUKED Tenis Lelaki (Negeri)
              </span>
              <span className="w-24 text-right text-[#B4531A] font-extrabold shrink-0">BRONZE</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                IMONST 1 Math Olympiad (Kebangsaan)
              </span>
              <span className="w-24 text-right text-ink-muted font-bold shrink-0">FINALIST</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Kursus Kepimpinan Generasi Madani (Kebangsaan)
              </span>
              <span className="w-24 text-right text-ink-muted font-bold shrink-0">MOE</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Bicara Eksekutif Kenegaraan Madani (Kebangsaan)
              </span>
              <span className="w-24 text-right text-ink-muted font-bold shrink-0">MOE</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Pertandingan Komik STEM 2024 (Negeri)
              </span>
              <span className="w-24 text-right text-ink-muted font-bold shrink-0">PARTICIPANT</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Pertandingan Poster AI (Negeri)
              </span>
              <span className="w-24 text-right text-ink-muted font-bold shrink-0">PARTICIPANT</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Konvensyen Profesional KMNS 2024 (Negeri)
              </span>
              <span className="w-24 text-right text-ink-muted font-bold shrink-0">PARTICIPANT</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-ink rounded-xl overflow-hidden">
          <div className="bg-pop-mint px-3 py-2 border-b-2 border-ink flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
            <span className="text-xs font-mono font-extrabold uppercase tracking-[0.08em] text-ink">
              Leadership & Mentorship Roles
            </span>
            <span className="text-xs font-mono font-bold text-ink">KEY POSITIONS</span>
          </div>
          <div className="p-3 grid grid-cols-1 gap-2 text-xs font-mono font-medium">
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Sukan Kampung
              </span>
              <span className="text-[#0F7A4A] font-extrabold shrink-0">CHAIRMAN</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Peer Assisted Learning (PAL)
              </span>
              <span className="text-[#0F7A4A] font-extrabold shrink-0">VICE PRESIDENT</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Maths Support System (MSS)
              </span>
              <span className="text-[#0F7A4A] font-bold shrink-0">MENTOR</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Program Chemcare Sem 2
              </span>
              <span className="text-[#0F7A4A] font-bold shrink-0">FACILITATOR</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Gemersik Cakna x Pesta Tanglung
              </span>
              <span className="text-[#0F7A4A] font-bold shrink-0">FACILITATOR</span>
            </div>
          </div>
        </div>
      </div>
    ),
    highlights: [],
    icon: GraduationCap,
  },
  {
    id: 'vhack',
    badge: 'V HACK 2026 QUALIFIER',
    badgeColor: 'cyan',
    title: 'CASE STUDY 3: FIRST RESPONDER OF THE FUTURE',
    issuingBody: 'Varsity Hackathon (V Hack) 2026',
    period: '2026',
    statCallout: { value: 'Qual', label: 'AI First Responder' },
    description:
      'Architected BILAHUJAN, a decentralised swarm intelligence platform for flood response. Fused Gemini 2.5 Flash image triage with an MCP-orchestrated command agent.',
    highlights: [
      'Engineered decentralised swarm architecture with real-time Firebase syncing',
      'Qualified in the Preliminary Round via the Case Study 3 track',
    ],
    certificateUrl: '/certificates/V_HACK_2026_QUALIFIER_HOWARD_WOON_HAO_ZHE.pdf',
    icon: Shield,
  },
  {
    id: 'umsic',
    badge: 'COMPETITION PARTICIPANT',
    badgeColor: 'cyan',
    title: 'UMSIC 2025 PARTICIPANT',
    issuingBody: 'Persatuan Komputer Universiti Malaya (PEKOM)',
    period: 'December 2025',
    statCallout: { value: '1st Yr', label: 'Initiation Competition' },
    description:
      'Participated in the Universiti Malaya Student Initiation Competition (UMSIC) 2025, engaging in technical challenges organized by PEKOM.',
    highlights: ['Collaborated in foundational software engineering problem-solving'],
    certificateUrl: '/certificates/UMSIC_HOWARD_WOON_HAO_ZHE.pdf',
    icon: Shield,
  },
];

/**
 * Certificate lightbox — a skeuomorphic "taped paper" on a dark desk.
 * Fixes: portaled to <body>, closes on Escape, locks page scroll, labelled dialog.
 */
function CertificateModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, mounted);
  useScrollLock();
  const isPdf = url.toLowerCase().endsWith('.pdf');
  const onCloseRef = useLatest(onClose);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onCloseRef]);

  if (!mounted) return null;

  return createPortal(
    <m.div
      ref={dialogRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Certificate Preview"
      data-lenis-prevent
      data-dark-surface
      className="fixed inset-0 z-[10000] flex flex-col h-screen-safe bg-ink/85 backdrop-blur-sm pt-[max(0.75rem,var(--safe-top))] pb-[max(0.75rem,var(--safe-bottom))] pl-[max(0.75rem,var(--safe-left))] pr-[max(0.75rem,var(--safe-right))] sm:p-10"
      onClick={onClose}
    >
      {/* Toolbar in normal flow → never overlaps the document on phones */}
      <div
        className="flex items-center justify-end gap-2 mb-3 sm:mb-4 shrink-0 w-full max-w-5xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {isPdf && (
          // Mobile browsers (Android Chrome, Samsung, most in-app browsers) can't render PDFs inside a page;
          // this always gives a working path to the native viewer.
          <a href={url} target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-yellow px-4 py-2.5">
            <ExternalLink className="w-4 h-4" strokeWidth={2.75} />
            <span>PDF</span>
          </a>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          data-autofocus
          className="w-12 h-12 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-red hover:text-white active:bg-pop-red active:text-white transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>

      <m.div
        initial={{ y: 40, rotateX: -20, opacity: 0 }}
        animate={{ y: 0, rotateX: 0, opacity: 1 }}
        exit={{ y: 40, rotateX: -20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl mx-auto flex-1 min-h-0 bg-white rounded-[18px] sm:rounded-[22px] border-3 border-ink shadow-brutal-lg sm:shadow-brutal-xl flex items-center justify-center p-2 sm:p-3"
      >
        <span className="tape w-24 sm:w-32 h-6 sm:h-7" aria-hidden />
        {isPdf ? (
          <object
            data={`${url}#navpanes=0&view=FitH`}
            type="application/pdf"
            aria-label="Certificate Preview"
            className="w-full h-full border-2 border-ink rounded-xl bg-paper-deep"
          >
            {/* Rendered automatically when the browser has no inline PDF viewer (most phones) */}
            <div className="w-full h-full grid place-items-center p-6 text-center">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="nb-btn nb-btn-yellow px-6 py-4 text-sm"
              >
                <FileText className="w-5 h-5" strokeWidth={2.5} />
                <span>PDF</span>
                <ExternalLink className="w-4 h-4" strokeWidth={2.75} />
              </a>
            </div>
          </object>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Certificate" className="w-full h-full object-contain p-1 sm:p-4" />
        )}
      </m.div>
    </m.div>,
    document.body,
  );
}

export default function HonorsSection() {
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'gold' | 'emerald' | 'cyan' | null>('gold');

  const categories = [
    {
      id: 'gold' as const,
      label: 'COMPETITIVE PLACEMENTS',
      desc: 'Regional Hackathons & Podiums',
      icon: Trophy,
      count: honorsList.filter((i) => i.badgeColor === 'gold').length,
      fill: 'bg-pop-yellow',
      soft: 'bg-[#FFF3C4]',
    },
    {
      id: 'emerald' as const,
      label: 'ACADEMIC DISTINCTIONS',
      desc: "4.00 CGPA & Dean's List",
      icon: GraduationCap,
      count: honorsList.filter((i) => i.badgeColor === 'emerald').length,
      fill: 'bg-pop-mint',
      soft: 'bg-[#DCFAEC]',
    },
    {
      id: 'cyan' as const,
      label: 'NATIONAL QUALIFIERS',
      desc: 'Varsity Hackathons & Initiations',
      icon: Shield,
      count: honorsList.filter((i) => i.badgeColor === 'cyan').length,
      fill: 'bg-pop-cyan',
      soft: 'bg-[#D9FBFF]',
    },
  ];

  const colorFor: Record<HonorItem['badgeColor'], { fill: string; soft: string }> = {
    gold: { fill: 'bg-pop-yellow', soft: 'bg-[#FFF3C4]' },
    emerald: { fill: 'bg-pop-mint', soft: 'bg-[#DCFAEC]' },
    cyan: { fill: 'bg-pop-cyan', soft: 'bg-[#D9FBFF]' },
    purple: { fill: 'bg-pop-lilac', soft: 'bg-[#EEE9FF]' },
  };

  const activeItems = honorsList.filter((i) => i.badgeColor === activeCategory);
  const resultsRef = useRef<HTMLDivElement>(null);
  const pick = (id: typeof activeCategory) => {
    setActiveCategory(id);
    // On phones the 3 category keys stack, so the opened list appears off-screen below them → bring it into view
    if (id && window.innerWidth < 768) {
      window.setTimeout(() => {
        const el = resultsRef.current;
        if (!el) return;
        if (window.__lenis)
          window.__lenis.scrollTo(el, {
            offset: -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72) - 12,
          });
        else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  };

  return (
    <section
      id="honors"
      className="relative w-full bg-paper-cream bg-dots text-ink py-24 sm:py-32 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-hidden border-t-3 border-ink flex flex-col"
    >
      {/* Structural grid + Bauhaus accents */}

      <div
        aria-hidden
        className="fx-depth pointer-events-none absolute -right-16 -top-16 hidden lg:block"
        style={{ '--depth': -22 } as React.CSSProperties}
      >
        {FX.solids3d ? (
          <BauhausSolid kind="coin" size={40} color="#FF4B2B" />
        ) : (
          <div className="w-40 h-40 rounded-full bg-pop-red border-3 border-ink" />
        )}
      </div>
      <div
        aria-hidden
        className="fx-depth pointer-events-none absolute right-16 top-6 hidden lg:block"
        style={{ '--depth': 18 } as React.CSSProperties}
      >
        {FX.solids3d ? (
          <BauhausSolid kind="cube" size={12} color="#454AE5" />
        ) : (
          <div className="w-12 h-12 bg-pop-blue border-3 border-ink rotate-12" />
        )}
      </div>

      <div className="relative max-w-7xl mx-auto space-y-12 w-full flex-1 flex flex-col">
        {/* Section Header */}
        <div className="space-y-7">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="nb-kicker"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span>HONORS // ACADEMIC & COMPETITION DISTINCTIONS</span>
          </m.div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="nb-title text-[clamp(1.55rem,8.2vw,2.1rem)] sm:text-5xl lg:text-6xl max-w-3xl leading-[1.02]"
            >
              <SplitWords text="HONORS & COMPETITIVE ACHIEVEMENTS." />
            </m.h2>

            <m.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-sm font-mono font-semibold text-ink-soft max-w-sm leading-relaxed bg-white border-3 border-ink rounded-2xl p-4 shadow-brutal-sm -rotate-1"
            >
              A curated log of regional hackathon podiums, 4.00 CGPA academic distinctions, and engineering competition
              finals.
            </m.p>
          </div>
        </div>

        {/* Interactive Category Keys (clay) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((cat, idx) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;

            return (
              <m.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                aria-expanded={isActive}
                onClick={() => pick(isActive ? null : cat.id)}
                className={`group relative w-full flex flex-col items-start text-left p-6 rounded-[26px] border-3 border-ink transition-[transform,box-shadow,background-color] duration-150 ${
                  isActive
                    ? `${cat.fill} shadow-clay-pressed translate-x-[3px] translate-y-[3px]`
                    : 'bg-white shadow-clay hover:-translate-y-1'
                }`}
              >
                <span className="relative z-10 w-full flex items-start justify-between mb-5">
                  <span
                    className={`w-14 h-14 rounded-2xl grid place-items-center border-3 border-ink shadow-brutal-sm transition-transform group-hover:-rotate-6 ${isActive ? 'bg-white' : cat.fill}`}
                  >
                    <Icon className="w-7 h-7 text-ink" strokeWidth={2.5} />
                  </span>
                  <span className="flex items-center gap-2 text-ink">
                    <span className="font-mono text-sm font-extrabold">[{cat.count}]</span>
                    <span className="grid place-items-center w-8 h-8 rounded-full border-2 border-ink bg-white">
                      {isActive ? (
                        <ChevronUp className="w-4 h-4" strokeWidth={3} />
                      ) : (
                        <ChevronDown className="w-4 h-4" strokeWidth={3} />
                      )}
                    </span>
                  </span>
                </span>

                <span className="relative z-10 block space-y-1.5">
                  <span className="block font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-ink">
                    {cat.label}
                  </span>
                  <span className="block text-xs font-mono font-bold text-ink/75">
                    {'// '}
                    {cat.desc}
                  </span>
                </span>
              </m.button>
            );
          })}
        </div>

        {/* Expanded Content Area */}
        <div ref={resultsRef} className={`relative flex-1 ${activeCategory ? 'min-h-[400px]' : ''}`}>
          <AnimatePresence mode="wait">
            {activeCategory && (
              <m.div
                key={activeCategory}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, position: 'absolute', inset: 0 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-7"
              >
                {activeItems.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isFeatured = item.isFeatured;
                  const c = colorFor[item.badgeColor];

                  return (
                    <m.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: itemIdx * 0.08 }}
                      className={`relative group rounded-[28px] border-3 border-ink bg-white overflow-hidden flex flex-col h-full transition-[transform,box-shadow] duration-200 hover:-translate-x-1 hover:-translate-y-1 ${
                        isFeatured ? 'shadow-brutal-lg hover:shadow-brutal-xl' : 'shadow-brutal hover:shadow-brutal-lg'
                      }`}
                    >
                      {/* Top Bar */}
                      <div
                        className={`flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b-3 border-ink ${isFeatured ? c.fill : c.soft}`}
                      >
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold tracking-[0.06em] uppercase text-ink">
                          <Icon className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                          <span>{item.badge}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-ink">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={2.5} />
                          <span>{item.period}</span>
                        </div>
                      </div>

                      {/* Featured Watermark */}
                      {isFeatured && (
                        <div
                          aria-hidden
                          className="absolute -right-10 top-10 opacity-[0.06] pointer-events-none rotate-12 group-hover:rotate-6 transition-transform duration-700"
                        >
                          <Trophy className="w-60 h-60" />
                        </div>
                      )}

                      <div className="relative z-10 flex flex-col flex-1 p-4 xs:p-6 sm:p-7">
                        {/* Title & Body */}
                        <div className="space-y-2 mb-4">
                          <h3 className="font-display text-2xl font-extrabold uppercase tracking-[-0.02em] leading-[1.05] text-ink">
                            {item.title}
                          </h3>
                          <p className="text-sm font-mono font-bold text-pop-blue">{item.issuingBody}</p>
                        </div>

                        <div className="text-[0.95rem] text-ink-soft leading-relaxed font-sans font-medium mb-6">
                          {item.description}
                        </div>

                        <div className="space-y-2.5 mb-8">
                          {item.highlights.map((hl, hlIdx) => (
                            <div
                              key={hlIdx}
                              className="flex items-start gap-2.5 text-sm text-ink-soft font-sans font-medium"
                            >
                              <div
                                className={`w-5 h-5 rounded-full grid place-items-center shrink-0 mt-0.5 border-2 border-ink ${c.fill}`}
                              >
                                <CheckCircle2 className="w-3 h-3 text-ink" strokeWidth={3} />
                              </div>
                              <p>{hl}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex-1" />

                        {/* Footer: Stat Callout & Certificate Link */}
                        <div className="mt-auto pt-6 border-t-2 border-dashed border-ink flex flex-col items-start gap-5">
                          {/* Big Stat Callout (sticker) */}
                          <div className="flex flex-col items-start">
                            <span
                              className={`font-display text-3xl font-extrabold text-ink tracking-[-0.03em] leading-none px-3 py-1.5 rounded-xl border-3 border-ink shadow-brutal-sm -rotate-2 ${c.fill}`}
                            >
                              <AnimatedCounter value={item.statCallout.value} />
                            </span>
                            <span className="text-[0.7rem] font-mono font-bold text-ink-muted uppercase tracking-[0.1em] mt-3">
                              {item.statCallout.label}
                            </span>
                          </div>

                          {/* Certificate Action */}
                          {item.certificateUrl && (
                            <button
                              onClick={() => setSelectedCert(item.certificateUrl!)}
                              className="group/btn nb-btn nb-btn-white px-4 py-2.5 xs:whitespace-nowrap"
                            >
                              <span>VIEW CERTIFICATE</span>
                              <ArrowRight
                                className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300"
                                strokeWidth={3}
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    </m.div>
                  );
                })}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fullscreen Certificate Preview Modal */}
      <AnimatePresence>
        {selectedCert && <CertificateModal url={selectedCert} onClose={() => setSelectedCert(null)} />}
      </AnimatePresence>
    </section>
  );
}
