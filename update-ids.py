import os
import re

file_path = 'components/portfolio-page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("<AboutSection />", "<div id=\"about\"><AboutSection /></div>")
content = content.replace("<StackedProjects />", "<div id=\"projects\"><StackedProjects /></div>")
content = content.replace("<ExperienceSection />", "<div id=\"experience\"><ExperienceSection /></div>")
content = content.replace("<HonorsSection />", "<div id=\"honors\"><HonorsSection /></div>")

# Simulators is not its own component right now, it might be inside stacked projects or something else, wait.
# The user's buttons say 03 // LAB. We can just link it to projects or experience. 
# Let's check what Simulators corresponds to.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)