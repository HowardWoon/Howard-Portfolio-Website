with open("app/layout.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("import { SiteHeader } from '@/components/site-header';", "import SmoothScrollProvider from '@/components/smooth-scroll-provider';")
content = content.replace("<SiteHeader />", "")
content = content.replace("{children}", "<SmoothScrollProvider>{children}</SmoothScrollProvider>")
content = content.replace('className="', 'className="scroll-smooth ')

with open("app/layout.tsx", "w", encoding="utf-8") as f:
    f.write(content)
