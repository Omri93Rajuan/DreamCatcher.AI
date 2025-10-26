import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

const schema = z.object({
  email: z.string().email("אימייל לא תקין"),
  password: z.string().min(6, "סיסמה חייבת להיות לפחות 6 תווים"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      // 1) לוגין: השרת ישים קוקי HttpOnly
      const loginRes = await AuthApi.login(data);

      // אם השרת כבר מחזיר user — נחסוך verify
      if (loginRes?.user) {
        setUser(loginRes.user);
        navigate("/");
        return;
      }

      // 2) המתנה קצרה כדי לוודא שהקוקי נשמר בדפדפן (במיוחד בכרום)
      await new Promise((r) => setTimeout(r, 50));

      // 3) אימות סשן וקבלת המשתמש
      const verify = await AuthApi.verify();
      if (verify?.user) {
        setUser(verify.user);
        navigate("/");
      } else {
        // fallback: אם אין user ב-verify
        setServerError("לא הצלחנו לאמת את ההתחברות. נסה שוב.");
      }
    } catch (e: any) {
      // טיפול בשגיאות שרת/ולידציה
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "קרתה שגיאה בהתחברות. בדוק פרטים ונסה שוב.";
      setServerError(msg);

      // דוגמה: הצמדת השגיאה לשדה ספציפי (לא חובה)
      if (e?.response?.status === 401) {
        setError("password", { message: "אימייל או סיסמה שגויים" });
      }
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="glass-card p-8 rounded-2xl w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">התחברות</h1>

        {serverError && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-red-300 text-sm">
            {serverError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Input type="email" placeholder="אימייל" {...register("email")} />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Input
              type="password"
              placeholder="סיסמה"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "מתחבר..." : "כניסה"}
          </Button>
        </div>
      </form>
    </div>
  );
}
