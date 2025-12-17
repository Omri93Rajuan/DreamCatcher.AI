"use client";
import * as React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  name?: string | null;
  image?: string | null;
  onClick?: () => void;
  active?: boolean;
};

export default function AvatarChip({ name, image, onClick, active }: Props) {
  const { t } = useTranslation();
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [image]);

  const initials = React.useMemo(() => {
    const n = (name || "").trim();
    if (!n) return t("userMenu.fallbackName").slice(0, 2);
    const parts = n.split(/\s+/).slice(0, 2);
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }, [name]);

  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full",
        "border transition shadow-sm",
        active
          ? "bg-black/5 dark:bg-white/10 border-black/15 dark:border-white/15"
          : "bg-white/70 dark:bg-white/5 border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10",
      ].join(" ")}
      aria-label={t("userMenu.label")}
      aria-haspopup="menu"
      aria-expanded={!!active}
    >
      <span className="relative w-8 h-8 rounded-full overflow-hidden border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs">
        {image && !failed ? (
          <img
            src={image}
            alt={name || t("userMenu.fallbackName")}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="text-slate-700 dark:text-white/80">{initials}</span>
        )}
      </span>

      <span className="hidden sm:block text-sm font-medium text-slate-800 dark:text-white/90 max-w-[10ch] truncate">
        {name || t("userMenu.fallbackName")}
      </span>
      <svg viewBox="0 0 20 20" className="w-4 h-4 text-slate-600 dark:text-white/70" fill="currentColor">
        <path d="M5.5 7.5l4.5 4 4.5-4" />
      </svg>
    </button>
  );
}
