import { ReactNode, useEffect, useMemo } from "react";
import { useUiStore } from "@/stores/useUiStore";

const THEME_KEY = "theme"; // 'dark' | 'light'

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);

  // עדכון צבע דפדפן נייד (כרום/אנדרואיד וכו')
  const meta = document.querySelector(
    'meta[name="theme-color"]'
  ) as HTMLMetaElement | null;
  if (meta) meta.content = dark ? "#0f172a" /* slate-900 */ : "#ffffff";

  // שמירה ב-localStorage
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const dark = useUiStore((s) => s.dark);
  const toggleDark = useUiStore((s) => s.toggleDark);

  // קבע העדפה ראשונית (localStorage -> מערכת)
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;

    const desiredDark =
      saved === "dark" ? true : saved === "light" ? false : systemPrefersDark;

    // אם ה-store לא תואם, עדכן דרך toggle
    if (desiredDark !== dark) toggleDark();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ריצה אחת בהידרציה

  // סנכרון לכל שינוי
  useEffect(() => {
    applyTheme(dark);
  }, [dark]);

  // אופציונלי: האזן לשינוי מערכת בזמן אמת
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;

    const handler = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem(THEME_KEY);
      // אם המשתמש לא נעל מצב (אין saved), עדכן לפי מערכת
      if (saved !== "dark" && saved !== "light") {
        const currentDark = useUiStore.getState().dark;
        if (currentDark !== e.matches) useUiStore.getState().toggleDark();
      }
    };
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  // לא מספק קונטקסט – הסטור מספיק; רק עוטף ילדים
  return <>{children}</>;
}
