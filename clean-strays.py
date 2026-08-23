import os

files_to_check = [
    'components/stacked-projects.tsx',
    'app/layout.tsx',
    'components/bikebear-hero.tsx',
    'components/contact-section.tsx',
    'components/about-section.tsx'
]

for file_path in files_to_check:
    if not os.path.exists(file_path): continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '`n' in content:
        print(f"Found strays in {file_path}")
        content = content.replace('`n', '\n')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)