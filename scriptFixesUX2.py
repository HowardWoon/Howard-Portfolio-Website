import re

with open("components/project-simulators.tsx", "r", encoding="utf-8") as f:
    sim_content = f.read()

# 6. Simulator Pulse Button
sim_content = sim_content.replace("{computing ? 'Routing...' : 'Route Vehicle'}", "{computing ? 'Routing...' : 'Route Vehicle'} <span className=\"absolute -top-1 -right-1 flex h-3 w-3\"><span className=\"animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75\"></span><span className=\"relative inline-flex rounded-full h-3 w-3 bg-indigo-500\"></span></span>")

old_button = """          <button
            onClick={runAllocation}
            disabled={computing || !!allocatedSlot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-slate-100 disabled:opacity-50 text-xs font-mono text-slate-900 transition-colors"
          >"""

new_button = """          <button
            onClick={runAllocation}
            disabled={computing || !!allocatedSlot}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-slate-100 disabled:opacity-50 text-xs font-mono text-slate-900 transition-colors shadow-sm" title="Click to simulate Dijkstra routing"
          >"""

sim_content = sim_content.replace(old_button, new_button)

with open("components/project-simulators.tsx", "w", encoding="utf-8") as f:
    f.write(sim_content)
