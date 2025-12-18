import { useUiStore } from "@/stores/useUiStore";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function ThemeToggle() {
    const { t } = useTranslation();
    const dark = useUiStore((s) => s.dark);
    const toggle = useUiStore((s) => s.toggleDark);

    const label = useMemo(() => dark ? t("theme.light") : t("theme.dark"), [dark, t]);

    return (
      <motion.button
        type="button"
        onClick={toggle}
        whileTap={{ scale: 0.96 }}
        className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm font-medium text-slate-800 transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/70 dark:text-white dark:hover:bg-white/10"
        title={dark ? t("theme.titleLight") : t("theme.titleDark")}
        aria-pressed={dark}
      >
        <motion.span
          className="relative inline-flex h-7 w-12 items-center rounded-full border border-purple-200/70 bg-white/90 px-1 shadow-inner dark:border-white/20 dark:bg-white/10"
          layout
        >
          <motion.span
            layout
            className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-purple-200/70 dark:bg-white/90 dark:ring-white/30"
            animate={{ x: dark ? 20 : 0, rotate: dark ? 12 : 0 }}
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
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.16 }}
                >
                  <Moon className="h-3.5 w-3.5 text-purple-700 dark:text-purple-200" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.span>
        </motion.span>

        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={label}
            className="text-sm"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    );
}
