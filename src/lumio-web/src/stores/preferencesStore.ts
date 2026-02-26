import { create } from "zustand";

const STORAGE_KEY_PREFIX = "lumio-dashboard-prefs";

function storageKey(profileId: string | null) {
  return profileId ? `${STORAGE_KEY_PREFIX}-${profileId}` : STORAGE_KEY_PREFIX;
}

/* ── Dashboard visibility toggles ─────────────────────────── */

export interface DashboardPreferences {
  showVoortgang: boolean;
  showStatistieken: boolean;
  showVoortgangGranulair: boolean;
  showSuggesties: boolean;
  hiddenDomeinKaarten: string[];
  domeinKaartenVolgorde: string[];
  sectieVolgorde: string[];
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
  _profileId: string | null;
  // Dashboard visibility
  initForUser: (profileId: string) => void;
  toggleSection: (key: BooleanPreferenceKey) => void;
  toggleDomeinKaart: (domein: string) => void;
  setDomeinKaartenVolgorde: (order: string[]) => void;
  setSectieVolgorde: (order: string[]) => void;
  resetDashboard: () => void;
}

/* ── Defaults ─────────────────────────────────────────────── */

const dashboardDefaults: DashboardPreferences = {
  showVoortgang: true,
  showStatistieken: true,
  showVoortgangGranulair: true,
  showSuggesties: true,
  hiddenDomeinKaarten: [],
  domeinKaartenVolgorde: [],
  sectieVolgorde: [],
  showMeldingen: true,
  showBackup: true,
  showAanbevolen: true,
  showVerloopdatum: true,
};

/* ── Persistence helpers ──────────────────────────────────── */

function load(profileId: string | null): DashboardPreferences {
  try {
    const raw = localStorage.getItem(storageKey(profileId));
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
      domeinKaartenVolgorde: state.domeinKaartenVolgorde,
      sectieVolgorde: state.sectieVolgorde,
      showMeldingen: state.showMeldingen,
      showBackup: state.showBackup,
      showAanbevolen: state.showAanbevolen,
      showVerloopdatum: state.showVerloopdatum,
    };
    localStorage.setItem(storageKey(state._profileId), JSON.stringify(persisted));
  } catch {
    // Storage full / unavailable
  }
}

/* ── Store ────────────────────────────────────────────────── */

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...dashboardDefaults,
  _profileId: null,

  /* Load preferences for a specific user — call after profile is selected */
  initForUser: (profileId) => {
    const prefs = load(profileId);
    set({ ...prefs, _profileId: profileId });
  },

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

  setDomeinKaartenVolgorde: (order) => {
    set({ domeinKaartenVolgorde: order });
    save(get());
  },

  setSectieVolgorde: (order) => {
    set({ sectieVolgorde: order });
    save(get());
  },

  resetDashboard: () => {
    set({ ...dashboardDefaults, _profileId: get()._profileId });
    save(get());
  },
}));
