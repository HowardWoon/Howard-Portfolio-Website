import os
import glob
import re

files = glob.glob('components/**/*.tsx', recursive=True) + glob.glob('app/**/*.tsx', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    def repl(m):
        return m.group(0).replace(' ', '_')
        
    new_content = re.sub(r'/(?:certificates|images)/[^\"\'\`]+?\.[a-zA-Z]{3,4}', repl, content)
    
    if new_content != content:
        print("Updated", f)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
