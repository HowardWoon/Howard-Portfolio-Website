with open("components/portfolio-page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix the import order
content = content.replace("import { HeroSection } from '@/components/hero-section';\n'use client';", "'use client';\nimport { HeroSection } from '@/components/hero-section';")

with open("components/portfolio-page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

# Add use client to HeroSection
with open("components/hero-section.tsx", "r", encoding="utf-8") as f:
    hero_content = f.read()

hero_content = '"use client";\n\n' + hero_content

with open("components/hero-section.tsx", "w", encoding="utf-8") as f:
    f.write(hero_content)
