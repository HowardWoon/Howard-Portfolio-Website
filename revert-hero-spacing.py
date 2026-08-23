import os

file_path = 'components/bikebear-hero.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black uppercase tracking-wide leading-[1.1] text-white [word-spacing:0.3em]"',
    'className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black uppercase tracking-tight leading-[0.92] text-white"'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)