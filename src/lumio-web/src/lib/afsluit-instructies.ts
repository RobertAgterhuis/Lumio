/**
 * Kennisbank: afsluitinstructies per platform.
 * Bevat links en korte uitleg voor het afsluiten/overdragen
 * van accounts bij overlijden.
 */

export interface AfsluitInstructie {
  platform: string;
  /** Zoekwoorden waarmee we op platformNaam matchen (lowercase) */
  zoekwoorden: string[];
  /** Vertaalsleutel voor de beschrijving van de procedure */
  beschrijvingKey: string;
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
    beschrijvingKey: "facebook",
    url: "https://www.facebook.com/help/1506822589577997",
    categorie: "Social Media",
  },
  {
    platform: "Instagram",
    zoekwoorden: ["instagram", "insta"],
    beschrijvingKey: "instagram",
    url: "https://help.instagram.com/264154560391256",
    categorie: "Social Media",
  },
  {
    platform: "X (Twitter)",
    zoekwoorden: ["twitter", "x.com", "tweet"],
    beschrijvingKey: "twitter",
    url: "https://help.twitter.com/nl/rules-and-policies/contact-twitter-about-a-deceased-family-members-account",
    categorie: "Social Media",
  },
  {
    platform: "LinkedIn",
    zoekwoorden: ["linkedin"],
    beschrijvingKey: "linkedin",
    url: "https://www.linkedin.com/help/linkedin/answer/a1339498",
    categorie: "Social Media",
  },
  {
    platform: "TikTok",
    zoekwoorden: ["tiktok"],
    beschrijvingKey: "tiktok",
    url: "https://support.tiktok.com/nl",
    categorie: "Social Media",
  },
  {
    platform: "Snapchat",
    zoekwoorden: ["snapchat", "snap"],
    beschrijvingKey: "snapchat",
    url: "https://support.snapchat.com/nl-NL",
    categorie: "Social Media",
  },

  // ── Email & Cloud ─────────────────────────────────────────────
  {
    platform: "Google (Gmail, Drive, YouTube)",
    zoekwoorden: ["google", "gmail", "youtube", "drive", "android"],
    beschrijvingKey: "google",
    url: "https://support.google.com/accounts/troubleshooter/6357590",
    categorie: "Email",
  },
  {
    platform: "Microsoft (Outlook, OneDrive)",
    zoekwoorden: ["microsoft", "outlook", "hotmail", "live", "onedrive", "xbox"],
    beschrijvingKey: "microsoft",
    url: "https://support.microsoft.com/nl-nl/account-billing/toegang-tot-het-account-van-een-onlangs-overleden-persoon-7e7c2fbf-4e6c-4e1c-9e6b-d8e5e9f0e1c5",
    categorie: "Email",
  },
  {
    platform: "Apple (iCloud)",
    zoekwoorden: ["apple", "icloud", "itunes", "iphone", "imac", "macbook"],
    beschrijvingKey: "apple",
    url: "https://support.apple.com/nl-nl/102638",
    categorie: "Cloud",
  },
  {
    platform: "Yahoo Mail",
    zoekwoorden: ["yahoo"],
    beschrijvingKey: "yahoo",
    url: "https://help.yahoo.com/kb/close-account-background-sln2044.html",
    categorie: "Email",
  },

  // ── Banking & Financieel ──────────────────────────────────────
  {
    platform: "ING",
    zoekwoorden: ["ing"],
    beschrijvingKey: "ing",
    url: "https://www.ing.nl/particulier/bij-overlijden",
    categorie: "Banking",
  },
  {
    platform: "Rabobank",
    zoekwoorden: ["rabobank", "rabo"],
    beschrijvingKey: "rabobank",
    url: "https://www.rabobank.nl/particulieren/service/overlijden",
    categorie: "Banking",
  },
  {
    platform: "ABN AMRO",
    zoekwoorden: ["abn", "amro", "abn amro"],
    beschrijvingKey: "abnAmro",
    url: "https://www.abnamro.nl/nl/prive/bij-een-overlijden/index.html",
    categorie: "Banking",
  },
  {
    platform: "SNS Bank",
    zoekwoorden: ["sns"],
    beschrijvingKey: "sns",
    url: "https://www.snsbank.nl/service/overlijden.html",
    categorie: "Banking",
  },
  {
    platform: "PayPal",
    zoekwoorden: ["paypal"],
    beschrijvingKey: "paypal",
    url: "https://www.paypal.com/nl/webapps/mpp/close-account",
    categorie: "Banking",
  },

  // ── Shopping ──────────────────────────────────────────────────
  {
    platform: "Bol.com",
    zoekwoorden: ["bol.com", "bol"],
    beschrijvingKey: "bolcom",
    url: "https://www.bol.com/nl/rnwy/account/",
    categorie: "Shopping",
  },
  {
    platform: "Amazon",
    zoekwoorden: ["amazon"],
    beschrijvingKey: "amazon",
    url: "https://www.amazon.nl/gp/help/customer/display.html?nodeId=GDK92DNLSGWTV66W",
    categorie: "Shopping",
  },
  {
    platform: "Coolblue",
    zoekwoorden: ["coolblue"],
    beschrijvingKey: "coolblue",
    url: "https://www.coolblue.nl/klantenservice",
    categorie: "Shopping",
  },

  // ── Streaming ─────────────────────────────────────────────────
  {
    platform: "Netflix",
    zoekwoorden: ["netflix"],
    beschrijvingKey: "netflix",
    url: "https://help.netflix.com/nl/node/407",
    categorie: "Streaming",
  },
  {
    platform: "Spotify",
    zoekwoorden: ["spotify"],
    beschrijvingKey: "spotify",
    url: "https://support.spotify.com/nl/article/close-account/",
    categorie: "Streaming",
  },
  {
    platform: "Disney+",
    zoekwoorden: ["disney"],
    beschrijvingKey: "disney",
    url: "https://help.disneyplus.com/nl-NL",
    categorie: "Streaming",
  },

  // ── Gaming ────────────────────────────────────────────────────
  {
    platform: "Steam",
    zoekwoorden: ["steam", "valve"],
    beschrijvingKey: "steam",
    url: "https://help.steampowered.com/nl/",
    categorie: "Gaming",
  },
  {
    platform: "PlayStation (Sony)",
    zoekwoorden: ["playstation", "psn", "sony"],
    beschrijvingKey: "playstation",
    url: "https://www.playstation.com/nl-nl/support/",
    categorie: "Gaming",
  },
  {
    platform: "Xbox (Microsoft)",
    zoekwoorden: ["xbox"],
    beschrijvingKey: "xbox",
    url: "https://support.xbox.com/nl-NL/help/account-profile/manage-account/close-account",
    categorie: "Gaming",
  },

  // ── Overheid ──────────────────────────────────────────────────
  {
    platform: "DigiD",
    zoekwoorden: ["digid"],
    beschrijvingKey: "digid",
    url: "https://www.digid.nl/over-digid/veelgestelde-vragen",
    categorie: "Overheid",
  },
  {
    platform: "MijnOverheid",
    zoekwoorden: ["mijnoverheid", "mijn overheid"],
    beschrijvingKey: "mijnOverheid",
    url: "https://mijn.overheid.nl/",
    categorie: "Overheid",
  },

  // ── Werk ──────────────────────────────────────────────────────
  {
    platform: "Slack",
    zoekwoorden: ["slack"],
    beschrijvingKey: "slack",
    url: "https://slack.com/intl/nl-nl/help/articles/204475027",
    categorie: "Werk",
  },
  {
    platform: "Zoom",
    zoekwoorden: ["zoom"],
    beschrijvingKey: "zoom",
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
