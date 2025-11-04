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

export default function AuthGateDialog({
  open,
  onOpenChange,
  onSuccess,
  initialMode = "signup",
}: Props) {
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<"signup" | "login">(initialMode);

  // mount/SSR safe
  React.useEffect(() => setMounted(true), []);

  // lock scroll while open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // reset mode when reopened
  React.useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  // close on ESC
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999]"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
      dir="rtl"
    >
      {/* Overlay – פחות כהה בלייט, מעט כהה בדארק; blur עדין */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[2px]" />

      <div className="relative min-h-full w-full flex items-center justify-center p-4">
        {/* Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          role="document"
          className="
            w-full max-w-md rounded-2xl overflow-hidden
            bg-white/90 text-slate-900 border border-black/10
            shadow-[0_20px_60px_-30px_rgba(0,0,0,.45)]
            dark:bg-white/[0.08] dark:text-white dark:border-white/12
          "
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-3 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-amber-700 dark:text-amber-300">
                רוצים להשפיע ולפענח חלומות? הירשמו זה 100% בחינם
              </h3>
              <button
                onClick={() => onOpenChange(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-white/70 dark:hover:text-white transition"
                aria-label="סגור"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div
              className="
                mt-3 inline-flex rounded-xl p-1 border
                bg-slate-100/80 border-black/10
                dark:bg-white/[0.06] dark:border-white/10
              "
            >
              <button
                onClick={() => setMode("signup")}
                className={`px-4 py-1.5 rounded-lg text-sm transition
                  ${
                    mode === "signup"
                      ? "bg-white text-slate-900 shadow dark:bg-white/15 dark:text-white"
                      : "text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"
                  }`}
              >
                הרשמה
              </button>
              <button
                onClick={() => setMode("login")}
                className={`px-4 py-1.5 rounded-lg text-sm transition
                  ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow dark:bg-white/15 dark:text-white"
                      : "text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"
                  }`}
              >
                התחברות
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {mode === "login" ? (
              <LoginForm
                onSuccess={() => {
                  onOpenChange(false);
                  onSuccess?.();
                }}
              />
            ) : (
              <SignupForm
                onSuccess={() => {
                  onOpenChange(false);
                  onSuccess?.();
                }}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-1 text-center text-[11px] text-slate-600 dark:text-white/70">
            אפשר לסגור כאן בכל רגע. הרקע חסום בזמן ההרשמה.
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
