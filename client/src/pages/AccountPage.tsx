import * as React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import UserProfileForm from "@/components/ui/users/UserProfileForm";
import PasswordActionsCard from "@/components/ui/users/PasswordActionsCard";
import DeleteAccountCard from "@/components/ui/users/DeleteAccountCard";
import { useTranslation } from "react-i18next";
export default function AccountPage() {
    const { t, i18n } = useTranslation();
    const user = useAuthStore((s) => s.user);
    if (!user)
        return <Navigate to="/login" replace/>;
    return (<div className="min-h-[70vh]">
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6 text-center" dir={i18n.dir()}>
        <h1 className="
            font-extrabold leading-[1.1] tracking-tight
            text-4xl sm:text-5xl
            bg-clip-text text-transparent
            bg-gradient-to-r from-[#D4A100] via-[#C4903A] to-[#B87E40]
            dark:from-purple-300 dark:via-purple-200 dark:to-amber-200
            mb-2
          ">
          {t("account.title")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-white/70">
          {t("account.subtitle")}
        </p>
      </section>

      <section className="max-w-3xl md:max-w-4xl mx-auto px-4 pb-20" dir={i18n.dir()}>
        <UserProfileForm user={user}/>
        <PasswordActionsCard />
        <DeleteAccountCard />
      </section>
    </div>);
}
