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

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
  React.useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999]"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative min-h-full w-full flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          role="document"
          className="glass-card w-full max-w-md rounded-2xl overflow-hidden border border-white/25 bg-white/15 shadow-2xl text-white"
        >
          <div className="px-6 pt-5 pb-3 border-b border-white/15">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold gradient-text">
                רוצים להשפיע ולפענח חלומות? הירשמו זה 100% בחינם
              </h3>
              <button
                onClick={() => onOpenChange(false)}
                className="text-white/80 hover:text-white transition"
                aria-label="סגור"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 inline-flex rounded-xl bg-white/10 p-1 border border-white/15">
              <button
                onClick={() => setMode("signup")}
                className={`px-4 py-1.5 rounded-lg text-sm transition ${
                  mode === "signup"
                    ? "bg-white/20 text-white shadow"
                    : "text-white/80 hover:text-white"
                }`}
              >
                הרשמה
              </button>
              <button
                onClick={() => setMode("login")}
                className={`px-4 py-1.5 rounded-lg text-sm transition ${
                  mode === "login"
                    ? "bg-white/20 text-white shadow"
                    : "text-white/80 hover:text-white"
                }`}
              >
                התחברות
              </button>
            </div>
          </div>

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

          <div className="px-6 pb-6 pt-1 text-center text-[11px] text-white/70">
            אפשר לסגור כאן בכל רגע. הרקע חסום בזמן ההרשמה.
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
