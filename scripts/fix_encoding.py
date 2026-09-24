#!/usr/bin/env python3
"""Repair UTF-8 text that was mis-decoded as Windows-1252 and re-saved (mojibake), and strip UTF-8 BOMs.
Usage:  python scripts/fix_encoding.py            (dry run)
        python scripts/fix_encoding.py --write    (apply)"""
import re, subprocess, sys
CP1252_SPECIAL = set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ')
RUN = re.compile('[\u0080-ÿ' + ''.join(CP1252_SPECIAL) + ']{2,}')

def to_bytes(s):
    out = bytearray()
    for ch in s:
        o = ord(ch)
        if o < 0x100 and not (0x80 <= o <= 0x9f and ch not in '\x81\x8d\x8f\x90\x9d'):
            out.append(o)
        else:
            out += ch.encode('cp1252')
    return bytes(out)

def repair(text):
    def fix(m):
        s = m.group(0)
        try:
            return to_bytes(s).decode('utf-8')
        except (UnicodeDecodeError, UnicodeEncodeError):
            return s
    for _ in range(3):            # some lines were double-encoded
        new = RUN.sub(fix, text)
        if new == text:
            break
        text = new
    return text

write = '--write' in sys.argv
files = subprocess.check_output(['git', 'ls-files', '*.ts', '*.tsx', '*.js', '*.mjs', '*.css',
                                 '*.json', '*.md', '*.yml', '*.sql', '.prettierrc']).decode().split()
for f in files:
    raw = open(f, 'rb').read()
    if raw[:2] in (b'\xff\xfe', b'\xfe\xff'):
        print('UTF-16 file (convert or delete):', f)
        continue
    text = raw.decode('utf-8-sig')
    fixed = repair(text)
    if fixed.encode('utf-8') != raw:
        print(('FIXED ' if write else 'WOULD FIX ') + f)
        if write:
            open(f, 'w', encoding='utf-8', newline='').write(fixed)
