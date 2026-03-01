import { create } from "zustand";

interface HelpState {
  /** Whether the help slide-over panel is visible */
  panelOpen: boolean;
  /** Currently displayed chapter slug (in the panel) */
  activeChapterSlug: string | null;
  /** Optional anchor (#id) to scroll to after the panel opens */
  activeAnchor: string | null;

  /** Open the help panel for a specific chapter, optionally scrolling to an anchor */
  openPanel: (slug: string, anchor?: string) => void;
  /** Close the help panel */
  closePanel: () => void;
  /** Toggle the help panel */
  togglePanel: (slug?: string) => void;
  /** Set the active chapter */
  setActiveChapter: (slug: string) => void;
  /** Clear the active anchor (called after scroll completes) */
  clearAnchor: () => void;
}

export const useHelpStore = create<HelpState>((set) => ({
  panelOpen: false,
  activeChapterSlug: null,
  activeAnchor: null,

  openPanel: (slug, anchor) =>
    set({ panelOpen: true, activeChapterSlug: slug, activeAnchor: anchor ?? null }),

  closePanel: () =>
    set({ panelOpen: false, activeAnchor: null }),

  togglePanel: (slug) =>
    set((state) => {
      if (state.panelOpen && state.activeChapterSlug === slug) {
        return { panelOpen: false, activeAnchor: null };
      }
      return {
        panelOpen: true,
        activeChapterSlug: slug ?? state.activeChapterSlug,
        activeAnchor: null,
      };
    }),

  setActiveChapter: (slug) =>
    set({ activeChapterSlug: slug, activeAnchor: null }),

  clearAnchor: () =>
    set({ activeAnchor: null }),
}));

