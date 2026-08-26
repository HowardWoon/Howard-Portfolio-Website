import re

file_path = 'components/boot-sequence.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the overly complex CSS variables with standard tailwind shadows
content = content.replace(
    'shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)]',
    'shadow-md'
)
content = content.replace(
    'dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)]',
    'dark:shadow-md'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned up button shadows")