import { create } from "zustand";

const STORAGE_KEY = "lumio-dashboard-prefs";

/* ── Dashboard visibility toggles ─────────────────────────── */

export interface DashboardPreferences {
  showVoortgang: boolean;
  showStatistieken: boolean;
  showVoortgangGranulair: boolean;
  showSuggesties: boolean;
  hiddenDomeinKaarten: string[];
  showMeldingen: boolean;
  showBackup: boolean;
  showAanbevolen: boolean;
  showVerloopdatum: boolean;
}

export type BooleanPreferenceKey = {
  [K in keyof DashboardPreferences]: DashboardPreferences[K] extends boolean ? K : never;
}[keyof DashboardPreferences];

/* ── Store interface ──────────────────────────────────────── */

interface PreferencesState extends DashboardPreferences {
  // Dashboard visibility
  toggleSection: (key: BooleanPreferenceKey) => void;
  toggleDomeinKaart: (domein: string) => void;
  resetDashboard: () => void;
}

/* ── Defaults ─────────────────────────────────────────────── */

const dashboardDefaults: DashboardPreferences = {
  showVoortgang: true,
  showStatistieken: true,
  showVoortgangGranulair: true,
  showSuggesties: true,
  hiddenDomeinKaarten: [],
  showMeldingen: true,
  showBackup: true,
  showAanbevolen: true,
  showVerloopdatum: true,
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
      showStatistieken: state.showStatistieken,
      showVoortgangGranulair: state.showVoortgangGranulair,
      showSuggesties: state.showSuggesties,
      hiddenDomeinKaarten: state.hiddenDomeinKaarten,
      showMeldingen: state.showMeldingen,
      showBackup: state.showBackup,
      showAanbevolen: state.showAanbevolen,
      showVerloopdatum: state.showVerloopdatum,
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

  toggleDomeinKaart: (domein) => {
    const current = get().hiddenDomeinKaarten;
    const next = current.includes(domein)
      ? current.filter((d) => d !== domein)
      : [...current, domein];
    set({ hiddenDomeinKaarten: next });
    save(get());
  },

  resetDashboard: () => {
    set(dashboardDefaults);
    save(get());
  },
}));
