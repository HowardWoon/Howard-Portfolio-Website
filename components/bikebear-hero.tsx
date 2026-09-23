"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Magnetic } from "./magnetic-button";
import { Sparkles, Terminal } from "lucide-react";


/**
 * X-ray magnifier headline.
 * Perf fix: the cursor position is written straight into CSS custom properties
 * (no React state → no re-render on every mousemove).
 * A11y fix: the duplicated overlay copy is aria-hidden so screen readers read the headline once.
 */
function MagnifiedHeadline() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const setVars = (x: number, y: number, on: boolean) => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.dataset.hover = on ? "true" : "false";
  };

  // Mouse / pen only. On phones a tap fires a synthetic mousemove with no mouseleave, which used to
  // leave the headline stuck at 25% opacity with a magnifier circle frozen on screen.
  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setVars(e.clientX - rect.left, e.clientY - rect.top, true);
  };

  const headlineClass =
    "font-display text-[clamp(1.85rem,10.8vw,2.6rem)] leading-[0.95] sm:text-6xl md:text-7xl xl:text-[5.6rem] landscape-short:!text-5xl font-extrabold uppercase tracking-[-0.035em]";
  const chipClass =
    "inline-block my-1 px-2 xs:px-3 border-3 rounded-xl xs:rounded-2xl -rotate-1";

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setVars(-1000, -1000, false)}
      data-hover="false"
      style={{ ["--mx" as string]: "-1000px", ["--my" as string]: "-1000px" }}
      className="group/headline relative space-y-2"
    >
      {/* Base Normal Text */}
      <h2 className={`${headlineClass} text-ink transition-opacity duration-300 group-data-[hover=true]/headline:opacity-25`}>
        ENGINEERING <br />
        <span className={`${chipClass} bg-pop-yellow border-ink shadow-brutal text-ink`}>
          SYSTEMS TO
        </span> <br />
        STAND OUT IN <br />
        A NOISY WORLD.
      </h2>

      {/* Scaled X-Ray Magnification Text (decorative duplicate) */}
      <h2
        aria-hidden="true"
        className={`${headlineClass} text-pop-blue absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-150 group-data-[hover=true]/headline:opacity-100`}
        style={{
          transform: "scale(1.15)",
          transformOrigin: "var(--mx) var(--my)",
          WebkitMaskImage: "radial-gradient(circle 140px at var(--mx) var(--my), black 60%, transparent 100%)",
          maskImage: "radial-gradient(circle 140px at var(--mx) var(--my), black 60%, transparent 100%)",
        }}
      >
        ENGINEERING <br />
        <span className={`${chipClass} bg-pop-red border-ink text-white`}>
          SYSTEMS TO
        </span> <br />
        STAND OUT IN <br />
        A NOISY WORLD.
      </h2>

      {/* Decorative squiggle */}
      <div className="w-48 sm:w-64 pt-3 relative z-10" aria-hidden>
        <svg
          viewBox="0 0 200 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full stroke-pop-red"
          strokeWidth="4.5"
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
  const [maskPosition, setMaskPosition] = React.useState({ x: -1000, y: -1000, r: 40 });
  const tapTimer = useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(tapTimer.current), []);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // no sticky 3D tilt after a tap on phones/tablets
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
      className="relative min-h-screen-safe bg-paper text-ink flex flex-col justify-between overflow-hidden"
    >
      {/* Structural grid + dot texture */}
      <div
        aria-hidden
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_75%_65%_at_45%_45%,#000_60%,transparent_100%)] pointer-events-none"
      />

      {/* Bauhaus geometry (decorative) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 bottom-6 w-44 h-44 rounded-full bg-pop-blue border-3 border-ink hidden xl:block" />
        <div className="absolute left-[38%] top-28 w-10 h-10 bg-pop-red border-3 border-ink rotate-12 hidden lg:block" />
        <svg className="absolute left-[46%] bottom-24 w-16 h-16 hidden lg:block animate-wobble" viewBox="0 0 100 100">
          <polygon points="50,6 96,92 4,92" fill="#FFC700" stroke="#0A0A0A" strokeWidth="7" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Main Hero Body */}
      <div className="relative flex-1 flex items-center w-full max-w-[1440px] mx-auto px-4 xs:px-5 sm:px-10 lg:px-16 pt-[calc(var(--header-h)+1.75rem)] sm:pt-[calc(var(--header-h)+3rem)] pb-14 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">

          {/* Left Column: Vision & Narrative (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-7 relative z-30 pointer-events-auto">

            {/* Brand Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="nb-kicker"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-ink-soft text-lg sm:text-xl max-w-xl leading-relaxed font-sans font-medium"
            >
              Architecting robust, <span className="nb-marker font-bold text-ink">low-latency distributed backends</span> and <span className="nb-marker font-bold text-ink">autonomous AI systems</span> — engineered with algorithmic precision, enterprise scalability, and strategic fiscal discipline.
            </motion.p>

            {/* Call to Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 xs:gap-4 pt-2 w-full"
            >
              <Magnetic strength={0.3}>
                <a href="#projects" className="nb-btn nb-btn-ink px-7 py-4">
                  EXPLORE PROJECTS ↗
                </a>
              </Magnetic>
              <Magnetic strength={0.3}>
                <a href="#projects" className="nb-btn nb-btn-white px-6 py-4">
                  <Terminal className="w-4 h-4" strokeWidth={2.75} />
                  <span>LIVE SIMULATORS</span>
                </a>
              </Magnetic>
            </motion.div>
          </div>

          {/* Right Column: Portrait Card with Interactive Tilt (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full relative">
            {/* Big Bauhaus sun behind the portrait */}
            <div aria-hidden className="pointer-events-none absolute -top-6 right-0 sm:right-10 w-40 h-40 xs:w-56 xs:h-56 sm:w-72 sm:h-72 rounded-full bg-pop-yellow border-3 border-ink" />
            <div aria-hidden className="pointer-events-none absolute -bottom-6 left-0 lg:left-auto lg:right-[70%] w-20 h-20 xs:w-28 xs:h-28 bg-pop-lilac border-3 border-ink rounded-[28px] rotate-6" />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              onPointerMove={handlePointerMove}
              onPointerLeave={handleMouseLeave}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 1200 }}
              className="relative group cursor-pointer flex flex-col items-center lg:items-end z-40 pointer-events-auto w-full sm:w-auto px-1 sm:px-0"
            >
              {/* News Ticker (Above Photo) */}
              <div className="w-full max-w-[350px] sm:max-w-none sm:w-[460px] lg:w-[460px] xl:w-[520px] mb-5 overflow-hidden bg-white rounded-2xl border-3 border-ink py-2.5 relative z-20 shadow-brutal pointer-events-auto">
                <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] w-max">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center" aria-hidden={i > 0}>
                      <span className="text-xs sm:text-sm font-mono font-extrabold text-ink uppercase tracking-[0.12em] px-4">
                        LATEST: 2ND PLACE @ SUPERVITY ASIA HACKATHON ✈
                      </span>
                      <span className="text-xl text-pop-red font-black mx-2 translate-y-[2px]">*</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Portrait Frame */}
              <div
                data-spiderman="true"
                onPointerMove={(e) => {
                  if (e.pointerType === "touch") return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMaskPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 40 });
                }}
                onPointerLeave={(e) => { if (e.pointerType !== "touch") setMaskPosition({ x: -1000, y: -1000, r: 40 }); }}
                onPointerUp={(e) => {
                  // Touch easter egg: a tap reveals the x-ray lens at the tap point for 1.6s
                  if (e.pointerType !== "touch") return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMaskPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 70 });
                  window.clearTimeout(tapTimer.current);
                  tapTimer.current = window.setTimeout(() => setMaskPosition({ x: -1000, y: -1000, r: 40 }), 1600);
                }}
                className="relative w-full max-w-[350px] sm:max-w-none sm:w-[460px] lg:w-[460px] xl:w-[520px] aspect-[5/6] xs:aspect-[6/7] sm:aspect-auto sm:h-[560px] lg:h-[600px] xl:h-[660px] rounded-[28px] xs:rounded-[36px] sm:rounded-[44px] border-3 border-ink bg-pop-yellow overflow-hidden shadow-brutal-lg sm:shadow-brutal-xl transition-colors duration-300 group-hover:border-pop-red pointer-events-auto cursor-pointer"
              >
                <Image
                  src="/images/howard-solid.jpeg"
                  alt="Howard Woon - Systems & AI Architect"
                  fill
                  sizes="(max-width: 640px) 350px, (max-width: 1280px) 460px, 520px"
                  className="object-cover object-top saturate-[1.15] contrast-[1.05]"
                  priority
                  quality={85}
                />

                {/* Spiderman Overlay X-Ray Mask (not LCP-critical → no preload) */}
                <Image
                  src="/images/spiderman.jpg"
                  alt="Howard Woon - Spiderman"
                  aria-hidden
                  fill
                  sizes="(max-width: 640px) 350px, (max-width: 1280px) 460px, 520px"
                  className="object-cover object-top saturate-[1.15] contrast-[1.05] pointer-events-none"
                  style={{
                    clipPath: `circle(${maskPosition.r}px at ${maskPosition.x}px ${maskPosition.y}px)`,
                    transition: "clip-path 180ms ease-out"
                  }}
                  loading="eager"
                  quality={85}
                />

                {/* Corner sticker */}
                <div aria-hidden className="absolute left-4 bottom-4 w-14 h-14 rounded-full bg-white border-3 border-ink grid place-items-center shadow-brutal-sm animate-spin-slow">
                  <span className="font-display font-extrabold text-xl text-ink">✦</span>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </motion.section>
  );
}
