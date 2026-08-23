import sys

with open('components/portfolio-page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Normalize
content = content.replace('\r\n', '\n')

content = content.replace(
    '''        {/* ================= 5. CONTACT ================= */}''',
    '''        <FaqAccordion />

        {/* ================= 5. CONTACT ================= */}'''
)

content = content.replace(
    '''        {/* ================= FOOTER ================= */}''',
    '''        <SignatureMarquee />

        {/* ================= FOOTER ================= */}'''
)

old_card_start = '                <div className="h-full p-6 sm:p-8 rounded-[32px] border border-line bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between group relative overflow-hidden">'
new_card_start = '                <div className="h-full p-6 sm:p-8 rounded-[32px] border border-line bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-line-strong">'

content = content.replace(old_card_start, new_card_start)

old_sim_container = '                      <div className="aspect-video w-full rounded-2xl bg-canvas border border-line overflow-hidden relative">'
new_sim_container = '                      <div className="aspect-video w-full rounded-2xl bg-canvas border border-line overflow-hidden relative transition-transform duration-500 group-hover:scale-[1.02]">'

content = content.replace(old_sim_container, new_sim_container)


with open('components/portfolio-page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
