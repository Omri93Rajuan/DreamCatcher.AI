import { useState } from "react";
import { AuthApi, RegisterDto } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
export function useAuthSignup() {
    const { setUser } = useAuthStore();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const signup = async (payload: RegisterDto & {
        password: string;
    }) => {
        setSubmitting(true);
        setError(null);
        try {
            await AuthApi.register(payload);
            await new Promise((r) => setTimeout(r, 50));
            const v = await AuthApi.verify();
            if (v?.user) {
                setUser(v.user);
                return true;
            }
            await AuthApi.login({ email: payload.email, password: payload.password });
            await new Promise((r) => setTimeout(r, 50));
            const v2 = await AuthApi.verify();
            if (v2?.user) {
                setUser(v2.user);
                return true;
            }
            setError("החשבון נוצר, אך לא אומת.");
            return false;
        }
        catch (e: any) {
            const msg = e?.response?.data?.message ||
                e?.response?.data?.error ||
                e?.message ||
                "שגיאה בהרשמה.";
            setError(msg);
            return false;
        }
        finally {
            setSubmitting(false);
        }
    };
    return { signup, submitting, error, setError };
}
