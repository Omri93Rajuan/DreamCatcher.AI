import LoginForm from "@/components/auth/LoginForm";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const highlights = t("loginPage.highlights", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f2ff] via-[#fff6ec] to-[#fef5f5] px-4 py-16 dark:from-[#0b0b1a] dark:via-[#141426] dark:to-[#221933]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-stretch lg:gap-16">
        <section className="max-w-xl space-y-8 text-center lg:text-right" dir={i18n.dir()}>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm dark:bg-white/10 dark:text-amber-200">
            {t("loginPage.badge")}
          </span>
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl dark:text-white">
              {t("loginPage.title")}
            </h1>
            <p className="text-base text-slate-600 sm:text-lg dark:text-white/70">
              {t("loginPage.subtitle")}
            </p>
          </div>
          <ul className="space-y-3 text-right text-sm font-medium text-slate-700 dark:text-white/70">
            {highlights?.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-white/85 px-4 py-3 shadow-sm ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10"
              >
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-200">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur dark:bg-white/10 dark:ring-white/10">
          <header className="space-y-2 text-center" dir={i18n.dir()}>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {t("loginPage.formTitle")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-white/60">
              {t("loginPage.formSubtitle")}
            </p>
          </header>

          <div className="mt-6">
            <LoginForm
              onSuccess={() => {
                navigate("/");
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
