"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, ExternalLink, Sparkles, Terminal, Award, GraduationCap, Cpu, ShieldCheck } from "lucide-react";

export default function BikebearHero() {
  const containerRef = useRef<HTMLElement>(null);

  // Mouse Parallax for Portrait Card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Scroll Exit Animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);
  const yTranslate = useTransform(scrollYProgress, [0, 0.8], [0, 50]);

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity, scale, y: yTranslate }}
      className="relative min-h-screen bg-[#090B10] text-white flex flex-col justify-between overflow-hidden selection:bg-amber-500 selection:text-black"
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Subtle Background Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" 
      />

      {/* Top Header */}
      <header className="w-full flex items-center justify-between px-6 sm:px-10 lg:px-16 pt-6 z-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black flex items-center justify-center text-sm tracking-wider shadow-lg shadow-amber-500/20">
            HW
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide uppercase leading-none text-white flex items-center gap-2">
              HOWARD WOON
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </h1>
            <p className="text-[11px] font-mono text-neutral-400 tracking-wider mt-1">
              SYSTEMS & AI ARCHITECT
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3.5"
        >
          <div className="hidden sm:flex items-center gap-2 bg-white/[0.04] backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-medium tracking-wide text-neutral-300">
              AVAILABLE FOR HIRE 2026
            </span>
          </div>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>RESUME</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </motion.div>
      </header>

      {/* Main Hero Body */}
      <main className="flex-1 flex items-center w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Column: Vision & Narrative (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Brand Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-mono text-amber-300 tracking-widest uppercase shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>ABOUT // VISION & SYSTEMS ARCHITECTURE</span>
            </motion.div>

            {/* Kinetic Typography Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative space-y-2"
            >
              <h2 className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black uppercase tracking-tight leading-[0.92] text-white">
                ENGINEERING <br />
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  SYSTEMS TO
                </span> <br />
                STAND OUT IN <br />
                A NOISY WORLD.
              </h2>

              {/* Decorative Accent Glow Wave */}
              <div className="w-48 sm:w-64 pt-2">
                <svg
                  viewBox="0 0 200 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full stroke-amber-400"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                >
                  <path d="M2 8 Q 12 0, 22 8 T 42 8 T 62 8 T 82 8 T 102 8 T 122 8 T 142 8 T 162 8 T 182 8 T 198 8" />
                </svg>
              </div>
            </motion.div>

            {/* Sub-narrative Bio Copy */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-neutral-300 text-base sm:text-lg max-w-xl leading-relaxed font-sans"
            >
              Combining low-latency distributed backends (<span className="text-amber-300 font-mono text-sm">Spring Boot</span>, <span className="text-amber-300 font-mono text-sm">Java 21</span>, <span className="text-amber-300 font-mono text-sm">Graph Optimization</span>) with autonomous agentic pipelines and corporate fiscal governance.
            </motion.p>

            {/* Call to Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <a
                href="#projects"
                className="px-7 py-3.5 rounded-full bg-white text-black font-bold font-mono text-xs uppercase tracking-wider hover:bg-amber-400 transition-all duration-300 shadow-xl shadow-white/5 hover:shadow-amber-400/20 hover:-translate-y-0.5"
              >
                EXPLORE PROJECTS ↓
              </a>
              <a
                href="#simulators"
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.05] border border-white/15 text-white font-mono text-xs uppercase tracking-wider hover:bg-white/[0.1] hover:border-amber-400/50 transition-all duration-300 backdrop-blur-md"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>LIVE SIMULATORS</span>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Full-Color Portrait Card with Interactive Tilt (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative group cursor-pointer"
            >
              {/* Outer Glow Halo */}
              <div className="absolute -inset-1 bg-gradient-to-b from-amber-500/40 via-amber-500/10 to-transparent rounded-[52px] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Main Portrait Frame - Natural Vibrant Color (No Grayscale) */}
              <div className="relative w-[290px] sm:w-[340px] h-[390px] sm:h-[450px] rounded-[48px] border-2 border-amber-500/30 bg-[#121620] overflow-hidden shadow-2xl transition-all duration-500 group-hover:border-amber-400/60">
                <Image
                  src="/images/howard-solid.jpeg"
                  alt="Howard Woon - Systems & AI Architect"
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  priority
                  quality={95}
                />
                
                {/* Subtle Gradient Shade at the Bottom for Depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Glassmorphic Badge #1 (Top Left): Hackathon Winner */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="absolute -top-4 -left-6 bg-[#0E121B]/90 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 group-hover:-translate-y-1 transition-transform"
                style={{ transform: "translateZ(40px)" }}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono font-bold text-white leading-tight">
                    2nd Place Winner
                  </div>
                  <div className="text-[10px] font-mono text-amber-400">
                    Supervity Asia Hackathon
                  </div>
                </div>
              </motion.div>

              {/* Floating Glassmorphic Badge #2 (Bottom Right): 4.00 CGPA UM */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="absolute -bottom-5 -right-6 bg-[#0E121B]/90 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 group-hover:translate-y-1 transition-transform"
                style={{ transform: "translateZ(40px)" }}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono font-bold text-white flex items-center gap-1.5 leading-tight">
                    CGPA 4.00 · UM
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Software Engineering
                  </div>
                </div>
              </motion.div>

              {/* Floating Micro-Badge #3 (Bottom Left): Multi-Agent Pipelines */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className="hidden sm:flex absolute bottom-8 -left-8 bg-[#0E121B]/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl px-3 py-2 shadow-xl items-center gap-2"
                style={{ transform: "translateZ(30px)" }}
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-mono text-neutral-200">
                  5-Operator Agentic AI
                </span>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </main>

      {/* Hero Footer Bar */}
      <footer className="w-full flex items-center justify-between px-6 sm:px-10 lg:px-16 pb-6 text-xs font-mono z-20 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2.5 text-neutral-400 tracking-widest uppercase text-[11px]">
          <ArrowDown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>SCROLL TO INITIALIZE</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="tracking-widest text-neutral-300 font-bold">01 / 04</span>
          <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="w-1/4 h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-lg" />
          </div>
        </div>
      </footer>
    </motion.section>
  );
}