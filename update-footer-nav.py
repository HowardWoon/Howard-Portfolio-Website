import os
import re

file_path = 'components/contact-section.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

original_nav = """            {/* Thick Navigation Links */}
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-x-6 gap-y-3">
              <a href="#about" className="text-sm font-bold text-white uppercase hover:text-amber-400 transition-colors">01 // Vision</a>
              <a href="#projects" className="text-sm font-bold text-white uppercase hover:text-amber-400 transition-colors">02 // Architecture</a>
              <a href="#simulators" className="text-sm font-bold text-white uppercase hover:text-amber-400 transition-colors">03 // Lab</a>
              <a href="#experience" className="text-sm font-bold text-white uppercase hover:text-amber-400 transition-colors">04 // Governance</a>
              <a href="#honors" className="text-sm font-bold text-white uppercase hover:text-amber-400 transition-colors">05 // Honors</a>
            </div>"""

new_nav = """            {/* Structured Navigation Directory */}
            <div className="flex flex-col items-start md:items-end space-y-2.5 mt-4 pt-4 border-t border-white/5 w-full min-w-[200px]">
              <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.2em] mb-1">Index Directory</span>
              <a href="#about" className="group flex items-center gap-3 text-xs sm:text-sm font-mono font-bold text-neutral-400 hover:text-amber-400 transition-all">
                <span className="w-4 h-px bg-white/10 group-hover:bg-amber-400 transition-colors" />
                01 // VISION
              </a>
              <a href="#projects" className="group flex items-center gap-3 text-xs sm:text-sm font-mono font-bold text-neutral-400 hover:text-amber-400 transition-all">
                <span className="w-4 h-px bg-white/10 group-hover:bg-amber-400 transition-colors" />
                02 // ARCHITECTURE
              </a>
              <a href="#experience" className="group flex items-center gap-3 text-xs sm:text-sm font-mono font-bold text-neutral-400 hover:text-amber-400 transition-all">
                <span className="w-4 h-px bg-white/10 group-hover:bg-amber-400 transition-colors" />
                03 // GOVERNANCE
              </a>
              <a href="#honors" className="group flex items-center gap-3 text-xs sm:text-sm font-mono font-bold text-neutral-400 hover:text-amber-400 transition-all">
                <span className="w-4 h-px bg-white/10 group-hover:bg-amber-400 transition-colors" />
                04 // HONORS
              </a>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="group flex items-center gap-3 text-xs sm:text-sm font-mono font-bold text-white hover:text-amber-400 transition-all mt-2"
              >
                <span className="w-4 h-px bg-white/30 group-hover:bg-amber-400 transition-colors" />
                BACK TO TOP 
              </button>
            </div>"""

content = content.replace(original_nav, new_nav)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)