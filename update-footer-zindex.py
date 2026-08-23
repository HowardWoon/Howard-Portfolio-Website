import os

file_path = 'components/contact-section.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<footer className="border-t-2 border-white/10 pt-12 pb-8 mt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">',
    '<footer className="relative z-10 border-t-2 border-white/10 pt-12 pb-8 mt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)