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
        {/* GLOW עדין מאחורה */}
        <div
          className={`pointer-events-none absolute -inset-1 rounded-2xl blur-xl transition-all duration-300
            bg-[radial-gradient(120%_120%_at_100%_0%,rgba(242,201,76,.28),rgba(91,31,166,.22)_45%,transparent_70%)]
            ${focused ? "opacity-60 scale-[1.02]" : "opacity-30 scale-100"}
          `}
        />

        {/* המסגרת הראשית */}
        <div
          className={`relative flex items-center rounded-2xl bg-white/6 border transition-all duration-200
            ${focused ? "border-white/25" : "border-white/12"}`}
        >
          {/* אייקון חיפוש */}
          <Search
            className={`absolute right-4 w-5 h-5 transition-transform duration-200
              ${
                focused ? "text-white/80 scale-110" : "text-white/60 scale-100"
              }`}
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
            className={`
              w-full bg-transparent text-white placeholder:text-white/45
              pr-12 pl-12 py-3.5 text-lg outline-none
              /* מכבה את כפתור ה-X המובנה של הדפדפן */
              [appearance:textfield]
              [&::-webkit-search-cancel-button]:appearance-none
              [&::-webkit-search-decoration]:appearance-none
              [&::-webkit-search-results-button]:appearance-none
              [&::-webkit-search-results-decoration]:appearance-none
            `}
            aria-label="חיפוש חלומות"
          />

          {/* כפתור ניקוי יחיד */}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute left-3 p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
