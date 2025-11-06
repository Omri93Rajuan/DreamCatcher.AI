from pathlib import Path
import re
path = Path("DreamCatcher.AI/client/src/layout/layout.tsx")
text = path.read_text(encoding="utf-8")
new_desktop = '''            <nav className="hidden md:flex items-center gap-4">
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
text, count = re.subn(r'<nav className="hidden md:flex items-center gap-4">.*?</nav>', new_desktop, text, count=1, flags=re.S)
if count != 1:
    raise SystemExit('failed replacing desktop nav')
new_mobile = '''        {mobileOpen && (
          <div className="md:hidden fixed top-16 left-0 right-0 z-40
                       border-t border-black/10 dark:border-white/10
                       bg-white/80 dark:bg-[#0b0e1a]/70 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
              <NavItem to="/" onClick={() => setMobileOpen(false)}>
                בית
              </NavItem>
              <NavItem to="/articles" onClick={() => setMobileOpen(false)}>
                מאמרים
              </NavItem>

              {user ? (
                <>
                  <NavItem to="/account" onClick={() => setMobileOpen(false)}>
                    הפרופיל שלי
                  </NavItem>
                  <NavItem to="/me/dreams" onClick={() => setMobileOpen(false)}>
                    החלומות שלי
                  </NavItem>

                  <div className="mt-1 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setMobileOpen(false)
                        handleLogout()
                      }}
                      className="px-3.5 py-2 rounded-lg border
                                 border-black/10 text-slate-900 hover:bg-black/5
                                 dark:border-white/15 dark:text-white/90 dark:hover:bg-white/10
                                 transition"
                    >
                      התנתקות
                    </button>
                    <ThemeToggle />
                  </div>
                </>
              ) : (
                <>
                  <NavItem to="/login" onClick={() => setMobileOpen(false)}>
                    התחברות
                  </NavItem>
                  <div className="mt-1 flex items-center justify-between">
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="px-3.5 py-2 rounded-xl font-semibold
                                 text-slate-900 dark:text-white
                                 bg-gradient-to-l from-[#F59E0B] to-[#8B5CF6]
                                 hover:opacity-95
                                 shadow-[0_6px_20px_-10px_rgba(139,92,246,.35)]
                                 dark:shadow-[0_6px_20px_-10px_rgba(139,92,246,.55)]"
                    >
                      הרשמה
                    </Link>
                    <ThemeToggle />
                  </div>
                </>
              )}
            </div>
          </div>
        )}'''
text, count = re.subn(r'\{mobileOpen && \(.*?\)\}', new_mobile, text, count=1, flags=re.S)
if count != 1:
    raise SystemExit('failed replacing mobile nav')
path.write_text(text, encoding="utf-8")
