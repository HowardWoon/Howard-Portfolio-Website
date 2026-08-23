import os

file_path = 'components/contact-section.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace wrapper styles
content = content.replace(
    'className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-3 border-y border-amber-500/20 bg-amber-500/5 mt-16 shadow-[0_0_30px_rgba(245,158,11,0.05)]"',
    'className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-4 border-y-2 border-black bg-[#FFC700] mt-16 z-20"'
)

# Replace text styles
content = content.replace(
    '<span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest px-8">ENGINEERING SYSTEMS TO STAND OUT IN A NOISY WORLD</span>',
    '<span className="text-base sm:text-xl md:text-2xl font-sans font-black text-black uppercase tracking-wide px-6 sm:px-8">ENGINEERING SYSTEMS TO STAND OUT IN A NOISY WORLD</span>'
)

# Replace dot with asterisk
content = content.replace(
    '<span className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mx-4"></span>',
    '<span className="text-3xl sm:text-4xl text-[#00E5FF] font-black mx-2 sm:mx-4 mt-2">*</span>'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)