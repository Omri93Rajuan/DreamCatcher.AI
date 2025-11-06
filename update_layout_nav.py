from pathlib import Path
path = Path("DreamCatcher.AI/client/src/layout/layout.tsx")
text = path.read_text(encoding="utf-8")
old = '''            <nav className="hidden md:flex items-center gap-4">
              <NavItem to="/">?"?� ?"?`?T?x</NavItem>

              {user ? (<>
                  
                  
                  <UserMenu />
                </>) : (<>
                  <NavItem to="/articles">??????"?T??</NavItem>
                  <NavItem to="/login">?"?x?-?`?"?\u0007?x</NavItem>
                  <Link to="/register" className="px-3.5 py-1.5 rounded-xl font-semibold
                               text-white
                               bg-gradient-to-l from-[#F59E0B] to-[#8B5CF6]
                               hover:opacity-95 active:scale-[0.98]
                               shadow-[0_6px_20px_-10px_rgba(139,92,246,.35)]
                               dark:shadow-[0_6px_20px_-10px_rgba(139,92,246,.55)]
                               transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60">
                    ?"?"?c???
                  </Link>
                </>)}

              <ThemeToggle />
            </nav>'''
new = '''            <nav className="hidden md:flex items-center gap-4">
              <NavItem to="/">בית</NavItem>
              <NavItem to="/articles">מאמרים</NavItem>

              {user ? (
                <UserMenu />
              ) : (
                <>
                  <NavItem to="/login">התחברות</NavItem>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 rounded-xl font-semibold
                               text-white
                               bg-gradient-to-l from-[#F59E0B] to-[#8B5CF6]
                               hover:opacity-95 active:scale-[0.98]
                               shadow-[0_6px_20px_-10px_rgba(139,92,246,.35)]
                               dark:shadow-[0_6px_20px_-10px_rgba(139,92,246,.55)]
                               transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                  >
                    הרשמה
                  </Link>
                </>
              )}

              <ThemeToggle />
            </nav>'''
if old not in text:
    raise SystemExit('old nav block not found')
text = text.replace(old, new)
path.write_text(text, encoding="utf-8")
