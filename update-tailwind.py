with open("tailwind.config.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("var(--font-inter)", "var(--font-sans)")
content = content.replace("var(--font-jetbrains-mono)", "var(--font-mono)")

with open("tailwind.config.ts", "w", encoding="utf-8") as f:
    f.write(content)
