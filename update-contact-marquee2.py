import os
import re

file_path = 'components/contact-section.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace wrapper
content = re.sub(
    r'<div className="w-full overflow-hidden bg-amber-500/10 border-y border-amber-500/20 py-3 mt-16 w-screen relative left-1/2 right-1/2 -ml-\[50vw\] -mr-\[50vw\]">',
    '<div className="w-full overflow-hidden bg-[#FFC700] border-y-2 border-black py-4 mt-16 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] z-20">',
    content
)

# Replace text
content = re.sub(
    r'<span className="text-xs font-mono font-medium text-amber-500 px-8">ENGINEERING SYSTEMS TO STAND OUT IN A NOISY WORLD</span>',
    '<span className="text-base sm:text-xl md:text-2xl font-sans font-black text-black uppercase tracking-wide px-6 sm:px-8">ENGINEERING SYSTEMS TO STAND OUT IN A NOISY WORLD</span>',
    content
)

# Replace dot
content = re.sub(
    r'<span className="w-1\.5 h-1\.5 rounded-full bg-amber-500 mx-4"></span>',
    '<span className="text-3xl sm:text-4xl text-[#00E5FF] font-black mx-2 sm:mx-4 mt-2">*</span>',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)