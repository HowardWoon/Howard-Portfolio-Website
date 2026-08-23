import re

with open('lib/site-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("      deckUrl: '/documents/dsaise-pitchdeck.pdf',\n", "")

with open('lib/site-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)
