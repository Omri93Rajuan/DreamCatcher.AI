import { useUiStore } from "@/stores/useUiStore";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ThemeToggle() {
    const { t } = useTranslation();
    const dark = useUiStore((s) => s.dark);
    const toggle = useUiStore((s) => s.toggleDark);

    return (
      <button
        type="button"
        onClick={toggle}
        className="relative inline-flex h-9 w-[66px] items-center justify-start rounded-full border border-purple-200/70 bg-white/90 px-1 text-sm font-medium text-slate-800 shadow-inner transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/70 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/10"
        title={dark ? t("theme.titleLight") : t("theme.titleDark")}
        aria-pressed={dark}
        aria-label={dark ? t("theme.titleLight") : t("theme.titleDark")}
        dir="ltr"
      >
        <span className="sr-only">{dark ? t("theme.titleLight") : t("theme.titleDark")}</span>
        <span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)",
          }}
        />
        <span
          className={[
            "relative z-[1] flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-purple-200/70 transition-transform duration-200",
            "dark:bg-white/90 dark:ring-white/25",
            dark ? "translate-x-6 rotate-12" : "translate-x-0 rotate-0",
          ].join(" ")}
        >
          {dark ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-purple-700 dark:text-purple-200" />
          )}
        </span>
      </button>
    );
}
