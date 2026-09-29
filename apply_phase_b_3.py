# B-5: site-header.tsx, scroll-to-top.tsx, globals.css

with open('components/site-header.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
    text = text.replace('className="group nb-btn nb-btn-yellow', 'className="group nb-resume nb-btn nb-btn-yellow')
    with open('components/site-header.tsx', 'w', encoding='utf-8') as f: f.write(text)

with open('components/scroll-to-top.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
    old_scroll = '''  const scrollToTop = () => {
    // Use Lenis when active so the two scroll engines don't fight each other
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };'''
    new_scroll = '''  const scrollToTop = () => {
    // Use Lenis when active so the two scroll engines don't fight each other
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    const dot = document.querySelector('.nb-led') as HTMLElement;
    if (dot) {
      dot.style.animationIterationCount = '1';
      setTimeout(() => { dot.style.animationIterationCount = 'infinite'; }, 1200);
    }
  };'''
    text = text.replace(old_scroll, new_scroll)
    with open('components/scroll-to-top.tsx', 'w', encoding='utf-8') as f: f.write(text)

with open('app/globals.css', 'a', encoding='utf-8') as f:
    f.write('''
@media (hover: hover) {
  .nb-resume:hover {
    transform: translate(-2px, -3px) rotate(-1deg);
    box-shadow: 6px 6px 0 0 #0a0a0a !important;
  }
  .fx-case-folder {
    position: relative;
  }
  .fx-case-folder::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 20px;
    width: 60px;
    height: 10px;
    background: inherit;
    border: 3px solid #0a0a0a;
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    transition: transform 0.2s;
    z-index: -1;
  }
  .fx-case-folder:hover::before {
    transform: translateY(-4px);
  }
}
''')

# Now add .fx-case-folder to experience cards!
with open('components/experience-section.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
    text = text.replace('className="relative group bg-white border-3 border-ink rounded-[28px] overflow-hidden shadow-brutal hover:shadow-brutal-lg transition-all duration-300"', 'className="relative group fx-case-folder bg-white border-3 border-ink rounded-[28px] overflow-hidden shadow-brutal hover:shadow-brutal-lg transition-all duration-300"')
    # Or in general:
    text = text.replace('className={`relative group bg-white border-3 border-ink rounded-[28px] overflow-hidden transition-all duration-300 ${', 'className={`relative group fx-case-folder bg-white border-3 border-ink rounded-[28px] overflow-hidden transition-all duration-300 ${')
    with open('components/experience-section.tsx', 'w', encoding='utf-8') as f: f.write(text)
