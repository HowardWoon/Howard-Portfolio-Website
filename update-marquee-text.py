import os

file_path = 'components/portfolio-page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "'UM GAME JAM CHAMPION'",
    "'UM GAME JAM 2026 PUBLIC CHOICE AWARD'"
)
content = content.replace(
    "'PKUM FINANCE LEAD'",
    "'PERSATUAN KOMPUTER UNIVERSITI MALAYA (PEKOM) FINANCE LEAD'"
)
content = content.replace(
    "'V HACK QUALIFIER'",
    "'USM V HACK PRELIMINARY ROUND QUALIFIER'"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)