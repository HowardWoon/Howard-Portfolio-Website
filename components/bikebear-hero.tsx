"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowDown, Terminal, Award, Sparkles, ExternalLink } from "lucide-react";

export default function BikebearInspiredHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Dynamic Background Color Interpolation (Yellow -> Dark Tech Obsidian)
  const backgroundColor = useTransform(
    smoothProgress,
    [0, 0.3, 0.6, 1],
    ["#FACC15", "#F59E0B", "#18181B", "#09090B"]
  );

  // Text Color Inversion
  const textColor = useTransform(
    smoothProgress,
    [0, 0.4, 0.7],
    ["#09090B", "#09090B", "#F4F4F5"]
  );

  // Central Portal Zoom & Scale
  const portalScale = useTransform(smoothProgress, [0, 1], [1, 5]);
  const portalRadius = useTransform(smoothProgress, [0, 0.5, 1], ["38%", "25%", "8%"]);
  const portalRotation = useTransform(smoothProgress, [0, 1], [0, 45]);
  const imageScale = useTransform(smoothProgress, [0, 1], [1, 0.5]);

  // Headline Kinetic Parallax & Opacity
  const headlineY = useTransform(smoothProgress, [0, 0.5], [0, -80]);
  const headlineOpacity = useTransform(smoothProgress, [0, 0.4], [1, 0]);

  // Bottom Content Reveal
  const bottomContentY = useTransform(smoothProgress, [0.3, 0.8], [100, 0]);
  const bottomContentOpacity = useTransform(smoothProgress, [0.3, 0.6], [0, 1]);

  return (
    <motion.div
      ref={containerRef}
      style={{ backgroundColor }}
      className="relative min-h-[220vh] w-full transition-colors duration-200"
    >
      {/* Sticky Fixed Viewport Frame */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between p-6 sm:p-10 z-10">
        
        {/* Floating Top Nav (Adaptive Glass) */}
        <header className="flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white font-mono font-bold text-base shadow-md">
              HW
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block text-black">HOWARD WOON</span>
              <span className="text-[11px] font-mono opacity-70 text-black">SYSTEMS & AI ARCHITECT</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-black/10 backdrop-blur-md px-4 py-2 text-xs font-mono font-medium text-black">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AVAILABLE FOR HIRE 2026</span>
            </div>
            
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-white shadow-lg transition hover:scale-105 active:scale-95"
            >
              <span>Resume</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        {/* Sticky Left Vertical Edge Tab */}
        <aside className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden sm:flex">
          <div className="flex items-center gap-2 rounded-r-xl bg-cyan-400 px-3 py-6 text-xs font-mono font-bold uppercase tracking-widest text-black shadow-lg [writing-mode:vertical-rl] rotate-180 cursor-pointer hover:pl-4 transition-all">
            <span>Honors & Awards</span>
          </div>
        </aside>

        {/* Centerpiece Morphing Portal with Headshot */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <motion.div
            style={{
              scale: portalScale,
              borderRadius: portalRadius,
              rotate: portalRotation,
            }}
            className="relative h-[280px] w-[280px] sm:h-[380px] sm:w-[380px] overflow-hidden bg-neutral-900 shadow-2xl border-4 border-black/20"
          >
            {/* Animated Fluid Blob SVG Mask Container */}
            <motion.div
              style={{ rotate: useTransform(portalRotation, (r) => -r) }}
              className="relative h-full w-full"
            >
              <motion.div style={{ scale: imageScale }} className="relative h-full w-full">
                <Image
                  src="/images/howard-solid.jpeg"
                  alt="Howard Woon"
                  fill
                  priority
                  className="object-cover object-top filter grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              </motion.div>

              {/* Floating Verified Role Hologram */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-black/60 p-3 backdrop-blur-md text-white">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-300">CGPA 4.00 · UM</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Terminal className="h-3 w-3" /> VERIFIED
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Large Kinetic Typography Reveal (Overlaid on Bottom) */}
        <motion.div
          style={{ y: headlineY, opacity: headlineOpacity, color: textColor }}
          className="relative z-20 max-w-5xl space-y-4"
        >
          <div className="inline-block rounded-full border border-black/30 px-3 py-1 text-xs font-mono uppercase tracking-widest">
            ABOUT // VISION
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight uppercase leading-[0.95]">
            Engineering Systems <br />
            <span className="underline decoration-black/30 decoration-wavy">To Stand Out</span> In A <br />
            Noisy World.
          </h1>
        </motion.div>

        {/* Scroll Progress & Bottom Indicator */}
        <div className="flex items-center justify-between z-20 text-xs font-mono uppercase tracking-widest text-black">
          <div className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4 animate-bounce" />
            <span>Scroll To Initialize</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span>01 / 04</span>
            <div className="h-1 w-24 rounded-full bg-black/20 overflow-hidden">
              <motion.div
                style={{ scaleX: smoothProgress }}
                className="h-full w-full bg-black origin-left"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Subsequent Section Revealed On Scroll Down (Dark Tech Mode) */}
      <div className="relative z-20 mx-auto max-w-6xl px-6 py-24">
        <motion.div
          style={{ y: bottomContentY, opacity: bottomContentOpacity }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl text-white hover:border-white/20 transition group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-black mb-6 group-hover:scale-110 transition">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="text-4xl font-extrabold font-mono tracking-tight text-yellow-400">4.00</div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mt-1">Dean's List · Universiti Malaya</div>
            <p className="text-sm text-neutral-300 mt-4 leading-relaxed">
              Software Engineering undergraduate maintaining top academic standing across core CS & systems architecture.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl text-white hover:border-white/20 transition group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-black mb-6 group-hover:scale-110 transition">
              <Award className="h-6 w-6" />
            </div>
            <div className="text-4xl font-extrabold font-mono tracking-tight text-cyan-400">2nd Place</div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mt-1">Supervity APAC Hackathon 2026</div>
            <p className="text-sm text-neutral-300 mt-4 leading-relaxed">
              Built ZeroLag, an autonomous AI sales-intelligence agent with sub-second real-time telemetry pipelines.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl text-white hover:border-white/20 transition group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-black mb-6 group-hover:scale-110 transition">
              <Terminal className="h-6 w-6" />
            </div>
            <div className="text-4xl font-extrabold font-mono tracking-tight text-emerald-400">12+ Builds</div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mt-1">Shipped Systems & Prototypes</div>
            <p className="text-sm text-neutral-300 mt-4 leading-relaxed">
              From IoT energy management (Sensor X Sensei) to flood response AI (BILAHUJAN) and Spring Boot engines.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}