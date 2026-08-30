import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoMark from "@/assets/logo.webp";
import { AdminApi } from "@/lib/api/admin";

export default function Footer({ isAdmin = false }: { isAdmin?: boolean }) {
  const { t, i18n } = useTranslation();
  const linkedInUrl = "https://www.linkedin.com/in/omri-rajuan";
  const overviewQuery = useQuery({
    queryKey: ["admin-overview", 30],
    queryFn: () => AdminApi.getOverview(30),
    enabled: isAdmin,
    staleTime: 60_000,
    retry: 1,
  });
  const isHebrew = i18n.language?.startsWith("he");
  const totalVisits = overviewQuery.data?.totals.visits;

  return (
    <footer className="border-t border-amber-200/40 bg-white/90 text-center shadow-[0_-4px_20px_rgba(0,0,0,0.04)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
      <div
        className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 sm:flex-row sm:justify-between"
        dir={i18n.dir()}
      >
        <div className="flex items-center gap-3">
          <img
            src={logoMark}
            alt="DreamCatcher.AI"
            className="h-12 w-12"
            loading="lazy"
            decoding="async"
          />
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              DreamCatcher.AI
            </p>
            <p className="text-sm text-slate-600 dark:text-white/70">
              {t("layout.footer.tagline")}
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-amber-700 dark:text-amber-200">
          <Link to="/articles" className="transition hover:text-amber-500">
            {t("layout.nav.articles")}
          </Link>
          <Link to="/contact" className="transition hover:text-amber-500">
            {t("layout.nav.contact")}
          </Link>
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 transition hover:opacity-90"
            aria-label="LinkedIn"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              className="h-5 w-5"
              viewBox="0 0 24 24"
            >
              <defs>
                <linearGradient
                  id="linkedinGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#fcd34d" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <path
                fill="url(#linkedinGradient)"
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.603 0 4.268 2.371 4.268 5.457v6.284ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.777 13.019H3.56V9h3.554v11.452ZM22.225 0H1.771C.792 0 0 .77 0 1.723v20.555C0 23.23.792 24 1.771 24h20.451C23.2 24 24 23.23 24 22.278V1.723C24 .77 23.2 0 22.222 0h.003Z"
              />
            </svg>
          </a>
        </nav>
      </div>
      {isAdmin && (
        <div className="mx-auto mb-5 w-fit rounded-full border border-amber-300/60 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 shadow-sm dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100">
          {overviewQuery.isLoading
            ? isHebrew
              ? "טוען נתוני כניסות…"
              : "Loading visit count…"
            : typeof totalVisits === "number"
              ? `${isHebrew ? "סה״כ כניסות לאתר" : "Total site visits"}: ${new Intl.NumberFormat(
                  isHebrew ? "he-IL" : "en-US",
                ).format(totalVisits)}`
              : isHebrew
                ? "נתוני הכניסות אינם זמינים כרגע"
                : "Visit data is currently unavailable"}
        </div>
      )}
      <p className="pb-6 text-xs text-slate-400 dark:text-white/50">
        Ac {new Date().getFullYear()} DreamCatcher.AI.{" "}
        {t("layout.footer.allRights")}
      </p>
    </footer>
  );
}
