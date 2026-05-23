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
    <main>
      <section className="relative overflow-hidden pb-20 pt-10 sm:pb-28 sm:pt-16">
        <div className="absolute inset-0 grid-noise opacity-40" />
        <div className="absolute left-1/2 top-[-10rem] h-80 w-80 -translate-x-1/2 rounded-full bg-white/10 blur-3xl animate-drift" />

        <div className="section-shell relative z-10">
          <div className="mx-auto max-w-5xl text-center">
            <Reveal>
              <p className="mb-6 text-sm font-medium uppercase tracking-[0.34em] text-transparent bg-gradient-to-r from-zinc-300 via-white to-zinc-100 bg-clip-text">
                {profile.full_name}
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mx-auto max-w-4xl text-balance text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-8xl">
                Bridging software engineering and financial precision.
              </h1>
            </Reveal>
            <Reveal delay={170}>
              <p className="mx-auto mt-6 max-w-3xl text-balance text-lg leading-8 text-fog-500 sm:text-xl">
                {profile.bio}
              </p>
            </Reveal>

            <Reveal delay={250}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a href="#projects" className="pill-button pill-button-primary min-w-44">
                  <Sparkles className="h-4 w-4" />
                  <span>View My Work</span>
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="pill-button pill-button-secondary min-w-44">
                  <Github className="h-4 w-4" />
                  <span>Connect on GitHub</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-14 grid gap-4 sm:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="glass-panel rounded-3xl p-5 text-left">
                    <p className="text-xs uppercase tracking-[0.24em] text-fog-500">{metric.label}</p>
                    <p className="mt-2 text-lg font-medium text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="experience" className="pb-24 sm:pb-32">
        <div className="section-shell">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="muted-label mb-4">Experience and leadership</p>
              <h2 className="section-heading">A disciplined foundation in finance, leadership, and execution.</h2>
            </div>
          </Reveal>

          <div className="mx-auto mt-14 max-w-4xl">
            <div className="relative border-l border-white/10 pl-6 sm:pl-10">
              {experiences.map((item, index) => (
                <Reveal key={item.id} delay={index * 80}>
                  <article className="relative mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glass backdrop-blur-2xl">
                    <span className="absolute -left-[1.75rem] top-8 h-3.5 w-3.5 rounded-full border border-white/30 bg-white shadow-[0_0_0_8px_rgba(255,255,255,0.04)]" />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">{item.role}</p>
                        <p className="text-sm text-fog-500">{item.company}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.24em] text-fog-500">
                        {item.is_current ? 'Current' : 'Past'}
                      </span>
                    </div>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-fog-500">{item.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="pb-24 sm:pb-32">
        <div className="section-shell">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="muted-label mb-4">Featured projects</p>
              <h2 className="section-heading">Bento-style work shaped around impact, clarity, and speed.</h2>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-12">
            {projects.map((project, index) => {
              const spans = [
                'md:col-span-7 md:row-span-2',
                'md:col-span-5',
                'md:col-span-5'
              ];

              return (
                <Reveal key={project.id} delay={index * 90} className={spans[index % spans.length]}>
                  <article className="glass-panel group relative flex h-full min-h-72 flex-col overflow-hidden rounded-[2rem] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_40%)] opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative flex h-full flex-col justify-between gap-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white">
                          <SquareArrowOutUpRight className="h-5 w-5" />
                        </div>
                        <span className="text-xs uppercase tracking-[0.25em] text-fog-500">{project.context}</span>
                      </div>

                      <div>
                        <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-fog-500">{project.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-fog-500">
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

      <section id="stack" className="pb-24 sm:pb-32">
        <div className="section-shell">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="muted-label mb-4">The stack</p>
              <h2 className="section-heading">A minimalist system for building, shipping, and iterating.</h2>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {groupedSkills.map((group, index) => (
              <Reveal key={group.title} delay={index * 80}>
                <div className="glass-panel rounded-[2rem] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold text-white">{group.title}</h3>
                    <span className="text-xs uppercase tracking-[0.24em] text-fog-500">{group.values.length || group.items.length} tools</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {(group.values.length ? group.values : group.items).map((item) => (
                      <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-fog-100">
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

      <section id="leadership" className="pb-24 sm:pb-32">
        <div className="section-shell">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="muted-label mb-4">Leadership</p>
              <h2 className="section-heading">Operational discipline across campus communities and competitive events.</h2>
            </div>
          </Reveal>

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {['UM Alphathon 2025', 'MYTECH Career Fair 2026', 'PEKOM CODEFEST / Mental Health Week'].map((item, index) => (
              <Reveal key={item} delay={index * 80}>
                <div className="glass-panel rounded-3xl p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-fog-500">Treasury</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{item}</h3>
                  <p className="mt-3 text-sm leading-7 text-fog-500">
                    Led financial operations with precision, accountability, and calm execution under event pressure.
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="pb-24 sm:pb-32">
        <div className="section-shell">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="muted-label mb-4">Contact</p>
              <h2 className="section-heading">Let&apos;s build something exceptional.</h2>
              <p className="section-copy mt-4">Minimal, fast, and intentionally sharp. Reach out for collaborations, roles, or product ideas.</p>
            </div>
          </Reveal>

          <div className="mx-auto mt-12 max-w-4xl">
            <Reveal>
              <ContactForm />
            </Reveal>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-5 text-sm text-fog-500">
              <div className="flex items-center gap-4">
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
    </main>
  );
}
