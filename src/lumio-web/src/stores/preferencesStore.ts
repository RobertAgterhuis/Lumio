import { create } from "zustand";

const STORAGE_KEY = "lumio-dashboard-prefs";

/* ── Dashboard visibility toggles ─────────────────────────── */

export interface DashboardPreferences {
  showVoortgang: boolean;
  showVoortgangGranulair: boolean;
  showSuggesties: boolean;
  showDomeinKaarten: boolean;
}

/* ── Store interface ──────────────────────────────────────── */

interface PreferencesState extends DashboardPreferences {
  // Dashboard visibility
  toggleSection: (key: keyof DashboardPreferences) => void;
  resetDashboard: () => void;
}

/* ── Defaults ─────────────────────────────────────────────── */

const dashboardDefaults: DashboardPreferences = {
  showVoortgang: true,
  showVoortgangGranulair: true,
  showSuggesties: true,
  showDomeinKaarten: true,
};

/* ── Persistence helpers ──────────────────────────────────── */

function load(): DashboardPreferences {
  if (typeof window === "undefined") return dashboardDefaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return dashboardDefaults;
    return { ...dashboardDefaults, ...JSON.parse(raw) };
  } catch {
    return dashboardDefaults;
  }
}

function save(state: PreferencesState) {
  try {
    const persisted: DashboardPreferences = {
      showVoortgang: state.showVoortgang,
      showVoortgangGranulair: state.showVoortgangGranulair,
      showSuggesties: state.showSuggesties,
      showDomeinKaarten: state.showDomeinKaarten,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // Storage full / unavailable
  }
}

/* ── Store ────────────────────────────────────────────────── */

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...load(),

  /* Dashboard visibility */
  toggleSection: (key) => {
    set({ [key]: !get()[key] });
    save(get());
  },

  resetDashboard: () => {
    set(dashboardDefaults);
    save(get());
  },
}));
