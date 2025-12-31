"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import type { User, UpdateUserDTO } from "@/lib/api/types";
import { UsersApi } from "@/lib/api/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Camera } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/useAuthStore";
import { UploadsApi } from "@/lib/api/uploads";
import { toProxiedImage } from "@/lib/images";

type FormValues = {
  firstName: string;
  lastName: string;
  image?: string;
};

export default function UserProfileForm({ user }: { user: User }) {
  const { t, i18n } = useTranslation();
  const schema = React.useMemo(
    () =>
      z.object({
        firstName: z.string().min(1, t("account.profile.errors.firstName")),
        lastName: z.string().min(1, t("account.profile.errors.lastName")),
        image: z
          .string()
          .trim()
          .refine(
            (v) => v === "" || /^https?:\/\/.+/i.test(v) || /^\/api\/images\//i.test(v),
            { message: t("account.profile.errors.image") }
          )
          .optional(),
      }),
    [t]
  );

  const qc = useQueryClient();
  const patchUser = useAuthStore((s) => s.patchUser);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      image: user.image ?? "",
    },
    mode: "onBlur",
  });

  const [preview, setPreview] = React.useState<string | undefined>(
    toProxiedImage(user.image) || undefined
  );
  const [uploading, setUploading] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const selectedFileRef = React.useRef<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const objectUrlRef = React.useRef<string | null>(null);

  const setLocalFile = React.useCallback((file: File | null) => {
    selectedFileRef.current = file;
    setSelectedFile(file);
  }, []);

  const setPreviewUrl = React.useCallback(
    (url?: string) => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (url && url.startsWith("blob:")) {
        objectUrlRef.current = url;
      }
      setPreview(url);
    },
    [setPreview]
  );

  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    reset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      image: user.image ?? "",
    });
    const proxied = toProxiedImage(user.image) || undefined;
    setLocalFile(null);
    setPreviewUrl(proxied);
    if (proxied && proxied !== user.image) {
      setValue("image", proxied, { shouldDirty: false });
    }
  }, [user, reset, setValue, setPreviewUrl, setLocalFile]);

  React.useEffect(() => {
    const sub = watch((vals) => {
      if (selectedFileRef.current) return;
      setPreviewUrl(toProxiedImage(vals.image) || undefined);
    });
    return () => sub.unsubscribe();
  }, [watch, setPreviewUrl]);

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
      setLocalFile(null);
      setPreviewUrl(toProxiedImage(updated.image) || undefined);
      if (patchUser) {
        patchUser({
          firstName: updated.firstName,
          lastName: updated.lastName,
          image: updated.image,
        });
      } else {
        setUser(updated);
      }
      toast.success(t("account.profile.toastSaved"));
    },
    onError: (e: any) => {
      toast.error(
        e?.response?.data?.error?.message ??
          e?.message ??
          t("account.profile.toastError")
      );
    },
  });

  const onSubmit = async (values: FormValues) => {
    let imageUrl = values.image?.trim() || undefined;

    if (selectedFile) {
      setUploading(true);
      try {
        const presign = await UploadsApi.getAvatarUploadUrl({
          contentType: selectedFile.type,
          contentLength: selectedFile.size,
        });
        if (selectedFile.size > presign.maxBytes) {
          toast.error(t("account.profile.errors.fileTooLarge"));
          return;
        }
        const putRes = await fetch(presign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        if (!putRes.ok) {
          throw new Error(`Upload failed (${putRes.status})`);
        }
        imageUrl =
          toProxiedImage(presign.proxyUrl || presign.publicUrl) ||
          presign.publicUrl;
      } catch (err: any) {
        toast.error(err?.message || t("account.profile.toastUpload"));
        return;
      } finally {
        setUploading(false);
      }
    }

    const payload: UpdateUserDTO = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      image: imageUrl,
    };
    mUpdate.mutate(payload);
  };

  const hasLocalFile = !!selectedFile;
  const isSaving = mUpdate.isPending || uploading;

  return (
    <div className="relative rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur shadow-[0_12px_40px_-20px_rgba(0,0,0,.35)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-500 via-purple-600 to-amber-400 rounded-t-2xl" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 sm:p-8" dir={i18n.dir()}>
        <div className="flex items-start gap-4 mb-6">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-amber-400">
              <div className="w-full h-full rounded-full overflow-hidden border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10">
                <img
                  src={preview || "/avatar-placeholder.webp"}
                  alt={user.firstName || "avatar"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = "true";
                      img.src = "/avatar-placeholder.webp";
                    }
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -left-1 p-2 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/15"
              onClick={() => fileInputRef.current?.click()}
              title={t("account.profile.camera")}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-amber-500 dark:from-purple-300 dark:to-amber-200">
              {t("account.profile.title")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-white/70">
              {t("account.profile.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-slate-700 dark:text-white/80">
              {t("signup.firstName")}
            </label>
            <Input
              {...register("firstName")}
              className="dark:bg-white/10 dark:border-white/15 dark:text-white"
              placeholder={t("signup.firstNamePlaceholder")}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-700 dark:text-white/80">
              {t("signup.lastName")}
            </label>
            <Input
              {...register("lastName")}
              className="dark:bg-white/10 dark:border-white/15 dark:text-white"
              placeholder={t("signup.lastNamePlaceholder")}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1 text-slate-700 dark:text-white/80">
              {t("account.profile.imageLabel")}
            </label>
            <div className="flex gap-2 flex-wrap">
              <Input
                {...register("image")}
                className="dark:bg-white/10 dark:border-white/15 dark:text-white"
                placeholder="https://example.com/avatar.jpg"
              />
              <Button
                type="button"
                variant="outline"
                className="border-black/15 dark:border-white/20 dark:text-white"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t("signup.uploading")}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1" /> {t("account.profile.upload")}
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
                    toast.error(t("account.profile.errors.format"));
                    return;
                  }
                  const objectUrl = URL.createObjectURL(file);
                  setLocalFile(file);
                  setPreviewUrl(objectUrl);
                  setValue("image", watch("image") ?? "", {
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                }}
              />
            </div>
            {errors.image && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.image.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset({
                firstName: user.firstName ?? "",
                lastName: user.lastName ?? "",
                image: user.image ?? "",
              });
              setLocalFile(null);
              setPreviewUrl(toProxiedImage(user.image) || undefined);
            }}
            className="border-black/15 dark:border-white/20 dark:text-white"
          >
            {t("account.profile.reset")}
          </Button>

          <Button
            type="submit"
            disabled={isSaving || (!isDirty && !hasLocalFile)}
            className="px-6 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-md disabled:opacity-60 dark:from-purple-500 dark:to-amber-400 dark:hover:from-purple-400 dark:hover:to-amber-300"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" /> {t("account.profile.saving")}
              </>
            ) : (
              t("account.profile.save")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
