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
      showVoortgang: true,
      showVoortgangGranulair: true,
      showSuggesties: true,
      showDomeinKaarten: true,
      finishedDomains: {},
    });
  });

  it("starts with all sections visible", () => {
    const state = usePreferencesStore.getState();
    expect(state.showVoortgang).toBe(true);
    expect(state.showVoortgangGranulair).toBe(true);
    expect(state.showSuggesties).toBe(true);
    expect(state.showDomeinKaarten).toBe(true);
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

  it("resetDashboard restores defaults", () => {
    usePreferencesStore.getState().toggleSection("showVoortgang");
    usePreferencesStore.getState().toggleSection("showSuggesties");
    usePreferencesStore.getState().resetDashboard();

    const state = usePreferencesStore.getState();
    expect(state.showVoortgang).toBe(true);
    expect(state.showSuggesties).toBe(true);
  });

  it("setDomainFinished marks domain as finished", () => {
    usePreferencesStore.getState().setDomainFinished("testament", true);
    expect(usePreferencesStore.getState().isDomainFinished("testament")).toBe(true);
  });

  it("setDomainFinished(false) unmarks domain", () => {
    usePreferencesStore.getState().setDomainFinished("testament", true);
    usePreferencesStore.getState().setDomainFinished("testament", false);
    expect(usePreferencesStore.getState().isDomainFinished("testament")).toBe(false);
  });

  it("isDomainFinished returns false for unknown domain", () => {
    expect(usePreferencesStore.getState().isDomainFinished("nonexistent")).toBe(false);
  });

  it("finishedDomains persists to localStorage", () => {
    usePreferencesStore.getState().setDomainFinished("boedel", true);
    const persisted = JSON.parse(localStorageMock.getItem("lumio-dashboard-prefs") ?? "{}");
    expect(persisted.finishedDomains.boedel).toBeDefined();
  });
});
