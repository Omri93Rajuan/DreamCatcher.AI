"use client";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthApi, GoogleUrlParams } from "@/lib/api/auth";
import { TERMS_VERSION } from "@/constants/legal";

type StartOptions = Partial<GoogleUrlParams> & {
  termsAccepted?: boolean;
};

const defaultNext = () =>
  typeof window !== "undefined" ? window.location.pathname || "/" : "/";

const defaultRedirect = () =>
  typeof window !== "undefined"
    ? `${window.location.origin}/auth/google/callback`
    : undefined;

export function useGoogleAuth(defaults?: StartOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  const start = useCallback(
    async (overrides?: StartOptions) => {
      setLoading(true);
      setError(null);
      try {
        const opts: StartOptions = {
          ...(defaults || {}),
          ...(overrides || {}),
        };
        const mode: "login" | "signup" =
          opts.mode === "signup" ? "signup" : "login";
        const params: GoogleUrlParams = {
          mode,
          next: opts.next || defaultNext(),
          redirectTo: opts.redirectTo || defaultRedirect(),
        };
        if (!params.redirectTo) {
          throw new Error(t("auth.google.noRedirect"));
        }
        if (mode === "signup") {
          if (!opts.termsAccepted) {
            setError(t("auth.google.termsRequired"));
            return false;
          }
          params.termsAccepted = true;
          params.termsVersion = opts.termsVersion || TERMS_VERSION;
          if (opts.termsLocale) params.termsLocale = opts.termsLocale;
          else params.termsLocale = i18n.language;
        } else if (opts.termsLocale) {
          params.termsLocale = opts.termsLocale;
        }
        const result = await AuthApi.googleUrl(params);
        if (!result?.url) {
          throw new Error(t("auth.google.unavailable"));
        }
        window.location.assign(result.url);
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.error?.message ||
          err?.message ||
          t("googleCallback.genericError");
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [defaults, i18n.language, t]
  );

  return { start, loading, error, setError };
}
