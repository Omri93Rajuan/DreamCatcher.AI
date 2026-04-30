import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

export default function SearchInputBalancedGlow({
  value,
  onChange,
  className,
}: Props) {
  const { t, i18n } = useTranslation();
  const [focused, setFocused] = useState(false);
  const dir = i18n.dir();

  return (
    <div
      className={`max-w-2xl mx-auto mb-10 px-4 ${className ?? ""}`}
      dir={dir}
    >
      <div className="relative group">
        <div
          className={[
            "pointer-events-none absolute -inset-1 rounded-xl blur-lg transition-all duration-200",
            "bg-[radial-gradient(120%_120%_at_100%_0%,rgba(224,179,74,.22),rgba(100,116,139,.10)_48%,transparent_72%)]",
            "dark:bg-[radial-gradient(120%_120%_at_100%_0%,rgba(224,179,74,.18),rgba(255,255,255,.08)_48%,transparent_72%)]",
            focused ? "opacity-70 scale-[1.01]" : "opacity-30 scale-100",
          ].join(" ")}
        />

        <div
          className={[
            "relative flex items-center rounded-xl transition-colors duration-200",
            "bg-white/80 border border-black/10 backdrop-blur-sm",
            "dark:bg-white/[0.06] dark:border dark:border-white/15 dark:backdrop-blur-sm",
            focused ? "ring-2 ring-[var(--brand)]/25 dark:ring-[var(--brand)]/25" : "",
          ].join(" ")}
        >
          <Search
            className={[
              `absolute ${dir === "rtl" ? "right-4" : "left-4"} w-5 h-5 transition-transform duration-200`,
              "text-slate-600 dark:text-white/70",
              focused ? "scale-110" : "scale-100",
            ].join(" ")}
            aria-hidden
          />

          <input
            type="search"
            placeholder={t("search.placeholder")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={[
              "w-full bg-transparent outline-none pr-12 pl-12 py-3.5 text-lg",
              "text-slate-900 placeholder:text-slate-400",
              "dark:text-white dark:placeholder:text-white/50",
              "[appearance:textfield] [&::-webkit-search-cancel-button]:appearance-none",
              "[&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none",
              "[&::-webkit-search-results-decoration]:appearance-none",
            ].join(" ")}
            aria-label={t("search.aria")}
          />

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute left-3 p-1.5 rounded-md
                         text-slate-600 hover:text-slate-900 hover:bg-black/5
                         dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10
                         transition-colors"
              aria-label={t("search.clear")}
              title={t("search.clear")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
