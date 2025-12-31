"use client";
import React, { useMemo, useState } from "react";
import { AuthApi, RegisterDto } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import TermsDialog from "./TermsDialog";
import { TERMS_VERSION } from "@/constants/legal";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import googleLogo from "@/assets/logoGoogle.webp";
import { UploadsApi } from "@/lib/api/uploads";
import { toast } from "react-toastify";
import { convertFileToWebp, toProxiedImage } from "@/lib/images";
import { useTranslation } from "react-i18next";

type Props = {
  onSuccess?: () => void;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Errors = Partial<
  Record<keyof FormState | "general" | "terms" | "avatar", string>
>;

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const AVATARS = [
  "/avatars/avatar-1.webp",
  "/avatars/avatar-2.webp",
  "/avatars/avatar-3.webp",
  "/avatars/avatar-4.webp",
  "/avatars/avatar-5.webp",
  "/avatars/avatar-6.webp",
  "/avatars/avatar-7.webp",
  "/avatars/avatar-8.webp",
  "/avatars/avatar-9.webp",
  "/avatars/avatar-10.webp",
  "/avatars/avatar-11.webp",
  "/avatars/avatar-12.webp",
];

export default function SignupForm({ onSuccess }: Props) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATARS[0]);
  const [showAllAvatars, setShowAllAvatars] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploadCache, setAvatarUploadCache] = useState<{
    fingerprint: string;
    url: string;
  } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const primaryAvatars = AVATARS.slice(0, 4);
  const collapsedAvatars = React.useMemo(() => {
    const list: string[] = [];
    if (!primaryAvatars.includes(selectedAvatar)) {
      list.push(selectedAvatar);
    }
    for (const a of primaryAvatars) {
      if (list.length >= 4) break;
      if (!list.includes(a)) list.push(a);
    }
    return list;
  }, [selectedAvatar, primaryAvatars]);

  const setUser = useAuthStore((state) => state.setUser);
  const googleAuth = useGoogleAuth({ mode: "signup" });

  const passwordScore = useMemo(() => {
    let score = 0;
    if (form.password.length >= 8) score += 40;
    if (/[A-Z]/.test(form.password)) score += 20;
    if (/[a-z]/.test(form.password)) score += 20;
    if (/\d/.test(form.password)) score += 20;
    return Math.min(score, 100);
  }, [form.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next: Errors = {};
    if (!form.firstName.trim()) next.firstName = t("signup.errors.firstName");
    if (!form.lastName.trim()) next.lastName = t("signup.errors.lastName");
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim().toLowerCase())
    ) {
      next.email = t("signup.errors.email");
    }
    if (!form.password) {
      next.password = t("signup.errors.passwordRequired");
    } else if (form.password.length < 8) {
      next.password = t("signup.errors.passwordLength");
    }
    if (form.password !== form.confirmPassword) {
      next.confirmPassword = t("signup.errors.passwordMismatch");
    }
    if (!selectedAvatar) next.avatar = t("signup.errors.avatar");
    if (!acceptedTerms) next.terms = t("signup.errors.terms");
    const isValid = Object.keys(next).length === 0;
    setErrors(next);
    if (!isValid && next.terms) {
      toast.error(next.terms);
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    let imageUrl = selectedAvatar;

    // אם המשתמש בחר קובץ, נעלה אותו עכשיו (לפני שליחת ההרשמה)
    if (avatarFile) {
      const fingerprint = `${avatarFile.name}-${avatarFile.size}-${avatarFile.lastModified}`;
      if (avatarUploadCache && avatarUploadCache.fingerprint === fingerprint) {
        imageUrl = avatarUploadCache.url;
      } else {
        setUploadingAvatar(true);
        try {
          const presign = await UploadsApi.getAvatarUploadUrl({
            contentType: avatarFile.type,
            contentLength: avatarFile.size,
          });
          if (avatarFile.size > presign.maxBytes) {
            throw new Error(t("signup.errors.fileTooLarge"));
          }
          const putRes = await fetch(presign.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": avatarFile.type },
            body: avatarFile,
          });
          if (!putRes.ok) {
            throw new Error(`Upload failed (${putRes.status})`);
          }
          imageUrl =
            toProxiedImage(presign.proxyUrl || presign.publicUrl) || presign.publicUrl;
          setAvatarUploadCache({ fingerprint, url: imageUrl });
        } catch (err: any) {
          toast.error(err?.message || t("signup.errors.avatarUpload"));
          setSubmitting(false);
          setUploadingAvatar(false);
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }
    }

    const payload: RegisterDto = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      image: imageUrl,
      termsAgreed: true,
      termsVersion: TERMS_VERSION,
      termsUserAgent:
        typeof window !== "undefined" ? navigator.userAgent : undefined,
      termsLocale:
        typeof navigator !== "undefined" ? navigator.language : undefined,
    };

    try {
      const res = await AuthApi.register(payload);
      let user = res?.user;
      if (!user) {
        await AuthApi.login({
          email: payload.email,
          password: payload.password,
        });
        const verify = await AuthApi.verify();
        user = verify?.user;
      }
      if (user) {
        setUser(user);
        onSuccess?.();
        return;
      }
      setErrors({ general: t("signup.errors.genericCreate") });
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message || error?.message || t("auth.signupErrors.generic");
      if (status === 409) {
        setErrors({
          email: t("signup.errors.emailExists"),
        });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarFileSelect = async (file: File) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error(t("account.profile.errors.format"));
      return;
    }
    const webpFile = await convertFileToWebp(file);
    setAvatarFile(webpFile);
    setAvatarUploadCache(null);
    const url = URL.createObjectURL(webpFile);
    setAvatarPreview(url);
    setSelectedAvatar(url);
    setShowAllAvatars(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6" dir={i18n.dir()} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-white/80">
            {t("signup.firstName")}
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
              placeholder={t("signup.firstNamePlaceholder")}
              autoComplete="given-name"
              required
            />
            {errors.firstName && (
              <span className="text-xs text-red-500">{errors.firstName}</span>
            )}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-white/80">
            {t("signup.lastName")}
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
              placeholder={t("signup.lastNamePlaceholder")}
              autoComplete="family-name"
              required
            />
            {errors.lastName && (
              <span className="text-xs text-red-500">{errors.lastName}</span>
            )}
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-white/80">
            {t("signup.avatarTitle")}
          </p>
          <div
            className={[
              "flex gap-3 pb-1",
              showAllAvatars ? "flex-wrap" : "flex-nowrap overflow-x-auto",
            ].join(" ")}
          >
            {(showAllAvatars ? AVATARS : collapsedAvatars).map((src) => {
              const active = src === selectedAvatar;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(src);
                    setAvatarFile(null);
                    setAvatarPreview(null);
                    setAvatarUploadCache(null);
                  }}
                  className={[
                    "relative aspect-square w-16 md:w-20 rounded-full overflow-hidden group transition shrink-0",
                    active
                      ? "ring-[6px] ring-amber-400 dark:ring-amber-300 shadow-[0_18px_36px_-10px_rgba(251,191,36,0.85)] scale-[1.08] bg-gradient-to-br from-amber-100 via-white to-amber-50 dark:from-amber-500/35 dark:via-slate-800 dark:to-amber-400/20"
                      : "ring-1 ring-blue-200/70 dark:ring-white/15 bg-white/80 dark:bg-slate-800/70 hover:ring-amber-300 dark:hover:ring-amber-200 hover:shadow-[0_10px_18px_-12px_rgba(251,191,36,0.55)] hover:scale-[1.04] hover:bg-gradient-to-br hover:from-white hover:via-amber-50 hover:to-white dark:hover:from-slate-800 dark:hover:via-slate-700 dark:hover:to-slate-800",
                  ].join(" ")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/18 via-transparent to-fuchsia-400/14 opacity-0 group-hover:opacity-100 transition" />
                  <img
                    src={src}
                    alt="avatar option"
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                  />
                  {active && (
                    <>
                      <div className="absolute inset-0 rounded-full ring-2 ring-white/80 blur-[1px] pointer-events-none" />
                      <div className="absolute inset-[-6px] rounded-full bg-amber-300/15 blur-md pointer-events-none" />
                     <span className="absolute top-1 right-1">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500 text-white text-[10px] shadow">
                          {t("signup.selected")}
                        </span>
                      </span>
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-6 w-6 rounded-full bg-white text-amber-500 border border-amber-300 shadow flex items-center justify-center text-xs font-black dark:bg-slate-900 dark:text-amber-200 dark:border-amber-300">
                        ★
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {!showAllAvatars && (
              <button
                type="button"
                onClick={() => setShowAllAvatars(true)}
                className="text-xs px-3 py-2 rounded-full border border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 transition dark:border-amber-300 dark:text-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25"
              >
                {t("signup.showMoreAvatars", { count: AVATARS.length - 4 })}
              </button>
            )}
            {showAllAvatars && (
              <button
                type="button"
                onClick={() => setShowAllAvatars(false)}
                className="text-xs px-3 py-2 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition dark:border-white/20 dark:text-white dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                {t("signup.showLessAvatars")}
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="text-xs px-3 py-2 rounded-full border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition dark:border-white/20 dark:text-white dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              {uploadingAvatar ? t("signup.uploading") : t("signup.uploadOwn")}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                await handleAvatarFileSelect(file);
              }}
            />
          </div>
          {errors.avatar && (
            <p className="text-xs text-red-500">{errors.avatar}</p>
          )}
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-white/80">
          {t("signup.email")}
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
            placeholder="name@example.com"
            autoComplete="email"
            required
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email}</span>
          )}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-white/80">
            {t("signup.password")}
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
              placeholder={t("signup.passwordPlaceholder")}
              autoComplete="new-password"
              required
            />
            {errors.password && (
              <span className="text-xs text-red-500">{errors.password}</span>
            )}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-white/80">
            {t("signup.passwordConfirm")}
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
              placeholder={t("signup.passwordConfirmPlaceholder")}
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && (
              <span className="text-xs text-red-500">
                {errors.confirmPassword}
              </span>
            )}
          </label>
        </div>

        <div className="space-y-2">
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
              style={{ width: `${passwordScore}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-white/60">
            {t("signup.passwordHint")}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 shadow-sm dark:border-white/15 dark:bg-white/5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {t("signup.termsTitle")}
              </p>
              <p className="text-xs text-slate-500 dark:text-white/60">
                {t("signup.termsSubtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="inline-flex items-center justify-center rounded-full border border-amber-500 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:border-amber-300 dark:text-amber-200 dark:hover:bg-white/10"
            >
              {t("signup.showTerms")}
            </button>
          </div>
          <div className="mt-3 text-xs font-semibold">
            {acceptedTerms ? (
              <span className="text-emerald-600 dark:text-emerald-300">
                {t("signup.termsAccepted")}
              </span>
            ) : null}
          </div>
          {errors.terms && (
            <p className="mt-2 text-xs text-red-500">{errors.terms}</p>
          )}
        </div>

          {errors.general && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-200 dark:ring-red-400/30">
            {errors.general}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? t("signup.submitting") : t("signup.submit")}
        </button>

        <div className="text-center text-xs text-slate-400 dark:text-white/60">
          --- {t("signup.or")} ---
        </div>

        <button
          type="button"
          aria-label="Google"
          disabled={googleAuth.loading}
          onClick={() => {
            if (!acceptedTerms) {
              toast.error(t("signup.errors.terms"));
              return;
            }
            googleAuth.start({
              next: "/",
              termsAccepted: acceptedTerms,
              termsVersion: TERMS_VERSION,
              termsLocale:
                typeof navigator !== "undefined"
                  ? navigator.language
                  : undefined,
            });
          }}
          className={`inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/15 dark:bg-white/10 dark:text-white ${
            !acceptedTerms ? "opacity-60" : ""
          }`}
        >
          {googleAuth.loading ? (
            t("signup.googlePreparing")
          ) : (
            <img
              src={googleLogo}
              alt="Google"
              loading="lazy"
              className="h-6 w-auto"
            />
          )}
        </button>

        {googleAuth.error && (
          <p className="text-center text-xs text-red-500">
            {googleAuth.error}
          </p>
        )}
      </form>

      <TermsDialog
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setAcceptedTerms(true);
          setErrors((prev) => ({ ...prev, terms: "" }));
          setShowTerms(false);
        }}
      />
    </>
  );
}
