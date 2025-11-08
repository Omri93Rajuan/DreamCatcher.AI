"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MailCheck, Loader2 } from "lucide-react";
import { AuthApi } from "@/lib/api/auth";
import { toast } from "react-toastify";
const schema = z.object({
    email: z.string().email("אימייל לא תקין"),
});
export default function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
    const onSubmit = async (v: z.infer<typeof schema>) => {
        try {
            await AuthApi.requestPasswordReset(v.email.trim());
            toast.success("אם האימייל קיים, שלחנו קישור לאיפוס.");
        }
        catch {
            toast.success("אם האימייל קיים, שלחנו קישור לאיפוס.");
        }
    };
    return (<section className="max-w-md mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">שכחתי סיסמה</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">אימייל</label>
          <Input type="email" placeholder="name@example.com" {...register("email")}/>
          {errors.email && (<p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>)}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-amber-500 text-white">
          {isSubmitting ? (<>
              <Loader2 className="w-4 h-4 ml-2 animate-spin"/>
              שולח…
            </>) : (<>
              <MailCheck className="w-4 h-4 ml-2"/>
              שלח קישור לאיפוס
            </>)}
        </Button>
        <p className="mt-3 text-xs text-slate-500">
          נשלח מייל אם קיים חשבון עם הכתובת הזו. בדקו גם ספאם.
        </p>
      </form>
    </section>);
}
