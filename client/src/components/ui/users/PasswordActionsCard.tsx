"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { KeyRound, MailCheck } from "lucide-react";
import { toast } from "react-toastify";
import { AuthApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export default function PasswordActionsCard() {
  const user = useAuthStore((s) => s.user);

  const onSendReset = async () => {
    try {
      await AuthApi.requestPasswordReset(user?.email || "");
      toast.success("אם האימייל קיים, שלחנו קישור לאיפוס.");
    } catch {
      toast.success("אם האימייל קיים, שלחנו קישור לאיפוס.");
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15">
          <KeyRound className="w-5 h-5 text-purple-600 dark:text-purple-300" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">
            אבטחה וסיסמה
          </h3>
          <p className="text-sm text-slate-600 dark:text-white/70">
            איפוס סיסמה דרך מייל מאובטח.
          </p>
        </div>
      </div>

      <Button
        onClick={onSendReset}
        className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white"
      >
        <MailCheck className="w-4 h-4 ml-2" />
        שלח קישור לאיפוס סיסמה
      </Button>

      <p className="mt-3 text-xs text-slate-500 dark:text-white/60">
        אם לא קיבלת מייל תוך כמה דקות – בדוק גם את תיקיית הספאם.
      </p>
    </div>
  );
}
