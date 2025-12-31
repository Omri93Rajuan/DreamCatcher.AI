"use client";
import * as React from "react";
import { Link } from "react-router-dom";
import { useAuthLogin } from "@/hooks/useAuthLogin";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import googleLogo from "@/assets/logoGoogle.webp";
import { useTranslation } from "react-i18next";

type Props = {
  onSuccess?: () => void;
};

export default function LoginForm({ onSuccess }: Props) {
  const { t, i18n } = useTranslation();
  const { login, submitting, error, setError } = useAuthLogin();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const googleAuth = useGoogleAuth({ mode: "login" });
  const dir = i18n.dir();
  const togglePos = dir === "rtl" ? "left-4" : "right-4";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError?.(null as any);
    const ok = await login(email, password);
    if (ok) onSuccess?.();
  };

  return (
    <form dir={i18n.dir()} onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
          {t("auth.loginForm.email")}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onInvalid={(e) =>
            e.currentTarget.setCustomValidity(t("auth.loginErrors.invalid"))
          }
          onInput={(e) => e.currentTarget.setCustomValidity("")}
          required
          placeholder={t("auth.loginForm.emailPlaceholder")}
          autoComplete="email"
          className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
          {t("auth.loginForm.password")}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onInvalid={(e) =>
              e.currentTarget.setCustomValidity(t("auth.loginErrors.missing"))
            }
          onInput={(e) => e.currentTarget.setCustomValidity("")}
          required
          placeholder={t("auth.loginForm.passwordPlaceholder")}
          autoComplete="current-password"
          className={[
            "w-full rounded-2xl border border-slate-200 bg-white/90 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white",
            dir === "rtl" ? "pl-14 pr-4" : "pr-14 pl-4",
          ].join(" ")}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className={`absolute ${togglePos} top-1/2 -translate-y-1/2 text-xs font-semibold text-amber-600 hover:text-amber-500 focus:outline-none`}
          aria-label={showPassword ? t("auth.loginForm.hide") : t("auth.loginForm.show")}
        >
          {showPassword ? t("auth.loginForm.hide") : t("auth.loginForm.show")}
        </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-200 dark:ring-red-400/30">
          {typeof error === "string"
            ? error
            : t("auth.loginErrors.fallback")}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? t("auth.loginForm.submitting") : t("auth.loginForm.submit")}
      </button>

      <div className="text-center text-xs text-slate-400 dark:text-white/60">
        {t("auth.loginForm.or")}
      </div>

      <button
        type="button"
        aria-label={t("auth.loginForm.googleAria")}
        disabled={googleAuth.loading}
        onClick={() => googleAuth.start({ next: "/" })}
        className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-white/10 dark:text-white"
      >
        {googleAuth.loading ? (
          t("auth.loginForm.googleLoading")
        ) : (
          <img src={googleLogo} alt="Google" loading="lazy" className="h-6 w-auto" />
        )}
      </button>

      {googleAuth.error && (
        <p className="text-center text-xs text-red-500">{googleAuth.error}</p>
      )}

      <div className="text-center text-xs text-slate-500 dark:text-white/60">
        {t("auth.loginForm.forgotPrompt")}
        <br />
        <Link
          to="/forgot-password"
          className="font-semibold text-amber-700 hover:text-amber-500 dark:text-amber-200"
        >
          {t("auth.loginForm.forgotCta")}
        </Link>
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-white/60">
        {t("auth.loginForm.registerPrompt")}
        <br />
        <Link
          to="/register"
          className="font-semibold text-amber-700 hover:text-amber-500 dark:text-amber-200"
        >
          {t("auth.loginForm.registerCta")}
        </Link>
      </p>
    </form>
  );
}
