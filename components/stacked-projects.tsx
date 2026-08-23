"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";

interface Project {
  title: string;
  category: string;
  description: string;
  tags: string[];
  color: string;
}

const projects: Project[] = [
  {
    title: "ZeroLag — Autonomous Sales Intelligence",
    category: "Supervity APAC Hackathon · 2nd Place Winner",
    description: "Agentic AI pipeline delivering real-time prospect telemetry, sentiment analysis, and instant lead scoring.",
    tags: ["FastAPI", "React", "Gemini API", "Supabase"],
    color: "#121212",
  },
  {
    title: "BILAHUJAN — AI Flood Disaster Response",
    category: "KitaHack 2026 Top Project",
    description: "Real-time flood alert and logistics dispatch mobile platform powered by IoT water sensors and local vision models.",
    tags: ["Flutter", "FastAPI", "IoT Sensors", "Computer Vision"],
    color: "#121212",
  },
  {
    title: "Sensor X Sensei — Smart Energy Grid",
    category: "UM Technothon 2026 Finalist",
    description: "Automated lecture hall electricity optimization tracking occupancy via NFC/PIR fusion and carbon emission analytics.",
    tags: ["ESP32", "Next.js", "C++", "MQTT"],
    color: "#121212",
  },
];

export default function StackedProjects() {
  return (
    <section className="relative w-full bg-neutral-950 py-24 px-4 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center border border-white/80 rounded-full px-3.5 py-1 text-xs font-mono tracking-widest uppercase text-white bg-transparent">PROJECTS // PRODUCTION</div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white uppercase">
            Stacked Systems & Works
          </h2>
        </div>

        <div className="space-y-16">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} total={projects.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index, total }: { project: Project; index: number; total: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  return (
    <motion.div
      ref={cardRef}
      style={{
        scale,
        top: `calc(100px + ${index * 35}px)`,
        backgroundColor: project.color,
      }}
      className="sticky rounded-3xl border border-neutral-800 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl transition-all"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <span className="inline-block rounded-full bg-white/10 px-3.5 py-1 text-xs font-mono text-[#F5C400]">
            {project.category}
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{project.title}</h3>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">{project.description}</p>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs font-mono text-neutral-300">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5C400] text-black shadow-lg hover:scale-110 active:scale-95 transition">
            <ArrowUpRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}