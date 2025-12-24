import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CONSENT_KEY = "dc_cookie_consent";
type ConsentState = "granted" | "denied";

export default function CookieConsent() {
  const { t, i18n } = useTranslation();
  const [choice, setChoice] = useState<ConsentState | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(CONSENT_KEY) as ConsentState | null;
    if (saved === "granted" || saved === "denied") {
      setChoice(saved);
    }
  }, []);

  const handleChoice = (value: ConsentState) => {
    setChoice(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CONSENT_KEY, value);
    }
  };

  if (choice) return null;

  return (
    <div
      dir={i18n.dir()}
      className="fixed inset-x-0 bottom-4 z-50 px-4 md:px-6"
      role="presentation"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-2xl border border-amber-200/60 bg-white/95 p-4 shadow-[0_14px_40px_-14px_rgba(0,0,0,0.2)] backdrop-blur-md dark:border-amber-300/20 dark:bg-slate-900/95 dark:shadow-[0_14px_40px_-14px_rgba(0,0,0,0.55)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold">
              <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                {t("layout.cookies.title")}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
              {t("layout.cookies.body")}
            </p>
            <Link
              to="/privacy"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 underline decoration-amber-400 decoration-2 underline-offset-4 transition hover:text-amber-600 dark:text-amber-200 dark:hover:text-amber-100"
            >
              {t("layout.cookies.manage")}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleChoice("denied")}
              className="inline-flex items-center justify-center rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:text-amber-800 dark:border-amber-300/40 dark:text-amber-200 dark:hover:border-amber-200/70"
            >
              {t("layout.cookies.decline")}
            </button>
            <button
              type="button"
              onClick={() => handleChoice("granted")}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_-12px_rgba(234,88,12,0.7)] transition active:scale-[0.99] bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500"
            >
              {t("layout.cookies.accept")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
