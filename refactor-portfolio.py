import re

with open("components/portfolio-page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Simulators section background to #121212
# The simulators section currently doesn't have a background set explicitly or is just part of the page.
# Wait, the page is wrapped in <main>.
# Let's replace the Simulators header.
content = re.sub(
    r'<div className="text-xs font-mono text-slate-600 uppercase tracking-widest">/arch_simulators</div>\s*<h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 font-display mt-1">Interactive Benchmarks.</h2>',
    '<div className="inline-flex items-center border border-black/80 rounded-full px-3.5 py-1 text-xs font-mono tracking-widest uppercase bg-white mb-2">BENCHMARKS // SIMULATOR</div>\n<h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-black font-display">Interactive Benchmarks.</h2>',
    content
)

# 2. Update Honors section header
content = re.sub(
    r'<div className="text-xs font-mono text-slate-600 uppercase tracking-widest">/honors_and_awards</div>\s*<h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 font-display mt-1">Recognition.</h2>',
    '<div className="inline-flex items-center border border-black/80 rounded-full px-3.5 py-1 text-xs font-mono tracking-widest uppercase bg-white mb-2">HONORS // AWARDS</div>\n<h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-black font-display">Recognition.</h2>',
    content
)

# 3. Update Contact section header
content = re.sub(
    r'<div className="text-xs font-mono text-slate-600 uppercase tracking-widest">/new_project</div>\s*<h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 font-display mt-1">Let&apos;s build something special.</h2>',
    '<div className="inline-flex items-center border border-black/80 rounded-full px-3.5 py-1 text-xs font-mono tracking-widest uppercase bg-white mb-2">CONTACT // CONNECT</div>\n<h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-black font-display">Let&apos;s build something special.</h2>',
    content
)

# 4. Update the main page background to cream
content = content.replace('bg-[#F3F3F5]', 'bg-[#F6F6F2]')
content = content.replace('text-slate-900', 'text-black')
content = content.replace('text-slate-600', 'text-neutral-700')
content = content.replace('rounded-3xl border border-black/[0.08]', 'rounded-3xl border-2 border-black')
content = content.replace('bg-white', 'bg-white')

with open("components/portfolio-page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

# Update Simulators file
with open("components/project-simulators.tsx", "r", encoding="utf-8") as f:
    sim_content = f.read()

sim_content = sim_content.replace('bg-slate-900', 'bg-[#121212]')
sim_content = sim_content.replace('bg-slate-800', 'bg-neutral-800')
sim_content = sim_content.replace('text-slate-100', 'text-white')
sim_content = sim_content.replace('text-slate-400', 'text-neutral-400')
sim_content = sim_content.replace('rounded-2xl', 'rounded-3xl border-2 border-black/80')

with open("components/project-simulators.tsx", "w", encoding="utf-8") as f:
    f.write(sim_content)

