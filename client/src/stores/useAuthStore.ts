// src/stores/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/api/types";
import { AuthApi } from "@/lib/api/auth";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;

  /** קובע את המשתמש במלואו (או null) */
  setUser: (u: User | null) => void;

  /** מעדכן חלקית את אובייקט המשתמש (מיזוג לתוך ה-store) */
  patchUser: (patch: Partial<User>) => void;

  /** התנתקות (שרת + ניקוי לוקאלי) */
  logout: () => Promise<void>;

  /** רענון פרטי משתמש מהשרת (אופציונלי לשימוש בלייאאוט) */
  refreshMe: (id?: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (u) => set({ user: u, isAuthenticated: !!u }),

      patchUser: (patch) => {
        const curr = get().user;
        if (!curr) return;
        // מיזוג עדין – לא “זורקים” שדות שלא הגיעו
        const merged = { ...curr, ...patch } as User;
        set({ user: merged, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await AuthApi.logout(); // מוחק קוקי/סשן בצד שרת
        } catch {
          // גם אם השרת לא זמין—ממשיכים לנקות לוקאלית
        }
        set({ user: null, isAuthenticated: false });
      },

      refreshMe: async (id?: string) => {
        try {
          const curr = get().user;
          const userId = id ?? curr?._id;
          if (!userId) return;
          const res = await AuthApi.getMe(userId);
          if (res?.user) set({ user: res.user, isAuthenticated: true });
        } catch {
          // אם נכשל—לא שוברים את האפליקציה
        }
      },
    }),
    {
      name: "auth-store", // localStorage key
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);

// מאזין גלובלי להתנתקות מאינטרספטור/אירוע מערכת
if (typeof window !== "undefined") {
  window.addEventListener("auth:logout", () => {
    const { setUser } = useAuthStore.getState();
    setUser(null); // גם isAuthenticated ירד ל-false בזכות setUser
  });
}
