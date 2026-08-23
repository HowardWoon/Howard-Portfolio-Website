import os

file_path = 'components/about-section.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-5xl leading-[1.08]"',
    'className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-normal text-white max-w-5xl leading-tight"'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)