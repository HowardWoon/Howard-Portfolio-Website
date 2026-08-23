import os

file_path = 'components/bikebear-hero.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'tracking-tight leading-[0.92]',
    'tracking-normal leading-[1.05]'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)