"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
};

export default function TermsDialog({ open, onClose, onAccept }: Props) {
  const { t, i18n } = useTranslation();
  const sections = t("terms.sections", { returnObjects: true }) as Array<{
    title: string;
    body: string;
  }>;

  if (!open) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
      dir={i18n.dir()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#131020]">
        <header className="flex items-center justify-between border-b border-black/5 px-6 py-4 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t("terms.badge")}
          </h3>
          <button
            onClick={onClose}
            className="text-sm text-slate-500 transition hover:text-slate-700 dark:text-white/60 dark:hover:text-white"
            aria-label={t("accessibility.close")}
          >
            ✕
          </button>
        </header>

        <div className="max-h-[60vh] space-y-4 overflow-auto px-6 py-5 text-sm leading-6 text-slate-700 dark:text-white/70">
          {sections?.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {section.title}
              </h4>
              <p>{section.body}</p>
            </div>
          ))}
          <p className="text-xs text-slate-500 dark:text-white/60">
            {t("terms.footer")}
          </p>
        </div>

        <footer className="flex flex-col gap-3 border-t border-black/5 px-6 py-4 sm:flex-row sm:justify-end dark:border-white/10">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onAccept}
            className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            {t("terms.accept")}
          </button>
        </footer>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(dialog, document.body)
    : dialog;
}
