with open("components/portfolio-page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('pt-28 sm:pt-32 pb-32 space-y-36', 'pt-16 pb-32 space-y-36')

with open("components/portfolio-page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
