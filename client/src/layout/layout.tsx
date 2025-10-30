// src/layout/Layout.tsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/lib/utils/createPageUrl";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthApi } from "@/lib/api/auth";

// ⬅️ עדכן אם הנתיב שלך שונה
import logoMark from "@/assets/logo.png";
// אם אין SVG אז PNG שקוף: import logoMark from "@/assets/brand/logo-mark.png";

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
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // הטענת פרטי משתמש מלאים אם חסר name
  useEffect(() => {
    (async () => {
      try {
        if (user && !user.name) {
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

  // לינק ניווט עם קו תחתון אנימטיבי RTL
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
          isActive ? "text-white" : "text-purple-200 hover:text-white",
          // underline anim (RTL: מתחיל מימין)
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
      className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white"
      dir="rtl"
    >
      {/* HEADER */}
      <header
        className={[
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "backdrop-blur-md bg-white/7 border-white/10 shadow-[0_6px_20px_-10px_rgba(0,0,0,.45)]"
            : "backdrop-blur-[2px] bg-transparent border-white/10",
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link
              to={createPageUrl("HomePage")}
              className="flex items-center gap-2.5 group rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              aria-label="דף הבית"
            >
              <img
                src={logoMark}
                alt="פתרון חלומות - לוגו"
                className="w-20 h-20 transition-transform duration-200 group-hover:scale-105"
                decoding="async"
                loading="eager"
              />
              <div className="leading-tight select-none">
                <span className="text-[25px] font-bold tracking-tight">
                  פתרון חלומות
                </span>
                <span className="block text-[14px] text-white/70">
                  גלה את המשמעות הסמויה
                </span>
              </div>
            </Link>

            {/* ניווט דסקטופ */}
            <nav className="hidden md:flex items-center gap-4">
              {user && (
                <span className="text-white/70 text-sm">
                  שלום
                  {user.name
                    ? `, ${user.name}`
                    : user.email
                    ? `, ${user.email}`
                    : ""}{" "}
                  👋
                </span>
              )}

              <NavItem to="/">דף הבית</NavItem>

              {user ? (
                <>
                  <NavItem to="/me/dreams">החלומות שלי</NavItem>
                  <button
                    onClick={handleLogout}
                    className="px-3.5 py-1.5 rounded-lg border border-white/15 text-white/90 hover:bg-white/10 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                  >
                    התנתק
                  </button>
                </>
              ) : (
                <>
                  <NavItem to="/login">התחברות</NavItem>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 rounded-xl font-semibold text-white
                               bg-gradient-to-l from-[#F59E0B] to-[#8B5CF6]
                               hover:opacity-95 active:scale-[0.98]
                               shadow-[0_6px_20px_-10px_rgba(139,92,246,.55)]
                               transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                  >
                    הרשמה
                  </Link>
                </>
              )}
            </nav>

            {/* כפתור מובייל */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/15 hover:bg-white/10 transition"
              aria-label="תפריט"
              aria-expanded={mobileOpen}
            >
              <div
                className={[
                  "relative w-5 h-5",
                  "before:absolute before:inset-x-0 before:top-1 before:h-[2px] before:bg-white before:transition",
                  "after:absolute after:inset-x-0 after:bottom-1 before:content-[''] after:content-[''] after:h-[2px] after:bg-white after:transition",
                  mobileOpen
                    ? "before:translate-y-2 before:rotate-45 after:-translate-y-2 after:-rotate-45"
                    : "",
                ].join(" ")}
              />
            </button>
          </div>
        </div>

        {/* תפריט מובייל */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/30 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
              {user && (
                <div className="text-white/70 text-sm mb-1">
                  שלום
                  {user.name
                    ? `, ${user.name}`
                    : user.email
                    ? `, ${user.email}`
                    : ""}{" "}
                  👋
                </div>
              )}

              <NavItem to="/" onClick={() => setMobileOpen(false)}>
                דף הבית
              </NavItem>

              {user ? (
                <>
                  <NavItem to="/me/dreams" onClick={() => setMobileOpen(false)}>
                    החלומות שלי
                  </NavItem>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="mt-1 px-3.5 py-2 rounded-lg border border-white/15 text-white/90 hover:bg-white/10 transition"
                  >
                    התנתק
                  </button>
                </>
              ) : (
                <>
                  <NavItem to="/login" onClick={() => setMobileOpen(false)}>
                    התחברות
                  </NavItem>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="mt-1 px-3.5 py-2 rounded-xl font-semibold text-white
                               bg-gradient-to-l from-[#F59E0B] to-[#8B5CF6]
                               hover:opacity-95 shadow-[0_6px_20px_-10px_rgba(139,92,246,.55)]"
                  >
                    הרשמה
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* MAIN */}
      <main className="relative">{children}</main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img
              src={logoMark}
              alt="פתרון חלומות - סמל"
              className="w-12 h-12"
              loading="lazy"
              decoding="async"
            />
            <span className="text-xl font-bold">פתרון חלומות</span>
          </div>
          <p className="text-white/70 text-sm">
            פרשנות חלומות מתקדמת באמצעות בינה מלאכותית
          </p>
          <p className="text-white/60 text-xs mt-2">
            © {new Date().getFullYear()} כל הזכויות שמורות — DreamCatcher.AI
          </p>
        </div>
      </footer>
    </div>
  );
}
