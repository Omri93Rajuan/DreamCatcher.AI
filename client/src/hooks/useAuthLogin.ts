import { useState } from "react";
import { AuthApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

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
      await new Promise((r) => setTimeout(r, 50));
      const v = await AuthApi.verify();
      if (v?.user) {
        setUser(v.user);
        return true;
      }
      setError("לא הצלחנו לאמת את ההתחברות.");
      return false;
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "אימייל או סיסמה שגויים.";
      setError(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { login, submitting, error, setError };
}
