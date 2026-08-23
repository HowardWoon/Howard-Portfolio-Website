import re

with open("components/portfolio-page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add imports
if "BikebearInspiredHero" not in content:
    content = content.replace("import { HeroSection } from '@/components/hero-section';", "import BikebearInspiredHero from '@/components/bikebear-hero';\nimport StackedProjects from '@/components/stacked-projects';")

# Swap out the Hero
content = content.replace("<HeroSection />", "<BikebearInspiredHero />")

# Swap out the selected-work section
start_tag = '<section id="selected-work" className="space-y-10 scroll-mt-24">'
end_tag = '</section>'

start_idx = content.find(start_tag)
if start_idx != -1:
    end_idx = content.find(end_tag, start_idx) + len(end_tag)
    
    # We replace the old section with StackedProjects
    content = content[:start_idx] + "<StackedProjects />" + content[end_idx:]

with open("components/portfolio-page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
