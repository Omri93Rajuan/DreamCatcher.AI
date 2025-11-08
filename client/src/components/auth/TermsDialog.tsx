"use client";
import * as React from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
};

const content = [
  {
    title: "1. שימוש הוגן",
    body:
      "השירות מיועד לניהול חלומות ופרשנות אישית בלבד. אין לעשות שימוש מסחרי או להפיץ תכנים של משתמשים אחרים ללא הסכמה.",
  },
  {
    title: "2. פרטיות",
    body:
      "אנו מגינים על המידע האישי שהמשתמשים משתפים, אך כדאי להימנע מפרטים מזהים או תכנים רגישים במיוחד.",
  },
  {
    title: "3. אחריות אישית",
    body:
      "DreamCatcher.AI אינו מחליף ייעוץ מקצועי. כל החלטה הנעשית בעקבות הפרשנות היא באחריות המשתמש בלבד.",
  },
  {
    title: "4. עדכוני תנאים",
    body:
      "נעדכן את התנאים מעת לעת. נודיע מראש, והמשך שימוש ייחשב כהסכמה לגרסה המעודכנת.",
  },
];

export default function TermsDialog({ open, onClose, onAccept }: Props) {
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
            aria-label="סגור"
          >
            ✕
          </button>
        </header>

        <div className="max-h-[60vh] space-y-4 overflow-auto px-6 py-5 text-sm leading-6 text-slate-700 dark:text-white/70">
          {content.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {section.title}
              </h4>
              <p>{section.body}</p>
            </div>
          ))}
          <p className="text-xs text-slate-500 dark:text-white/60">
            השימוש בשירות מהווה הסכמה לכל התנאים, כוללת שמירת מידע, שליחת
            התראות והסרה של תכנים פוגעניים.
          </p>
        </div>

        <footer className="flex flex-col gap-3 border-t border-black/5 px-6 py-4 sm:flex-row sm:justify-end dark:border-white/10">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10"
          >
            חזרו אחורה
          </button>
          <button
            onClick={onAccept}
            className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            אני מאשר/ת את התנאים
          </button>
        </footer>
      </div>
    </div>
  );

  if (!open) return null;

  return typeof document !== "undefined"
    ? createPortal(dialog, document.body)
    : dialog;
}
