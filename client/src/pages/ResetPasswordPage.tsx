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

const schema = z
  .object({
    password: z.string().min(8, "לפחות 8 תווים"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirm"],
  });

export default function ResetPasswordPage() {
  const nav = useNavigate();
  const logoutLocal = useAuthStore((s) => s.logout);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: z.infer<typeof schema>) => {
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
          <label className="block text-sm mb-1">סיסמה חדשה</label>
          <Input type="password" {...register("password")} />
          {errors.password && (
            <p className="text-xs text-rose-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">אימות סיסמה</label>
          <Input type="password" {...register("confirm")} />
          {errors.confirm && (
            <p className="text-xs text-rose-500 mt-1">
              {errors.confirm.message}
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
