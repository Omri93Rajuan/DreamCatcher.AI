import LoginForm from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const highlights = t("loginPage.highlights", {
    returnObjects: true,
  }) as string[];

  return (
    <main className="min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:items-center">
        <section className="space-y-7 text-center lg:text-right" dir={i18n.dir()}>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm dark:border-amber-300/20 dark:bg-white/[0.06] dark:text-amber-200">
            {t("loginPage.badge")}
          </span>

          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl dark:text-white">
              {t("loginPage.title")}
            </h1>
            <p className="mx-auto max-w-xl text-base text-slate-600 sm:text-lg lg:mx-0 dark:text-white/70">
              {t("loginPage.subtitle")}
            </p>
          </div>

          <ul className="grid gap-3 text-right text-sm font-medium text-slate-700 sm:grid-cols-2 lg:grid-cols-1 dark:text-white/70">
            {highlights?.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-black/10 bg-white/80 px-4 py-3 shadow-[0_12px_30px_-26px_rgba(15,23,42,.7)] dark:border-white/10 dark:bg-white/[0.05]"
              >
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full rounded-2xl border border-black/10 bg-white/90 p-6 shadow-[0_20px_60px_-38px_rgba(15,23,42,.9)] backdrop-blur-sm sm:p-8 dark:border-white/10 dark:bg-white/[0.06]">
          <header className="space-y-2 text-center" dir={i18n.dir()}>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {t("loginPage.formTitle")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-white/60">
              {t("loginPage.formSubtitle")}
            </p>
          </header>

          <div className="mt-6">
            <LoginForm onSuccess={() => navigate("/")} />
          </div>
        </section>
      </div>
    </main>
  );
}
