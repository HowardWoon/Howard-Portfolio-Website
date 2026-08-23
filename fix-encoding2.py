with open("components/hero-section.tsx", "r", encoding="utf-8", errors='ignore') as f:
    content = f.read()

import re
content = re.sub(r'Dean\'s List .* UM', "Dean's List · UM", content)

with open("components/hero-section.tsx", "w", encoding="utf-8") as f:
    f.write(content)
