// useAuthLogin.ts
import { useState } from "react";
import { AuthApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

function toText(x: unknown): string | null {
  if (!x) return null;
  if (typeof x === "string") return x.trim() || null;
  if (typeof x === "number" || typeof x === "boolean") return String(x);
  if (Array.isArray(x)) {
    // לדוגמה: [{message: "..."}, "error text"]
    const parts = x
      .map((i) =>
        typeof i === "string"
          ? i
          : typeof i === "object" &&
            i &&
            "message" in i &&
            typeof (i as any).message === "string"
          ? (i as any).message
          : null
      )
      .filter(Boolean) as string[];
    return parts.length ? parts.join(", ") : null;
  }
  // אובייקט: ננסה שדות נפוצים
  const obj = x as Record<string, any>;
  const candidates: Array<unknown> = [
    obj.message, // "message": "..."
    obj.error, // "error": "..."
    obj.detail, // "detail": "..."
    obj?.message?.he, // i18n { message: { he, en } }
    obj?.errors, // errors: [...]
  ];
  for (const c of candidates) {
    const t = toText(c);
    if (t) return t;
  }
  // אחרון חביב – stringify בטוח
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

function normalizeError(e: any, fallback = "אימייל או סיסמה שגויים."): string {
  // Axios-style
  const axiosData = e?.response?.data;
  const axiosMsg =
    toText(axiosData) ??
    toText(e?.response?.data?.message) ??
    toText(e?.response?.data?.error);
  if (axiosMsg) return axiosMsg;

  // Fetch/throw מותאם אישית
  const direct = toText(e?.message) ?? toText(e?.error) ?? toText(e);
  return direct ?? fallback;
}

export function useAuthLogin() {
  const { setUser } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const r = await AuthApi.login({ email, password });
      if (r?.user) {
        setUser(r.user);
        return true;
      }

      // fallback קטן אם יש דיליי ל-session
      await new Promise((r) => setTimeout(r, 50));
      const v = await AuthApi.verify();
      if (v?.user) {
        setUser(v.user);
        return true;
      }

      setError("לא הצלחנו לאמת את ההתחברות.");
      return false;
    } catch (e: any) {
      // תמיד מכניסים מחרוזת — לעולם לא אובייקט
      const msg = normalizeError(e, "אימייל או סיסמה שגויים.");
      setError(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { login, submitting, error, setError };
}
