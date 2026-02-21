import { create } from "zustand";

interface AuthState {
  isUnlocked: boolean;
  isFirstRun: boolean;
  isLoading: boolean;
  setUnlocked: (unlocked: boolean) => void;
  setFirstRun: (firstRun: boolean) => void;
  setLoading: (loading: boolean) => void;
  lock: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isUnlocked: false,
  isFirstRun: true,
  isLoading: true,
  setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
  setFirstRun: (firstRun) => set({ isFirstRun: firstRun }),
  setLoading: (loading) => set({ isLoading: loading }),
  lock: () => set({ isUnlocked: false }),
}));
