"use client";
import React, { useMemo, useState } from "react";
import { AuthApi, RegisterDto } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import TermsDialog from "./TermsDialog";

export const TERMS_VERSION = "2025-10-28";

type Props = {
  onSuccess?: () => void;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Errors = Partial<
  Record<keyof FormState | "general" | "terms", string>
>;

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignupForm({ onSuccess }: Props) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (form.password.length >= 8) score += 40;
    if (/[A-Z]/.test(form.password)) score += 20;
    if (/[a-z]/.test(form.password)) score += 20;
    if (/\d/.test(form.password)) score += 20;
    return Math.min(score, 100);
  }, [form.password]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next: Errors = {};
    if (!form.firstName.trim()) {
      next.firstName = "אנא הזינו שם פרטי";
    }
    if (!form.lastName.trim()) {
      next.lastName = "אנא הזינו שם משפחה";
    }
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim().toLowerCase())
    ) {
      next.email = 'כתובת הדוא"ל אינה תקינה';
    }
    if (!form.password) {
      next.password = "בחרו סיסמה";
    } else if (form.password.length < 8) {
      next.password = "הסיסמה חייבת להכיל לפחות 8 תווים";
    }
    if (form.password !== form.confirmPassword) {
      next.confirmPassword = "הסיסמאות אינן תואמות";
    }
    if (!acceptedTerms) {
      next.terms = "יש לקרוא ולאשר את תנאי השימוש לפני ההרשמה";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    const payload: RegisterDto = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      termsAgreed: true,
      termsVersion: TERMS_VERSION,
      termsUserAgent:
        typeof window !== "undefined" ? navigator.userAgent : undefined,
      termsLocale:
        typeof navigator !== "undefined" ? navigator.language : undefined,
    };

    try {
      const res = await AuthApi.register(payload);
      let user = res?.user;
      if (!user) {
        await AuthApi.login({
          email: payload.email,
          password: payload.password,
        });
        const verify = await AuthApi.verify();
        user = verify?.user;
      }
      if (user) {
        setUser(user);
        onSuccess?.();
        return;
      }
      setErrors({ general: "משהו השתבש. נסו שוב מאוחר יותר." });
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "לא הצלחנו להשלים את ההרשמה.";
      if (status === 409) {
        setErrors({
          email: 'כתובת הדוא"ל כבר קיימת במערכת. נסו להתחבר או לאפס סיסמה.',
        });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        dir="rtl"
        noValidate
      >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-white/80">
          שם פרטי
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
            placeholder="לדוגמה: עדי"
            autoComplete="given-name"
            required
          />
          {errors.firstName && (
            <span className="text-xs text-red-500">{errors.firstName}</span>
          )}
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-white/80">
          שם משפחה
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
            placeholder="לדוגמה: כהן"
            autoComplete="family-name"
            required
          />
          {errors.lastName && (
            <span className="text-xs text-red-500">{errors.lastName}</span>
          )}
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-white/80">
        דואר אלקטרוני
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
          placeholder="name@example.com"
          autoComplete="email"
          required
        />
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email}</span>
        )}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-white/80">
          סיסמה
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
            placeholder="לפחות 8 תווים"
            autoComplete="new-password"
            required
          />
          {errors.password && (
            <span className="text-xs text-red-500">{errors.password}</span>
          )}
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-white/80">
          אימות סיסמה
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
            placeholder="הקלידו שוב את הסיסמה"
            autoComplete="new-password"
            required
          />
          {errors.confirmPassword && (
            <span className="text-xs text-red-500">
              {errors.confirmPassword}
            </span>
          )}
        </label>
      </div>

      <div className="space-y-2">
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
            style={{ width: `${passwordScore}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-white/60">
          סיסמה חזקה כוללת לפחות 8 תווים, אות גדולה, אות קטנה ומספר.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 shadow-sm dark:border-white/15 dark:bg-white/5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              תנאי שימוש ומדיניות פרטיות
            </p>
            <p className="text-xs text-slate-500 dark:text-white/60">
              חובה לקרוא ולאשר את התנאים לפני פתיחת חשבון.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="inline-flex items-center justify-center rounded-full border border-amber-500 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:border-amber-300 dark:text-amber-200 dark:hover:bg-white/10"
          >
            קראו ואשרו
          </button>
        </div>
        <div className="mt-3 text-xs font-semibold">
          {acceptedTerms ? (
            <span className="text-emerald-600 dark:text-emerald-300">
              ✓ התנאים אושרו
            </span>
          ) : (
            <span className="text-red-500">טרם אושרו</span>
          )}
        </div>
        {errors.terms && (
          <p className="mt-2 text-xs text-red-500">{errors.terms}</p>
        )}
      </div>

      {errors.general && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-200 dark:ring-red-400/30">
          {errors.general}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "נרשמים..." : "הירשמו עכשיו"}
      </button>
      </form>
      <TermsDialog
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setAcceptedTerms(true);
          setErrors((prev) => ({ ...prev, terms: "" }));
          setShowTerms(false);
        }}
      />
    </>
  );
}
