with open("components/stacked-projects.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace individual background colors with #121212
content = content.replace('"#0F172A"', '"#121212"')
content = content.replace('"#1E293B"', '"#121212"')
content = content.replace('"#111827"', '"#121212"')

# Replace border-white/15 with border-neutral-800
content = content.replace('border border-white/15', 'border border-neutral-800')

# Update Section pill
content = content.replace('<span className="text-xs font-mono uppercase tracking-widest text-cyan-400">02 // PORTFOLIO</span>', '<div className="inline-flex items-center border border-white/80 rounded-full px-3.5 py-1 text-xs font-mono tracking-widest uppercase text-white bg-transparent">PROJECTS // PRODUCTION</div>')

# Apply yellow accent highlights. We can make the ArrowUpRight icon yellow, or the tags.
# "featuring yellow accent highlights (`text-[#F5C400]`)"
content = content.replace('bg-white text-black', 'bg-[#F5C400] text-black')
content = content.replace('text-cyan-300', 'text-[#F5C400]')

with open("components/stacked-projects.tsx", "w", encoding="utf-8") as f:
    f.write(content)
