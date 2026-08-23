import re

with open("components/portfolio-page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Find the start of the <main> tag
main_start = content.find('<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-32 space-y-36">')

# We want to insert the HeroSection BEFORE the <main> tag
# And remove the old hero section inside the <main> tag

# Find the old hero section
hero_start = content.find('<section className="relative min-h-[70vh] sm:min-h-[78vh] flex flex-col justify-between pt-6">')
hero_end = content.find('</section>', hero_start) + len('</section>')

# Remove the old hero section
content = content[:hero_start] + content[hero_end:]

# Insert <HeroSection /> before <main>
content = content.replace('<main ', '<HeroSection />\n      <main ')

# Add the import at the top
import_str = "import { HeroSection } from '@/components/hero-section';\n"
content = import_str + content

with open("components/portfolio-page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
