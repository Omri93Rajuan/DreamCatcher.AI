import { useTranslation } from "react-i18next";

const LANGUAGES: Array<{ code: "he" | "en"; label: string; short: string }> = [
  { code: "he", label: "עברית", short: "עב" },
  { code: "en", label: "English", short: "EN" },
];

export default function LanguageSwitcher({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || "he") as "he" | "en";

  const changeLanguage = (code: "he" | "en") => {
    if (code === current) return;
    void i18n.changeLanguage(code);
  };

  if (compact) {
    const next = current === "he" ? "en" : "he";
    return (
      <button
        type="button"
        onClick={() => changeLanguage(next)}
        className={[
          "rounded-full border px-3 py-1 text-xs font-semibold transition",
          "border-slate-200 text-slate-700 hover:bg-slate-100",
          "dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10",
          className,
        ].join(" ")}
        aria-label={t("layout.nav.languageToggle")}
      >
        {LANGUAGES.find((l) => l.code === next)?.short}
      </button>
    );
  }

  return (
    <div className={["inline-flex rounded-full border border-slate-200 bg-white/70 p-1 text-xs font-semibold shadow-sm dark:border-white/20 dark:bg-white/10", className].join(" ")}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => changeLanguage(lang.code)}
          className={[
            "px-2.5 py-1 rounded-full transition",
            lang.code === current
              ? "bg-amber-500 text-white shadow"
              : "text-slate-700 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/10",
          ].join(" ")}
          aria-pressed={lang.code === current}
          aria-label={t("layout.nav.languageToggle")}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
