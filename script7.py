import sys

with open('components/portfolio-page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

content = content.replace(
    'import { FaqAccordion } from \'@/components/faq-accordion\';',
    'import { FaqAccordion } from \'@/components/faq-accordion\';\nimport { ProjectSideRail } from \'@/components/project-side-rail\';'
)

content = content.replace(
    '        {/* ================= 2. PROJECTS ================= */}',
    '        <ProjectSideRail />\n\n        {/* ================= 2. PROJECTS ================= */}'
)

old_card = '<div className="h-full flex flex-col justify-between p-8 rounded-[24px] border border-line bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-1 hover:shadow-2xl hover:border-line-strong transition-all duration-300 group">'
new_card = '<div data-idx={idx} className="project-card-observe h-full flex flex-col justify-between p-8 rounded-[24px] border border-line bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-1 hover:shadow-2xl hover:border-line-strong transition-all duration-300 group">'

content = content.replace(old_card, new_card)

# Wait, previously I replaced old_card_start with transition-all duration-500 hover:-translate-y-2. Let me check if that succeeded.
# Let me just replace the current class string

old_card2 = '<div className="h-full p-6 sm:p-8 rounded-[32px] border border-line bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-line-strong">'
new_card2 = '<div data-idx={idx} className="project-card-observe h-full p-6 sm:p-8 rounded-[32px] border border-line bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-line-strong">'

content = content.replace(old_card2, new_card2)


# I also need to make sure the original class list isn't completely different. Let's do a regex to just add data-idx and class.
import re
content = re.sub(
    r'<div className="h-full flex flex-col justify-between p-8 rounded-\[24px\]([^"]*)">',
    r'<div data-idx={idx} className="project-card-observe h-full flex flex-col justify-between p-8 rounded-[24px]\1">',
    content
)


with open('components/portfolio-page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
