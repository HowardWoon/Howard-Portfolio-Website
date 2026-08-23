import re

with open("components/portfolio-page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Background Typography
content = content.replace("opacity-[0.06]", "opacity-[0.03]")
content = content.replace("text-7xl sm:text-9xl", "text-5xl sm:text-7xl")

# 2. Contrast
content = content.replace("text-xs text-slate-500", "text-xs text-slate-600")
content = content.replace("text-slate-500 uppercase tracking-widest", "text-slate-600 uppercase tracking-widest")

# 3. About Grid Hover
content = content.replace("group shadow-sm", "group shadow-sm hover:scale-[1.02] hover:shadow-md transition-all cursor-default")

# 4. Buttons hierarchy
old_buttons = """                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-600 hover:text-black transition-colors">
                        <Github className="w-3.5 h-3.5" /> Source Code <ArrowUpRight className="w-3 h-3 opacity-60" />
                      </a>
                    )}
                    {proj.deckUrl && (
                      <button onClick={() => setActiveDeck({ title: proj.title, pdfUrl: proj.deckUrl! })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all ml-auto active:scale-95">
                        <FileText className="w-3.5 h-3.5" /> View Pitch Deck
                      </button>
                    )}
                    {proj.certificateUrl && (
                      <button onClick={() => setActiveDeck({ title: proj.title, pdfUrl: proj.certificateUrl! })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all ml-auto active:scale-95">
                        <Award className="w-3.5 h-3.5" /> View Certificate
                      </button>
                    )}"""

new_buttons = """                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all active:scale-95">
                        <Github className="w-3.5 h-3.5" /> Source Code
                      </a>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      {proj.deckUrl && (
                        <button onClick={() => setActiveDeck({ title: proj.title, pdfUrl: proj.deckUrl! })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all active:scale-95">
                          <FileText className="w-3.5 h-3.5" /> Pitch Deck
                        </button>
                      )}
                      {proj.certificateUrl && (
                        <button onClick={() => setActiveDeck({ title: proj.title, pdfUrl: proj.certificateUrl! })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all active:scale-95">
                          <Award className="w-3.5 h-3.5" /> Certificate
                        </button>
                      )}
                    </div>"""

content = content.replace(old_buttons, new_buttons)

# 5. Grid Responsive
content = content.replace("grid-cols-2 md:grid-cols-4", "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")

with open("components/portfolio-page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

with open("components/project-simulators.tsx", "r", encoding="utf-8") as f:
    sim_content = f.read()

# 6. Simulator Pulse Button
sim_content = sim_content.replace("{computing ? 'Routing...' : 'Route Vehicle'}", "{computing ? 'Routing...' : 'Route Vehicle'} <span className=\"absolute -top-1 -right-1 flex h-3 w-3\"><span className=\"animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75\"></span><span className=\"relative inline-flex rounded-full h-3 w-3 bg-indigo-500\"></span></span>")
sim_content = sim_content.replace("className=\"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-slate-100 disabled:opacity-50 text-xs font-mono text-slate-900 transition-colors\"", "className=\"relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-slate-100 disabled:opacity-50 text-xs font-mono text-slate-900 transition-colors shadow-sm\" title=\"Click to simulate Dijkstra routing\"")

with open("components/project-simulators.tsx", "w", encoding="utf-8") as f:
    f.write(sim_content)
