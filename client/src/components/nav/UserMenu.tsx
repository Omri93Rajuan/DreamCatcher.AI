"use client";
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, NotebookPen, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthApi } from "@/lib/api/auth";
import AvatarChip from "./AvatarChip";
import LanguageSwitcher from "./LanguageSwitcher";
import { toProxiedImage } from "@/lib/images";
import { useTranslation } from "react-i18next";

export default function UserMenu() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.logout);
  const { t, i18n } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const popRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      if (
        popRef.current?.contains(e.target as Node) ||
        btnRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const avatarSrc =
    toProxiedImage(user.image || (user as any).avatar) ||
    "/avatar-placeholder.webp";

  const nameFromParts = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const displayName =
    (user.firstName || "").trim() ||
    (user as any).name?.split(" ")?.[0] ||
    nameFromParts ||
    user.email?.split("@")[0] ||
    t("userMenu.fallbackName");
  const email = user.email || "";

  const handleLogout = async () => {
    try {
      await AuthApi.logout();
    } catch {
      /* ignore */
    }
    clearUser();
    navigate("/");
  };

  return (
    <div className="relative" dir={i18n.dir()}>
      <span ref={btnRef as any}>
        <AvatarChip
          name={displayName}
          image={avatarSrc}
          active={open}
          onClick={() => setOpen((v) => !v)}
        />
      </span>

      {open && (
        <div
          ref={popRef}
          role="menu"
          aria-label={t("userMenu.label")}
          className="absolute top-full mt-2 right-0 z-50 w-[340px] max-w-[92vw] rounded-2xl overflow-hidden border border-black/10 dark:border-white/12 bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(139,92,246,.35)] animate-[menuIn_.18s_ease-out] text-slate-800 dark:text-white"
        >
          <style>{`
            @keyframes menuIn {
              from { opacity: 0; transform: translateY(-6px) scale(.96) }
              to   { opacity: 1; transform: translateY(0) scale(1) }
            }
            @media (prefers-reduced-motion: reduce){
              .animate-[menuIn_.18s_ease-out]{ animation: none; }
            }
          `}</style>

          <div className="h-[3px] bg-gradient-to-r from-fuchsia-500 via-purple-500 to-amber-400" />

          <div className="p-4 bg-gradient-to-l from-fuchsia-500/6 via-purple-600/6 to-amber-400/6 dark:from-fuchsia-500/10 dark:via-purple-600/10 dark:to-amber-400/10">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-black/10 dark:border-white/15 shadow-[0_0_0_2px_rgba(139,92,246,.18)] bg-slate-100 dark:bg-white/10">
                <img
                  src={avatarSrc}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = "true";
                      img.src = "/avatar-placeholder.webp";
                    }
                  }}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="text-base font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 via-purple-600 to-amber-600 dark:from-fuchsia-300 dark:via-purple-200 dark:to-amber-200 truncate">
                  {displayName}
                </div>
                {email && (
                  <div className="text-xs text-slate-600 dark:text-white/70 truncate">
                    {email}
                  </div>
                )}
              </div>

              <span
                className="ms-auto text-[11px] px-2 py-0.5 rounded-full border border-black/10 text-slate-700 bg-black/5 dark:border-white/15 dark:text-white/80 dark:bg-white/10"
                title={t("userMenu.verified")}
              >
                <ShieldCheck className="inline w-3 h-3 me-1" />
                {t("userMenu.verified")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 border-b border-black/8 bg-white/60 dark:border-white/10 dark:bg-white/[0.04]">
            <span className="text-xs font-semibold text-slate-600 dark:text-white/70">
              {t("layout.nav.languageToggle")}
            </span>
            <LanguageSwitcher compact className="ms-auto" />
          </div>

          <nav className="py-1">
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium hover:bg-black/5 dark:hover:bg-white/10"
            >
              <User className="w-4.5 h-4.5 text-purple-600 dark:text-purple-300" />
              <span>{t("userMenu.profile")}</span>
            </Link>

            <Link
              to="/me/dreams"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium hover:bg-black/5 dark:hover:bg-white/10"
            >
              <NotebookPen className="w-4.5 h-4.5 text-amber-600 dark:text-amber-300" />
              <span>{t("userMenu.myDreams")}</span>
            </Link>

            <div className="my-1 h-px bg-black/10 dark:bg-white/10" />

            <button
              onClick={handleLogout}
              className="w-full text-right flex items-center gap-3 px-4 py-3 text-[15px] font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/20"
            >
              <LogOut className="w-4.5 h-4.5" />
              {t("userMenu.logout")}
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
