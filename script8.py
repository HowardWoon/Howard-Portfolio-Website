import sys

with open('components/portfolio-page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

content = content.replace(
    '        {/* ================= 6. CONTACT ================= */}',
    '        <FaqAccordion />\n\n        {/* ================= 6. CONTACT ================= */}'
)

with open('components/portfolio-page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
