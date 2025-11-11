"use client";
import SignupForm from "@/components/auth/SignupForm";
import { Link, useNavigate } from "react-router-dom";

const benefits = [
  "פרשנות חכמה לחלומות בעזרת בינה מלאכותית שמדברת עברית.",
  "יומן חלומות אישי שמזהה דפוסים רגשיים ומחזיר תובנות מעשיות.",
  "כלים קצרים להרגעה, מדיטציות ונשימות להירדמות רגועה יותר.",
];

export default function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f2ff] via-[#fff6ec] to-[#fef5f5] px-4 py-16 dark:from-[#0b0b1a] dark:via-[#141426] dark:to-[#221933]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-stretch lg:gap-16">
        {/* Hero copy */}
        <section className="flex-1 space-y-8 text-center lg:text-right" dir="rtl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm dark:bg-white/10 dark:text-amber-200">
            יותר מ־25,000 חולמים כבר ב־DreamCatcher.AI
          </span>

          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl dark:text-white">
              פתחו חשבון חדש וקבלו ליווי רגשי דרך החלומות שלכם
            </h1>
            <p className="text-base text-slate-600 sm:text-lg dark:text-white/70">
              DreamCatcher.AI מחברת בין תיעוד יומי יומן חלומות, בינה מלאכותית ותכני
              רוגע, כדי לעזור לכם להבין את המסרים שמסתתרים בחלומות ולהפוך אותם
              לכלי צמיחה אישי.
            </p>
          </div>

          <ul className="space-y-3 text-right text-sm font-medium text-slate-700 dark:text-white/70">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-3 rounded-2xl bg-white/85 px-4 py-3 shadow-sm ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10"
              >
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-200">
                  ✦
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <p className="text-sm text-slate-500 dark:text-white/60">
            כבר יש לכם משתמש?{" "}
            <Link
              to="/login"
              className="font-semibold text-amber-700 hover:text-amber-500 dark:text-amber-200"
            >
              התחברות לחשבון
            </Link>
          </p>
        </section>

        {/* Form */}
        <section className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur dark:bg-white/10 dark:ring-white/10">
          <header className="space-y-2 text-center" dir="rtl">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              טופס הרשמה קצר ומדויק
            </h2>
            <p className="text-sm text-slate-500 dark:text-white/60">
              מלאו את הפרטים, ואנחנו נלווה אתכם בדרך לרוגע ולתובנות עמוקות.
            </p>
          </header>

          <div className="mt-6">
            <SignupForm
              onSuccess={() => {
                navigate("/");
              }}
            />
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 dark:text-white/50" dir="rtl">
            בלחיצה על "הרשמה" אתם מאשרים את{" "}
            <Link to="/terms" className="underline hover:text-amber-500">
              תנאי השימוש
            </Link>{" "}
            ואת{" "}
            <Link to="/privacy" className="underline hover:text-amber-500">
              מדיניות הפרטיות
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
