import { create } from "zustand";

const STORAGE_KEY = "lumio-dashboard-prefs";

/* ── Dashboard visibility toggles ─────────────────────────── */

export interface DashboardPreferences {
  showVoortgang: boolean;
  showVoortgangGranulair: boolean;
  showSuggesties: boolean;
  showDomeinKaarten: boolean;
}

/* ── Domain finished state ────────────────────────────────── */

/** Maps domeinKey → ISO-8601 date string when the user marked it finished */
export type FinishedDomains = Record<string, string>;

/* ── Combined persisted shape ─────────────────────────────── */

interface PersistedPrefs extends DashboardPreferences {
  finishedDomains: FinishedDomains;
}

/* ── Store interface ──────────────────────────────────────── */

interface PreferencesState extends PersistedPrefs {
  // Dashboard visibility
  toggleSection: (key: keyof DashboardPreferences) => void;
  resetDashboard: () => void;

  // Domain finished
  setDomainFinished: (domein: string, finished: boolean) => void;
  isDomainFinished: (domein: string) => boolean;
}

/* ── Defaults ─────────────────────────────────────────────── */

const dashboardDefaults: DashboardPreferences = {
  showVoortgang: true,
  showVoortgangGranulair: true,
  showSuggesties: true,
  showDomeinKaarten: true,
};

const allDefaults: PersistedPrefs = {
  ...dashboardDefaults,
  finishedDomains: {},
};

/* ── Persistence helpers ──────────────────────────────────── */

function load(): PersistedPrefs {
  if (typeof window === "undefined") return allDefaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return allDefaults;
    return { ...allDefaults, ...JSON.parse(raw) };
  } catch {
    return allDefaults;
  }
}

function save(state: PreferencesState) {
  try {
    const persisted: PersistedPrefs = {
      showVoortgang: state.showVoortgang,
      showVoortgangGranulair: state.showVoortgangGranulair,
      showSuggesties: state.showSuggesties,
      showDomeinKaarten: state.showDomeinKaarten,
      finishedDomains: state.finishedDomains,
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

  /* Domain finished */
  setDomainFinished: (domein, finished) => {
    const current = { ...get().finishedDomains };
    if (finished) {
      current[domein] = new Date().toISOString();
    } else {
      delete current[domein];
    }
    set({ finishedDomains: current });
    save(get());
  },

  isDomainFinished: (domein) => {
    return !!get().finishedDomains[domein];
  },
}));
