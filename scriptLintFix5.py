with open("components/project-simulators.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("useState<any>(null);", "useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any")

with open("components/project-simulators.tsx", "w", encoding="utf-8") as f:
    f.write(content)
