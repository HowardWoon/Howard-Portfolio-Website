import re

replacements = {
    'bg-[#0C1017]': 'bg-white',
    'bg-black/90': 'bg-slate-900/60',
    'border-white/10': 'border-black/10',
    'text-white': 'text-slate-900',
    'text-slate-400': 'text-slate-500',
    'hover:bg-white/5': 'hover:bg-slate-50',
    'focus-visible:ring-indigo-400': 'focus-visible:ring-indigo-600',
    'focus-visible:ring-offset-[#0C1017]': 'focus-visible:ring-offset-white'
}

with open('components/pitch-deck-modal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

for old, new in replacements.items():
    content = content.replace(old, new)

with open('components/pitch-deck-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
