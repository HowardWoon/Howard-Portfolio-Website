import re

file_path = 'components/honors-section.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('certificateUrl: "/certificates/Latest Transcript until sem 2.pdf"', 'certificateUrl: "/certificates/HowardWoon-Transcript-Sem2.pdf"')
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Renamed PDF URL")