import re

replacements = {
    'bg-canvas': 'bg-black/40',
    'bg-surface-2': 'bg-white/10',
    'bg-surface': 'bg-black/40',
    'border-line-strong': 'border-white/20',
    'border-line/50': 'border-white/5',
    'border-line': 'border-white/10',
    'text-ink-3/30': 'text-slate-500/30',
    'text-ink-3': 'text-slate-500',
    'text-ink-2': 'text-slate-300',
    'text-ink': 'text-white',
    'text-signal': 'text-indigo-400',
    'accent-signal': 'accent-indigo-500',
    'accent-ink': 'accent-white',
    'text-success': 'text-emerald-400',
    'text-danger': 'text-rose-400',
}

with open('components/project-simulators.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

for old, new in replacements.items():
    content = content.replace(old, new)

with open('components/project-simulators.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
