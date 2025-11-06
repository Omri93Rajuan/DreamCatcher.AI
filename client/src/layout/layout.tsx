// src/layout/Layout.tsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/lib/utils/createPageUrl";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthApi } from "@/lib/api/auth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import logoMark from "@/assets/logo.png";

// ▼ חדש: תפריט משתמש (Avatar + Dropdown)
import UserMenu from "@/components/nav/UserMenu";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.logout);

  // מצב הדר (שינוי רקע/צל ב-scroll)
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // תפריט מובייל
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // הטענת פרטי משתמש מלאים אם חסר name
  useEffect(() => {
    (async () => {
      try {
        if (user && !user.firstName) {
          const res = await AuthApi.getMe(user._id);
          if (res?.user) setUser(res.user);
        }
      } catch (e) {
        console.error("Failed to fetch user details:", e);
      }
    })();
  }, [user, setUser]);

  const handleLogout = async () => {
    try {
      await AuthApi.logout();
    } catch {}
    clearUser();
    navigate("/");
  };

  const NavItem = ({
    to,
    children,
    onClick,
  }: {
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "relative group px-2 py-1 font-medium transition-colors",
          isActive
            ? "text-slate-900 dark:text-white"
            : "text-slate-700 hover:text-slate-900 dark:text-purple-200 dark:hover:text-white",
          "after:absolute after:bottom-0 after:right-0 after:h-[2px] after:w-0",
          "after:bg-gradient-to-l after:from-amber-500 after:to-purple-500 after:transition-all after:duration-300",
          "motion-reduce:after:transition-none",
          "group-hover:after:w-full",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );

  return (
    <div
      dir="rtl"
      className="
        min-h-screen flex flex-col
        bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-100 text-slate-900
        dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900 dark:text-white
      "
    >
      {/* HEADER */}
      <header
        className={[
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled
            ? [
                "backdrop-blur-md bg-white/80 border-black/10 shadow-[0_6px_20px_-10px_rgba(0,0,0,.25)]",
                "dark:bg-[#0b0e1a]/60 dark:border-white/10 dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,.6)]",
              ].join(" ")
            : [
                "backdrop-blur-sm bg-white/30 border-black/10 shadow-none",
                "dark:bg-white/5 dark:border-white/10 dark:shadow-none",
              ].join(" "),
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* לוגו + טקסט */}
            <Link
              to={createPageUrl("HomePage")}
              className="flex items-center gap-2.5 group rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              aria-label="דף הבית"
            >
              <img
                src={logoMark}
                alt="פתרון חלומות - לוגו"
                className="w-16 h-16 transition-transform duration-200 group-hover:scale-105"
                decoding="async"
                loading="eager"
              />
              <div className="leading-tight select-none">
                <span className="text-[22px] md:text-[25px] font-bold tracking-tight text-slate-900 dark:text-white">
                  פתרון חלומות
                </span>
                <span className="block text-[13px] md:text-[14px] text-slate-700 dark:text-white/70">
                  גלה את המשמעות הסמויה
                </span>
              </div>
            </Link>

            {/* ניווט דסקטופ */}
            <nav className="hidden md:flex items-center gap-4">
              <NavItem to="/">דף הבית</NavItem>

              {user ? (
                <>
                  {/* הוסר כדי למנוע כפילות: <NavItem to="/me/dreams">החלומות שלי</NavItem> */}
                  {/* במקום זה: תפריט משתמש עם Avatar + Dropdown */}
                  <UserMenu />
                </>
              ) : (
                <>
                  <NavItem to="/articles">מאמרים</NavItem>
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

            {/* כפתור מובייל */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border
                         border-black/10 hover:bg-black/5
                         dark:border-white/15 dark:hover:bg-white/10
                         transition"
              aria-label="תפריט"
              aria-expanded={mobileOpen}
            >
              <div
                className={[
                  "relative w-5 h-5",
                  "before:absolute before:inset-x-0 before:top-1 before:h-[2px] before:bg-slate-900 dark:before:bg-white before:transition",
                  "after:absolute after:inset-x-0 after:bottom-1 before:content-[''] after:content-[''] after:h-[2px] after:bg-slate-900 dark:after:bg-white after:transition",
                  mobileOpen
                    ? "before:translate-y-2 before:rotate-45 after:-translate-y-2 after:-rotate-45"
                    : "",
                ].join(" ")}
              />
            </button>
          </div>
        </div>

        {/* תפריט מובייל — שכבה קבועה שלא דוחפת את התוכן/פוטר */}
        {mobileOpen && (
          <div
            className="md:hidden fixed top-16 left-0 right-0 z-40
                       border-t border-black/10 dark:border-white/10
                       bg-white/80 dark:bg-[#0b0e1a]/70 backdrop-blur-md"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
              <NavItem to="/" onClick={() => setMobileOpen(false)}>
                דף הבית
              </NavItem>

              {user ? (
                <>
                  {/* במובייל משאירים לינקים ישירים (אין Dropdown) */}
                  <NavItem to="/account" onClick={() => setMobileOpen(false)}>
                    הפרופיל שלי
                  </NavItem>
                  <NavItem to="/me/dreams" onClick={() => setMobileOpen(false)}>
                    החלומות שלי
                  </NavItem>

                  <div className="mt-1 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="px-3.5 py-2 rounded-lg border
                                 border-black/10 text-slate-900 hover:bg-black/5
                                 dark:border-white/15 dark:text-white/90 dark:hover:bg-white/10
                                 transition"
                    >
                      התנתק
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
        )}
      </header>

      {/* MAIN — תופס את המקום שנותר ומדביק את הפוטר לתחתית */}
      <main className="relative flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="border-t border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img
              src={logoMark}
              alt="פתרון חלומות - סמל"
              className="w-12 h-12"
              loading="lazy"
              decoding="async"
            />
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              פתרון חלומות
            </span>
          </div>
          <p className="text-slate-700 dark:text-white/70 text-sm">
            פרשנות חלומות מתקדמת באמצעות בינה מלאכותית
          </p>
          <p className="text-slate-600 dark:text-white/60 text-xs mt-2">
            © {new Date().getFullYear()} כל הזכויות שמורות — DreamCatcher.AI
          </p>
        </div>
      </footer>
    </div>
  );
}
