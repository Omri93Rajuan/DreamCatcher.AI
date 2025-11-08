import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/api/types";
import { AuthApi } from "@/lib/api/auth";
type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (u: User | null) => void;
    patchUser: (patch: Partial<User>) => void;
    logout: () => Promise<void>;
    refreshMe: (id?: string) => Promise<void>;
};
export const useAuthStore = create<AuthState>()(persist((set, get) => ({
    user: null,
    isAuthenticated: false,
    setUser: (u) => set({ user: u, isAuthenticated: !!u }),
    patchUser: (patch) => {
        const curr = get().user;
        if (!curr)
            return;
        const merged = { ...curr, ...patch } as User;
        set({ user: merged, isAuthenticated: true });
    },
    logout: async () => {
        try {
            await AuthApi.logout();
        }
        catch {
        }
        set({ user: null, isAuthenticated: false });
    },
    refreshMe: async (id?: string) => {
        try {
            const curr = get().user;
            const userId = id ?? curr?._id;
            if (!userId)
                return;
            const res = await AuthApi.getMe(userId);
            if (res?.user)
                set({ user: res.user, isAuthenticated: true });
        }
        catch {
        }
    },
}), {
    name: "auth-store",
    partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
}));
if (typeof window !== "undefined") {
    window.addEventListener("auth:logout", () => {
        const { setUser } = useAuthStore.getState();
        setUser(null);
    });
}
