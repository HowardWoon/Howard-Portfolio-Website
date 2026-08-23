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
  const portalRadius = useTransform(smoothProgress, [0, 0.5, 1], ["100px", "50px", "16px"]);
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
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between pt-6 pb-6 lg:pb-10 z-10 pl-14 sm:pl-16 lg:pl-20">
        
        {/* Floating Top Nav (Adaptive Glass) */}
        <header className="flex items-center justify-between z-30 pr-6 lg:pr-12">
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

        {/* Main Hero Body - 2-Column Grid */}
        <main className="flex-1 flex items-center w-full max-w-7xl mx-auto pr-6 sm:pr-10 lg:pr-16 py-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full relative">
            
            {/* Left Column: Vision Badge & Headline (7 Cols) */}
            <motion.div 
              style={{ y: headlineY, opacity: headlineOpacity, color: textColor }}
              className="lg:col-span-7 flex flex-col items-start space-y-6 relative z-10"
            >
              <div className="inline-flex items-center border border-black/80 rounded-full px-3.5 py-1 text-xs font-mono tracking-widest uppercase">
                ABOUT // VISION
              </div>

              <div className="relative">
                <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-extrabold uppercase tracking-tighter leading-[0.9] text-inherit">
                  ENGINEERING <br />
                  SYSTEMS TO <br />
                  STAND OUT IN <br />
                  A NOISY WORLD.
                </h1>

                {/* Decorative Accent Wave placed securely under text with z-0 */}
                <div className="w-48 sm:w-64 mt-3 opacity-75 absolute -bottom-6 left-0 -z-10">
                  <svg
                    viewBox="0 0 200 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full stroke-current"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <path d="M2 8 Q 12 0, 22 8 T 42 8 T 62 8 T 82 8 T 102 8 T 122 8 T 142 8 T 162 8 T 182 8 T 198 8" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Portrait Portal (5 Cols) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end z-20">
              <motion.div
                style={{
                  scale: portalScale,
                  borderRadius: portalRadius,
                  rotate: portalRotation,
                }}
                className="relative w-[280px] sm:w-[320px] h-[380px] sm:h-[430px] border-2 border-black bg-black shadow-2xl overflow-hidden origin-center"
              >
                {/* Animated Fluid Blob SVG Mask Container */}
                <motion.div
                  style={{ rotate: useTransform(portalRotation, (r) => -r) }}
                  className="relative h-full w-full flex flex-col justify-between"
                >
                  <motion.div style={{ scale: imageScale }} className="absolute inset-0 w-full h-full">
                    <Image
                      src="/images/howard-solid.jpeg"
                      alt="Howard Woon"
                      fill
                      priority
                      className="object-cover object-top filter grayscale contrast-125"
                    />
                  </motion.div>

                  {/* Terminal / HUD Footer Overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/90 text-white backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-t border-neutral-800 z-10">
                    <span className="text-[11px] font-mono tracking-wider text-neutral-300">
                      CGPA 4.00 · UM
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 tracking-wider">
                      &gt;_ VERIF
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

          </div>
        </main>

        {/* Scroll Progress & Bottom Indicator */}
        <div className="flex items-center justify-between z-20 text-xs font-mono uppercase tracking-widest text-black pr-6 lg:pr-12">
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