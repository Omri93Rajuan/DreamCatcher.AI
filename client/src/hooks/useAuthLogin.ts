import { useState } from "react";
import { AuthApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslation } from "react-i18next";

const FALLBACK_KEY = "auth.loginErrors.fallback";

const SERVER_MESSAGE_MAP: Array<{ pattern: RegExp; key: string }> = [
  { pattern: /could not find/i, key: "auth.loginErrors.invalid" },
  { pattern: /invalid password/i, key: "auth.loginErrors.invalidPassword" },
  { pattern: /missing required/i, key: "auth.loginErrors.missing" },
];

function toText(x: unknown): string | null {
  if (!x) return null;
  if (typeof x === "string") return x.trim() || null;
  if (typeof x === "number" || typeof x === "boolean") return String(x);
  if (Array.isArray(x)) {
    const parts = x
      .map((item) =>
        typeof item === "string"
          ? item
          : typeof item === "object" &&
              item &&
              "message" in item &&
              typeof (item as any).message === "string"
          ? ((item as any).message as string)
          : null
      )
      .filter(Boolean) as string[];
    return parts.length ? parts.join(", ") : null;
  }
  const obj = x as Record<string, unknown>;
  const candidates: Array<unknown> = [
    obj.message,
    obj.error,
    obj.detail,
    obj?.message && typeof obj.message === "object" ? (obj.message as any).he : null,
    obj?.errors,
  ];
  for (const candidate of candidates) {
    const text = toText(candidate);
    if (text) return text;
  }
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

function translateServerMessage(message: string | null): string | null {
  if (!message) return null;
  const match = SERVER_MESSAGE_MAP.find((item) => item.pattern.test(message));
  return match ? match.key : message;
}

function normalizeError(e: any, fallback = FALLBACK_KEY): string {
  const axiosData = e?.response?.data;
  const axiosMsg =
    toText(axiosData) ??
    toText(e?.response?.data?.message) ??
    toText(e?.response?.data?.error);
  const translatedAxios = translateServerMessage(axiosMsg);
  if (translatedAxios) return translatedAxios;
  const direct = translateServerMessage(
    toText(e?.message) ?? toText(e?.error) ?? toText(e)
  );
  return direct ?? fallback;
}

function translateStatus(status?: number): string | null {
  switch (status) {
    case 401:
    case 404:
      return "auth.loginErrors.invalid";
    case 429:
      return "auth.loginErrors.tooMany";
    case 500:
      return "auth.loginErrors.serverBusy";
    default:
      return null;
  }
}

export function useAuthLogin() {
  const { t, i18n } = useTranslation();
  const { setUser } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await AuthApi.login({ email, password });
      if (response?.user) {
        setUser(response.user);
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
      const verify = await AuthApi.verify();
      if (verify?.user) {
        setUser(verify.user);
        return true;
      }

      setError(t("auth.loginErrors.verifyFailed"));
      return false;
    } catch (e: any) {
      const status = e?.response?.status as number | undefined;
      const fallbackKey = normalizeError(e, FALLBACK_KEY);
      const messageKey = translateStatus(status) ?? fallbackKey ?? FALLBACK_KEY;
      const hasKey = typeof messageKey === "string" && i18n.exists(messageKey);
      const translated = hasKey ? t(messageKey) : messageKey;
      const finalError =
        typeof translated === "string" && translated !== messageKey
          ? translated
          : t(FALLBACK_KEY);
      setError(finalError);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { login, submitting, error, setError };
}
