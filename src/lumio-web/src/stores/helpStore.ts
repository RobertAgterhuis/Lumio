import { create } from "zustand";

interface HelpState {
  /** Whether the help slide-over panel is visible */
  panelOpen: boolean;
  /** Currently displayed chapter slug (in the panel) */
  activeChapterSlug: string | null;

  /** Open the help panel for a specific chapter */
  openPanel: (slug: string) => void;
  /** Close the help panel */
  closePanel: () => void;
  /** Toggle the help panel */
  togglePanel: (slug?: string) => void;
  /** Set the active chapter */
  setActiveChapter: (slug: string) => void;
}

export const useHelpStore = create<HelpState>((set) => ({
  panelOpen: false,
  activeChapterSlug: null,

  openPanel: (slug) =>
    set({ panelOpen: true, activeChapterSlug: slug }),

  closePanel: () =>
    set({ panelOpen: false }),

  togglePanel: (slug) =>
    set((state) => {
      if (state.panelOpen && state.activeChapterSlug === slug) {
        return { panelOpen: false };
      }
      return {
        panelOpen: true,
        activeChapterSlug: slug ?? state.activeChapterSlug,
      };
    }),

  setActiveChapter: (slug) =>
    set({ activeChapterSlug: slug }),
}));
