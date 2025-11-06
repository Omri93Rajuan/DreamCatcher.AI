from pathlib import Path
text = Path("DreamCatcher.AI/client/src/layout/layout.tsx").read_text(encoding="utf-8")
start = text.index("<header")
end = text.index("</header>", start) + len("</header>")
print(text[start:end])
