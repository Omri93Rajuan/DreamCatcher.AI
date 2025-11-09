import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/lib/utils/createPageUrl";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthApi } from "@/lib/api/auth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import logoMark from "@/assets/logo.png";
import UserMenu from "@/components/nav/UserMenu";
export default function Layout({ children }: {
    children: React.ReactNode;
}) {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);
    const clearUser = useAuthStore((s) => s.logout);
    const [scrolled, setScrolled] = useState(false);
    const [checkedAuth, setCheckedAuth] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    const [mobileOpen, setMobileOpen] = useState(false);
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);
    useEffect(() => {
        if (checkedAuth)
            return;
        let cancelled = false;
        (async () => {
            try {
                const res = await AuthApi.verify();
                if (!cancelled && res?.user) {
                    const id = (res.user as any)._id || (res.user as any).id;
                    if (id) {
                        const full = await AuthApi.getMe(id);
                        if (!cancelled && full?.user) {
                            setUser(full.user);
                            return;
                        }
                    }
                    setUser(res.user as any);
                }
            }
            catch {
            }
            finally {
                if (!cancelled)
                    setCheckedAuth(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [checkedAuth, setUser]);
    useEffect(() => {
        (async () => {
            try {
                if (user && !user.firstName) {
                    const res = await AuthApi.getMe(user._id);
                    if (res?.user)
                        setUser(res.user);
                }
            }
            catch (e) {
                console.error("Failed to fetch user details:", e);
            }
        })();
    }, [user, setUser]);
    const handleLogout = async () => {
        try {
            await AuthApi.logout();
        }
        catch { }
        clearUser();
        navigate("/");
    };
    const NavItem = ({ to, children, onClick, }: {
        to: string;
        children: React.ReactNode;
        onClick?: () => void;
    }) => (<NavLink to={to} onClick={onClick} className={({ isActive }) => [
            "relative group px-2 py-1 font-medium transition-colors",
            isActive
                ? "text-slate-900 dark:text-white"
                : "text-slate-700 hover:text-slate-900 dark:text-purple-200 dark:hover:text-white",
            "after:absolute after:bottom-0 after:right-0 after:h-[2px] after:w-0",
            "after:bg-gradient-to-l after:from-amber-500 after:to-purple-500 after:transition-all after:duration-300",
            "motion-reduce:after:transition-none",
            "group-hover:after:w-full",
        ].join(" ")}>
      {children}
    </NavLink>);
    return (<div dir="rtl" className="
        min-h-screen flex flex-col
        bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-100 text-slate-900
        dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900 dark:text-white
      ">
      
      <header className={[
            "sticky top-0 z-50 border-b transition-all duration-300",
            scrolled
                ? [
                    "backdrop-blur-md bg-white/80 border-black/10 shadow-[0_6px_20px_-10px_rgba(0,0,0,.25)]",
                    "dark:bg-[#0b0e1a]/60 dark:border-white/10 dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,.6)]",
                ].join(" ")
                : [
                    "backdrop-blur-sm bg-white/30 border-black/10 shadow-none",
                    "dark:bg-white/5 dark;border-white/10 dark:shadow-none",
                ].join(" "),
        ].join(" ")}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link to={createPageUrl("HomePage")} className="flex items-center gap-2.5 group rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60" aria-label="בית">
              <img src={logoMark} alt="DreamCatcher.AI" className="w-16 h-16 transition-transform duration-200 group-hover:scale-105" decoding="async" loading="eager" />
              <div className="leading-tight select-none">
                <span className="text-[22px] md:text-[25px] font-bold tracking-tight text-slate-900 dark:text-white">
                  DreamCatcher.AI
                </span>
                <span className="block text-[13px] md:text-[14px] text-slate-700 dark:text-white/70">
                  החברים הטובים של המסר החלומי
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-4">
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
            </nav>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border
                         border-black/10 hover:bg-black/5
                         dark:border-white/15 dark:hover:bg-white/10
                         transition"
              aria-label="פתיחת תפריט"
              aria-expanded={mobileOpen}
            >
              <div className={[
                "relative w-5 h-5",
                "before:absolute before:inset-x-0 before:top-1 before:h-[2px] before:bg-slate-900 dark:before:bg-white before:transition",
                "after:absolute after:inset-x-0 after:bottom-1 before:content-[''] after:content-[''] after:h-[2px] after:bg-slate-900 dark:after:bg-white after:transition",
                mobileOpen
                  ? "before:translate-y-2 before:rotate-45 after:-translate-y-2 after:-rotate-45"
                  : "",
              ].join(" ")} />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="md:hidden fixed top-16 left-0 right-0 z-40
                       border-t border-black/10 dark:border-white/10
                       bg-white/80 dark:bg-[#0b0e1a]/70 backdrop-blur-md"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
              <NavItem to="/" onClick={() => setMobileOpen(false)}>בית</NavItem>
              <NavItem to="/articles" onClick={() => setMobileOpen(false)}>מאמרים</NavItem>

              {user ? (
                <>
                  <NavItem to="/account" onClick={() => setMobileOpen(false)}>הפרופיל שלי</NavItem>
                  <NavItem to="/me/dreams" onClick={() => setMobileOpen(false)}>החלומות שלי</NavItem>
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
                  <NavItem to="/login" onClick={() => setMobileOpen(false)}>התחברות</NavItem>
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
        )}
      </header>


      
      <main className="relative flex-1">{children}</main>

      
      <footer className="border-t border-amber-200/40 bg-white/90 text-center shadow-[0_-4px_20px_rgba(0,0,0,0.04)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
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
      </footer>
    </div>);
}


