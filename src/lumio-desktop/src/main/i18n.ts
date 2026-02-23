import * as fs from "fs";
import * as path from "path";

export type Locale = "nl" | "en";

const messages = {
  nl: {
    windowTitle: "Lumio — Digitale Nalatenschap",
    errorStartTitle: "Lumio — Fout bij opstarten",
    errorStartBody:
      "Lumio kon niet worden gestart.\n\n{error}\n\nBackend: {backend}\nFrontend: {frontend}",
    noAutoBackupConfigured: "Geen auto-backup geconfigureerd.",
    backupDirNotFound: "Backupdirectory niet gevonden: {path}",
    backupApiError:
      "Backup API retourneerde status {status}. Is de database ontgrendeld?",
    backupTimeout: "Backup timeout (30s).",
    selectBackupLocation: "Selecteer backup locatie",
  },
  en: {
    windowTitle: "Lumio — Digital Estate",
    errorStartTitle: "Lumio — Startup Error",
    errorStartBody:
      "Lumio could not be started.\n\n{error}\n\nBackend: {backend}\nFrontend: {frontend}",
    noAutoBackupConfigured: "No auto-backup configured.",
    backupDirNotFound: "Backup directory not found: {path}",
    backupApiError:
      "Backup API returned status {status}. Is the database unlocked?",
    backupTimeout: "Backup timeout (30s).",
    selectBackupLocation: "Select backup location",
  },
} as const;

export type MessageKey = keyof (typeof messages)["nl"];

let currentLocale: Locale = "nl";

/**
 * Read the locale from the frontend's localStorage db.
 * The frontend stores it in localStorage as "lumio-locale".
 * We read it from the Electron data dir's locale file, which the
 * preload script keeps in sync.
 */
export function loadLocale(dataDir: string): void {
  try {
    const localeFile = path.join(dataDir, "locale.txt");
    if (fs.existsSync(localeFile)) {
      const stored = fs.readFileSync(localeFile, "utf-8").trim();
      if (stored === "nl" || stored === "en") {
        currentLocale = stored;
      }
    }
  } catch {
    // Silently fall back to 'nl'
  }
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

/**
 * Persist the locale to disk so it survives restarts.
 */
export function persistLocale(dataDir: string, locale: Locale): void {
  try {
    const localeFile = path.join(dataDir, "locale.txt");
    fs.writeFileSync(localeFile, locale, "utf-8");
  } catch {
    // Silently ignore write errors
  }
}

/**
 * Get a translated string. Supports named placeholders: {key}.
 */
export function t(
  key: MessageKey,
  params?: Record<string, string | number>
): string {
  let text: string = messages[currentLocale][key] ?? messages.nl[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
