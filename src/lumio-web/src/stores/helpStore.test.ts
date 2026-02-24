import { describe, it, expect, beforeEach } from "vitest";
import { useHelpStore } from "./helpStore";

describe("helpStore", () => {
  beforeEach(() => {
    useHelpStore.setState({
      panelOpen: false,
      activeChapterSlug: null,
    });
  });

  it("starts with panel closed", () => {
    expect(useHelpStore.getState().panelOpen).toBe(false);
    expect(useHelpStore.getState().activeChapterSlug).toBeNull();
  });

  it("openPanel opens panel with slug", () => {
    useHelpStore.getState().openPanel("getting-started");
    const state = useHelpStore.getState();
    expect(state.panelOpen).toBe(true);
    expect(state.activeChapterSlug).toBe("getting-started");
  });

  it("closePanel closes panel", () => {
    useHelpStore.getState().openPanel("test");
    useHelpStore.getState().closePanel();
    expect(useHelpStore.getState().panelOpen).toBe(false);
  });

  it("togglePanel opens when closed", () => {
    useHelpStore.getState().togglePanel("chapter-1");
    expect(useHelpStore.getState().panelOpen).toBe(true);
    expect(useHelpStore.getState().activeChapterSlug).toBe("chapter-1");
  });

  it("togglePanel closes when open and same slug", () => {
    useHelpStore.getState().openPanel("chapter-1");
    useHelpStore.getState().togglePanel("chapter-1");
    expect(useHelpStore.getState().panelOpen).toBe(false);
  });

  it("togglePanel switches slug when open and different slug", () => {
    useHelpStore.getState().openPanel("chapter-1");
    useHelpStore.getState().togglePanel("chapter-2");
    expect(useHelpStore.getState().panelOpen).toBe(true);
    expect(useHelpStore.getState().activeChapterSlug).toBe("chapter-2");
  });

  it("setActiveChapter changes slug without affecting open state", () => {
    useHelpStore.getState().setActiveChapter("new-slug");
    expect(useHelpStore.getState().activeChapterSlug).toBe("new-slug");
    expect(useHelpStore.getState().panelOpen).toBe(false);
  });
});
