/**
 * Kennisbank: afsluitinstructies per platform.
 * Bevat links en korte uitleg voor het afsluiten/overdragen
 * van accounts bij overlijden.
 */

export interface AfsluitInstructie {
  platform: string;
  /** Zoekwoorden waarmee we op platformNaam matchen (lowercase) */
  zoekwoorden: string[];
  /** Korte beschrijving van de procedure */
  beschrijving: string;
  /** URL naar de officiële afsluitprocedure */
  url: string;
  /** Categorie voor fallback-matching */
  categorie?: string;
}

export const AFSLUIT_INSTRUCTIES: AfsluitInstructie[] = [
  // ── Social Media ──────────────────────────────────────────────
  {
    platform: "Facebook / Meta",
    zoekwoorden: ["facebook", "meta", "fb"],
    beschrijving:
      "Herdenkingsstatus aanvragen of account laten verwijderen via het speciale herdenkingsformulier van Meta. Vereist overlijdensakte.",
    url: "https://www.facebook.com/help/1506822589577997",
    categorie: "Social Media",
  },
  {
    platform: "Instagram",
    zoekwoorden: ["instagram", "insta"],
    beschrijving:
      "Herdenkingsaccount aanvragen of verwijdering via Instagram's nabestaandenformulier. Bewijs van overlijden vereist.",
    url: "https://help.instagram.com/264154560391256",
    categorie: "Social Media",
  },
  {
    platform: "X (Twitter)",
    zoekwoorden: ["twitter", "x.com", "tweet"],
    beschrijving:
      "Deactivering aanvragen door nabestaanden via het privacyformulier. Overlijdensakte en identiteitsbewijs vereist.",
    url: "https://help.twitter.com/nl/rules-and-policies/contact-twitter-about-a-deceased-family-members-account",
    categorie: "Social Media",
  },
  {
    platform: "LinkedIn",
    zoekwoorden: ["linkedin"],
    beschrijving:
      "Profiel van een overleden lid verwijderen via het nabestaandenformulier. Verificatie vereist.",
    url: "https://www.linkedin.com/help/linkedin/answer/a1339498",
    categorie: "Social Media",
  },
  {
    platform: "TikTok",
    zoekwoorden: ["tiktok"],
    beschrijving:
      "Account verwijderen door nabestaanden via contactformulier. Bewijs van overlijden nodig.",
    url: "https://support.tiktok.com/nl",
    categorie: "Social Media",
  },
  {
    platform: "Snapchat",
    zoekwoorden: ["snapchat", "snap"],
    beschrijving:
      "Nabestaanden kunnen een verwijderingsverzoek indienen via het ondersteuningsformulier.",
    url: "https://support.snapchat.com/nl-NL",
    categorie: "Social Media",
  },

  // ── Email & Cloud ─────────────────────────────────────────────
  {
    platform: "Google (Gmail, Drive, YouTube)",
    zoekwoorden: ["google", "gmail", "youtube", "drive", "android"],
    beschrijving:
      "Inactieve Account Manager instellen of account laten verwijderen door nabestaanden. Google biedt een uitgebreide procedure inclusief gegevenstoegang.",
    url: "https://support.google.com/accounts/troubleshooter/6357590",
    categorie: "Email",
  },
  {
    platform: "Microsoft (Outlook, OneDrive)",
    zoekwoorden: ["microsoft", "outlook", "hotmail", "live", "onedrive", "xbox"],
    beschrijving:
      "Nabestaanden kunnen een verzoek indienen om het account te sluiten of gegevens op te vragen via het 'Next of Kin'-proces.",
    url: "https://support.microsoft.com/nl-nl/account-billing/toegang-tot-het-account-van-een-onlangs-overleden-persoon-7e7c2fbf-4e6c-4e1c-9e6b-d8e5e9f0e1c5",
    categorie: "Email",
  },
  {
    platform: "Apple (iCloud)",
    zoekwoorden: ["apple", "icloud", "itunes", "iphone", "imac", "macbook"],
    beschrijving:
      "Digital Legacy-programma of verzoek tot accountsluiting. Apple vereist een gerechtelijk bevel of overlijdensakte.",
    url: "https://support.apple.com/nl-nl/102638",
    categorie: "Cloud",
  },
  {
    platform: "Yahoo Mail",
    zoekwoorden: ["yahoo"],
    beschrijving:
      "Account sluiten via nabestaandenverzoek. Overlijdensakte en identiteitsbewijs vereist.",
    url: "https://help.yahoo.com/kb/close-account-background-sln2044.html",
    categorie: "Email",
  },

  // ── Banking & Financieel ──────────────────────────────────────
  {
    platform: "ING",
    zoekwoorden: ["ing"],
    beschrijving:
      "Neem contact op met de bank over overlijden. ING regelt afsluiting via het kantoor of telefonisch.",
    url: "https://www.ing.nl/particulier/bij-overlijden",
    categorie: "Banking",
  },
  {
    platform: "Rabobank",
    zoekwoorden: ["rabobank", "rabo"],
    beschrijving:
      "Overlijden melden via het kantoor of telefonisch. Rabobank begeleidt het afwikkelingsproces.",
    url: "https://www.rabobank.nl/particulieren/service/overlijden",
    categorie: "Banking",
  },
  {
    platform: "ABN AMRO",
    zoekwoorden: ["abn", "amro", "abn amro"],
    beschrijving:
      "Overlijden melden en bankzaken regelen. ABN AMRO biedt een speciaal overlijdensteam.",
    url: "https://www.abnamro.nl/nl/prive/bij-een-overlijden/index.html",
    categorie: "Banking",
  },
  {
    platform: "SNS Bank",
    zoekwoorden: ["sns"],
    beschrijving:
      "Overlijden doorgeven en rekeningen laten afwikkelen via het kantoor.",
    url: "https://www.snsbank.nl/service/overlijden.html",
    categorie: "Banking",
  },
  {
    platform: "PayPal",
    zoekwoorden: ["paypal"],
    beschrijving:
      "Account sluiten na overlijden door contact met PayPal klantenservice. Overlijdensakte vereist.",
    url: "https://www.paypal.com/nl/webapps/mpp/close-account",
    categorie: "Banking",
  },

  // ── Shopping ──────────────────────────────────────────────────
  {
    platform: "Bol.com",
    zoekwoorden: ["bol.com", "bol"],
    beschrijving:
      "Neem contact op met de klantenservice om het account te laten opheffen.",
    url: "https://www.bol.com/nl/rnwy/account/",
    categorie: "Shopping",
  },
  {
    platform: "Amazon",
    zoekwoorden: ["amazon"],
    beschrijving:
      "Account sluiten via het ondersteuningsformulier. Nabestaanden moeten overlijdensakte overleggen.",
    url: "https://www.amazon.nl/gp/help/customer/display.html?nodeId=GDK92DNLSGWTV66W",
    categorie: "Shopping",
  },
  {
    platform: "Coolblue",
    zoekwoorden: ["coolblue"],
    beschrijving:
      "Neem contact op met de klantenservice voor accountverwijdering.",
    url: "https://www.coolblue.nl/klantenservice",
    categorie: "Shopping",
  },

  // ── Streaming ─────────────────────────────────────────────────
  {
    platform: "Netflix",
    zoekwoorden: ["netflix"],
    beschrijving:
      "Abonnement opzeggen en account verwijderen via de accountinstellingen of klantenservice.",
    url: "https://help.netflix.com/nl/node/407",
    categorie: "Streaming",
  },
  {
    platform: "Spotify",
    zoekwoorden: ["spotify"],
    beschrijving:
      "Account sluiten via de accountinstellingen of door contact met ondersteuning.",
    url: "https://support.spotify.com/nl/article/close-account/",
    categorie: "Streaming",
  },
  {
    platform: "Disney+",
    zoekwoorden: ["disney"],
    beschrijving:
      "Abonnement opzeggen en account verwijderen via accountbeheer.",
    url: "https://help.disneyplus.com/nl-NL",
    categorie: "Streaming",
  },

  // ── Gaming ────────────────────────────────────────────────────
  {
    platform: "Steam",
    zoekwoorden: ["steam", "valve"],
    beschrijving:
      "Account overdracht is officieel niet ondersteund. Neem contact op met Steam Support.",
    url: "https://help.steampowered.com/nl/",
    categorie: "Gaming",
  },
  {
    platform: "PlayStation (Sony)",
    zoekwoorden: ["playstation", "psn", "sony"],
    beschrijving:
      "Account sluiten via PlayStation Support. Overlijdensakte vereist.",
    url: "https://www.playstation.com/nl-nl/support/",
    categorie: "Gaming",
  },
  {
    platform: "Xbox (Microsoft)",
    zoekwoorden: ["xbox"],
    beschrijving:
      "Valt onder Microsoft Next of Kin-proces. Account sluiten via Microsoft Support.",
    url: "https://support.xbox.com/nl-NL/help/account-profile/manage-account/close-account",
    categorie: "Gaming",
  },

  // ── Overheid ──────────────────────────────────────────────────
  {
    platform: "DigiD",
    zoekwoorden: ["digid"],
    beschrijving:
      "DigiD wordt automatisch ingetrokken bij de gemeente na registratie van het overlijden.",
    url: "https://www.digid.nl/over-digid/veelgestelde-vragen",
    categorie: "Overheid",
  },
  {
    platform: "MijnOverheid",
    zoekwoorden: ["mijnoverheid", "mijn overheid"],
    beschrijving:
      "Account wordt gekoppeld aan DigiD en vervalt automatisch na overlijden.",
    url: "https://mijn.overheid.nl/",
    categorie: "Overheid",
  },

  // ── Werk ──────────────────────────────────────────────────────
  {
    platform: "Slack",
    zoekwoorden: ["slack"],
    beschrijving:
      "Workspace-beheerder kan het account deactiveren. Neem contact op met de IT-afdeling van de werkgever.",
    url: "https://slack.com/intl/nl-nl/help/articles/204475027",
    categorie: "Werk",
  },
  {
    platform: "Zoom",
    zoekwoorden: ["zoom"],
    beschrijving:
      "Account verwijderen via accountinstellingen of door de beheerder.",
    url: "https://support.zoom.com/hc/nl/article?id=zm_kb&sysparm_article=KB0060411",
    categorie: "Werk",
  },
];

/**
 * Zoek afsluitinstructie op basis van platformnaam.
 * Matcht op zoekwoorden (case-insensitive, deels).
 */
export function zoekAfsluitInstructie(
  platformNaam: string
): AfsluitInstructie | undefined {
  const naam = platformNaam.toLowerCase().trim();
  return AFSLUIT_INSTRUCTIES.find((i) =>
    i.zoekwoorden.some(
      (z) => naam.includes(z) || z.includes(naam)
    )
  );
}

/**
 * Zoek afsluitinstructies op basis van categorie (fallback).
 * Retourneert alle instructies in de gegeven categorie.
 */
export function zoekAfsluitInstructiesVoorCategorie(
  categorie: string
): AfsluitInstructie[] {
  return AFSLUIT_INSTRUCTIES.filter(
    (i) => i.categorie?.toLowerCase() === categorie.toLowerCase()
  );
}
