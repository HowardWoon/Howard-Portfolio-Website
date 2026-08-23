import sys

with open('components/portfolio-page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Normalize
content = content.replace('\r\n', '\n')

# 1. Imports
imports = '''import { PitchDeckModal } from '@/components/pitch-deck-modal';
import { BootSequence } from '@/components/boot-sequence';
import { TechMarquee, SignatureMarquee } from '@/components/marquees';
import { FaqAccordion } from '@/components/faq-accordion';
import {
  SlotifySimulator,
  ZeroLagSimulator,
  BLAHujanSimulator,
  SensorSenseiSimulator,
} from '@/components/project-simulators';'''

content = content.replace(
    '''import { PitchDeckModal } from '@/components/pitch-deck-modal';
import {
  SlotifySimulator,
  ZeroLagSimulator,
  BLAHujanSimulator,
  SensorSenseiSimulator,
} from '@/components/project-simulators';''',
    imports
)

# 2. Add BootSequence wrapper
content = content.replace(
    'return (\n    <div className="min-h-screen bg-canvas selection:bg-signal/30 selection:text-signal">',
    'return (\n    <BootSequence>\n    <div className="min-h-screen bg-canvas selection:bg-signal/30 selection:text-signal">'
)

content = content.replace(
    '    </div>\n  );\n}',
    '    </div>\n    </BootSequence>\n  );\n}'
)

# 3. Add Tech Marquee
# Extract skills
tech_marquee_insert = '''        </section>

        <TechMarquee skills={Array.from(new Set(techMatrix.flatMap(t => t.skills)))} />

        {/* ================= 2. PROJECTS ================= */}'''

content = content.replace(
    '''        </section>

        {/* ================= 2. PROJECTS ================= */}''',
    tech_marquee_insert
)

# 4. Add FAQ Accordion
faq_insert = '''        <FaqAccordion />

        {/* ================= 5. CONTACT ================= */}'''

content = content.replace(
    '        {/* ================= 5. CONTACT ================= */}',
    faq_insert
)

# 5. Add Signature Marquee
sig_insert = '''          </section>

          <SignatureMarquee />

          {/* ================= FOOTER ================= */}'''

content = content.replace(
    '''          </section>

          {/* ================= FOOTER ================= */}''',
    sig_insert
)

# 6. Enhance project cards (Hover-activated media)
old_card_start = '                <div className="h-full p-6 sm:p-8 rounded-[32px] border border-line bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between group relative overflow-hidden">'
new_card_start = '                <div className="h-full p-6 sm:p-8 rounded-[32px] border border-line bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-line-strong">'

content = content.replace(old_card_start, new_card_start)

# The simulator container in projects
old_sim_container = '                      <div className="aspect-video w-full rounded-2xl bg-canvas border border-line overflow-hidden relative">'
new_sim_container = '                      <div className="aspect-video w-full rounded-2xl bg-canvas border border-line overflow-hidden relative transition-transform duration-500 group-hover:scale-[1.02]">'

content = content.replace(old_sim_container, new_sim_container)

with open('components/portfolio-page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done python script 3")
