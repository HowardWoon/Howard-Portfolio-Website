import { ArrowUpRight, Github, Sparkles, SquareArrowOutUpRight } from 'lucide-react';
import { fallbackProfile, stackGroups, type ExperienceItem, type ProjectItem, type SkillItem } from '@/lib/site-data';
import { Reveal } from '@/components/reveal';
import { ContactForm } from '@/components/contact-form';

type PortfolioPageProps = {
  profile: typeof fallbackProfile;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
};

const heroMetrics = [
  { label: 'University', value: 'University of Malaya' },
  { label: 'Focus', value: 'Software Engineering' },
  { label: 'Domain', value: 'Finance to AI systems' }
];

export function PortfolioPage({ profile, experiences, projects, skills }: PortfolioPageProps) {
  const groupedSkills = stackGroups.map((group) => ({
    ...group,
    values: skills.filter((skill) => group.items.includes(skill.name)).map((skill) => skill.name)
  }));

  return (
    <div className="text-white">
      {/* We add significant padding to the top so the 3D Hero scene has space to breathe */}
      <section className="relative overflow-hidden pt-[60vh] pb-24 sm:pb-32">
        <div className="relative z-10 px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto pointer-events-none">
          <div className="mx-auto max-w-6xl pointer-events-auto">
            <Reveal>
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary font-jetbrains">
                {profile.full_name}
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="max-w-5xl text-balance text-6xl font-black tracking-tighter text-white sm:text-7xl lg:text-[7rem] leading-none mb-10 drop-shadow-2xl">
                Creative<br /> Developer
              </h1>
            </Reveal>
            <Reveal delay={170}>
              <p className="max-w-2xl text-balance text-xl leading-relaxed text-muted font-medium font-inter">
                {profile.bio} Bridging software engineering and financial precision with impact, clarity, and speed.
              </p>
            </Reveal>

            <Reveal delay={250}>
              <div className="mt-12 flex flex-col items-start justify-start gap-4 sm:flex-row">
                <a href="#projects" className="pill-button pill-button-primary">
                  <Sparkles className="h-5 w-5" />
                  <span>View My Work</span>
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="pill-button pill-button-secondary">
                  <Github className="h-5 w-5" />
                  <span>Connect on GitHub</span>
                  <ArrowUpRight className="h-5 w-5" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto">
           <Reveal delay={320}>
             <div className="glass-panel grid gap-8 sm:grid-cols-3">
               {heroMetrics.map((metric) => (
                 <div key={metric.label} className="text-left">
                   <p className="text-xs font-bold uppercase tracking-widest text-muted font-jetbrains">{metric.label}</p>
                   <p className="mt-3 text-2xl font-bold text-white font-inter">{metric.value}</p>
                 </div>
               ))}
             </div>
           </Reveal>
        </div>
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
