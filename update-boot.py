import re

file_path = 'components/boot-sequence.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = r"""    // Only run client-side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      const hasBooted = sessionStorage.getItem('hasBooted');
      const prefersReducedMotion = window.matchMedia('\(prefers-reduced-motion: reduce\)').matches;
      
      if (hasBooted || prefersReducedMotion) {
        setShowBoot\(false\);
        return;
      }
    }
  \}, \[\]\);"""

replacement = """    // Only run client-side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      const hasBooted = sessionStorage.getItem('hasBooted');
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (hasBooted || prefersReducedMotion) {
        setShowBoot(false);
        return;
      }
      
      // Auto-boot for recruiters
      const timer = setTimeout(() => {
        handleStartBoot();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);"""

content = re.sub(target, replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated boot sequence to auto-boot")