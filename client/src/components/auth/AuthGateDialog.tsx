import * as React from "react";
import { createPortal } from "react-dom";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    initialMode?: "signup" | "login";
};
export default function AuthGateDialog({ open, onOpenChange, onSuccess, initialMode = "signup", }: Props) {
    const [mounted, setMounted] = React.useState(false);
    const [mode, setMode] = React.useState<"signup" | "login">(initialMode);
    React.useEffect(() => setMounted(true), []);
    React.useEffect(() => {
        if (!open)
            return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);
    React.useEffect(() => {
        if (open)
            setMode(initialMode);
    }, [open, initialMode]);
    React.useEffect(() => {
        if (!open)
            return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onOpenChange]);
    if (!open || !mounted)
    return null;
    return createPortal(<div className="fixed inset-0 z-[9999] overflow-y-auto" onClick={() => onOpenChange(false)} role="dialog" aria-modal="true" dir="rtl">
      
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[2px]"/>

      <div className="relative flex min-h-full w-full items-center justify-center p-4 sm:p-6">
        
        <div onClick={(e) => e.stopPropagation()} role="document" className="
            w-full max-w-md sm:max-w-lg rounded-2xl
            bg-white/90 text-slate-900 border border-black/10
            shadow-[0_20px_60px_-30px_rgba(0,0,0,.45)]
            dark:bg-white/[0.08] dark:text-white dark:border-white/12
            max-h-[calc(100vh-3rem)] overflow-y-auto
          ">
          
          <div className="px-6 pt-5 pb-3 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-amber-700 dark:text-amber-300">
                רוצים להשפיע ולפענח חלומות? הירשמו זה 100% בחינם
              </h3>
              <button onClick={() => onOpenChange(false)} className="text-slate-500 hover:text-slate-700 dark:text-white/70 dark:hover:text-white transition" aria-label="סגור">
                ✕
              </button>
            </div>

            
            <div className="
                mt-3 inline-flex rounded-xl p-1 border
                bg-slate-100/80 border-black/10
                dark:bg-white/[0.06] dark:border-white/10
              ">
              <button onClick={() => setMode("signup")} className={`px-4 py-1.5 rounded-lg text-sm transition
                  ${mode === "signup"
            ? "bg-white text-slate-900 shadow dark:bg-white/15 dark:text-white"
            : "text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"}`}>
                הרשמה
              </button>
              <button onClick={() => setMode("login")} className={`px-4 py-1.5 rounded-lg text-sm transition
                  ${mode === "login"
            ? "bg-white text-slate-900 shadow dark:bg-white/15 dark:text-white"
            : "text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"}`}>
                התחברות
              </button>
            </div>
          </div>

          
          <div className="p-6 space-y-4">
            {mode === "login" ? (<LoginForm onSuccess={() => {
                onOpenChange(false);
                onSuccess?.();
            }}/>) : (<SignupForm onSuccess={() => {
                onOpenChange(false);
                onSuccess?.();
            }}/>)}
          </div>

          
          <div className="px-6 pb-6 pt-1 text-center text-[11px] text-slate-600 dark:text-white/70">
            אפשר לסגור כאן בכל רגע. הרקע חסום בזמן ההרשמה.
          </div>
        </div>
      </div>
    </div>, document.body);
}
