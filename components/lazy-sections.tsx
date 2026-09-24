'use client';

import dynamic from 'next/dynamic';

// Below-the-fold sections: still server-rendered (same HTML and content), but their JS leaves First Load.
export const StackedProjects = dynamic(() => import('@/components/stacked-projects'));
export const ExperienceSection = dynamic(() => import('@/components/experience-section'));
export const HonorsSection = dynamic(() => import('@/components/honors-section'));
export const ContactSection = dynamic(() => import('@/components/contact-section'));
