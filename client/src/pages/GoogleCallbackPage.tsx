"use client";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export default function GoogleCallbackPage() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState(t("googleCallback.connecting"));
  const next = useMemo(() => params.get("next") || "/", [params]);
  const initialStatus = params.get("status");
  const initialMessage = params.get("message");

  useEffect(() => {
    if (initialStatus === "error") {
      setStatus("error");
      setMessage(initialMessage || t("googleCallback.failed"));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const verify = await AuthApi.verify();
        if (cancelled) return;
        if (verify?.user) {
          const id = (verify.user as any)._id || (verify.user as any).id;
          const full = id ? await AuthApi.getMe(id) : null;
          const detailed = full?.user ?? verify.user;
          setUser({
            ...(detailed as any),
            _id: (detailed as any)?._id || id,
          } as any);
          navigate(next, { replace: true });
          return;
        }
        setStatus("error");
        setMessage(t("googleCallback.verifyFailed"));
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage(t("googleCallback.genericError"));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialStatus, initialMessage, navigate, next, setUser, t]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-[#f6f2ff] via-[#fff6ec] to-[#fef5f5] px-4 py-16 dark:from-[#0b0b1a] dark:via-[#141426] dark:to-[#221933]">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white/95 p-8 text-center shadow-2xl ring-1 ring-black/5 backdrop-blur dark:bg-white/10 dark:ring-white/10">
        <div className="space-y-3" dir={i18n.dir()}>
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-200">
            {status === "loading"
              ? t("auth.loginForm.googleLoading")
              : t("googleCallback.errorTitle")}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {message}
          </h1>

          {status === "error" && (
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              {t("googleCallback.backLogin")}
            </button>
          )}
          {status === "error" && (
            <p className="text-sm text-slate-600 dark:text-white/70">
              {t("common.noAccount")}{" "}
              <button
                type="button"
                className="underline font-semibold text-amber-600 dark:text-amber-300"
                onClick={() => navigate("/register", { replace: true })}
              >
                {t("googleCallback.goRegister")}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
