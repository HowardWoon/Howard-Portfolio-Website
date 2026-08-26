import re

file_path = 'components/honors-section.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The deans-list object ends with:
#         highlights: [],
#       icon: GraduationCap,
#     },

target = r'(id: "deans-list",[\s\S]*?highlights: \[\],)\s*icon: GraduationCap,'
replacement = r'\1\n      certificateUrl: "/certificates/HowardWoon-Transcript-Sem2.pdf",\n      icon: GraduationCap,'

new_content = re.sub(target, replacement, content)

if content == new_content:
    print("Failed to replace!")
else:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully added certificateUrl to deans-list")