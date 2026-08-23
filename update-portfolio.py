import re

with open("components/portfolio-page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Check if HeroSection is already imported
if "import { HeroSection }" not in content:
    # Add import
    content = content.replace("'use client';\n", "'use client';\nimport { HeroSection } from '@/components/hero-section';\n")

# Find the old hero section
hero_start = content.find('<section className="relative min-h-[70vh] sm:min-h-[78vh] flex flex-col justify-between pt-6">')
if hero_start != -1:
    hero_end = content.find('</section>', hero_start) + len('</section>')
    content = content[:hero_start] + content[hero_end:]

# Insert <HeroSection /> before <main>
if "<HeroSection />" not in content:
    content = content.replace('<main ', '<HeroSection />\n      <main ')

# Fix padding on main
content = content.replace('pt-28 sm:pt-32 pb-32 space-y-36', 'pt-16 pb-32 space-y-36')

with open("components/portfolio-page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
