# Fix portfolio-page.tsx
with open("components/portfolio-page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("{//}", "{\"//\"}")

with open("components/portfolio-page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

