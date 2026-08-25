import re

file_path = 'components/about-section.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = r"""            \{architecturePillars\.map\(\(pillar, idx\) => \{
              const Icon = pillar\.icon;
              const isActive = activeCard === pillar\.id;

              return \(
                <motion\.div
                  key=\{pillar\.id\}
                  initial=\{\{ opacity: 0, y: 30 \}\}
                  whileInView=\{\{ opacity: 1, y: 0 \}\}
                  viewport=\{\{ once: true \}\}
                  transition=\{\{ duration: 0\.6, delay: idx \* 0\.1 \}\}
                  onClick=\{\(\) => setActiveCard\(pillar\.id\)\}
                  className=\{`relative group cursor-pointer rounded-3xl p-8 border transition-all duration-500 flex flex-col justify-between space-y-6 \$\{
                    isActive
                      \? "bg-\[#121622\] border-amber-500/60 shadow-2xl shadow-amber-500/10"
                      : "bg-\[#0E121B\]/90 hover:bg-\[#121622\] border-white/10 hover:border-white/25"
                  \}`\}
                >
                  \{\/\* Top Card Bar: Category Tag \+ Icon \*\/\}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
                      \{pillar\.category\}
                    </span>
                    <div className=\{`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 \$\{
                      isActive 
                        \? "bg-amber-400/20 border-amber-400/50 text-amber-400" 
                        : "bg-white/5 border-white/10 text-neutral-300 group-hover:text-white"
                    \}`\}>"""

replacement = """            {architecturePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isActive = activeCard === pillar.id;

              const getColors = (color: string, active: boolean) => {
                if (!active) return { border: "border-white/10 hover:border-white/25", iconBg: "bg-white/5 border-white/10 text-neutral-300 group-hover:text-white" };
                switch (color) {
                  case 'cyan': return { border: "border-cyan-500/60 shadow-2xl shadow-cyan-500/10", iconBg: "bg-cyan-400/20 border-cyan-400/50 text-cyan-400" };
                  case 'purple': return { border: "border-purple-500/60 shadow-2xl shadow-purple-500/10", iconBg: "bg-purple-400/20 border-purple-400/50 text-purple-400" };
                  case 'emerald': return { border: "border-emerald-500/60 shadow-2xl shadow-emerald-500/10", iconBg: "bg-emerald-400/20 border-emerald-400/50 text-emerald-400" };
                  case 'amber': default: return { border: "border-amber-500/60 shadow-2xl shadow-amber-500/10", iconBg: "bg-amber-400/20 border-amber-400/50 text-amber-400" };
                }
              };
              const colors = getColors(pillar.color, isActive);

              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  onClick={() => setActiveCard(pillar.id)}
                  className={`relative group cursor-pointer rounded-3xl p-8 border transition-all duration-500 flex flex-col justify-between space-y-6 ${
                    isActive ? `bg-[#121622] ${colors.border}` : `bg-[#0E121B]/90 hover:bg-[#121622] ${colors.border}`
                  }`}
                >
                  {/* Top Card Bar: Category Tag + Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
                      {pillar.category}
                    </span>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 ${colors.iconBg}`}>"""

content = re.sub(target, replacement, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated about-section.tsx colors")