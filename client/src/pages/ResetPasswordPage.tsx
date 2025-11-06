"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AuthApi } from "@/lib/api/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

// אותן ולידציות בדיוק כמו ב-Sign Up:
// - לפחות 8 תווים
// - מכיל ספרה
// - מכיל אות גדולה
const schema = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .superRefine(({ password, confirm }, ctx) => {
    if (!password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "סיסמה חובה.",
      });
    }
    if (password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "לפחות 8 תווים.",
      });
    }
    if (!/\d/.test(password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "להוסיף ספרה.",
      });
    }
    if (!/[A-Z]/.test(password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "להוסיף אות גדולה.",
      });
    }
    if (password !== confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirm"],
        message: "הסיסמאות אינן תואמות",
      });
    }
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const nav = useNavigate();
  const logoutLocal = useAuthStore((s) => s.logout);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onBlur" });

  // חישוב "חוזק" כמו בקומפוננטת ההרשמה:
  const pass = watch("password") ?? "";
  const pwReq = React.useMemo(
    () => ({
      len: pass.length >= 8,
      num: /\d/.test(pass),
      up: /[A-Z]/.test(pass),
    }),
    [pass]
  );
  const pwScore =
    (pwReq.len ? 4 : 0) + (pwReq.num ? 3 : 0) + (pwReq.up ? 3 : 0);

  const onSubmit = async (v: FormData) => {
    try {
      await AuthApi.resetPasswordWithCookie(v.password);
      await logoutLocal(); // ניקוי סטור מקומי
      toast.success("הסיסמה עודכנה. היכנס/י מחדש.");
      nav("/login");
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ??
        "הקישור לאיפוס לא תקין או שפג תוקפו. בקש/י קישור חדש.";
      toast.error(msg);
    }
  };

  return (
    <section className="max-w-md mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">איפוס סיסמה</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 flex items-center justify-between">
            <span>סיסמה חדשה</span>
            <span className="text-xs text-slate-500">חוזק: {pwScore}/10</span>
          </label>
          <Input type="password" {...register("password")} />
          {errors.password && (
            <p className="text-xs text-rose-500 mt-1">
              {errors.password.message as string}
            </p>
          )}
          {/* אינדיקציה מהירה לדרישות (לא חובה, אבל נוח למשתמש): */}
          <ul className="mt-2 text-xs space-y-1">
            <li className={pwReq.len ? "text-emerald-600" : "text-slate-500"}>
              • לפחות 8 תווים
            </li>
            <li className={pwReq.num ? "text-emerald-600" : "text-slate-500"}>
              • מכיל ספרה
            </li>
            <li className={pwReq.up ? "text-emerald-600" : "text-slate-500"}>
              • מכיל אות גדולה (A-Z)
            </li>
          </ul>
        </div>

        <div>
          <label className="block text-sm mb-1">אימות סיסמה</label>
          <Input type="password" {...register("confirm")} />
          {errors.confirm && (
            <p className="text-xs text-rose-500 mt-1">
              {errors.confirm.message as string}
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
              <Loader2 className="w-4 h-4 ml-2 animate-spin" /> מעדכן…
            </>
          ) : (
            "עדכן סיסמה"
          )}
        </Button>
      </form>
    </section>
  );
}
