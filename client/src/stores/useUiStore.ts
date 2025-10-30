import { create } from "zustand";

export interface UiStore {
  dark: boolean;
  toggleDark: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  dark: false,
  toggleDark: () => set((state) => ({ dark: !state.dark })),
}));
