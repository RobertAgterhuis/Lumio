import { create } from "zustand";

export interface Profile {
  id: string;
  naam: string;
  relatie: string;
  isPrimair: boolean;
  aangemaaktOp: string;
  fotoThumbnail?: string | null;
}

interface AuthState {
  isUnlocked: boolean;
  isFirstRun: boolean;
  isReadOnly: boolean;
  isLoading: boolean;
  profiles: Profile[];
  activeProfile: Profile | null;
  profileSelected: boolean;
  profileNeedsSetup: boolean;
  setUnlocked: (unlocked: boolean) => void;
  setFirstRun: (firstRun: boolean) => void;
  setReadOnly: (readOnly: boolean) => void;
  setLoading: (loading: boolean) => void;
  setProfiles: (profiles: Profile[]) => void;
  setActiveProfile: (profile: Profile | null) => void;
  setProfileSelected: (selected: boolean) => void;
  setProfileNeedsSetup: (needsSetup: boolean) => void;
  lock: () => void;
  profileFotoVersion: number;
  bumpProfileFoto: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isUnlocked: false,
  isFirstRun: true,
  isReadOnly: false,
  isLoading: true,
  profiles: [],
  activeProfile: null,
  profileSelected: false,
  profileNeedsSetup: false,
  profileFotoVersion: 0,
  bumpProfileFoto: () => set((s) => ({ profileFotoVersion: s.profileFotoVersion + 1 })),
  setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
  setFirstRun: (firstRun) => set({ isFirstRun: firstRun }),
  setReadOnly: (readOnly) => set({ isReadOnly: readOnly }),
  setLoading: (loading) => set({ isLoading: loading }),
  setProfiles: (profiles) => set({ profiles }),
  setActiveProfile: (profile) => set({ activeProfile: profile }),
  setProfileSelected: (selected) => set({ profileSelected: selected }),
  setProfileNeedsSetup: (needsSetup) => set({ profileNeedsSetup: needsSetup }),
  lock: () => {
    try {
      localStorage.removeItem("lumio-recent-searches");
    } catch {
      // localStorage not available
    }
    set({
      isUnlocked: false,
      isReadOnly: false,
      activeProfile: null,
      profileSelected: false,
      profileNeedsSetup: false,
    });
  },
}));
