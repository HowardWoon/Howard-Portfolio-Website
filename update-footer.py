import os
import re

file_path = 'components/contact-section.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_footer = """        {/* Global Footer & Functional Sitemap */}
        <footer className="border-t-2 border-white/10 pt-12 pb-8 mt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          
          {/* Left Block: Identity & Copyright */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-amber-500 flex items-center justify-center bg-[#090B10]">
                <span className="w-4 h-4 bg-amber-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  Howard Woon <span className="text-amber-500">Hao Zhe</span>
                </h3>
                <div className="text-sm font-mono text-neutral-400 uppercase tracking-widest mt-1">
                  Systems & AI Architect
                </div>
              </div>
            </div>
            
            <div className="space-y-1 pt-2">
              <div className="text-sm font-bold text-neutral-300">
                © 2026 Howard Woon Hao Zhe. All rights reserved.
              </div>
              <div className="text-sm font-mono text-neutral-500">
                Universiti Malaya · Bachelor of Computer Science (Software Engineering, 4.00 CGPA)
              </div>
            </div>
          </div>

          {/* Right Block: System Status & Sitemap */}
          <div className="flex flex-col items-start md:items-end space-y-6">
            
            {/* System Status Display */}
            <div className="flex flex-col md:items-end space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">System Status</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">ALL SYSTEMS OPERATIONAL</span>
              </div>
              <div className="text-xs font-mono text-neutral-500 tracking-wider">
                NODE: KUL-MY-01 | LATENCY: 24ms | LOAD: 12%
              </div>
            </div>

            {/* Thick Navigation Links */}
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-x-6 gap-y-3">
              <a href="#about" className="text-sm font-bold text-white uppercase hover:text-amber-400 transition-colors">01 // Vision</a>
              <a href="#projects" className="text-sm font-bold text-white uppercase hover:text-amber-400 transition-colors">02 // Architecture</a>
              <a href="#simulators" className="text-sm font-bold text-white uppercase hover:text-amber-400 transition-colors">03 // Lab</a>
              <a href="#experience" className="text-sm font-bold text-white uppercase hover:text-amber-400 transition-colors">04 // Governance</a>
              <a href="#honors" className="text-sm font-bold text-white uppercase hover:text-amber-400 transition-colors">05 // Honors</a>
            </div>
          </div>

        </footer>"""

content = re.sub(r'\{\/\* Global Footer & Functional Sitemap \*\/}.*?<\/footer>', new_footer, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)