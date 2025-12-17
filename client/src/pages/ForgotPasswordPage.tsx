import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MailCheck, Loader2 } from "lucide-react";
import { AuthApi } from "@/lib/api/auth";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const schema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: FormValues) => {
    const email = v.email.trim();
    if (!email) {
      toast.error(t("auth.forgot.emptyEmail"));
      return;
    }
    try {
      await AuthApi.requestPasswordReset(email);
      toast.success(t("auth.forgot.sent"));
    } catch {
      toast.success(t("auth.forgot.sent"));
    }
  };

  return (
    <section className="max-w-md mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">{t("auth.forgot.title")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">{t("auth.forgot.emailLabel")}</label>
          <Input
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "forgot-email-error" : undefined}
          />
          {errors.email && (
            <p id="forgot-email-error" className="text-xs text-rose-500 mt-1">
              {t("auth.forgot.emailInvalid")}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 to-amber-500 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              {t("auth.forgot.sending")}
            </>
          ) : (
            <>
              <MailCheck className="w-4 h-4 ml-2" />
              {t("auth.forgot.sendCta")}
            </>
          )}
        </Button>
        <p className="mt-3 text-xs text-slate-500">{t("auth.forgot.hint")}</p>
      </form>
    </section>
  );
}
