import React, { useState } from "react";
import { Cpu, Network, GitBranch, ShieldCheck } from "lucide-react";

const competencies = [
  {
    id: "A",
    title: "Backend Systems",
    subtitle: "Spring Boot & Java 21",
    angle: 45,
    icon: Cpu,
  },
  {
    id: "B",
    title: "Agentic AI",
    subtitle: "5-Operator Pipelines",
    angle: 135,
    icon: Network,
  },
  {
    id: "C",
    title: "Graph Algorithms",
    subtitle: "Dijkstra & Min-Heaps",
    angle: 220,
    icon: GitBranch,
  },
  {
    id: "D",
    title: "Fiscal Governance",
    subtitle: "PEKOM Finance Lead",
    angle: 310,
    icon: ShieldCheck,
  },
];

const techStack = [
  "Java 21", "Spring Boot", "Python", "FastAPI", "PostgreSQL", "Docker", "Next.js 15", "TypeScript"
];

export default function AboutSection() {
  const [activeDial, setActiveDial] = useState<string>("A");

  return (
    <section id="about" className="w-full bg-[#F6F6F2] text-black py-24 px-6 lg:px-16 border-t-2 border-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header with Standard Brand Pill */}
        <div className="space-y-4">
          <div className="inline-flex items-center border border-black/80 rounded-full px-3.5 py-1 text-xs font-mono tracking-widest uppercase bg-white">
            ABOUT // VISION
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-black max-w-4xl leading-[1.05]">
            I architect resilient backend systems and engineer autonomous agentic pipelines from 0 to 1.
          </h2>
          <p className="text-neutral-700 text-lg sm:text-xl max-w-3xl leading-relaxed font-sans">
            Studying Software Engineering at Universiti Malaya (4.00 CGPA). Combining low-latency algorithmic backend design (Spring Boot, Graph algorithms, Min-Heaps) with real-time AI automation and corporate financial governance.
          </p>
        </div>

        {/* Competencies Bento Box */}
        <div className="bg-white border-2 border-black rounded-[32px] p-6 lg:p-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {competencies.map((comp) => {
              const Icon = comp.icon;
              const isActive = activeDial === comp.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => setActiveDial(comp.id)}
                  className={`cursor-pointer rounded-2xl p-6 border-2 transition-all flex flex-col items-center text-center space-y-4 ${
                    isActive
                      ? "border-black bg-[#F5C400]/20 shadow-md"
                      : "border-black/15 bg-neutral-50 hover:border-black/50"
                  }`}
                >
                  {/* Dial Gauge Indicator */}
                  <div className="relative w-28 h-28 rounded-full border-2 border-black/80 bg-white flex items-center justify-center shadow-inner">
                    {/* Dial needle indicator */}
                    <div
                      className="absolute w-1 h-12 bg-black origin-bottom rounded-full transition-transform duration-500"
                      style={{
                        transform: `rotate(${comp.angle}deg)`,
                        bottom: "50%",
                      }}
                    />
                    {/* Dial Center Cap */}
                    <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center z-10 shadow">
                      {comp.id}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-black uppercase tracking-wide">
                      {comp.title}
                    </h3>
                    <p className="text-xs font-mono text-neutral-600">
                      {comp.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tech Stack Bar */}
          <div className="mt-8 pt-6 border-t border-black/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-xs font-mono text-neutral-600">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Systems
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> AI Pipelines
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Fiscal Governance
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-semibold text-neutral-500 mr-2">
                STACK:
              </span>
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-neutral-100 hover:bg-[#F5C400] border border-black/10 rounded-full text-xs font-mono transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}