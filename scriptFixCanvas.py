import os

canvas_dir = "components/canvas"
if os.path.exists(canvas_dir):
    # Fix Meteors.tsx
    meteors_path = os.path.join(canvas_dir, "Meteors.tsx")
    if os.path.exists(meteors_path):
        with open(meteors_path, "r", encoding="utf-8") as f:
            content = f.read()
        content = content.replace("any", "unknown") # Safe quick fix or add eslint disable
        with open(meteors_path, "w", encoding="utf-8") as f:
            f.write(content)

    # Fix TechGalaxy.tsx
    tech_galaxy_path = os.path.join(canvas_dir, "TechGalaxy.tsx")
    if os.path.exists(tech_galaxy_path):
        with open(tech_galaxy_path, "r", encoding="utf-8") as f:
            content = f.read()
        content = content.replace("any", "unknown")
        with open(tech_galaxy_path, "w", encoding="utf-8") as f:
            f.write(content)
