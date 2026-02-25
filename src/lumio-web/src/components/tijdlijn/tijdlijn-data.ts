/**
 * tijdlijn-data.ts
 * Config mapping tijdlijn stap keys to their associated Lumio domain.
 * Used by TijdlijnStapRow to show completion badges, summaries, and deep links.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TijdlijnTranslateFn = (key: string, values?: any) => string;

export interface TijdlijnStapConfig {
  /** API endpoint (without /api prefix) to fetch domain data */
  endpoint: string;
  /** Navigation href to the domain detail page */
  href: string;
  /** Returns true when domain has any usable data */
  hasData: (data: unknown) => boolean;
  /** Returns true when the step is considered fully completed */
  isCompleted: (data: unknown) => boolean;
  /** Builds a short human-readable summary of the recorded domain data */
  getSamenvatting: (data: unknown, t: TijdlijnTranslateFn) => string;
}

export const STAP_DOMAIN_CONFIGS: Record<string, TijdlijnStapConfig> = {
  /** Eerste 24 uur */
  uitvaart: {
    endpoint: "uitvaart",
    href: "/uitvaart",
    hasData: (data) => data !== null && data !== undefined,
    isCompleted: (data) => {
      if (!data || typeof data !== "object") return false;
      const d = data as { voorkeurType?: string };
      return !!d.voorkeurType;
    },
    getSamenvatting: (data, t) => {
      const d = data as { voorkeurType?: string };
      return d.voorkeurType
        ? t("samenvatting.uitvaart", { type: d.voorkeurType })
        : t("samenvatting.vastgelegd");
    },
  },

  donor: {
    endpoint: "donor",
    href: "/donor",
    hasData: (data) => data !== null && data !== undefined,
    isCompleted: (data) => {
      if (!data || typeof data !== "object") return false;
      const d = data as { keuze?: string; isGeregistreerdBijDonorregister?: boolean };
      return !!d.keuze || d.isGeregistreerdBijDonorregister === true;
    },
    getSamenvatting: (data, t) => {
      const d = data as { keuze?: string };
      return d.keuze
        ? t("samenvatting.donor", { keuze: d.keuze })
        : t("samenvatting.vastgelegd");
    },
  },

  wilsverklaring: {
    endpoint: "euthanasie",
    href: "/euthanasie",
    hasData: (data) => data !== null && data !== undefined,
    isCompleted: (data) => {
      if (!data || typeof data !== "object") return false;
      const d = data as { wilEuthanasie?: boolean; datumOndertekening?: string };
      return d.wilEuthanasie === true || d.wilEuthanasie === false || !!d.datumOndertekening;
    },
    getSamenvatting: (data, t) => {
      const d = data as { datumOndertekening?: string };
      return d.datumOndertekening
        ? t("samenvatting.wilsverklaring", { datum: d.datumOndertekening })
        : t("samenvatting.vastgelegd");
    },
  },

  /** Eerste week */
  notaris: {
    endpoint: "testament",
    href: "/testament",
    hasData: (data) => data !== null && data !== undefined,
    isCompleted: (data) => {
      if (!data || typeof data !== "object") return false;
      const d = data as { notarisNaam?: string; notarisKantoor?: string };
      return !!(d.notarisNaam || d.notarisKantoor);
    },
    getSamenvatting: (data, t) => {
      const d = data as { notarisNaam?: string; notarisKantoor?: string };
      const naam = d.notarisNaam ?? d.notarisKantoor ?? "";
      return naam
        ? t("samenvatting.notaris", { naam })
        : t("samenvatting.vastgelegd");
    },
  },

  documenten: {
    endpoint: "documenten",
    href: "/documenten",
    hasData: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    isCompleted: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    getSamenvatting: (data, t) => {
      const count = Array.isArray(data) ? (data as unknown[]).length : 0;
      return t("samenvatting.documenten", { aantal: count });
    },
  },

  naasten: {
    endpoint: "noodcontacten",
    href: "/noodcontacten",
    hasData: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    isCompleted: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    getSamenvatting: (data, t) => {
      const count = Array.isArray(data) ? (data as unknown[]).length : 0;
      return t("samenvatting.naasten", { aantal: count });
    },
  },
};
