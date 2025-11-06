import { ReactNode, useEffect } from "react";
import { useUiStore } from "@/stores/useUiStore";
const THEME_KEY = "theme";
function applyTheme(dark: boolean) {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (meta)
        meta.content = dark ? "#0f172a" : "#ffffff";
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
}
export function ThemeProvider({ children }: {
    children: ReactNode;
}) {
    const dark = useUiStore((s) => s.dark);
    const toggleDark = useUiStore((s) => s.toggleDark);
    const setDark = (useUiStore as any).getState().setDark as ((v: boolean) => void) | undefined;
    useEffect(() => {
        const saved = localStorage.getItem(THEME_KEY);
        const systemPrefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
        const desiredDark = saved === "dark" ? true : saved === "light" ? false : systemPrefersDark;
        if (desiredDark !== dark) {
            if (setDark)
                setDark(desiredDark);
            else
                toggleDark();
        }
        else {
            applyTheme(dark);
        }
    }, []);
    useEffect(() => {
        applyTheme(dark);
    }, [dark]);
    useEffect(() => {
        const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
        if (!mql)
            return;
        const handler = (e: MediaQueryListEvent) => {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved !== "dark" && saved !== "light") {
                if (setDark)
                    setDark(e.matches);
                else {
                    const currentDark = useUiStore.getState().dark;
                    if (currentDark !== e.matches)
                        useUiStore.getState().toggleDark();
                }
            }
        };
        mql.addEventListener?.("change", handler);
        return () => mql.removeEventListener?.("change", handler);
    }, []);
    return <>{children}</>;
}
