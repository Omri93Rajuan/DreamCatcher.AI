import { create } from "zustand";

export interface UiStore {
  dark: boolean;
  toggleDark: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  dark: false,
  toggleDark: () => set((s) => ({ dark: !s.dark })),
  setDark: (v: boolean) => set({ dark: v }),
}));
