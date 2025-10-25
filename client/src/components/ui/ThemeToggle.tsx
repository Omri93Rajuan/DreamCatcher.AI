import { useUiStore } from "@/stores/useUiStore";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const dark = useUiStore((s) => s.dark);
  const toggle = useUiStore((s) => s.toggleDark);

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-purple-500/30 hover:bg-white/10"
      title={dark ? "מצב בהיר" : "מצב כהה"}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span>{dark ? "בהיר" : "כהה"}</span>
    </button>
  );
}
