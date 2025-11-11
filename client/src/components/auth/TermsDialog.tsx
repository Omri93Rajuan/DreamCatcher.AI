"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { TERMS_FOOTER, TERMS_SECTIONS } from "@/constants/terms";

type Props = {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
};

export default function TermsDialog({ open, onClose, onAccept }: Props) {
  if (!open) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
      dir="rtl"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#131020]">
        <header className="flex items-center justify-between border-b border-black/5 px-6 py-4 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            תנאי שימוש ומדיניות פרטיות
          </h3>
          <button
            onClick={onClose}
            className="text-sm text-slate-500 transition hover:text-slate-700 dark:text-white/60 dark:hover:text-white"
            aria-label="סגירת חלון תנאים"
          >
            ✕
          </button>
        </header>

        <div className="max-h-[60vh] space-y-4 overflow-auto px-6 py-5 text-sm leading-6 text-slate-700 dark:text-white/70">
          {TERMS_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {section.title}
              </h4>
              <p>{section.body}</p>
            </div>
          ))}
          <p className="text-xs text-slate-500 dark:text-white/60">
            {TERMS_FOOTER}
          </p>
        </div>

        <footer className="flex flex-col gap-3 border-t border-black/5 px-6 py-4 sm:flex-row sm:justify-end dark:border-white/10">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10"
          >
            דחייה
          </button>
          <button
            onClick={onAccept}
            className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            אני מסכים/ה לתנאים
          </button>
        </footer>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(dialog, document.body)
    : dialog;
}
