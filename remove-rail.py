import re

with open("components/bikebear-hero.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove the aside block
aside_pattern = r'\s*\{\/\* Sticky Left Vertical Edge Tab \*\/\}\s*<aside className="fixed left-0.*?<\/aside>'
content = re.sub(aside_pattern, '', content, flags=re.DOTALL)

# Revert padding on main
content = content.replace('lg:pl-24 lg:pr-16', 'lg:px-16')

with open("components/bikebear-hero.tsx", "w", encoding="utf-8") as f:
    f.write(content)
