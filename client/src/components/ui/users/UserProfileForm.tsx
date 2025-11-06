"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User, UpdateUserDTO } from "@/lib/api/types";
import { UsersApi } from "@/lib/api/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Camera } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/useAuthStore";
const schema = z.object({
    firstName: z.string().min(1, "שדה חובה"),
    lastName: z.string().min(1, "שדה חובה"),
    image: z
        .string()
        .trim()
        .refine((v) => v === "" || /^https?:\/\/.+/i.test(v), {
        message: "כתובת תמונה לא תקינה",
    })
        .optional(),
});
type FormValues = z.infer<typeof schema>;
export default function UserProfileForm({ user }: {
    user: User;
}) {
    const qc = useQueryClient();
    const patchUser = useAuthStore((s) => s.patchUser);
    const setUser = useAuthStore((s) => s.setUser);
    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch, } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            image: user.image ?? "",
        },
        mode: "onBlur",
    });
    const [preview, setPreview] = React.useState<string | undefined>(user.image || undefined);
    React.useEffect(() => {
        const sub = watch((vals) => setPreview(vals.image || undefined));
        return () => sub.unsubscribe();
    }, [watch]);
    const mUpdate = useMutation({
        mutationFn: (payload: UpdateUserDTO) => UsersApi.update(user._id, payload),
        onSuccess: (updated) => {
            qc.invalidateQueries({ queryKey: ["user", user._id] });
            qc.invalidateQueries({ queryKey: ["auth/me"] });
            reset({
                firstName: updated.firstName ?? "",
                lastName: updated.lastName ?? "",
                image: updated.image ?? "",
            });
            if (patchUser) {
                patchUser({
                    firstName: updated.firstName,
                    lastName: updated.lastName,
                    image: updated.image,
                });
            }
            else {
                setUser(updated);
            }
            toast.success("הפרטים נשמרו בהצלחה!");
        },
        onError: (e: any) => {
            toast.error(e?.response?.data?.error?.message ??
                e?.message ??
                "שמירה נכשלה, נסה שוב מאוחר יותר");
        },
    });
    const onSubmit = (values: FormValues) => {
        const payload: UpdateUserDTO = {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            image: values.image?.trim() || undefined,
        };
        mUpdate.mutate(payload);
    };
    return (<div className="relative rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur shadow-[0_12px_40px_-20px_rgba(0,0,0,.35)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-500 via-purple-600 to-amber-400 rounded-t-2xl"/>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 sm:p-8" dir="rtl">
        <div className="flex items-start gap-4 mb-6">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-amber-400">
              <div className="w-full h-full rounded-full overflow-hidden border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10">
                <img src={preview || "/avatar-placeholder.png"} alt={user.firstName || "avatar"} className="w-full h-full object-cover" onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
                "/avatar-placeholder.png";
        }}/>
              </div>
            </div>
            <button type="button" className="absolute -bottom-1 -left-1 p-2 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/15" title="שנה תמונה" onClick={() => toast.info("העלאת תמונה ישירה תתווסף בהמשך. כרגע הדבק/י URL.")}>
              <Camera className="w-4 h-4"/>
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-amber-500 dark:from-purple-300 dark:to-amber-200">
              הפרטים שלי
            </h2>
            <p className="text-sm text-slate-600 dark:text-white/70">
              ניהול פרטי פרופיל ותמונה. האימייל מוצג לקריאה בלבד.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-slate-700 dark:text-white/80">
              שם פרטי
            </label>
            <Input {...register("firstName")} className="dark:bg-white/10 dark:border-white/15 dark:text-white" placeholder="יוסי"/>
            {errors.firstName && (<p className="mt-1 text-xs text-rose-500">
                {errors.firstName.message}
              </p>)}
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-700 dark:text-white/80">
              שם משפחה
            </label>
            <Input {...register("lastName")} className="dark:bg-white/10 dark:border-white/15 dark:text-white" placeholder="כהן"/>
            {errors.lastName && (<p className="mt-1 text-xs text-rose-500">
                {errors.lastName.message}
              </p>)}
          </div>

          
          <div className="md:col-span-2">
            <label className="block text-sm mb-1 text-slate-700 dark:text-white/80">
              אימייל (לא ניתן לשינוי)
            </label>
            <div className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-black/5 text-slate-800 border border-black/10 dark:bg-white/10 dark:text-white dark:border-white/15">
              <div className="flex items-center gap-2 min-w-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4 opacity-70" fill="currentColor" aria-hidden>
                  <path d="M4 6h16a2 2 0 0 1 2 2v.7l-10 6.25L2 8.7V8a2 2 0 0 1 2-2Zm0 4.05V16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10.05l-8.7 5.44a2 2 0 0 1-2.6 0L4 10.05Z"/>
                </svg>
                <span className="truncate">{user.email}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-full bg-black/10 text-slate-700 border border-black/10 dark:bg-white/15 dark:text-white/80 dark:border-white/15" title="שדה זה לא ניתן לעריכה">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden>
                  <path d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2H10V7Z"/>
                </svg>
                נעול
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-white/60">
              לשינוי אימייל יש לפתוח פנייה לתמיכה.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1 text-slate-700 dark:text-white/80">
              כתובת תמונה (URL)
            </label>
            <div className="flex gap-2">
              <Input {...register("image")} className="dark:bg-white/10 dark:border-white/15 dark:text-white" placeholder="https://…"/>
              <Button type="button" variant="outline" title="העלה תמונה (בעתיד)" onClick={() => toast.info("חברו ספק העלאה (S3/Cloudinary) והכניסו את ה-URL לשדה")} className="border-black/15 dark:border-white/20 dark:text-white">
                <Upload className="w-4 h-4"/>
              </Button>
            </div>
            {errors.image && (<p className="mt-1 text-xs text-rose-500">
                {errors.image.message}
              </p>)}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => reset({
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            image: user.image ?? "",
        })} className="border-black/15 dark:border-white/20 dark:text-white">
            אפס
          </Button>

          <Button type="submit" disabled={mUpdate.isPending || !isDirty} className="px-6 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-md disabled:opacity-60 dark:from-purple-500 dark:to-amber-400 dark:hover:from-purple-400 dark:hover:to-amber-300">
            {mUpdate.isPending ? (<>
                <Loader2 className="w-4 h-4 ml-2 animate-spin"/> שומר…
              </>) : ("שמור שינויים")}
          </Button>
        </div>
      </form>
    </div>);
}
