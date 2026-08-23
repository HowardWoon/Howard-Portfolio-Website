"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Copy, Check, Terminal, Award, BookOpen, Layers } from "lucide-react";

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("howardwoonhz06@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden bg-neutral-50/60 pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Background Architectural Grid with Radial Fade */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)] opacity-70" 
      />

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-neutral-200/50 rounded-full blur-3xl z-0" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Top Technical Metadata Bar */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4 text-xs font-mono uppercase tracking-widest text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="text-neutral-900 font-semibold">01 //</span>
            <span>Software Engineer & Systems Architect</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-neutral-500">
            <span>Universiti Malaya</span>
            <span className="h-1 w-1 rounded-full bg-neutral-300" />
            <span className="text-neutral-900 font-medium">4.00 CGPA</span>
          </div>
        </div>

        {/* Main Hero Content (Asymmetric 2-Column Bento) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center py-12 lg:py-16">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Status Indicator Chip */}
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3.5 py-1 text-xs font-mono text-neutral-600 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Available for 2026 Opportunities</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-neutral-950 leading-[1.1] font-display">
              Engineering high-throughput systems, graph models & AI workflows.
            </h1>

            {/* Narrative Subtitle */}
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed">
              Software Engineering undergraduate at <strong className="text-neutral-900 font-medium">Universiti Malaya</strong>. 
              Focused on scalable backend infrastructure, algorithmic optimization, and agentic AI systems — from production prototypes to award-winning hackathon builds.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#selected-work"
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
              >
                <span>View Selected Work</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:border-neutral-300"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700">Email Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-neutral-400" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Architectural Framed Portrait */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group">
              
              {/* Technical Corner Brackets */}
              <div className="absolute -top-2 -left-2 h-4 w-4 border-t-2 border-l-2 border-neutral-400" />
              <div className="absolute -top-2 -right-2 h-4 w-4 border-t-2 border-r-2 border-neutral-400" />
              <div className="absolute -bottom-2 -left-2 h-4 w-4 border-b-2 border-l-2 border-neutral-400" />
              <div className="absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-neutral-400" />

              {/* Card Surface */}
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl shadow-neutral-950/5">
                <div className="relative h-[380px] w-[300px] sm:h-[420px] sm:w-[330px] overflow-hidden rounded-xl bg-neutral-100">
                  <Image
                    src="/images/howard-solid.jpeg"
                    alt="Howard Woon"
                    fill
                    sizes="(max-width: 768px) 300px, 330px"
                    className="object-cover object-top filter grayscale-[15%] contrast-[105%] transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />
                  
                  {/* Floating Overlay Badge on Portrait */}
                  <div className="absolute bottom-3 left-3 right-3 rounded-lg border border-white/20 bg-black/50 p-2.5 backdrop-blur-md text-white text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-neutral-300">ROLE_ID: LEAD_SE</span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <Terminal className="h-3 w-3" /> VERIFIED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Metrics Bar */}
        <div className="border-t border-neutral-200/80 pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Stat Card 1 */}
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition hover:border-neutral-300">
              <div>
                <div className="text-3xl font-bold font-mono tracking-tight text-neutral-950">4.00</div>
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 mt-1">Dean's List · UM</div>
              </div>
              <div className="rounded-xl bg-neutral-100 p-2.5 text-neutral-700">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition hover:border-neutral-300">
              <div>
                <div className="text-3xl font-bold font-mono tracking-tight text-neutral-950">2nd Place</div>
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 mt-1">Supervity APAC '26</div>
              </div>
              <div className="rounded-xl bg-neutral-100 p-2.5 text-neutral-700">
                <Award className="h-5 w-5" />
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition hover:border-neutral-300">
              <div>
                <div className="text-3xl font-bold font-mono tracking-tight text-neutral-950">12+</div>
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 mt-1">Shipped Systems</div>
              </div>
              <div className="rounded-xl bg-neutral-100 p-2.5 text-neutral-700">
                <Layers className="h-5 w-5" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}