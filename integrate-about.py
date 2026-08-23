with open("components/portfolio-page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the old About section with the new AboutSection component
start_tag = '<section id="about"'
end_tag = '</section>'

start_idx = content.find(start_tag)
if start_idx != -1:
    end_idx = content.find(end_tag, start_idx) + len(end_tag)
    
    # We replace the old section with <AboutSection />
    content = content[:start_idx] + "<AboutSection />" + content[end_idx:]
    
# Add the import if it is not there
if "import AboutSection from '@/components/about-section';" not in content:
    content = content.replace("import StackedProjects", "import AboutSection from '@/components/about-section';\nimport StackedProjects")

with open("components/portfolio-page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
