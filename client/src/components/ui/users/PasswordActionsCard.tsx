"use client";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { KeyRound, MailCheck, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { AuthApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

type AnyErr = unknown & {
  response?: {
    status?: number;
    data?: any;
  };
};

export default function PasswordActionsCard() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = React.useState(false);

  const onSendReset = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await AuthApi.requestPasswordReset(user?.email || "");
      toast.success(t("account.security.sent"));
    } catch (err: unknown) {
      const e = err as AnyErr;
      if (e?.response?.status === 429) {
        toast.error(t("account.security.rateLimit"));
      } else {
        toast.error(t("account.security.error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mt-8 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4 sm:p-5"
      dir={i18n.dir()}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg grid place-items-center bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15">
          <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-300" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            {t("account.security.title")}
          </h3>
          <p className="text-xs text-slate-600 dark:text-white/70">
            {t("account.security.subtitle")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          onClick={onSendReset}
          disabled={loading}
          size="sm"
          variant="outline"
          className="shrink-0 rounded-lg border-slate-300/70 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10 px-3 h-8 text-sm"
          aria-busy={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("account.security.sending")}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <MailCheck className="w-4 h-4" />
              {t("account.security.cta")}
            </span>
          )}
        </Button>

        <p className="text-[11px] leading-4 text-slate-500 dark:text-white/60">
          {t("account.security.hint")}{" "}
          <span className="font-medium">{t("account.security.dailyLimit")}</span>.{" "}
          {t("account.security.spam")}
        </p>
      </div>
    </div>
  );
}
