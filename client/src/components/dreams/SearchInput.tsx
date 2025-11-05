import React, { useState } from "react";
import { Search, X } from "lucide-react";

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
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`max-w-2xl mx-auto mb-10 px-4 ${className ?? ""}`}
      dir="rtl"
    >
      <div className="relative group">
        {/* GLOW עדין מאחורה – בהיר בלייט, בהיר-מט בדרק */}
        <div
          className={[
            "pointer-events-none absolute -inset-1 rounded-2xl blur-xl transition-all duration-300",
            // Light glow
            "bg-[radial-gradient(120%_120%_at_100%_0%,rgba(242,201,76,.30),rgba(91,31,166,.18)_45%,transparent_70%)]",
            // Dark glow override
            "dark:bg-[radial-gradient(120%_120%_at_100%_0%,rgba(242,201,76,.28),rgba(91,31,166,.22)_45%,transparent_70%)]",
            focused ? "opacity-70 scale-[1.02]" : "opacity-35 scale-100",
          ].join(" ")}
        />

        {/* המסגרת הראשית */}
        <div
          className={[
            "relative flex items-center rounded-2xl transition-all duration-200",
            // Light: לבן-זכוכי עם גבול כהה עדין
            "bg-white/80 border border-black/10 backdrop-blur-sm",
            // Dark: זכוכית כהה עם גבול בהיר עדין
            "dark:bg-white/[0.06] dark:border dark:border-white/12 dark:backdrop-blur-md",
            focused ? "ring-2 ring-amber-400/30 dark:ring-amber-400/25" : "",
          ].join(" ")}
        >
          {/* אייקון חיפוש */}
          <Search
            className={[
              "absolute right-4 w-5 h-5 transition-transform duration-200",
              "text-slate-600 dark:text-white/70",
              focused ? "scale-110" : "scale-100",
            ].join(" ")}
            aria-hidden
          />

          {/* שדה קלט */}
          <input
            type="search"
            placeholder="חפש/י חלום..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={[
              "w-full bg-transparent outline-none pr-12 pl-12 py-3.5 text-lg",
              // Light text/placeholder
              "text-slate-900 placeholder:text-slate-400",
              // Dark text/placeholder
              "dark:text-white dark:placeholder:text-white/45",
              // לכבות את כפתורי ה-X המובנים
              "[appearance:textfield] [&::-webkit-search-cancel-button]:appearance-none",
              "[&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none",
              "[&::-webkit-search-results-decoration]:appearance-none",
            ].join(" ")}
            aria-label="חיפוש חלומות"
          />

          {/* כפתור ניקוי */}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute left-3 p-1.5 rounded-md
                         text-slate-600 hover:text-slate-900 hover:bg-black/5
                         dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10
                         transition-colors"
              aria-label="נקה חיפוש"
              title="נקה"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
