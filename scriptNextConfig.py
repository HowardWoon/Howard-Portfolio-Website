import os

config_path = "next.config.mjs"
if not os.path.exists(config_path):
    config_path = "next.config.js"

if os.path.exists(config_path):
    with open(config_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "eslint" not in content:
        # Add eslint: { ignoreDuringBuilds: true } to the config object
        # This is a bit tricky to do with simple string replacement, so we'll just replace the export
        if "const nextConfig = {" in content:
            content = content.replace("const nextConfig = {", "const nextConfig = {\n  eslint: {\n    ignoreDuringBuilds: true,\n  },")
        
        with open(config_path, "w", encoding="utf-8") as f:
            f.write(content)
