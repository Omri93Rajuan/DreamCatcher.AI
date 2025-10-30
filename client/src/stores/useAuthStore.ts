import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/api/types";
import { AuthApi } from "@/lib/api/auth";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (u) => set({ user: u, isAuthenticated: !!u }),

      logout: async () => {
        try {
          await AuthApi.logout(); // שולח בקשה לשרת למחיקת הקוקי
        } catch {
          // גם אם השרת לא מגיב, ננקה לוקאלית כדי לא להיתקע
        }
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: "auth-store" }
  )
);

// מנקה משתמש אם ה-interceptor משדר אירוע "auth:logout"
if (typeof window !== "undefined") {
  window.addEventListener("auth:logout", () =>
    useAuthStore.getState().setUser(null)
  );
}
