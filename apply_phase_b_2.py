import re

with open('components/interactive-photo-stack.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

if 'uid: string;' not in text:
    # 1. Update PhotoLightbox props to accept uid
    text = text.replace(
        '  onClose:\n}: {\n  list: Photo[];\n  index: number;\n  onIndex: (i: number) => void;\n  onClose: () => void;\n}) {',
        '  onClose,\n  uid\n}: {\n  list: Photo[];\n  index: number;\n  onIndex: (i: number) => void;\n  onClose: () => void;\n  uid: string;\n}) {'
    )
    # Note: wait, the original was:
    #  onClose,
    #}: {
    # Let me just use regex
    text = re.sub(
        r'  onClose,\n}: {\n  list: Photo\[\];\n  index: number;\n  onIndex: \(i: number\) => void;\n  onClose: \(\) => void;\n}\) {',
        '  onClose,\n  uid,\n}: {\n  list: Photo[];\n  index: number;\n  onIndex: (i: number) => void;\n  onClose: () => void;\n  uid: string;\n}) {',
        text
    )

    # 2. Add layoutId to m.div inside PhotoLightbox
    # original:
    #         <m.div
    #          initial={{ scale: 0.95, y: 20 }}
    #          animate={{ scale: 1, y: 0 }}
    #          exit={{ scale: 0.95, y: 20 }}
    #          onClick={(e) => e.stopPropagation()}
    
    text = text.replace(
        '<m.div\n          initial={{ scale: 0.95, y: 20 }}',
        '<m.div\n          layoutId={FX.lightboxMorph ? `${uid}-${photo.src}` : undefined}\n          initial={{ scale: 0.95, y: 20 }}'
    )
    
    # 3. Move LayoutGroup to wrap AnimatePresence
    text = text.replace(
        '      </LayoutGroup>\n\n      {mounted && (\n        <AnimatePresence>\n          {viewer !== null && (\n            <PhotoLightbox list={source} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />\n          )}\n        </AnimatePresence>\n      )}\n    </>\n  );',
        '      {mounted && (\n        <AnimatePresence>\n          {viewer !== null && (\n            <PhotoLightbox list={source} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} uid={uid} />\n          )}\n        </AnimatePresence>\n      )}\n      </LayoutGroup>\n    </>\n  );'
    )
    
    with open('components/interactive-photo-stack.tsx', 'w', encoding='utf-8') as f: f.write(text)
