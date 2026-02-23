import { create } from "zustand";

interface HelpState {
  /** Whether the help slide-over panel is visible */
  panelOpen: boolean;
  /** Currently displayed chapter slug (in the panel) */
  activeChapterSlug: string | null;
  /** Cached markdown content per chapter slug */
  contentCache: Record<string, string>;
  /** Whether content is currently loading */
  loading: boolean;

  /** Open the help panel for a specific chapter */
  openPanel: (slug: string) => void;
  /** Close the help panel */
  closePanel: () => void;
  /** Toggle the help panel */
  togglePanel: (slug?: string) => void;
  /** Set the active chapter */
  setActiveChapter: (slug: string) => void;
  /** Cache fetched markdown content */
  cacheContent: (slug: string, content: string) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
}

export const useHelpStore = create<HelpState>((set) => ({
  panelOpen: false,
  activeChapterSlug: null,
  contentCache: {},
  loading: false,

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

  cacheContent: (slug, content) =>
    set((state) => ({
      contentCache: { ...state.contentCache, [slug]: content },
    })),

  setLoading: (loading) =>
    set({ loading }),
}));
