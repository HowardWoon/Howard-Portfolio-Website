import React from "react";
import Image from "next/image";
import { ArrowDown, ExternalLink } from "lucide-react";

export default function BikebearInspiredHero() {
  return (
    <section className="relative min-h-screen bg-[#F5C400] text-black flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between px-6 lg:px-12 pt-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black text-white font-bold flex items-center justify-center text-sm tracking-wider">
            HW
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide uppercase leading-none">
              HOWARD WOON
            </h1>
            <p className="text-[11px] font-mono text-neutral-800 tracking-wider mt-0.5">
              SYSTEMS & AI ARCHITECT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-black/10 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-black/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-medium tracking-wide">
              AVAILABLE FOR HIRE 2026
            </span>
          </div>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-black text-white text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <span>RESUME</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Sticky Left Vertical Edge Tab */}
      <aside className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden sm:flex">
        <div className="flex items-center gap-2 rounded-r-xl bg-cyan-400 px-3 py-6 text-xs font-mono font-bold uppercase tracking-widest text-black shadow-lg [writing-mode:vertical-rl] rotate-180 cursor-pointer hover:pl-4 transition-all border border-black/10 border-l-0">
          <span>Honors & Awards</span>
        </div>
      </aside>

      {/* Main 2-Column Hero Section with extra left padding for the rail */}
      <main className="flex-1 flex items-center w-full max-w-7xl mx-auto px-6 sm:px-10 lg:pl-24 lg:pr-16 py-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Vision & Headline (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center border border-black/80 rounded-full px-3.5 py-1 text-xs font-mono tracking-widest uppercase">
              ABOUT // VISION
            </div>

            <div className="relative">
              <h2 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-extrabold uppercase tracking-tighter leading-[0.9] text-black">
                ENGINEERING <br />
                SYSTEMS TO <br />
                STAND OUT IN <br />
                A NOISY WORLD.
              </h2>

              {/* Decorative Accent Wave */}
              <div className="w-48 sm:w-64 mt-3 opacity-75">
                <svg
                  viewBox="0 0 200 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full stroke-black"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <path d="M2 8 Q 12 0, 22 8 T 42 8 T 62 8 T 82 8 T 102 8 T 122 8 T 142 8 T 162 8 T 182 8 T 198 8" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Profile Image (5 cols, No Footer Bar) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-[280px] sm:w-[320px] h-[360px] sm:h-[420px] rounded-[60px] border-2 border-black bg-black overflow-hidden shadow-xl">
              <Image
                src="/images/howard-solid.jpeg"
                alt="Howard Woon"
                fill
                className="object-cover grayscale contrast-125"
                priority
              />
            </div>
          </div>

        </div>
      </main>

      {/* Hero Footer */}
      <footer className="w-full flex items-center justify-between px-6 lg:px-12 pb-6 text-xs font-mono z-20">
        <div className="flex items-center gap-2 tracking-widest uppercase">
          <ArrowDown className="w-4 h-4 animate-bounce" />
          <span>SCROLL TO INITIALIZE</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="tracking-widest">01 / 04</span>
          <div className="w-16 h-1 bg-black/20 rounded-full overflow-hidden">
            <div className="w-1/4 h-full bg-black rounded-full" />
          </div>
        </div>
      </footer>
    </section>
  );
}