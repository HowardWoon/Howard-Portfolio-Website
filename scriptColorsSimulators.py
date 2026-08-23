import re

replacements = {
    'bg-black/40': 'bg-white',
    'bg-white/10': 'bg-slate-100',
    'border-white/20': 'border-black/20',
    'border-white/5': 'border-black/5',
    'border-white/10': 'border-black/10',
    'text-slate-500/30': 'text-slate-400/50',
    'text-slate-500': 'text-slate-500',
    'text-slate-300': 'text-slate-600',
    'text-white': 'text-slate-900',
    'text-indigo-400': 'text-indigo-600',
    'accent-indigo-500': 'accent-indigo-600',
    'accent-white': 'accent-slate-900',
    'text-emerald-400': 'text-emerald-600',
    'text-rose-400': 'text-rose-600'
}

with open('components/project-simulators.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

for old, new in replacements.items():
    content = content.replace(old, new)

with open('components/project-simulators.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
