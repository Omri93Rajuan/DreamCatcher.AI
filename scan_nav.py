from pathlib import Path
import re
text = Path("DreamCatcher.AI/client/src/layout/layout.tsx").read_text(encoding="utf-8")
strings = set()
for m in re.finditer(r'>[^<]+</NavItem>', text):
    strings.add(m.group(0)[1:-9])
print(strings)
