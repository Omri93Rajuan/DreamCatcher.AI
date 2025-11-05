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
import { Loader2, Upload, Camera, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/useAuthStore";

const schema = z.object({
  firstName: z.string().min(1, "שדה חובה"),
  lastName: z.string().min(1, "שדה חובה"),
  email: z.string().email("אימייל לא תקין"),
  image: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\/.+/i.test(v), {
      message: "כתובת תמונה לא תקינה",
    })
    .optional(),
});

type FormValues = z.infer<typeof schema>;

export default function UserProfileForm({ user }: { user: User }) {
  const qc = useQueryClient();
  const patchUser = useAuthStore((s) => s.patchUser ?? (() => {}));
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      image: user.image ?? "",
    },
    mode: "onBlur",
  });

  // תצוגה מקדימה לפי ה-URL שבשדה
  const [preview, setPreview] = React.useState<string | undefined>(
    user.image || undefined
  );
  React.useEffect(() => {
    const sub = watch((vals) => setPreview(vals.image || undefined));
    return () => sub.unsubscribe();
  }, [watch]);

  const mUpdate = useMutation({
    mutationFn: (payload: UpdateUserDTO) => UsersApi.update(user._id, payload),
    onSuccess: (updated) => {
      // רענון קוואריז (אם קיימים)
      qc.invalidateQueries({ queryKey: ["user", user._id] });
      qc.invalidateQueries({ queryKey: ["auth/me"] });

      // עדכון הטופס לערכים ששמרנו
      reset({
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
        email: updated.email ?? "",
        image: updated.image ?? "",
      });

      // עדכון ה-Store (Navbar/Avatar מתעדכן מיידית)
      if (patchUser) {
        patchUser({
          firstName: updated.firstName,
          lastName: updated.lastName,
          image: updated.image,
        });
      } else {
        setUser(updated);
      }

      toast.success("הפרטים נשמרו בהצלחה!");
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.error?.message ??
        e?.message ??
        "שמירה נכשלה, נסה שוב מאוחר יותר";
      toast.error(msg);
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

  return (
    <div
      className="
        relative rounded-2xl border border-black/10 dark:border-white/10
        bg-white/70 dark:bg-white/5 backdrop-blur
        shadow-[0_12px_40px_-20px_rgba(0,0,0,.35)]
      "
    >
      {/* פס עליון דקורטיבי */}
      <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-500 via-purple-600 to-amber-400 rounded-t-2xl" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="p-6 sm:p-8"
        dir="rtl"
      >
        {/* כותרת קטנה פנימית + אוואטר */}
        <div className="flex items-start gap-4 mb-6">
          {/* אוואטר עם רינג גרדיינט */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-amber-400">
              <div className="w-full h-full rounded-full overflow-hidden border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview || "/avatar-placeholder.png"}
                  alt={user.firstName || "avatar"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/avatar-placeholder.png";
                  }}
                />
              </div>
            </div>

            {/* "צלמת" קטנה – פעולה עתידית להעלאה ישירה */}
            <button
              type="button"
              className="absolute -bottom-1 -left-1 p-2 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/15"
              title="שנה תמונה"
              onClick={() =>
                toast.info("העלאת תמונה ישירה תתווסף בהמשך. כרגע הדבק/י URL.")
              }
            >
              <Camera className="w-4 h-4" />
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

        {/* טופס – רספונסיבי */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-slate-700 dark:text-white/80">
              שם פרטי
            </label>
            <Input
              {...register("firstName")}
              className="dark:bg-white/10 dark:border-white/15 dark:text-white"
              placeholder="יוסי"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-700 dark:text-white/80">
              שם משפחה
            </label>
            <Input
              {...register("lastName")}
              className="dark:bg-white/10 dark:border-white/15 dark:text-white"
              placeholder="כהן"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1 text-slate-700 dark:text-white/80">
              אימייל
            </label>

            <div className="relative group">
              {/* רקע מטושטש עם גרדיינט */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-amber-500/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* התוכן */}
              <div className="relative flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-slate-300/60 dark:border-white/20 bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 dark:text-white/90 truncate">
                    {user.email}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">
                    חשבון מוגן · לשינוי פנה לתמיכה
                  </div>
                </div>

                <div className="flex-shrink-0 px-2 py-1 rounded-md bg-purple-500/10 dark:bg-purple-400/10 border border-purple-500/20 dark:border-purple-400/20">
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-300">
                    מאומת
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1 text-slate-700 dark:text-white/80">
              כתובת תמונה (URL)
            </label>
            <div className="flex gap-2">
              <Input
                {...register("image")}
                className="dark:bg-white/10 dark:border-white/15 dark:text-white"
                placeholder="https://…"
              />
              <Button
                type="button"
                variant="outline"
                title="העלה תמונה (בעתיד)"
                onClick={() =>
                  toast.info(
                    "חברו ספק העלאה (S3/Cloudinary) והכניסו את ה-URL לשדה"
                  )
                }
                className="border-black/15 dark:border-white/20 dark:text-white"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            {errors.image && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.image.message}
              </p>
            )}
          </div>
        </div>

        {/* פוטר כפתורים */}
        <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              reset({
                firstName: user.firstName ?? "",
                lastName: user.lastName ?? "",
                email: user.email ?? "",
                image: user.image ?? "",
              })
            }
            className="border-black/15 dark:border-white/20 dark:text-white"
          >
            אפס
          </Button>

          <Button
            type="submit"
            disabled={mUpdate.isPending || !isDirty}
            className="
              px-6
              bg-gradient-to-r from-purple-600 to-amber-500
              hover:from-purple-500 hover:to-amber-400
              text-white shadow-md disabled:opacity-60
              dark:from-purple-500 dark:to-amber-400
              dark:hover:from-purple-400 dark:hover:to-amber-300
            "
          >
            {mUpdate.isPending ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                שומר…
              </>
            ) : (
              "שמור שינויים"
            )}
          </Button>
        </div>

        {/* מידע תנאים (אופציונלי) */}
        <div className="mt-6 text-xs text-slate-500 dark:text-white/60 space-y-1">
          <div>תנאים מאושרים: {user.termsAccepted ? "כן" : "לא"}</div>
          {user.termsAcceptedAt && (
            <div>
              אושר בתאריך:{" "}
              {new Date(user.termsAcceptedAt).toLocaleString("he-IL")}
            </div>
          )}
          {user.termsVersion && <div>גרסת תנאים: {user.termsVersion}</div>}
        </div>
      </form>
    </div>
  );
}
