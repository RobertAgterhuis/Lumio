/**
 * tijdlijn-data.ts
 * Config mapping tijdlijn stap keys to their associated Lumio domain.
 * Used by TijdlijnStapRow to show completion badges, summaries, and deep links.
 */

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
  huisarts: {
    endpoint: "noodcontacten",
    href: "/noodcontacten?tab=medisch",
    hasData: (data) => {
      if (!Array.isArray(data)) return false;
      return (data as { rol?: string }[]).some(
        (c) => c.rol?.toLowerCase() === "huisarts"
      );
    },
    isCompleted: (data) => {
      if (!Array.isArray(data)) return false;
      return (data as { rol?: string }[]).some(
        (c) => c.rol?.toLowerCase() === "huisarts"
      );
    },
    getSamenvatting: (data, t) => {
      if (!Array.isArray(data)) return t("legeStaat.huisarts");
      const arts = (data as { rol?: string; naam?: string; telefoon?: string }[]).find(
        (c) => c.rol?.toLowerCase() === "huisarts"
      );
      if (!arts) return t("legeStaat.huisarts");
      return t("samenvatting.huisarts", {
        naam: arts.naam ?? "",
        telefoon: arts.telefoon ?? "",
      });
    },
  },

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
      if (!data || typeof data !== "object") return t("samenvatting.vastgelegd");
      const d = data as {
        voorkeurType?: string;
        uitvaartOndernemer?: string;
        uitvaartOndernemerTelefoon?: string;
        heeftUitvaartVerzekering?: boolean;
      };
      if (d.uitvaartOndernemer) {
        return t("samenvatting.uitvaartMetOndernemer", {
          naam: d.uitvaartOndernemer,
          telefoon: d.uitvaartOndernemerTelefoon ?? "",
        });
      }
      if (d.heeftUitvaartVerzekering && d.voorkeurType) {
        return t("samenvatting.uitvaartMetVerzekering", { type: d.voorkeurType });
      }
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
  werkgever: {
    endpoint: "werkgever",
    href: "/eigenaar?sectie=werkgever",
    hasData: (data) => {
      if (!Array.isArray(data) || data.length === 0) return false;
      return !!(data as { bedrijfsNaam?: string }[])[0]?.bedrijfsNaam;
    },
    isCompleted: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    getSamenvatting: (data, t) => {
      if (!Array.isArray(data) || data.length === 0) return t("legeStaat.werkgever");
      const w = data[0] as {
        bedrijfsNaam?: string;
        isZzp?: boolean;
        hrContactNaam?: string;
        pensioenfondNaam?: string;
      };
      if (!w.bedrijfsNaam) return t("legeStaat.werkgever");
      if (w.isZzp) return t("samenvatting.werkgeverZzp", { naam: w.bedrijfsNaam });
      const hr = w.hrContactNaam ? ` — HR: ${w.hrContactNaam}` : "";
      const pensioen = w.pensioenfondNaam ? ` — Pensioen: ${w.pensioenfondNaam}` : "";
      return t("samenvatting.werkgever", { naam: w.bedrijfsNaam, hr, pensioen });
    },
  },

  pensioenen: {
    endpoint: "werkgever",
    href: "/eigenaar?sectie=werkgever",
    hasData: (data) => {
      if (!Array.isArray(data) || data.length === 0) return false;
      return !!(data as { pensioenfondNaam?: string }[])[0]?.pensioenfondNaam;
    },
    isCompleted: (_data) => false,
    getSamenvatting: (data, t) => {
      if (!Array.isArray(data) || data.length === 0) return t("legeStaat.pensioenen");
      const w = data[0] as { pensioenfondNaam?: string; pensioenfondTelefoon?: string };
      if (!w.pensioenfondNaam) return t("legeStaat.pensioenen");
      const telefoon = w.pensioenfondTelefoon ? ` (${w.pensioenfondTelefoon})` : "";
      return t("samenvatting.pensioenen", { naam: w.pensioenfondNaam, telefoon });
    },
  },

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

  aangifte: {
    endpoint: "eigenaar",
    href: "/mijn-profiel",
    hasData: (data) => {
      const d = data as { woonplaats?: string };
      return !!d?.woonplaats;
    },
    isCompleted: (_data) => false,
    getSamenvatting: (data, t) => {
      const d = data as { woonplaats?: string };
      if (!d?.woonplaats) return t("legeStaat.aangifte");
      return t("samenvatting.aangifte", { gemeente: d.woonplaats });
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
    href: "/noodcontacten?tab=persoonlijk",
    hasData: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    isCompleted: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    getSamenvatting: (data, t) => {
      const count = Array.isArray(data) ? (data as unknown[]).length : 0;
      return t("samenvatting.naasten", { aantal: count });
    },
  },

  /** Eerste maand */
  verzekeringen: {
    endpoint: "boedel/verzekeringen",
    href: "/boedel?tab=verzekeringen",
    hasData: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    isCompleted: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    getSamenvatting: (data, t) => {
      if (!Array.isArray(data)) return t("legeStaat.verzekeringen");
      const items = data as { type?: string; verzekeraar?: string }[];
      const count = items.length;
      const types = [
        ...new Set(items.map((v) => v.type).filter(Boolean)),
      ].join(", ");
      return t("samenvatting.verzekeringen", { aantal: count, types });
    },
  },

  bank: {
    endpoint: "boedel/bankrekeningen",
    href: "/boedel?tab=rekeningen",
    hasData: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    isCompleted: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    getSamenvatting: (data, t) => {
      if (!Array.isArray(data)) return t("legeStaat.bank");
      const items = data as { bankNaam?: string }[];
      const count = items.length;
      const namen = [
        ...new Set(items.map((b) => b.bankNaam).filter(Boolean)),
      ].join(", ");
      return t("samenvatting.bank", { aantal: count, namen });
    },
  },

  woning: {
    endpoint: "boedel/bezittingen",
    href: "/boedel?tab=bezittingen",
    hasData: (data) => {
      if (!Array.isArray(data)) return false;
      const woningCategorieen = ["woning", "onroerend goed", "huis", "appartement", "woonhuis"];
      return (data as { categorie?: string }[]).some(
        (b) => woningCategorieen.some((k) => b.categorie?.toLowerCase().includes(k))
      );
    },
    isCompleted: (data) => {
      if (!Array.isArray(data)) return false;
      const woningCategorieen = ["woning", "onroerend goed", "huis", "appartement", "woonhuis"];
      return (data as { categorie?: string }[]).some(
        (b) => woningCategorieen.some((k) => b.categorie?.toLowerCase().includes(k))
      );
    },
    getSamenvatting: (data, t) => {
      if (!Array.isArray(data)) return t("legeStaat.woning");
      const woningCategorieen = ["woning", "onroerend goed", "huis", "appartement", "woonhuis"];
      const woningen = (data as { categorie?: string; omschrijving?: string }[]).filter(
        (b) => woningCategorieen.some((k) => b.categorie?.toLowerCase().includes(k))
      );
      if (woningen.length === 0) return t("legeStaat.woning");
      const namen = woningen
        .slice(0, 2)
        .map((w) => w.omschrijving)
        .filter(Boolean)
        .join(", ");
      const extra = woningen.length > 2 ? ` +${woningen.length - 2}` : "";
      return t("samenvatting.woning", { aantal: woningen.length, namen: namen + extra });
    },
  },

  digitaal: {
    endpoint: "digitaal-bezit",
    href: "/digitaal-bezit",
    hasData: (data) => {
      if (!data || typeof data !== "object") return false;
      const d = data as { accounts?: unknown[]; abonnementen?: unknown[] };
      return (d.accounts?.length ?? 0) > 0 || (d.abonnementen?.length ?? 0) > 0;
    },
    isCompleted: (data) => {
      if (!data || typeof data !== "object") return false;
      const d = data as { accounts?: unknown[] };
      return (d.accounts?.length ?? 0) > 0;
    },
    getSamenvatting: (data, t) => {
      if (!data || typeof data !== "object") return t("legeStaat.digitaal");
      const d = data as {
        accounts?: { gewensteActie?: string }[];
        wallets?: unknown[];
      };
      const teVerwijderen = (d.accounts ?? []).filter(
        (a) => a.gewensteActie?.toLowerCase() === "verwijderen"
      ).length;
      const overTeDragen = (d.accounts ?? []).filter(
        (a) => a.gewensteActie?.toLowerCase() === "overdragen"
      ).length;
      const wallets = d.wallets?.length ?? 0;
      return t("samenvatting.digitaalRich", { teVerwijderen, overTeDragen, wallets });
    },
  },

  /** Drie maanden */
  aanvaarding: {
    endpoint: "erfgenamen",
    href: "/erfgenamen",
    hasData: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    isCompleted: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    getSamenvatting: (data, t) => {
      if (!Array.isArray(data)) return t("legeStaat.erfgenamen");
      const items = data as { voornaam?: string; achternaam?: string }[];
      const namen = items
        .slice(0, 3)
        .map((e) => [e.voornaam, e.achternaam].filter(Boolean).join(" "))
        .join(", ");
      const extra = items.length > 3 ? ` +${items.length - 3}` : "";
      return t("samenvatting.aanvaarding", { namen: namen + extra, aantal: items.length });
    },
  },

  boedelverdeling: {
    endpoint: "boedel/samenvatting",
    href: "/boedel?tab=bezittingen",
    hasData: (data) => {
      if (!data || typeof data !== "object") return false;
      const d = data as { aantalBezittingen?: number; aantalRekeningen?: number };
      return (d.aantalBezittingen ?? 0) > 0 || (d.aantalRekeningen ?? 0) > 0;
    },
    isCompleted: (data) => {
      if (!data || typeof data !== "object") return false;
      const d = data as { aantalBezittingen?: number };
      return (d.aantalBezittingen ?? 0) > 0;
    },
    getSamenvatting: (data, t) => {
      if (!data || typeof data !== "object") return t("legeStaat.boedel");
      const d = data as { nettoNalatenschap?: number };
      if (d.nettoNalatenschap != null) {
        const bedrag = d.nettoNalatenschap.toLocaleString("nl-NL", {
          style: "currency",
          currency: "EUR",
        });
        return t("samenvatting.boedelNetto", { bedrag });
      }
      return t("legeStaat.boedel");
    },
  },

  /** Social media — drie maanden */
  socialMedia: {
    endpoint: "digitaal-bezit/accounts",
    href: "/digitaal-bezit",
    hasData: (data) => {
      if (!Array.isArray(data)) return false;
      const items = data as { categorie?: string; platformNaam?: string }[];
      const socialPlatforms = [
        "facebook", "instagram", "linkedin", "x", "twitter",
        "tiktok", "snapchat", "youtube",
      ];
      return items.some(
        (a) =>
          a.categorie?.toLowerCase() === "social media" ||
          socialPlatforms.some((p) => a.platformNaam?.toLowerCase().includes(p))
      );
    },
    isCompleted: (data) => Array.isArray(data) && (data as unknown[]).length > 0,
    getSamenvatting: (data, t) => {
      if (!Array.isArray(data)) return t("legeStaat.socialMedia");
      const items = data as { categorie?: string; platformNaam?: string }[];
      const socialPlatforms = [
        "facebook", "instagram", "linkedin", "x", "twitter",
        "tiktok", "snapchat", "youtube",
      ];
      const socialItems = items.filter(
        (a) =>
          a.categorie?.toLowerCase() === "social media" ||
          socialPlatforms.some((p) => a.platformNaam?.toLowerCase().includes(p))
      );
      if (socialItems.length === 0) return t("legeStaat.socialMedia");
      const namen = socialItems
        .map((a) => a.platformNaam)
        .filter(Boolean)
        .join(", ");
      return t("samenvatting.socialMedia", {
        aantal: socialItems.length,
        namen,
      });
    },
  },
};
