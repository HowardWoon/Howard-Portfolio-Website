with open('components/fx/pointer-field.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

if 'idleTimer' not in text:
    old_move = """    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(write);
    };"""

    new_move = """    let idleTimer: any;
    const setIdle = () => {
      if (FX.depthLock) {
        visible.forEach(el => el.style.setProperty('--glare-o', '0.6'));
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (FX.depthLock) {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(setIdle, 150);
        visible.forEach(el => el.style.removeProperty('--glare-o'));
      }
      if (!raf) raf = requestAnimationFrame(write);
    };"""
    
    text = text.replace(old_move, new_move)
    text = text.replace('if (raf) cancelAnimationFrame(raf);', 'if (raf) cancelAnimationFrame(raf);\n      clearTimeout(idleTimer);')
    with open('components/fx/pointer-field.tsx', 'w', encoding='utf-8') as f: f.write(text)

