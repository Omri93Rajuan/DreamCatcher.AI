import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createPageUrl } from "@/lib/utils/createPageUrl";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitcher from "@/components/nav/LanguageSwitcher";
import logoMark from "@/assets/logo.png";
import UserMenu from "@/components/nav/UserMenu";

type HeaderProps = {
  user: any;
  onLogout: () => Promise<void> | void;
};

export default function Header({ user, onLogout }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
          <Link
            to={createPageUrl("HomePage")}
            className="flex items-center gap-2.5 group rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
            aria-label={t("layout.nav.logoLabel")}
          >
            <img
              src={logoMark}
              alt="DreamCatcher.AI"
              className="w-16 h-16 transition-transform duration-200 group-hover:scale-105"
              decoding="async"
              loading="eager"
            />
            <div className="leading-tight select-none">
              <span className="text-[22px] md:text-[25px] font-bold tracking-tight text-slate-900 dark:text-white">
                DreamCatcher.AI
              </span>
              <span className="block text-[13px] md:text-[14px] text-slate-700 dark:text-white/70">
                {t("layout.brandTagline")}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <NavItem to="/">{t("layout.nav.home")}</NavItem>
            <NavItem to="/articles">{t("layout.nav.articles")}</NavItem>

            {user ? (
              <UserMenu />
            ) : (
              <>
                <NavItem to="/login">{t("layout.nav.login")}</NavItem>
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
                  {t("layout.nav.register")}
                </Link>
                <LanguageSwitcher compact className="ms-2" />
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
            aria-label={mobileOpen ? t("layout.nav.menuClose") : t("layout.nav.menuOpen")}
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

      {mobileOpen && (
        <div
          className="md:hidden fixed top-16 left-0 right-0 z-40
                     border-t border-black/10 dark:border-white/10
                     bg-white/80 dark:bg-[#0b0e1a]/70 backdrop-blur-md"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
            <NavItem to="/" onClick={() => setMobileOpen(false)}>
              {t("layout.nav.home")}
            </NavItem>
            <NavItem to="/articles" onClick={() => setMobileOpen(false)}>
              {t("layout.nav.articles")}
            </NavItem>

            <div
              className="flex items-center justify-end px-1"
              dir={i18n.dir()}
            >
              <LanguageSwitcher compact />
            </div>

            {user ? (
              <>
                <NavItem to="/account" onClick={() => setMobileOpen(false)}>
                  {t("layout.nav.account")}
                </NavItem>
                <NavItem to="/me/dreams" onClick={() => setMobileOpen(false)}>
                  {t("layout.nav.myDreams")}
                </NavItem>
                <div className="mt-1 flex items-center justify-end">
                  <button
                    onClick={async () => {
                      setMobileOpen(false);
                      await onLogout();
                    }}
                    className="px-3.5 py-2 rounded-lg border
                               border-black/10 text-slate-900 hover:bg-black/5
                               dark:border-white/15 dark:text-white/90 dark:hover:bg-white/10
                               transition"
                  >
                    {t("layout.nav.logout")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavItem to="/login" onClick={() => setMobileOpen(false)}>
                  {t("layout.nav.login")}
                </NavItem>
                <div className="mt-1 flex items-center justify-end">
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
                    {t("layout.nav.register")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
