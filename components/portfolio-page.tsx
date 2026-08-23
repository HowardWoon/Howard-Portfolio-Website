'use client';
import BikebearInspiredHero from '@/components/bikebear-hero';
import AboutSection from '@/components/about-section';
import StackedProjects from '@/components/stacked-projects';
import ExperienceSection from '@/components/experience-section';
import HonorsSection from '@/components/honors-section';
import ContactSection from '@/components/contact-section';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Github, ExternalLink, FileText, ArrowUpRight, ArrowDown, Sparkles, Building2, Calendar, Award, Layers, Send, Check, Copy, MapPin, AlertCircle, CheckCircle,
} from 'lucide-react';


import ProjectSimulators from '@/components/project-simulators';

export function PortfolioPage() {
  
    
  

  return (
    <div className="relative min-h-screen tech-grid-bg selection:bg-slate-900 selection:text-white">
      <BikebearInspiredHero />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 space-y-36">
        

        <AboutSection />

        <StackedProjects />

        <ProjectSimulators />

        <ExperienceSection />

        <HonorsSection />

        <ContactSection />
      </main>

      
    </div>
  );
}
