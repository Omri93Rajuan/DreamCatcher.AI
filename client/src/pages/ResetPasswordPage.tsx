import React from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { AuthApi } from "@/lib/api/auth";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const schema = z
  .object({
    password: z.string().min(8, { message: "min8" }).regex(/[0-9]/, { message: "digit" }).regex(/[A-Z]/, {
      message: "upper",
    }),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "mismatch",
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      toast.error(t("auth.reset.noToken"));
      return;
    }
    try {
      await AuthApi.resetPasswordWithToken(token, values.password);
      toast.success(t("auth.reset.success"));
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 400 || status === 410) {
        toast.error(t("auth.reset.tokenInvalid"));
      } else {
        toast.error(t("auth.reset.genericError"));
      }
    }
  };

  const errorText = (key?: string) => {
    switch (key) {
      case "min8":
        return t("auth.reset.rules.min8");
      case "digit":
        return t("auth.reset.rules.digit");
      case "upper":
        return t("auth.reset.rules.upper");
      case "mismatch":
        return t("auth.reset.rules.mismatch");
      default:
        return t("auth.reset.genericError");
    }
  };

  return (
    <section className="max-w-md mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">{t("auth.reset.title")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">{t("auth.reset.newPasswordLabel")}</label>
          <Input
            type="password"
            {...register("password")}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "pw-error" : undefined}
          />
          {errors.password && (
            <p id="pw-error" className="text-xs text-rose-500 mt-1">
              {errorText(errors.password.message)}
            </p>
          )}
          <div className="mt-2 text-xs text-slate-500 space-y-0.5">
            <div>• {t("auth.reset.rules.min8")}</div>
            <div>• {t("auth.reset.rules.digit")}</div>
            <div>• {t("auth.reset.rules.upper")}</div>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">{t("auth.reset.confirmLabel")}</label>
          <Input
            type="password"
            {...register("confirm")}
            aria-invalid={!!errors.confirm}
            aria-describedby={errors.confirm ? "confirm-error" : undefined}
          />
          {errors.confirm && (
            <p id="confirm-error" className="text-xs text-rose-500 mt-1">
              {errorText(errors.confirm.message)}
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
              {t("auth.reset.saving")}
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 ml-2" />
              {t("auth.reset.saveCta")}
            </>
          )}
        </Button>
      </form>
    </section>
  );
}
