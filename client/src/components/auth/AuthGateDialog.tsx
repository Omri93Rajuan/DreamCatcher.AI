// components/auth/AuthGateDialog.tsx
import * as React from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthApi } from "@/lib/api/auth";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialMode?: "signup" | "login";
};
type Step = 1 | 2;

export default function AuthGateDialog({
  open,
  onOpenChange,
  onSuccess,
  initialMode = "signup",
}: Props) {
  const { setUser } = useAuthStore();

  const [mode, setMode] = React.useState<"signup" | "login">(initialMode);
  const [step, setStep] = React.useState<Step>(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // signup fields
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  // login fields
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // נועל גלילה ברקע
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    setError(null);
    setSubmitting(false);
    setMode(initialMode);
    if (initialMode === "signup") setStep(1);
  }, [open, initialMode]);

  React.useEffect(() => {
    if (!avatarFile) return setAvatarPreview(null);
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const close = () => {
    if (!submitting) onOpenChange(false);
  };
  const nextStep = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("נא למלא שם פרטי, שם משפחה ואימייל.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const pwScore = (pw: string) => {
    let s = 0;
    if (pw.length >= 6) s += 4;
    if (/\d/.test(pw)) s += 2;
    if (/[A-Z]/.test(pw)) s += 2;
    if (/[^a-zA-Z0-9]/.test(pw)) s += 2;
    return Math.min(10, s);
  };

  const doLogin = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const loginRes = await AuthApi.login({
        email: loginEmail,
        password: loginPassword,
      });

      if (loginRes?.user) {
        setUser(loginRes.user);
        onOpenChange(false);
        onSuccess?.();
        return;
      }

      // זמן קצר כדי לוודא שהדפדפן כתב את ה־HttpOnly cookie
      await new Promise((r) => setTimeout(r, 50));

      const verify = await AuthApi.verify();
      if (verify?.user) {
        setUser(verify.user);
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError("לא הצלחנו לאמת את ההתחברות. נסו שוב.");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "אימייל או סיסמה שגויים.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const doSignup = async () => {
    if (!password || password.length < 6) {
      setError("סיסמה חייבת להיות לפחות 6 תווים.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await AuthApi.register({
        firstName,
        lastName,
        email,
        password,
        // image: avatarFile? ... : undefined // אם תבחר לממש העלאת תמונה
      });

      // הלוגין יכול להיות מיותר אם השרת מחזיר user+cookie ישר ב־register;
      // כאן נשמור תאימות: נבצע login ואז verify כמו ב־LoginPage.
      await AuthApi.login({ email, password });
      await new Promise((r) => setTimeout(r, 50));
      const verify = await AuthApi.verify();

      if (verify?.user) {
        setUser(verify.user);
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError("החשבון נוצר, אבל לא הצלחנו לאמת את ההתחברות.");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "שגיאה בהרשמה.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !mounted) return null;

  return createPortal(
    // ⬇️ קליק מחוץ לחלון יסגור
    <div
      className="fixed inset-0 z-[9999]"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay – קצת יותר חי */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative min-h-full w-full flex items-center justify-center p-4">
        {/* ⬇️ עצירת קליק בתוך הכרטיס */}
        <div
          onClick={(e) => e.stopPropagation()}
          role="document"
          className="glass-card w-full max-w-md rounded-2xl overflow-hidden 
                     border border-white/25 
                     bg-white/15 shadow-2xl"
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-3 border-b border-white/15">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold gradient-text">
                רוצים להשפיע ולפענח חלומות? הירשמו זה 100% בחינם
              </h3>
              <button
                onClick={close}
                className="text-white/80 hover:text-white transition"
                aria-label="סגור"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-3 inline-flex rounded-xl bg-white/10 p-1 border border-white/15">
              <button
                onClick={() => {
                  setMode("signup");
                  setStep(1);
                  setError(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-sm transition ${
                  mode === "signup"
                    ? "bg-white/20 text-white shadow"
                    : "text-white/80 hover:text-white"
                }`}
              >
                הרשמה
              </button>
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-sm transition ${
                  mode === "login"
                    ? "bg-white/20 text-white shadow"
                    : "text-white/80 hover:text-white"
                }`}
              >
                התחברות
              </button>
            </div>

            {mode === "signup" && (
              <div className="mt-3 h-1 w-full rounded bg-white/10">
                <div
                  className="h-1 rounded transition-all"
                  style={{
                    width: step === 1 ? "50%" : "100%",
                    background: "var(--primary)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {mode === "login" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  doLogin();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-white/80 mb-1">
                    אימייל
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-white outline-none focus:border-[var(--primary-light)]"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">
                    סיסמה
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-white outline-none focus:border-[var(--primary-light)]"
                    placeholder="••••••••"
                  />
                </div>
                {error && <div className="text-rose-300 text-sm">{error}</div>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold transition disabled:opacity-50"
                >
                  כניסה
                </button>
              </form>
            ) : (
              <>
                {step === 1 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      nextStep();
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-white/80 mb-1">
                          שם פרטי
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-white outline-none focus:border-[var(--primary-light)]"
                          placeholder="נועה"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/80 mb-1">
                          שם משפחה
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-white outline-none focus:border-[var(--primary-light)]"
                          placeholder="כהן"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white/80 mb-1">
                        אימייל
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-white outline-none focus:border-[var(--primary-light)]"
                        placeholder="name@example.com"
                      />
                    </div>

                    {error && (
                      <div className="text-rose-300 text-sm">{error}</div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-white/15 text-white hover:bg-white/20 border border-white/20 transition"
                    >
                      המשך לשלב הבא →
                    </button>
                  </form>
                )}

                {step === 2 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      doSignup();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="flex items-center justify-between text-sm text-white/80 mb-1">
                        <span>סיסמה</span>
                        <span className="text-xs text-white/60">
                          חוזק: {pwScore(password)}/10
                        </span>
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-white outline-none focus:border-[var(--primary-light)]"
                        placeholder="בחר/י סיסמה"
                      />
                      <input
                        type="range"
                        min={0}
                        max={10}
                        readOnly
                        value={pwScore(password)}
                        className="w-full accent-[var(--primary)] mt-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/80 mb-1">
                        תמונה (אופציונלי)
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-white/10 border border-white/20">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-white/60 text-sm">
                              🙂
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setAvatarFile(e.target.files?.[0] ?? null)
                          }
                          className="block w-full text-sm text-white/90 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-white/20 file:bg-white/10 file:text-white hover:file:bg-white/20"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="text-rose-300 text-sm">{error}</div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-2.5 rounded-xl bg-white/15 text-white hover:bg-white/20 border border-white/20 transition"
                      >
                        ← חזרה
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold transition disabled:opacity-50"
                      >
                        יצירת חשבון
                      </button>
                    </div>
                  </form>
                )}
              </>
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
