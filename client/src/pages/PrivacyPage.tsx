"use client";
import { Link } from "react-router-dom";

const privacySections = [
  {
    title: "1. נתונים שאנו אוספים",
    body:
      "אנו אוספים רק את המידע ההכרחי להפעלת הפלטפורמה: שם משתמש, כתובת אימייל, החלומות שתבחרו לשתף ונתוני שימוש אנונימיים לצורך שיפור הביצועים. כל הנתונים נשמרים בצורה מבוקרת ומוצפנת.",
  },
  {
    title: "2. בחירה, שיתוף וביטול",
    body:
      "אתם יכולים לבחור שלא לשתף חלומות פרטיים, למחוק פרשנויות או לבטל את ההרשמה בכל עת. בקשות גישה, תיקון או מחיקה נענות בתוך פרק זמן סביר.",
  },
  {
    title: "3. שמירה ואבטחה",
    body:
      "מעבר להגבלות גישה פנימיות, אנו מספקים רק מידע שתואם לחוק. גם לאחר סגירת החשבון נשמור רק נתונים חיוניים לצרכי אבטחה והתאמה לרגולציה.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6f2ff] via-[#fff6ec] to-[#fef5f5] px-4 py-16 dark:from-[#0b0b1a] dark:via-[#141426] dark:to-[#221933]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-3xl bg-white/90 p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur dark:bg-white/5 dark:ring-white/10">
        <header className="space-y-2" dir="rtl">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-300">
            מדיניות פרטיות
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            איך אנו שומרים על המידע שלכם
          </h1>
          <p className="text-sm text-slate-600 dark:text-white/70">
            הפרטיות חשובה לנו. אתם מובילים את הבחירות הנוגעות לשיתוף החלומות, ואנחנו מתחייבים שלא לשתף דבר מחוץ לגבולות שתגדירו.
          </p>
        </header>

        <section className="space-y-6" dir="rtl">
          {privacySections.map((section) => (
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

        <div className="flex flex-wrap gap-3">
          <Link
            to="/terms"
            className="rounded-full border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-400 dark:text-amber-200 dark:hover:bg-white/10"
          >
            קראו את תנאי השימוש
          </Link>
          <Link
            to="/"
            className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
