"use client";
import * as React from "react";
import { Link } from "react-router-dom";
import { useAuthLogin } from "@/hooks/useAuthLogin";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import googleLogo from "@/assets/logoGoogle.png";

type Props = {
  onSuccess?: () => void;
};

export default function LoginForm({ onSuccess }: Props) {
  const { login, submitting, error, setError } = useAuthLogin();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const googleAuth = useGoogleAuth({ mode: "login" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError?.(null as any);
    const ok = await login(email, password);
    if (ok) onSuccess?.();
  };

  return (
    <form dir="rtl" onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
          דוא"ל
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onInvalid={(e) =>
            e.currentTarget.setCustomValidity("אנא הכניסו כתובת דוא\"ל תקינה")
          }
          onInput={(e) => e.currentTarget.setCustomValidity("")}
          required
          placeholder="name@example.com"
          autoComplete="email"
          className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
          סיסמה
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onInvalid={(e) =>
              e.currentTarget.setCustomValidity("יש להזין סיסמה")
            }
            onInput={(e) => e.currentTarget.setCustomValidity("")}
            required
            placeholder="הקלידו סיסמה"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-amber-600 hover:text-amber-500 focus:outline-none"
          >
            {showPassword ? "הסתר" : "הצג"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-200 dark:ring-red-400/30">
          {typeof error === "string"
            ? error
            : "אירעה שגיאה בהתחברות. נסו שוב."}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "מתחבר..." : "התחברות"}
      </button>

      <div className="text-center text-xs text-slate-400 dark:text-white/60">
        --- או ---
      </div>

      <button
        type="button"
        aria-label="התחברות באמצעות Google"
        disabled={googleAuth.loading}
        onClick={() => googleAuth.start({ next: "/" })}
        className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-white/10 dark:text-white"
      >
        {googleAuth.loading ? (
          "מתחבר..."
        ) : (
          <img src={googleLogo} alt="Google" loading="lazy" className="h-6 w-auto" />
        )}
      </button>

      {googleAuth.error && (
        <p className="text-center text-xs text-red-500">{googleAuth.error}</p>
      )}

      <div className="text-center text-xs text-slate-500 dark:text-white/60">
        שכחתם סיסמה?
        <br />
        <Link
          to="/forgot-password"
          className="font-semibold text-amber-700 hover:text-amber-500 dark:text-amber-200"
        >
          שליחת קישור לאיפוס
        </Link>
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-white/60">
        עדיין לא רשומים?
        <br />
        <Link
          to="/register"
          className="font-semibold text-amber-700 hover:text-amber-500 dark:text-amber-200"
        >
          הרשמה חדשה
        </Link>
      </p>
    </form>
  );
}
