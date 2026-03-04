import { describe, it, expect, beforeEach } from "vitest";
import { usePreferencesStore } from "./preferencesStore";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("preferencesStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
    usePreferencesStore.setState({
      _profileId: null,
      showVoortgang: true,
      showStatistieken: true,
      showVoortgangGranulair: true,
      showSuggesties: true,
      hiddenDomeinKaarten: [],
      domeinKaartenVolgorde: [],
      sectieVolgorde: [],
      showMeldingen: false,
      showBackup: true,
      showAanbevolen: true,
      showVerloopdatum: true,
      dismissedBanners: [],
    });
  });

  it("starts with all sections visible", () => {
    const state = usePreferencesStore.getState();
    expect(state.showVoortgang).toBe(true);
    expect(state.showStatistieken).toBe(true);
    expect(state.showVoortgangGranulair).toBe(true);
    expect(state.showSuggesties).toBe(true);
    expect(state.hiddenDomeinKaarten).toEqual([]);
    expect(state.domeinKaartenVolgorde).toEqual([]);
    expect(state.sectieVolgorde).toEqual([]);
    expect(state.showMeldingen).toBe(false);
    expect(state.showBackup).toBe(true);
    expect(state.showAanbevolen).toBe(true);
    expect(state.showVerloopdatum).toBe(true);
  });

  it("toggleSection flips boolean", () => {
    usePreferencesStore.getState().toggleSection("showVoortgang");
    expect(usePreferencesStore.getState().showVoortgang).toBe(false);

    usePreferencesStore.getState().toggleSection("showVoortgang");
    expect(usePreferencesStore.getState().showVoortgang).toBe(true);
  });

  it("toggleSection persists to localStorage", () => {
    usePreferencesStore.getState().toggleSection("showSuggesties");
    const persisted = JSON.parse(localStorageMock.getItem("lumio-dashboard-prefs") ?? "{}");
    expect(persisted.showSuggesties).toBe(false);
  });

  it("initForUser loads user-specific prefs from localStorage", () => {
    localStorageMock.setItem("lumio-dashboard-prefs-user-42", JSON.stringify({ showVoortgang: false, showMeldingen: false }));
    usePreferencesStore.getState().initForUser("user-42");
    const state = usePreferencesStore.getState();
    expect(state._profileId).toBe("user-42");
    expect(state.showVoortgang).toBe(false);
    expect(state.showMeldingen).toBe(false);
    // Other prefs default to true
    expect(state.showStatistieken).toBe(true);
  });

  it("initForUser uses defaults when no stored prefs exist for user", () => {
    usePreferencesStore.getState().initForUser("new-user-99");
    const state = usePreferencesStore.getState();
    expect(state._profileId).toBe("new-user-99");
    expect(state.showVoortgang).toBe(true);
    expect(state.sectieVolgorde).toEqual([]);
  });

  it("saves to user-specific key after initForUser", () => {
    usePreferencesStore.getState().initForUser("user-7");
    usePreferencesStore.getState().toggleSection("showStatistieken");
    const persisted = JSON.parse(localStorageMock.getItem("lumio-dashboard-prefs-user-7") ?? "{}");
    expect(persisted.showStatistieken).toBe(false);
  });

  it("resetDashboard preserves _profileId", () => {
    usePreferencesStore.getState().initForUser("user-5");
    usePreferencesStore.getState().toggleSection("showVoortgang");
    usePreferencesStore.getState().resetDashboard();
    expect(usePreferencesStore.getState()._profileId).toBe("user-5");
    expect(usePreferencesStore.getState().showVoortgang).toBe(true);
  });

  it("resetDashboard restores defaults", () => {
    usePreferencesStore.getState().toggleSection("showVoortgang");
    usePreferencesStore.getState().toggleSection("showSuggesties");
    usePreferencesStore.getState().resetDashboard();

    const state = usePreferencesStore.getState();
    expect(state.showVoortgang).toBe(true);
    expect(state.showSuggesties).toBe(true);
  });

});
