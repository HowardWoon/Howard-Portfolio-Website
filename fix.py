import re

def fix(f):
    try:
        txt = open(f, encoding='utf-8').read()
    except Exception:
        return
    if 'use client' in txt:
        txt = re.sub(r'[\'\"]use client[\'\"];?\n+', '', txt)
        txt = txt.replace("import { motion } from 'framer-motion';", "import { Reveal } from './reveal';")
        txt = txt.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { Reveal } from './reveal';\nimport { AnimatePresence } from 'framer-motion';")
        
        # Replace <motion.div ...> with <Reveal delay={...} y={...}>
        txt = re.sub(r'<motion\.div\s+initial=\{\{\s*opacity:\s*0\s*,\s*y:\s*([0-9]+)\s*\}\}\s+whileInView=\{\{\s*opacity:\s*1\s*,\s*y:\s*0\s*\}\}\s+viewport=\{\{\s*once:\s*true\s*\}\}\s+transition=\{\{[^\}]*delay:\s*([0-9.]+)[^\}]*\}\}', r'<Reveal delay={\2} y={\1}', txt)
        txt = re.sub(r'<motion\.div\s+initial=\{\{\s*opacity:\s*0\s*\}\}\s+whileInView=\{\{\s*opacity:\s*1\s*\}\}\s+viewport=\{\{\s*once:\s*true\s*\}\}\s+transition=\{\{[^\}]*delay:\s*([0-9.]+)[^\}]*\}\}', r'<Reveal delay={\1}', txt)
        
        txt = re.sub(r'</motion\.div>', '</Reveal>', txt)
        open(f, 'w', encoding='utf-8').write(txt)

fix('components/marquees.tsx')
fix('components/stacked-projects.tsx')
