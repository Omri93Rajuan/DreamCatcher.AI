import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/api/types";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (u: User | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (u) => set({ user: u, isAuthenticated: !!u }),
    }),
    { name: "auth-store" }
  )
);

if (typeof window !== "undefined") {
  window.addEventListener("auth:logout", () =>
    useAuthStore.getState().setUser(null)
  );
}
