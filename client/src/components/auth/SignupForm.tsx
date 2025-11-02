import React, { useEffect, useMemo, useRef, useState } from "react";
import { AuthApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import TermsDialog from "./TermsDialog";

export const TERMS_VERSION = "2025-10-28";

/** האם העלאת תמונה חובה? */
const AVATAR_REQUIRED = false;

type Props = { onSuccess?: () => void };

type FieldErrors = Partial<{
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  avatar: string;
}>;

type Step = "email" | "details" | "avatar" | "terms";

export default function AuthSignup({ onSuccess }: Props) {
  const [step, setStep] = useState<Step>("email");

  // form
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  // avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // errors
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // terms
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // auth store
  const { setUser } = useAuthStore();

  // clear global error on edit/step change
  useEffect(() => {
    if (serverError) setServerError(null);
  }, [step, email, firstName, lastName, password, avatarFile, serverError]);

  // ------- validation -------
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const pwReq = useMemo(
    () => ({
      hasLen: password.length >= 8,
      hasNum: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasSpecial: /[^a-zA-Z0-9]/.test(password),
    }),
    [password]
  );

  const pwScore = useMemo(() => {
    let s = 0;
    if (pwReq.hasLen) s += 4;
    if (pwReq.hasNum) s += 2;
    if (pwReq.hasUpper) s += 2;
    if (pwReq.hasSpecial) s += 2;
    return Math.min(10, s);
  }, [pwReq]);

  const validate = (keys?: (keyof FieldErrors)[]) => {
    const k = keys ?? ["email", "firstName", "lastName", "password", "avatar"];
    const out: FieldErrors = { ...fieldErrors };

    if (k.includes("email")) {
      const v = email.trim().toLowerCase();
      out.email = !v
        ? "יש להזין אימייל."
        : !emailRegex.test(v)
        ? "אימייל לא תקין."
        : "";
    }
    if (k.includes("firstName")) {
      out.firstName = firstName.trim() ? "" : "שם פרטי חובה.";
    }
    if (k.includes("lastName")) {
      out.lastName = lastName.trim() ? "" : "שם משפחה חובה.";
    }
    if (k.includes("password")) {
      if (!password) out.password = "סיסמה חובה.";
      else if (!pwReq.hasLen) out.password = "לפחות 8 תווים.";
      else if (!pwReq.hasNum) out.password = "הוספ/י ספרה אחת.";
      else if (!pwReq.hasUpper) out.password = "הוספ/י אות גדולה אחת.";
      else out.password = "";
    }
    if (k.includes("avatar")) {
      out.avatar = AVATAR_REQUIRED && !avatarFile ? "נא להעלות תמונה." : "";
    }

    setFieldErrors(out);
    return out;
  };

  const invalid = (name: keyof FieldErrors) =>
    touched[name] && !!fieldErrors[name];

  const canEmail =
    emailRegex.test(email.trim().toLowerCase()) && !fieldErrors.email;
  const canDetails =
    !!firstName.trim() &&
    !!lastName.trim() &&
    pwReq.hasLen &&
    pwReq.hasNum &&
    pwReq.hasUpper &&
    !fieldErrors.firstName &&
    !fieldErrors.lastName &&
    !fieldErrors.password;
  const canAvatar =
    (!AVATAR_REQUIRED || !!avatarFile) && !fieldErrors.avatar && !avatarError;

  // ------- handlers -------
  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched((t) => ({ ...t, email: true }));
    const v = validate(["email"]);
    if (v.email) return;
    setEmail(email.trim().toLowerCase());
    setStep("details");
  };

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched((t) => ({
      ...t,
      firstName: true,
      lastName: true,
      password: true,
    }));
    const v = validate(["firstName", "lastName", "password"]);
    if (v.firstName || v.lastName || v.password) return;
    setStep("avatar");
  };

  const MAX_SIZE_MB = 5;
  const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | null) => {
    setAvatarError(null);
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!ACCEPT.includes(f.type)) {
      setAvatarError("סוג קובץ לא נתמך. יש להעלות JPG/PNG/WebP/GIF.");
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setAvatarError(`גודל קובץ מקסימלי: ${MAX_SIZE_MB}MB`);
      return;
    }
    setAvatarFile(f);
  };

  // תצוגה מקדימה
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const submitAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched((t) => ({ ...t, avatar: true }));
    const v = validate(["avatar"]);
    if (v.avatar || avatarError) return;
    setStep("terms");
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const delay = (ms = 50) => new Promise((r) => setTimeout(r, ms));

  const finish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setServerError("יש לאשר את תנאי השימוש כדי להשלים הרשמה.");
      return;
    }
    setSubmitting(true);
    try {
      const imageDataUrl = avatarFile
        ? await fileToDataUrl(avatarFile)
        : undefined;

      // 1) רישום
      const res = await AuthApi.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        image: imageDataUrl, // בפועל מומלץ להעלות ל־storage ולקבל URL
        termsAgreed: true,
        termsVersion: TERMS_VERSION,
        termsUserAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        termsLocale:
          typeof navigator !== "undefined" ? navigator.language : undefined,
      });

      // אם ה־API כבר מחזיר user – התחבר מיד
      if (res?.user) {
        setUser(res.user);
        onSuccess?.();
        return;
      }

      await delay();
      const v = await AuthApi.verify(); // או AuthApi.me()
      if (v?.user) {
        setUser(v.user);
        onSuccess?.();
        return;
      }

      await AuthApi.login({ email: email.trim().toLowerCase(), password });
      await delay();
      const v2 = await AuthApi.verify();
      if (v2?.user) {
        setUser(v2.user);
        onSuccess?.();
        return;
      }

      setServerError("החשבון נוצר, אך לא הצלחנו לאמת התחברות.");
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.message || "שגיאת שרת.";
      if (status === 409) {
        setStep("email");
        setTouched((t) => ({ ...t, email: true }));
        setFieldErrors((prev) => ({
          ...prev,
          email: "האימייל הזה כבר רשום אצלנו.",
        }));
        setServerError(null);
      } else if (status === 400) {
        setServerError(msg || "חסרים/שגויים נתונים בטופס.");
      } else if (status === 401) {
        setServerError("אין הרשאה – בדוק/י את הפרטים.");
      } else {
        setServerError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="w-full max-w-md mx-auto p-6 rounded-2xl glass-card text-white space-y-6"
    >
      {/* Progress */}
      <div className="flex items-center justify-between text-white/70 text-xs">
        <span>
          {step === "email"
            ? "1"
            : step === "details"
            ? "2"
            : step === "avatar"
            ? "3"
            : "4"}{" "}
          / 4
        </span>
      </div>

      {/* Global banner once */}
      {serverError && (
        <div
          className="rounded-xl border border-rose-400/30 bg-rose-500/15 text-rose-100 px-3 py-2 text-sm"
          role="alert"
          aria-live="polite"
        >
          {serverError}
        </div>
      )}

      {/* STEP 1 — Email */}
      {step === "email" && (
        <form onSubmit={submitEmail} className="space-y-6">
          <h2 className="text-center text-3xl font-bold gradient-text">
            נעים להכיר!
          </h2>
          <div>
            <label className="block text-sm text-white/80 mb-2">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setTouched((t) => ({ ...t, email: true }));
                validate(["email"]);
              }}
              onBlur={() => {
                setEmail((v) => v.trim());
                setTouched((t) => ({ ...t, email: true }));
                validate(["email"]);
              }}
              placeholder="name@example.com"
              autoComplete="email"
              className={`w-full rounded-xl bg-white/15 border px-3 py-2 text-white placeholder:text-white/50 outline-none focus:border-[var(--primary-light)] ${
                invalid("email") ? "border-rose-400/60" : "border-white/20"
              }`}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {invalid("email") && (
              <p
                id="email-error"
                className="mt-1 text-rose-300 text-xs"
                role="alert"
              >
                {fieldErrors.email}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={!canEmail}
            className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold transition glow-effect disabled:opacity-50 disabled:cursor-not-allowed"
          >
            המשך
          </button>
        </form>
      )}

      {/* STEP 2 — Details */}
      {step === "details" && (
        <form onSubmit={submitDetails} className="space-y-6">
          <h2 className="text-center text-2xl font-semibold gradient-text">
            יצירת פרופיל ✨
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field
              label="שם פרטי"
              value={firstName}
              onChange={(v) => {
                setFirstName(v);
                setTouched((t) => ({ ...t, firstName: true }));
                validate(["firstName"]);
              }}
              onBlur={() => {
                setFirstName((v) => v.trim());
                validate(["firstName"]);
              }}
              invalid={invalid("firstName")}
              error={fieldErrors.firstName}
              autoComplete="given-name"
              placeholder="נועה"
            />
            <Field
              label="שם משפחה"
              value={lastName}
              onChange={(v) => {
                setLastName(v);
                setTouched((t) => ({ ...t, lastName: true }));
                validate(["lastName"]);
              }}
              onBlur={() => {
                setLastName((v) => v.trim());
                validate(["lastName"]);
              }}
              invalid={invalid("lastName")}
              error={fieldErrors.lastName}
              autoComplete="family-name"
              placeholder="כהן"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm text-white/80 mb-1">
              <span>סיסמה</span>
              <span className="text-xs text-white/60">חוזק: {pwScore}/10</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setTouched((t) => ({ ...t, password: true }));
                validate(["password"]);
              }}
              onBlur={() => {
                setTouched((t) => ({ ...t, password: true }));
                validate(["password"]);
              }}
              placeholder="בחר/י סיסמה"
              autoComplete="new-password"
              className={`w-full rounded-xl bg-white/15 border px-3 py-2 text-white placeholder:text-white/60 outline-none focus:border-[var(--primary-light)] ${
                invalid("password") ? "border-rose-400/60" : "border-white/20"
              }`}
              aria-invalid={!!fieldErrors.password}
            />
            <div className="mt-2 space-y-1">
              <div className="h-2 w-full rounded bg-white/10 overflow-hidden">
                <div
                  className={`h-2 rounded ${
                    pwScore < 4
                      ? "bg-rose-400"
                      : pwScore < 7
                      ? "bg-amber-400"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${pwScore * 10}%` }}
                />
              </div>
              <ul className="grid grid-cols-2 gap-1 text-xs">
                <Req ok={pwReq.hasLen}>לפחות 8 תווים</Req>
                <Req ok={pwReq.hasNum}>ספרה אחת לפחות</Req>
                <Req ok={pwReq.hasUpper}>אות גדולה</Req>
                <Req ok={pwReq.hasSpecial}>תווים מיוחדים (מומלץ)</Req>
              </ul>
            </div>
            {invalid("password") && (
              <p className="mt-1 text-rose-300 text-xs" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="flex-1 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium transition"
            >
              חזרה
            </button>
            <button
              type="submit"
              disabled={!canDetails}
              className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold transition glow-effect disabled:opacity-50 disabled:cursor-not-allowed"
            >
              המשך
            </button>
          </div>
        </form>
      )}

      {/* STEP 3 — Avatar Upload */}
      {step === "avatar" && (
        <form onSubmit={submitAvatar} className="space-y-6">
          <h2 className="text-center text-2xl font-semibold gradient-text">
            העלאת תמונת פרופיל
          </h2>
          <p className="text-sm text-white/70 text-center">
            {AVATAR_REQUIRED
              ? "נא להעלות תמונה."
              : "אפשר להעלות עכשיו או לדלג, תמיד ניתן לעדכן אחר כך."}
          </p>

          <div
            className="rounded-2xl border-2 border-dashed border-white/25 bg-white/5 p-4 text-center hover:border-white/40 transition"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
              setTouched((t) => ({ ...t, avatar: true }));
              validate(["avatar"]);
            }}
          >
            {avatarPreview ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img
                    src={avatarPreview}
                    alt="תצוגה מקדימה"
                    className="w-40 h-40 object-cover rounded-2xl border border-white/20"
                  />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition"
                  >
                    החלף תמונה
                  </button>
                  {!AVATAR_REQUIRED && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarError(null);
                        setTouched((t) => ({ ...t, avatar: true }));
                      }}
                      className="text-xs underline text-white/70 hover:text-white/90"
                    >
                      הסר תמונה
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-white/80 text-sm">גררו תמונה לכאן או</p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold transition"
                >
                  בחר/י קובץ
                </button>
                <p className="text-xs text-white/60">
                  קבצים נתמכים: JPG, PNG, WebP, GIF · עד {MAX_SIZE_MB}MB
                </p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT.join(",")}
              className="hidden"
              onChange={(e) => {
                handleFiles(e.currentTarget.files);
                setTouched((t) => ({ ...t, avatar: true }));
                validate(["avatar"]);
              }}
            />
          </div>

          {(invalid("avatar") || avatarError) && (
            <p className="text-rose-300 text-xs" role="alert">
              {fieldErrors.avatar || avatarError}
            </p>
          )}

          {!AVATAR_REQUIRED && !avatarPreview && (
            <button
              type="button"
              onClick={() => {
                setAvatarFile(null);
                setAvatarError(null);
                setTouched((t) => ({ ...t, avatar: true }));
                setStep("terms");
              }}
              className="text-xs underline text-white/70 hover:text-white/90"
            >
              דלג/י ללא תמונה כרגע
            </button>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("details")}
              className="flex-1 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium transition"
            >
              חזרה
            </button>
            <button
              type="submit"
              disabled={!canAvatar}
              className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold transition glow-effect disabled:opacity-50 disabled:cursor-not-allowed"
            >
              המשך
            </button>
          </div>
        </form>
      )}

      {/* STEP 4 — Terms + Submit */}
      {step === "terms" && (
        <form onSubmit={finish} className="space-y-6">
          <h2 className="text-center text-xl font-semibold gradient-text">
            אישור תנאי שימוש
          </h2>
          <p className="text-sm text-white/80">
            יש לאשר את תנאי השימוש כדי להשלים הרשמה.
          </p>

          <div className="flex items-center gap-2 text-sm text-white/90">
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="underline text-[var(--primary-light)] hover:text-[var(--primary)]"
            >
              פתח/י תנאי שימוש
            </button>
            {agreed && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerלד-500/20 text-emerald-200 border border-emerald-400/30">
                ✓ אושר
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("avatar")}
              className="flex-1 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium transition"
            >
              חזרה
            </button>
            <button
              type="submit"
              disabled={!agreed || submitting}
              className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 text-white font-semibold transition glow-effect"
            >
              {submitting ? "יוצר/ת חשבון…" : "סיום"}
            </button>
          </div>
        </form>
      )}

      {/* TermsDialog – מאשר רק בשלב 4 */}
      {showTerms && (
        <TermsDialog
          open={showTerms}
          onClose={() => setShowTerms(false)}
          onAccept={() => {
            setAgreed(true);
            setShowTerms(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------- tiny components ---------- */
function Field({
  label,
  value,
  onChange,
  onBlur,
  invalid,
  error,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-white/80 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`w-full rounded-xl bg-white/15 border px-3 py-2 text-white placeholder:text-white/60 outline-none focus:border-[var(--primary-light)] ${
          invalid ? "border-rose-400/60" : "border-white/20"
        }`}
        aria-invalid={!!invalid}
      />
      {invalid && error && (
        <p className="mt-1 text-rose-300 text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Req({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li
      className={`inline-flex items-center gap-2 ${
        ok ? "text-emerald-300" : "text-white/60"
      }`}
    >
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${
          ok ? "bg-emerald-400" : "bg-white/30"
        }`}
      />
      {children}
    </li>
  );
}
