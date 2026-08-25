import re

file_path = 'components/boot-sequence.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# First we need to extract handleStartBoot and move it before useEffect
# Actually, since it uses states, let's wrap it in a useCallback or just rewrite the useEffect inside a functional component to use function hoisting.
# Wait, changing `const handleStartBoot = () => ...` to `function handleStartBoot() { ... }` will hoist it!

content = content.replace("const handleStartBoot = () => {", "function handleStartBoot() {")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Hoisted handleStartBoot")