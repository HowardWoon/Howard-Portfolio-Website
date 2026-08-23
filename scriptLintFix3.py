# Fix site-header.tsx
with open("components/site-header.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("</a>\n\n        {/* Center/Right:", "</Link>\n\n        {/* Center/Right:")
content = content.replace("Architecture\n          </a>", "Architecture\n          </Link>")

with open("components/site-header.tsx", "w", encoding="utf-8") as f:
    f.write(content)
