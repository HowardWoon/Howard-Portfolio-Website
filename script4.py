import sys

with open('components/portfolio-page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '  return (\n    <div className="relative min-h-screen',
    '  return (\n    <BootSequence>\n    <div className="relative min-h-screen'
)

with open('components/portfolio-page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
