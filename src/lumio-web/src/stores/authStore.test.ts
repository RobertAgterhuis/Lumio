import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./authStore";

// Mock localStorage for lock() test
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

describe("authStore", () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      isUnlocked: false,
      isFirstRun: true,
      isReadOnly: false,
      isLoading: true,
      profiles: [],
      activeProfile: null,
      profileSelected: false,
      profileNeedsSetup: false,
    });
    localStorageMock.clear();
  });

  it("starts locked", () => {
    expect(useAuthStore.getState().isUnlocked).toBe(false);
  });

  it("setUnlocked toggles isUnlocked", () => {
    useAuthStore.getState().setUnlocked(true);
    expect(useAuthStore.getState().isUnlocked).toBe(true);

    useAuthStore.getState().setUnlocked(false);
    expect(useAuthStore.getState().isUnlocked).toBe(false);
  });

  it("setActiveProfile stores profile", () => {
    const profile = {
      id: "1",
      naam: "Test",
      relatie: "eigenaar",
      isPrimair: true,
      aangemaaktOp: "2025-01-01",
    };
    useAuthStore.getState().setActiveProfile(profile);
    expect(useAuthStore.getState().activeProfile).toEqual(profile);
  });

  it("lock() resets state and clears recent searches", () => {
    localStorageMock.setItem("lumio-recent-searches", JSON.stringify(["test"]));

    useAuthStore.setState({
      isUnlocked: true,
      isReadOnly: true,
      activeProfile: { id: "1", naam: "X", relatie: "r", isPrimair: true, aangemaaktOp: "" },
      profileSelected: true,
      profileNeedsSetup: true,
    });

    useAuthStore.getState().lock();

    const state = useAuthStore.getState();
    expect(state.isUnlocked).toBe(false);
    expect(state.isReadOnly).toBe(false);
    expect(state.activeProfile).toBeNull();
    expect(state.profileSelected).toBe(false);
    expect(state.profileNeedsSetup).toBe(false);
    expect(localStorageMock.getItem("lumio-recent-searches")).toBeNull();
  });

  it("setProfiles stores profile list", () => {
    const profiles = [
      { id: "1", naam: "A", relatie: "eigenaar", isPrimair: true, aangemaaktOp: "" },
      { id: "2", naam: "B", relatie: "partner", isPrimair: false, aangemaaktOp: "" },
    ];
    useAuthStore.getState().setProfiles(profiles);
    expect(useAuthStore.getState().profiles).toHaveLength(2);
  });
});
