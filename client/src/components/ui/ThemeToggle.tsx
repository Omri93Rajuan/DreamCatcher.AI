import { useUiStore } from "@/stores/useUiStore";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function ThemeToggle() {
    const { t } = useTranslation();
    const dark = useUiStore((s) => s.dark);
    const toggle = useUiStore((s) => s.toggleDark);
    return (<button onClick={toggle} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-purple-500/30 hover:bg-black/5 dark:hover:bg-white/10 transition" title={dark ? t("theme.titleLight") : t("theme.titleDark")} aria-pressed={dark}>
      {dark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
      <span className="text-sm">{dark ? t("theme.light") : t("theme.dark")}</span>
    </button>);
}
