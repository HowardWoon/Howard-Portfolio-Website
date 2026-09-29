import re

# B-1: section-spine.tsx
with open('components/section-spine.tsx', 'r', encoding='utf-8') as f: text = f.read()
if 'route-preview' not in text:
    text = text.replace(
        'export function SectionSpine() {',
        'export function SectionSpine() {\n  const [previewId, setPreviewId] = React.useState<string | null>(null);\n  React.useEffect(() => {\n    const handle = (e: Event) => {\n      const ce = e as CustomEvent<{ id: string | null }>;\n      setPreviewId(ce.detail.id);\n    };\n    window.addEventListener(\'route-preview\', handle);\n    return () => window.removeEventListener(\'route-preview\', handle);\n  }, []);'
    )
    text = text.replace(
        'import { useActiveSection } from \'@/lib/use-active-section\';',
        'import React from \'react\';\nimport { useActiveSection } from \'@/lib/use-active-section\';'
    )
    text = text.replace(
        'const on = active === s.id;',
        'const on = active === s.id;\n        const preview = previewId === s.id;'
    )
    text = text.replace(
        'className={`relative w-[17px] h-[17px]',
        'className={`relative w-[17px] h-[17px] ${preview ? \'bg-pop-yellow scale-125\' : \'\'}'
    )
    with open('components/section-spine.tsx', 'w', encoding='utf-8') as f: f.write(text)

# B-1: site-header.tsx
with open('components/site-header.tsx', 'r', encoding='utf-8') as f: text = f.read()
if 'route-preview' not in text:
    nav_html = """
        <nav className="hidden xl:flex items-center gap-6 mr-4">
          {[
            { id: 'about', label: 'About' },
            { id: 'projects', label: 'Projects' },
            { id: 'experience', label: 'Experience' },
            { id: 'honors', label: 'Honors' },
            { id: 'contact', label: 'Contact' }
          ].map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="relative text-sm font-extrabold uppercase tracking-widest text-ink hover:text-pop-blue transition-colors after:absolute after:-bottom-1 after:left-0 after:w-full after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100 after:origin-left after:transition-transform after:h-[3px] after:bg-pop-yellow"
              onPointerEnter={() => window.dispatchEvent(new CustomEvent('route-preview', { detail: { id: s.id } }))}
              onPointerLeave={() => window.dispatchEvent(new CustomEvent('route-preview', { detail: { id: null } }))}
              onFocus={() => window.dispatchEvent(new CustomEvent('route-preview', { detail: { id: s.id } }))}
              onBlur={() => window.dispatchEvent(new CustomEvent('route-preview', { detail: { id: null } }))}
            >
              {s.label}
            </a>
          ))}
        </nav>
"""
    text = text.replace(
        '<Magnetic strength={0.3} stretch>',
        nav_html + '        <Magnetic strength={0.3} stretch>'
    )
    with open('components/site-header.tsx', 'w', encoding='utf-8') as f: f.write(text)

# B-2: bikebear-hero.tsx
with open('components/bikebear-hero.tsx', 'r', encoding='utf-8') as f: text = f.read()
if 'FX.heroInspection' not in text:
    old_mag = """      {/* Scaled X-Ray Magnification Text (decorative duplicate) */}
      <div
        aria-hidden="true"
        className={`${headlineClass} text-pop-blue absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-150 group-data-[hover=true]/headline:opacity-100`}
        style={{
          transform: 'scale(1.15)',
          transformOrigin: 'var(--mx) var(--my)',
          WebkitMaskImage: 'radial-gradient(circle 140px at var(--mx) var(--my), black 60%, transparent 100%)',
          maskImage: 'radial-gradient(circle 140px at var(--mx) var(--my), black 60%, transparent 100%)',
        }}
      >
        ENGINEERING <br />
        <span className={`${chipClass} bg-pop-red border-ink text-white`}>SYSTEMS TO</span> <br />
        STAND OUT IN <br />A NOISY WORLD.
      </div>"""
    
    new_mag = """      {/* Scaled X-Ray Magnification Text (decorative duplicate) */}
      <div
        aria-hidden="true"
        className={`${headlineClass} text-pop-blue absolute inset-0 pointer-events-none opacity-0 transition-[opacity,clip-path] duration-150 group-data-[hover=true]/headline:opacity-100`}
        style={{
          ...(FX.heroInspection ? {
            WebkitTextStroke: '2px #0a0a0a',
            clipPath: 'circle(70px at var(--mx) var(--my))'
          } : {
            transform: 'scale(1.15)',
            transformOrigin: 'var(--mx) var(--my)',
            WebkitMaskImage: 'radial-gradient(circle 140px at var(--mx) var(--my), black 60%, transparent 100%)',
            maskImage: 'radial-gradient(circle 140px at var(--mx) var(--my), black 60%, transparent 100%)',
          })
        }}
      >
        ENGINEERING <br />
        <span className={`${chipClass} bg-pop-red border-ink text-white`}>SYSTEMS TO</span> <br />
        STAND OUT IN <br />A NOISY WORLD.
      </div>"""
    text = text.replace(old_mag, new_mag)
    with open('components/bikebear-hero.tsx', 'w', encoding='utf-8') as f: f.write(text)

# B-3: project-index.tsx
with open('components/project-index.tsx', 'r', encoding='utf-8') as f: text = f.read()
if 'data-preview' not in text:
    text = text.replace(
        '<a\n                href={`#project-${p.id}`}',
        '<a\n                onPointerEnter={() => FX.honorConstellation && document.querySelector(`[data-project-id="${p.id}"]`)?.setAttribute(\'data-preview\', \'\')}\n                onPointerLeave={() => FX.honorConstellation && document.querySelector(`[data-project-id="${p.id}"]`)?.removeAttribute(\'data-preview\')}\n                href={`#project-${p.id}`}'
    )
    with open('components/project-index.tsx', 'w', encoding='utf-8') as f: f.write(text)

# B-3: honors-section.tsx
with open('components/honors-section.tsx', 'r', encoding='utf-8') as f: text = f.read()
if 'data-honor-projects' not in text:
    text = text.replace(
        '<div\n                  key={honor.id}',
        'const linked = honor.id === \'supervity\' ? \'zerolag\' : honor.id === \'proofpay\' ? \'proofpay\' : undefined;\n                return (<div\n                  key={honor.id}\n                  data-honor-projects={linked}'
    )
    text = text.replace(
        '<div\n            key={honor.id}',
        'const linked = honor.id === \'supervity\' ? \'zerolag\' : honor.id === \'proofpay\' ? \'proofpay\' : undefined;\n          return (<div\n            key={honor.id}\n            data-honor-projects={linked}'
    )
    # The return replacement means we need to wrap the body in braces. Wait!
    # Let me use regex for honors-section.tsx
    pass
