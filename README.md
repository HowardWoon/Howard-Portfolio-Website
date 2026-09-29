<div align="center">
  <img src="https://howard-woon-portfolio.vercel.app/images/howard-solid.jpeg" alt="Howard Woon" width="120" height="120" style="border-radius: 50%;" />

  <h1 align="center">Howard Woon · Software Engineer</h1>

  <p align="center">
    <strong>A high-performance, system-architecture focused portfolio.</strong>
  </p>

  <p align="center">
    <a href="https://howard-woon-portfolio.vercel.app">Live Portfolio</a> · 
    <a href="https://www.linkedin.com/in/howard-woon-hao-zhe-730b9337a/">LinkedIn</a>
  </p>
</div>

<br />

This repository houses the source code for my professional portfolio. Designed with an ultra-clean, bold "Neo-Brutalist Playground" aesthetic (featuring bento grids, claymorphism, and skeuomorphic details), it serves as both a resume and an active engineering showcase.

## ⚡ Key Features

- **Interactive System Simulators:** Live React simulations of backend algorithms and agentic workflows (Dijkstra Pathfinding, Agentic Intent Triage, IoT Telemetry).
- **In-App Document Modals:** Embedded, non-blocking PDF pitch-deck viewers.
- **Strict Visual Restraint:** A meticulously maintained design system utilizing bold ink borders, high-contrast primary color blocks (`#FFC700`, `#2B4BFF`, `#FF4B2B`), and precision typography.
- **High-Performance Architecture:** WebGL is used only where it earns its place (the Mercury Field hero effect). Static routing via the Next.js 15 App Router, below-the-fold sections code-split, and a First Load JS budget of 190 kB for `/` (about 187 kB today).
- **Fluid Interactions:** Staggered scroll reveals and physical hover lifts powered by Framer Motion.

## 🛠️ Technical Stack

- **Framework:** Next.js 15 (App Router, Strict Mode)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom Apple/Linear-inspired token system)
- **Motion:** Framer Motion
- **Icons:** Lucide React
- **Backend / DB:** Supabase (for secure `/admin` dashboard and contact form routing)

## 🚀 Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/HowardWoon/Howard-Portfolio-Website.git

# 2. Install dependencies
npm install

# 3. Setup environment variables (Requires Supabase instance for full admin features)
cp .env.local.example .env.local

# 4. Start the development server
npm run dev
```

Visit `http://localhost:3000` to view the application.

## 📁 Architecture Overview

- `app/`: Next.js 15 routing, global CSS, and layout configurations.
- `components/`: Modular React components, including the interactive `project-simulators.tsx` and the main `portfolio-page.tsx` view.
- Section content lives as typed arrays at the top of each section component in `components/`. `lib/site-data.ts` is legacy (only the contact email and admin fallbacks read it).

<br />

<div align="center">
  <sub>Built by Howard Woon. Deployed on Vercel Edge Network.</sub>
</div>
