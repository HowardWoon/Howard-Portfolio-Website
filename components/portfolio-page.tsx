import { ArrowRight, FileText, Github, Sparkles, SquareArrowOutUpRight } from 'lucide-react';
import { fallbackProfile, stackGroups, type ExperienceItem, type ProjectItem, type SkillItem } from '@/lib/site-data';
import { Reveal } from '@/components/reveal';
import { ContactForm } from '@/components/contact-form';

type PortfolioPageProps = {
  profile: typeof fallbackProfile;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
};

export function PortfolioPage({ profile, experiences, projects, skills }: PortfolioPageProps) {
  const groupedSkills = stackGroups.map((group) => ({
    ...group,
    values: skills.filter((skill) => group.items.includes(skill.name)).map((skill) => skill.name)
  }));

  return (
    <div className="text-white">
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-32 pb-12 overflow-hidden pointer-events-auto z-10">
        <Reveal>
          {/* 1. Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* 2. Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Software Engineering @ Universiti Malaya</span>
          </div>
        </Reveal>

        <Reveal delay={90}>
          {/* 3. Authoritative Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 max-w-4xl leading-[1.1] mb-6 mx-auto">
            Building Scalable Systems & Production Software
          </h1>
        </Reveal>

        <Reveal delay={170}>
          {/* 4. Concise Technical Value Proposition */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10 font-normal mx-auto">
            Hi, I'm <span className="text-white font-medium">{profile.name}</span>. I specialize in backend architectures, distributed systems, and AI integration using Java, Python, Next.js, and Spring Boot.
          </p>
        </Reveal>

        <Reveal delay={250}>
          {/* 5. Clear, Focused Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-slate-950 font-medium text-sm hover:bg-slate-200 transition-all shadow-sm"
            >
              View Projects
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/HowardWoon"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
            >
              <Github className="w-4 h-4" />
              GitHub Profile
            </a>
            <a
              href="/resume"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-medium text-sm hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
            >
              <FileText className="w-4 h-4" />
              Resume
            </a>
          </div>
        </Reveal>

        <Reveal delay={320}>
          {/* 6. Clean Inline Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 pt-8 border-t border-white/10 w-full max-w-3xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-white font-mono">4.00</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">CGPA (SE)</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-white font-mono">15+</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Projects Built</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-white font-mono">2nd Place</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">AutoPilot Hackathon</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-white font-mono">4+</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Finance Roles</div>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="experience" className="py-24 sm:py-32 relative z-10 pointer-events-auto">
        <div className="px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-primary font-jetbrains mb-4">Experience</p>
              <h2 className="section-heading mx-auto">A disciplined foundation in finance, leadership, and execution.</h2>
            </div>
          </Reveal>

          <div className="mx-auto mt-16 max-w-4xl">
            <div className="flex flex-col gap-8">
              {experiences.map((item, index) => (
                <Reveal key={item.id} delay={index * 80}>
                  <article className="glass-panel transition-transform hover:-translate-y-1 hover:shadow-glow">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-2xl font-bold text-white font-inter">{item.role}</p>
                        <p className="text-lg font-medium text-muted font-inter mt-1">{item.company}</p>
                      </div>
                      <span className="border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white rounded-full">
                        {item.is_current ? 'Current' : 'Past'}
                      </span>
                    </div>
                    <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted font-medium">{item.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="py-24 sm:py-32 relative z-10 pointer-events-auto">
        <div className="px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-accent font-jetbrains mb-4">Featured projects</p>
              <h2 className="section-heading mx-auto">Bento-style work shaped around impact, clarity, and speed.</h2>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-8 md:grid-cols-12">
            {projects.map((project, index) => {
              const spans = [
                'md:col-span-7 md:row-span-2',
                'md:col-span-5',
                'md:col-span-5'
              ];

              return (
                <Reveal key={project.id} delay={index * 90} className={spans[index % spans.length]}>
                  <article className="glass-panel group relative flex h-full min-h-[24rem] flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-glow hover:bg-black/60">
                    <div className="relative flex h-full flex-col justify-between gap-8 z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white group-hover:bg-primary transition-colors">
                          <SquareArrowOutUpRight className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-muted">{project.context}</span>
                      </div>

                      <div>
                        <h3 className="text-3xl font-bold font-inter text-white">{project.title}</h3>
                        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted font-medium">{project.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span key={tag} className="border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-muted rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="stack" className="py-24 sm:py-32 relative z-10 pointer-events-auto">
        <div className="px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-[#8B5CF6] font-jetbrains mb-4">The stack</p>
              <h2 className="section-heading mx-auto">A minimalist system for building, shipping, and iterating.</h2>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {groupedSkills.map((group, index) => (
              <Reveal key={group.title} delay={index * 80}>
                <div className="glass-panel">
                  <div className="flex items-center justify-between gap-4 mb-8">
                    <h3 className="text-xl font-bold font-inter text-white">{group.title}</h3>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted">{group.values.length || group.items.length} tools</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(group.values.length ? group.values : group.items).map((item) => (
                      <span key={item} className="border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="leadership" className="py-24 sm:py-32 relative z-10 pointer-events-auto">
        <div className="px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-primary font-jetbrains mb-4">Leadership</p>
              <h2 className="section-heading mx-auto">Operational discipline across campus communities.</h2>
            </div>
          </Reveal>

          <div className="mx-auto mt-16 grid max-w-6xl gap-8 md:grid-cols-3">
            {['UM Alphathon 2025', 'MYTECH Career Fair 2026', 'PEKOM CODEFEST'].map((item, index) => (
              <Reveal key={item} delay={index * 80}>
                <div className="glass-panel transition hover:-translate-y-1 hover:shadow-glow">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Treasury</p>
                  <h3 className="mt-4 text-xl font-bold text-white font-inter leading-tight">{item}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted font-medium">
                    Led financial operations with precision, accountability, and calm execution under event pressure.
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 sm:py-32 relative z-10 pointer-events-auto">
        <div className="px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-accent font-jetbrains mb-4">Contact</p>
              <h2 className="section-heading mx-auto">Let&apos;s build something exceptional.</h2>
              <p className="text-lg mt-6 text-muted font-medium">Minimal, fast, and intentionally sharp. Reach out for collaborations, roles, or product ideas.</p>
            </div>
          </Reveal>

          <div className="mx-auto mt-16 max-w-4xl">
            <Reveal>
              <div className="glass-panel p-8">
                <ContactForm />
              </div>
            </Reveal>
            <div className="mt-16 flex flex-wrap items-center justify-between gap-6 text-xs font-bold uppercase tracking-widest text-muted font-jetbrains">
              <div className="flex items-center gap-8">
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="transition hover:text-white">
                  LinkedIn
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="transition hover:text-white">
                  GitHub
                </a>
                <a href="mailto:howard.woon@example.com" className="transition hover:text-white">
                  Email
                </a>
              </div>
              <p>Designed and built by Howard Woon Hao Zhe. © 2026.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
