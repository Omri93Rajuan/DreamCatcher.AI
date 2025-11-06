from pathlib import Path
import re
path = Path("DreamCatcher.AI/client/src/layout/layout.tsx")
text = path.read_text(encoding="utf-8")
pattern = re.compile(r"      <footer className=\"border-t border-black/10 dark:border-white/10\">[\s\S]*?</footer>")
replacement = '''      <footer className="border-t border-amber-200/40 bg-white/90 text-center shadow-[0_-4px_20px_rgba(0,0,0,0.04)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
        <div
          className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 sm:flex-row sm:justify-between"
          dir="rtl"
        >
          <div className="flex items-center gap-3">
            <img
              src={logoMark}
              alt="DreamCatcher.AI"
              className="h-12 w-12"
              loading="lazy"
              decoding="async"
            />
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                DreamCatcher.AI
              </p>
              <p className="text-sm text-slate-600 dark:text-white/70">
                חולמים, מתעוררים, מפרשים – ביחד.
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium text-amber-700 dark:text-amber-200">
            <Link to="/articles" className="transition hover:text-amber-500">
              מאמרים
            </Link>
            <Link to="/contact" className="transition hover:text-amber-500">
              צור קשר
            </Link>
          </nav>
        </div>
        <p className="pb-6 text-xs text-slate-400 dark:text-white/50">
          © {new Date().getFullYear()} DreamCatcher.AI. כל הזכויות שמורות.
        </p>
      </footer>'''
text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit('footer block not replaced')
path.write_text(text, encoding='utf-8')
