"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ParticleMesh } from './particle-mesh';
import { ArrowDown, ExternalLink, Sparkles, Terminal, Award, GraduationCap, Cpu, ShieldCheck } from "lucide-react";


function MagnifiedHeadline() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative space-y-2 cursor-none"
    >
      {/* Base Normal Text */}
      <h2 className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black uppercase tracking-tight leading-[0.92] text-white transition-opacity duration-300" style={{ opacity: isHovered ? 0.2 : 1 }}>
        ENGINEERING <br />
        <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
          SYSTEMS TO
        </span> <br />
        STAND OUT IN <br />
        A NOISY WORLD.
      </h2>

      {/* Scaled X-Ray Magnification Text */}
      <h2 
        className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black uppercase tracking-tight leading-[0.92] text-amber-400 absolute inset-0 pointer-events-none transition-opacity duration-150"
        style={{
          transform: 'scale(1.15)',
          transformOrigin: `${position.x}px ${position.y}px`,
          WebkitMaskImage: `radial-gradient(circle 140px at ${position.x}px ${position.y}px, black 60%, transparent 100%)`,
          maskImage: `radial-gradient(circle 140px at ${position.x}px ${position.y}px, black 60%, transparent 100%)`,
          opacity: isHovered ? 1 : 0
        }}
      >
        ENGINEERING <br />
        <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          SYSTEMS TO
        </span> <br />
        STAND OUT IN <br />
        A NOISY WORLD.
      </h2>

      {/* Decorative Accent Glow Wave */}
      <div className="w-48 sm:w-64 pt-2 relative z-10">
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
    </div>
  );
}

export default function BikebearHero() {
  const containerRef = useRef<HTMLElement>(null);

  // Mouse Parallax for Portrait Card
  const mouseX = useMotionValue(0);
  const [maskPosition, setMaskPosition] = React.useState({ x: -1000, y: -1000 });
  const [isMaskVisible, setIsMaskVisible] = React.useState(false);
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

        

      {/* Main Hero Body */}
      <main className="flex-1 flex items-center w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-36 pb-10 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Column: Vision & Narrative (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 relative z-30 pointer-events-auto">
            
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
              <MagnifiedHeadline />
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
                href="#projects"
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
              className="relative group cursor-pointer flex flex-col items-center lg:items-end z-40 pointer-events-none"
            >
              {/* News Ticker (Above Photo) */}
                <div className="w-[340px] sm:w-[460px] lg:w-[480px] xl:w-[540px] mb-4 overflow-hidden bg-white rounded-xl border border-white/20 py-2.5 relative z-20 shadow-[0_0_20px_rgba(255,255,255,0.1)] pointer-events-auto">
                  <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] w-max">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <span className="text-xs sm:text-sm font-sans font-black text-black uppercase tracking-widest px-4">
                          BREAKING NEWS: 9 AUGUST • 2ND PLACE WINNER AT SUPERVITY ASIA HACKATHON
                        </span>
                        <span className="text-lg text-[#00E5FF] font-black mx-2 translate-y-[2px]">*</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outer Glow Halo */}
              <div className="absolute -inset-1 bg-gradient-to-b from-amber-500/40 via-amber-500/10 to-transparent rounded-[52px] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Main Portrait Frame - Natural Vibrant Color (No Grayscale) */}
                <div 
                  data-spiderman="true" 
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMaskPosition({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    });
                  }}
                  onMouseEnter={() => setIsMaskVisible(true)}
                  onMouseLeave={() => setIsMaskVisible(false)}
                  className="relative w-[340px] sm:w-[460px] lg:w-[480px] xl:w-[540px] h-[440px] sm:h-[580px] lg:h-[620px] xl:h-[700px] rounded-[48px] border-2 border-amber-500/30 bg-[#121620] overflow-hidden shadow-2xl transition-all duration-500 group-hover:border-red-500/60 pointer-events-auto cursor-pointer"
                >
                  <Image
                    src="/images/howard-solid.jpeg"
                    alt="Howard Woon - Systems & AI Architect"
                    fill
                    className="object-cover object-top saturate-[1.3] contrast-[1.15]"
                    priority
                    quality={100}
                  />
                  
                  {/* Spiderman Overlay X-Ray Mask */}
                  <Image
                    src="/images/spiderman.jpg"
                    alt="Howard Woon - Spiderman"
                    fill
                    className="object-cover object-top saturate-[1.3] contrast-[1.15] pointer-events-none transition-opacity duration-300"
                    style={{
                      opacity: isMaskVisible ? 1 : 0,
                      clipPath: `circle(120px at ${maskPosition.x}px ${maskPosition.y}px)`
                    }}
                    priority
                    quality={100}
                  />
                
                {/* Subtle Gradient Shade at the Bottom for Depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none transition-colors duration-500 group-hover:from-blue-900/60" />
              </div>

              

            </motion.div>
          </div>

        </div>
      </main>

      {/* Hero Footer Bar */}
    </motion.section>
  );
}