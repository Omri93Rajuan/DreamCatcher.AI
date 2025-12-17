"use client";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Section = { title: string; body: string };

export default function TermsPage() {
  const { t, i18n } = useTranslation();
  const sections = t("terms.sections", { returnObjects: true }) as Section[];

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#f6f2ff] via-[#fff6ec] to-[#fef5f5] px-4 py-16 dark:from-[#0b0b1a] dark:via-[#141426] dark:to-[#221933]"
      dir={i18n.dir()}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-3xl bg-white/90 p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur dark:bg-white/5 dark:ring-white/10">
        <header className="space-y-2" dir={i18n.dir()}>
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-300">
            {t("terms.badge")}
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t("terms.title")}
          </h1>
          <p className="text-sm text-slate-600 dark:text-white/70">
            {t("terms.intro")}
          </p>
        </header>

        <section className="space-y-6" dir={i18n.dir()}>
          {sections?.map((section) => (
            <article
              key={section.title}
              className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-200">
                {section.body}
              </p>
            </article>
          ))}
        </section>

        <p className="text-xs text-slate-500 dark:text-white/60" dir={i18n.dir()}>
          {t("terms.footer")}
        </p>

        <div className="flex flex-wrap gap-3" dir={i18n.dir()}>
          <Link
            to="/privacy"
            className="rounded-full border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-400 dark:text-amber-200 dark:hover:bg-white/10"
          >
            {t("terms.ctaPrivacy")}
          </Link>
          <Link
            to="/"
            className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
          >
            {t("terms.ctaHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
