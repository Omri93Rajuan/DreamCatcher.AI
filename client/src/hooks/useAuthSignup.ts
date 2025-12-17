import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthApi, RegisterDto } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export function useAuthSignup() {
  const { setUser } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const signup = async (
    payload: RegisterDto & {
      password: string;
    }
  ) => {
    setSubmitting(true);
    setError(null);
    try {
      await AuthApi.register(payload);
      await new Promise((r) => setTimeout(r, 50));

      const verifyInitial = await AuthApi.verify();
      if (verifyInitial?.user) {
        setUser(verifyInitial.user);
        return true;
      }

      await AuthApi.login({ email: payload.email, password: payload.password });
      await new Promise((r) => setTimeout(r, 50));

      const verifyAfterLogin = await AuthApi.verify();
      if (verifyAfterLogin?.user) {
        setUser(verifyAfterLogin.user);
        return true;
      }

      setError(t("auth.signupErrors.notVerified"));
      return false;
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        t("auth.signupErrors.generic");
      setError(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { signup, submitting, error, setError };
}
