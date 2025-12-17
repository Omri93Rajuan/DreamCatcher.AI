import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api/apiClient";

type FormState = { name: string; email: string; message: string };
type FormErrors = Partial<FormState>;

const initialForm: FormState = { name: "", email: "", message: "" };
const MIN_NAME = 2;
const MIN_MESSAGE = 10;

function validateField(key: keyof FormState, value: string): string | undefined {
  const trimmed = value.trim();
  switch (key) {
    case "name":
      if (trimmed.length < MIN_NAME) return `שם חייב להכיל לפחות ${MIN_NAME} תווים`;
      return;
    case "email":
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return "אימייל לא תקין";
      return;
    case "message":
      if (trimmed.length < MIN_MESSAGE) return `הודעה חייבת להיות לפחות ${MIN_MESSAGE} תווים`;
      return;
    default:
      return;
  }
}

function validateAll(form: FormState): { next: FormErrors; isValid: boolean } {
  const next: FormErrors = {};
  (Object.keys(form) as Array<keyof FormState>).forEach((key) => {
    const err = validateField(key, form[key]);
    if (err) next[key] = err;
  });
  return { next, isValid: Object.keys(next).length === 0 };
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const firstErrorRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!firstErrorRef.current) return;
    firstErrorRef.current.focus({ preventScroll: false });
  }, [errors]);

  const hasError = useMemo(() => Object.keys(errors).length > 0 || !!error, [errors, error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
    const fieldError = validateField(name as keyof FormState, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (fieldError) {
        next[name as keyof FormState] = fieldError;
      } else {
        delete next[name as keyof FormState];
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { next, isValid } = validateAll(form);
    setErrors(next);
    if (!isValid) {
      setError("תקן את השדות המסומנים.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSent(false);

    try {
      await api.post("/contact", form);
      setSent(true);
      setForm(initialForm);
      setErrors({});
    } catch (err: any) {
      const status = err?.response?.status;
      const issues = err?.response?.data?.issues as Array<{ path?: string; message?: string }> | undefined;
      if (status === 400 && Array.isArray(issues)) {
        const mapped: FormErrors = {};
        issues.forEach((issue) => {
          const path = (issue?.path || "").replace(/^body\./, "") as keyof FormState;
          if (path in initialForm) mapped[path] = issue?.message || "ערך לא תקין";
        });
        setErrors(mapped);
        if (!issues.length) {
          setError("אחד השדות לא תקין.");
        }
      }

      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        "משהו השתבש. נסו שוב מאוחר יותר.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f8f3ff] via-[#fff7e5] to-[#e5f2ff] px-4 py-16 text-slate-900 dark:from-[#050616] dark:via-[#0d1027] dark:to-[#12091b] dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-400/25" />
        <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl dark:bg-purple-600/20" />
        <div className="absolute left-12 bottom-10 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-400/20" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500 dark:text-amber-300/80">DreamCatcher.AI</p>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            צור קשר, תן לחלום שלך להגיע
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-700 dark:text-white/80">
            יש לכם רעיון, שאלה או השראה לילית? השאירו פרטים ואחזור אליכם עם תשובה וחוויה שממשיכה את החלום.
          </p>
          <div className="mx-auto flex flex-wrap justify-center gap-3 text-xs text-slate-700 dark:text-white/70">
            <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              תמיכה מהירה
            </span>
            <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              השראות AI
            </span>
            <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              שאלות על חלומות
            </span>
          </div>
        </div>

        <div
          id="contact-section"
          className="relative mt-10 overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.6),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,196,64,0.25),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.15),transparent_35%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,196,64,0.12),transparent_35%)]" />
          <div className="relative p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6" dir="rtl" noValidate>
              {/* Honeypot anti-bot field (should stay empty) */}
              <input
                type="text"
                name="website"
                value=""
                onChange={() => {}}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid gap-6 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800 dark:text-white/90">
                  שם מלא
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    ref={(el) => {
                      if (errors.name && !firstErrorRef.current) firstErrorRef.current = el;
                    }}
                    className={`rounded-2xl border bg-white/90 px-4 py-3 text-base text-slate-900 shadow-inner transition focus:outline-none focus:ring-2 dark:bg-white/10 dark:text-white ${
                      errors.name
                        ? "border-red-400 focus:border-red-400 focus:ring-red-300/50 dark:border-red-400/70"
                        : "border-slate-200 focus:border-amber-400 focus:ring-amber-300/60 dark:border-white/15"
                    }`}
                    placeholder="השם המלא שלך"
                  />
                  {errors.name && (
                    <span id="name-error" className="text-xs font-normal text-red-500 dark:text-red-300">
                      {errors.name}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800 dark:text-white/90">
                  אימייל לחזרה
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    ref={(el) => {
                      if (errors.email && !firstErrorRef.current) firstErrorRef.current = el;
                    }}
                    className={`rounded-2xl border bg-white/90 px-4 py-3 text-base text-slate-900 shadow-inner transition focus:outline-none focus:ring-2 dark:bg-white/10 dark:text-white ${
                      errors.email
                        ? "border-red-400 focus:border-red-400 focus:ring-red-300/50 dark:border-red-400/70"
                        : "border-slate-200 focus:border-amber-400 focus:ring-amber-300/60 dark:border-white/15"
                    }`}
                    placeholder="you@dreams.com"
                  />
                  {errors.email && (
                    <span id="email-error" className="text-xs font-normal text-red-500 dark:text-red-300">
                      {errors.email}
                    </span>
                  )}
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800 dark:text-white/90">
                הודעה
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  required
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  ref={(el) => {
                    if (errors.message && !firstErrorRef.current) firstErrorRef.current = el;
                  }}
                  className={`rounded-2xl border bg-white/90 px-4 py-3 text-base text-slate-900 shadow-inner transition focus:outline-none focus:ring-2 dark:bg-white/10 dark:text-white ${
                    errors.message
                      ? "border-red-400 focus:border-red-400 focus:ring-red-300/50 dark:border-red-400/70"
                      : "border-slate-200 focus:border-amber-400 focus:ring-amber-300/60 dark:border-white/15"
                  }`}
                  placeholder="ספרו לי על החלום, על הרעיון, או על מה שתרצו שנבנה יחד."
                />
                {errors.message && (
                  <span id="message-error" className="text-xs font-normal text-red-500 dark:text-red-300">
                    {errors.message}
                  </span>
                )}
              </label>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-slate-700 dark:text-white/70">
                  <div>מענה אישי, בלי בוטים.</div>
                  <div>אנו עונים לרוב תוך יום עסקים.</div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 px-7 py-3 text-base font-semibold text-black shadow-xl transition hover:scale-[1.01] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {submitting ? "שולח..." : "שלחו הודעה"}
                </button>
              </div>
            </form>

            <div aria-live="polite" className="mt-4 space-y-3">
              {error && (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/50 dark:bg-red-500/10 dark:text-red-100">
                  {error}
                </div>
              )}
              {sent && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-100">
                  תודה! ההודעה נשלחה, ונחזור אליכם בקרוב.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
