import { useUiStore } from "@/stores/useUiStore";
import { AnimatePresence, motion } from "framer-motion";
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
        <motion.span
          className="absolute inset-0 rounded-full"
          animate={{ backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)" }}
          transition={{ duration: 0.15 }}
        />
        <motion.span
          className="relative z-[1] flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-purple-200/70 dark:bg-white/90 dark:ring-white/25"
          animate={{ x: dark ? 24 : 0, rotate: dark ? 12 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {dark ? (
              <motion.span
                key="sun"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.16 }}
              >
                <Sun className="h-4 w-4 text-amber-500" />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.16 }}
              >
                <Moon className="h-4 w-4 text-purple-700 dark:text-purple-200" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      </button>
    );
}
