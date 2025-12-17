import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t, i18n } = useTranslation();
  return (
    <footer className="border-t border-amber-200/40 bg-white/90 py-8 text-center shadow-[0_-4px_20px_rgba(0,0,0,0.04)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between" dir={i18n.dir()}>
        <div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">DreamCatcher.AI</div>
          <p className="text-sm text-slate-500 dark:text-white/60">
            {t("layout.footer.tagline")}
          </p>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-amber-700 dark:text-amber-200">
          <Link to="/articles" className="transition hover:text-amber-500">
            {t("layout.nav.articles")}
          </Link>
          <Link to="/contact" className="transition hover:text-amber-500">
            {t("layout.nav.contact")}
          </Link>
          <a
            href="https://www.linkedin.com/in/omri-rajuan/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-amber-500"
          >
            LinkedIn
          </a>
        </nav>
      </div>

      <p className="mt-6 text-xs text-slate-400 dark:text-white/50">
        © {new Date().getFullYear()} DreamCatcher.AI. {t("layout.footer.allRights")}
      </p>
    </footer>
  );
}
