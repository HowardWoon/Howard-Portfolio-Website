import os

file_path = 'components/stacked-projects.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<div className="flex-1 w-full flex items-center justify-center min-h-[350px] py-4">',
    '<div className="flex-1 w-full flex items-center justify-center min-h-[400px] lg:min-h-[450px] py-2 overflow-hidden rounded-xl">'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)