"use client";
import { useCallback, useState } from "react";
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

const TERMS_TOAST =
  "יש לאשר את תנאי השימוש לפני הרשמה דרך Google.";
const GENERIC_ERROR = "התחברות Google נתקלה בשגיאה, נסו שוב.";

export function useGoogleAuth(defaults?: StartOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          throw new Error("לא נמצא יעד הפניה עבור Google OAuth.");
        }
        if (mode === "signup") {
          if (!opts.termsAccepted) {
            setError(TERMS_TOAST);
            return false;
          }
          params.termsAccepted = true;
          params.termsVersion = opts.termsVersion || TERMS_VERSION;
          if (opts.termsLocale) params.termsLocale = opts.termsLocale;
        } else if (opts.termsLocale) {
          params.termsLocale = opts.termsLocale;
        }
        const result = await AuthApi.googleUrl(params);
        if (!result?.url) {
          throw new Error("Google OAuth אינו זמין כעת.");
        }
        window.location.assign(result.url);
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.error?.message ||
          err?.message ||
          GENERIC_ERROR;
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [defaults]
  );

  return { start, loading, error, setError };
}
