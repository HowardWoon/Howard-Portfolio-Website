'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, PencilLine, Plus, Trash2 } from 'lucide-react';
import type { ExperienceRow, ProjectRow, SkillRow } from '@/lib/admin-types';

type ExperienceItem = ExperienceRow;
type ProjectItem = ProjectRow;
type SkillItem = SkillRow;

type DashboardClientProps = {
  initialExperiences: ExperienceItem[];
  initialProjects: ProjectItem[];
  initialSkills: SkillItem[];
  adminName?: string;
  isLive?: boolean;
};

const emptyExperience = {
  role: '',
  company: '',
  description: '',
  start_date: '',
  end_date: '',
  is_current: true
};

const emptyProject = {
  title: '',
  context: '',
  description: '',
  tags: '',
  project_url: '',
  display_order: '1'
};

const emptySkill = {
  name: '',
  category: 'Languages'
};

export function DashboardClient({ initialExperiences, initialProjects, initialSkills, adminName, isLive = false }: DashboardClientProps) {
  const router = useRouter();
  const [experiences, setExperiences] = useState(initialExperiences);
  const [projects, setProjects] = useState(initialProjects);
  const [skills, setSkills] = useState(initialSkills);
  const [experienceForm, setExperienceForm] = useState(emptyExperience);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [skillForm, setSkillForm] = useState(emptySkill);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);

  // Every save/delete used to be fired with `void …()` — failures became silent unhandled rejections.
  const run = (label: string, action: () => Promise<void>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setNotice(null);
    action()
      .then(() => setNotice({ kind: 'ok', text: `${label} saved.` }))
      .catch((err: unknown) => setNotice({ kind: 'error', text: err instanceof Error ? err.message : 'Something went wrong.' }));
  };

  const reloadData = async () => {
    const response = await fetch('/api/admin/content', { cache: 'no-store' });
    if (!response.ok) return;

    const payload = (await response.json()) as {
      experiences: ExperienceItem[];
      projects: ProjectItem[];
      skills: SkillItem[];
    };

    setExperiences(payload.experiences ?? []);
    setProjects(payload.projects ?? []);
    setSkills(payload.skills ?? []);
    router.refresh();
  };

  const mutate = async (resource: 'experiences' | 'projects' | 'skills', method: 'POST' | 'PATCH' | 'DELETE', body?: Record<string, unknown>) => {
    const response = await fetch(`/api/admin/${resource}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? 'Unable to save content.');
    }

    await reloadData();
  };

  const upsertExperience = async () => {
    const payload = {
      ...experienceForm,
      start_date: experienceForm.start_date || null,
      end_date: experienceForm.end_date || null,
      is_current: Boolean(experienceForm.is_current)
    };

    if (editingExperienceId) {
      await mutate('experiences', 'PATCH', { id: editingExperienceId, ...payload });
    } else {
      await mutate('experiences', 'POST', payload);
    }

    setExperienceForm(emptyExperience);
    setEditingExperienceId(null);
  };

  const upsertProject = async () => {
    const payload = {
      title: projectForm.title,
      context: projectForm.context,
      description: projectForm.description,
      tags: projectForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      project_url: projectForm.project_url || null,
      display_order: Number(projectForm.display_order || 1)
    };

    if (editingProjectId) {
      await mutate('projects', 'PATCH', { id: editingProjectId, ...payload });
    } else {
      await mutate('projects', 'POST', payload);
    }

    setProjectForm(emptyProject);
    setEditingProjectId(null);
  };

  const upsertSkill = async () => {
    if (editingSkillId) {
      await mutate('skills', 'PATCH', { id: editingSkillId, ...skillForm });
    } else {
      await mutate('skills', 'POST', skillForm);
    }

    setSkillForm(emptySkill);
    setEditingSkillId(null);
  };

  const deleteRow = async (table: 'experiences' | 'projects' | 'skills', id: string) => {
    await mutate(table, 'DELETE', { id });
  };

  // previously only prefetched + refreshed the dashboard — it never actually opened the site
  const openPublicSite = () => {
    window.open('/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Honest status: the public portfolio renders content from the component files, not from these tables */}
      <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
        <strong className="text-amber-300">Heads-up:</strong> the public portfolio currently renders its content from the code
        (components/*.tsx), so edits saved here are stored in Supabase but do not change the live site yet.
        {!isLive && ' Supabase is not configured — showing read-only sample data.'}
      </div>

      {notice && (
        <div role="status" className={`rounded-2xl border p-4 text-sm ${notice.kind === 'error' ? 'border-red-400/40 bg-red-500/10 text-red-200' : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'}`}>
          {notice.text}
        </div>
      )}

      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="muted-label mb-2">Admin dashboard</p>
            <h1 className="text-3xl font-semibold text-white">Content manager</h1>
            <p className="mt-3 text-sm leading-7 text-fog-500">
              {adminName ? `Signed in as ${adminName}.` : 'Signed in and ready to manage portfolio content.'}
            </p>
          </div>
          <button
            onClick={() => startTransition(() => reloadData())}
            className="pill-button pill-button-secondary"
            type="button"
          >
            <Check className="h-4 w-4" />
            <span>{isPending ? 'Refreshing...' : 'Refresh content'}</span>
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Experiences & leadership</h2>
            <span className="text-xs uppercase tracking-[0.24em] text-fog-500">{experiences.length} records</span>
          </div>

          <div className="mt-6 grid gap-3">
            <input className="floating-field !py-0" placeholder=" " value={experienceForm.role} onChange={(event) => setExperienceForm({ ...experienceForm, role: event.target.value })} />
            <input className="floating-field !py-0" placeholder=" " value={experienceForm.company} onChange={(event) => setExperienceForm({ ...experienceForm, company: event.target.value })} />
            <textarea className="floating-field min-h-28 resize-none" placeholder=" " value={experienceForm.description} onChange={(event) => setExperienceForm({ ...experienceForm, description: event.target.value })} />
            <div className="grid gap-3 md:grid-cols-2">
              <input className="floating-field !py-0" type="date" placeholder=" " value={experienceForm.start_date} onChange={(event) => setExperienceForm({ ...experienceForm, start_date: event.target.value })} />
              <input className="floating-field !py-0" type="date" placeholder=" " value={experienceForm.end_date} onChange={(event) => setExperienceForm({ ...experienceForm, end_date: event.target.value })} />
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-fog-500">
              <input type="checkbox" checked={experienceForm.is_current} onChange={(event) => setExperienceForm({ ...experienceForm, is_current: event.target.checked })} />
              Current role
            </label>
            <button type="button" className="pill-button pill-button-primary justify-center" onClick={() => run('Experience', upsertExperience)}>
              <Plus className="h-4 w-4" />
              <span>{editingExperienceId ? 'Update Experience' : 'Add Experience'}</span>
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {experiences.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{item.role}</p>
                    <p className="text-sm text-fog-500">{item.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-white/10 p-2 text-fog-500 transition hover:text-white"
                      onClick={() => {
                        setEditingExperienceId(item.id);
                        setExperienceForm({
                          role: item.role,
                          company: item.company,
                          description: item.description,
                          start_date: item.start_date ?? '',
                          end_date: item.end_date ?? '',
                          is_current: item.is_current
                        });
                      }}
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button type="button" className="rounded-full border border-white/10 p-2 text-fog-500 transition hover:text-red-300" onClick={() => run('Deletion', () => deleteRow('experiences', item.id), 'Delete this record? This cannot be undone.')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Projects</h2>
            <span className="text-xs uppercase tracking-[0.24em] text-fog-500">{projects.length} records</span>
          </div>

          <div className="mt-6 grid gap-3">
            <input className="floating-field !py-0" placeholder=" " value={projectForm.title} onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })} />
            <input className="floating-field !py-0" placeholder=" " value={projectForm.context} onChange={(event) => setProjectForm({ ...projectForm, context: event.target.value })} />
            <textarea className="floating-field min-h-28 resize-none" placeholder=" " value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} />
            <input className="floating-field !py-0" placeholder=" " value={projectForm.tags} onChange={(event) => setProjectForm({ ...projectForm, tags: event.target.value })} />
            <div className="grid gap-3 md:grid-cols-2">
              <input className="floating-field !py-0" placeholder=" " value={projectForm.project_url} onChange={(event) => setProjectForm({ ...projectForm, project_url: event.target.value })} />
              <input className="floating-field !py-0" placeholder=" " value={projectForm.display_order} onChange={(event) => setProjectForm({ ...projectForm, display_order: event.target.value })} />
            </div>
            <button type="button" className="pill-button pill-button-primary justify-center" onClick={() => run('Project', upsertProject)}>
              <Plus className="h-4 w-4" />
              <span>{editingProjectId ? 'Update Project' : 'Add Project'}</span>
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {projects.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-fog-500">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="rounded-full border border-white/10 p-2 text-fog-500 transition hover:text-white" onClick={() => {
                      setEditingProjectId(item.id);
                      // previously overwrote `context` with the description and reset display_order to 0
                      setProjectForm({
                        title: item.title,
                        context: item.context,
                        description: item.description,
                        tags: item.tags.join(", "),
                        project_url: item.project_url ?? "",
                        display_order: String(item.display_order)
                      });
                    }}>
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button type="button" className="rounded-full border border-white/10 p-2 text-fog-500 transition hover:text-red-300" onClick={() => run('Deletion', () => deleteRow('projects', item.id), 'Delete this record? This cannot be undone.')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-fog-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Skills</h2>
          <span className="text-xs uppercase tracking-[0.24em] text-fog-500">{skills.length} records</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <input className="floating-field !py-0" placeholder=" " value={skillForm.name} onChange={(event) => setSkillForm({ ...skillForm, name: event.target.value })} />
          <select className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white outline-none" value={skillForm.category} onChange={(event) => setSkillForm({ ...skillForm, category: event.target.value })}>
            <option>Languages</option>
            <option>Backend</option>
            <option>AI/ML</option>
            <option>Design</option>
          </select>
          <button type="button" className="pill-button pill-button-primary justify-center" onClick={() => run('Skill', upsertSkill)}>
            <Plus className="h-4 w-4" />
            <span>{editingSkillId ? 'Update Skill' : 'Add Skill'}</span>
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {skills.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-medium text-white">{item.name}</p>
              <p className="mt-1 text-sm text-fog-500">{item.category}</p>
              <div className="mt-4 flex items-center gap-2">
                <button type="button" className="rounded-full border border-white/10 p-2 text-fog-500 transition hover:text-white" onClick={() => {
                  setEditingSkillId(item.id);
                  setSkillForm({ name: item.name, category: item.category });
                }}>
                  <PencilLine className="h-4 w-4" />
                </button>
                <button type="button" className="rounded-full border border-white/10 p-2 text-fog-500 transition hover:text-red-300" onClick={() => run('Deletion', () => deleteRow('skills', item.id), 'Delete this record? This cannot be undone.')}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button type="button" onClick={openPublicSite} className="pill-button pill-button-secondary">
          <span>Open public site ↗</span>
        </button>
      </div>
    </div>
  );
}







