import re

file_path = 'components/ui/noise-background.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('from "motion/react"', 'from "framer-motion"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced motion/react with framer-motion in noise-background.tsx")