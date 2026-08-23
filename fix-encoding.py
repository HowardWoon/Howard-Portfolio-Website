with open("components/hero-section.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix encoding corruption if any
content = content.replace("", "·")
content = content.replace("Dean's List · UM", "Dean's List · UM") 
content = content.replace("KUALA LUMPUR, MY · UNIVERSITI MALAYA", "KUALA LUMPUR, MY · UNIVERSITI MALAYA")

with open("components/hero-section.tsx", "w", encoding="utf-8") as f:
    f.write(content)
