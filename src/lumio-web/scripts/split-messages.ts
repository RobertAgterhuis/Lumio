/**
 * split-messages.ts  —  ONE-TIME USE
 *
 * Splits the monolithic nl.json / en.json into per-domain files in
 * messages/nl/ and messages/en/.
 *
 * Run once: npx tsx scripts/split-messages.ts
 *
 * After running, verify the output with: npx tsx scripts/merge-messages.ts
 * and confirm the merged output is identical to the original files.
 *
 * This script can be kept as documentation or deleted after migration.
 */

import * as fs from "node:fs";
import * as path from "node:path";

const MESSAGES_DIR = path.resolve(__dirname, "../messages");
const LOCALES = ["nl", "en"];

// Map: output filename (in messages/{locale}/) → top-level namespace keys to include
const DOMAIN_MAP: Record<string, string[]> = {
  shared: [
    "common",
    "nav",
    "enums",
    "feedback",
    "errors",
    "idle",
    "verwijderBevestiging",
    "sectieNotitie",
    "domainStatus",
    "search",
    "shortcuts",
    "wizard",
  ],
  auth: ["auth"],
  dashboard: ["dashboard"],
  erfgenamen: ["erfgenamen", "erfbelasting", "nabestaanden"],
  testament: ["testament", "testamentWizard"],
  boedel: ["boedel"],
  uitvaart: ["uitvaart", "uitvaartWizard", "noodkaartQR"],
  euthanasie: ["euthanasie", "euthanasieWizard"],
  noodcontacten: ["noodcontacten"],
  documenten: ["documenten"],
  "digitaal-bezit": ["digitaalBezit"],
  eigenaar: ["eigenaar"],
  donor: ["donor", "donorWizard"],
  videoboodschappen: ["videoboodschappen", "voorbeeldData"],
  instellingen: ["instellingen"],
  export: ["exporteren", "auditLog", "afsluitInstructies"],
  ui: ["personSelect", "help", "hulpteksten", "legeStaten"],
  misc: [
    "tijdlijn",
    "interview",
    "wachtwoordGenerator",
    "juridischeCheck",
    "dataHandtekening",
  ],
};

// Verify all keys in DOMAIN_MAP are unique (no namespace appears in two domain files)
const allMappedKeys: string[] = Object.values(DOMAIN_MAP).flat();
const duplicates = allMappedKeys.filter(
  (k, i) => allMappedKeys.indexOf(k) !== i
);
if (duplicates.length > 0) {
  console.error(
    `[split-messages] ERROR: Duplicate namespace keys in DOMAIN_MAP: ${duplicates.join(", ")}`
  );
  process.exit(1);
}

for (const locale of LOCALES) {
  const sourceFile = path.join(MESSAGES_DIR, `${locale}.json`);
  const domainDir = path.join(MESSAGES_DIR, locale);

  const full = JSON.parse(
    fs.readFileSync(sourceFile, "utf-8")
  ) as Record<string, unknown>;

  fs.mkdirSync(domainDir, { recursive: true });

  const allocatedKeys = new Set<string>();

  for (const [domainFile, keys] of Object.entries(DOMAIN_MAP)) {
    const chunk: Record<string, unknown> = {};
    for (const key of keys) {
      if (key in full) {
        chunk[key] = full[key];
        allocatedKeys.add(key);
      } else {
        console.warn(
          `[split-messages] WARNING: Key "${key}" not found in ${locale}.json — skipped`
        );
      }
    }
    const outPath = path.join(domainDir, `${domainFile}.json`);
    fs.writeFileSync(outPath, JSON.stringify(chunk, null, 2) + "\n", "utf-8");
    console.log(
      `[split-messages] ${locale}/${domainFile}.json — ${Object.keys(chunk).length} namespaces`
    );
  }

  // Warn about any namespaces present in the source but not allocated to a domain file
  const unallocated = Object.keys(full).filter((k) => !allocatedKeys.has(k));
  if (unallocated.length > 0) {
    console.warn(
      `[split-messages] WARNING: ${locale}.json has ${unallocated.length} unallocated namespace(s): ${unallocated.join(", ")}`
    );
    console.warn(
      `[split-messages] Add these to DOMAIN_MAP in split-messages.ts before continuing.`
    );
    process.exit(1);
  }

  console.log(
    `[split-messages] ${locale} — done. ${allocatedKeys.size}/${Object.keys(full).length} namespaces allocated.\n`
  );
}

console.log("[split-messages] Migration complete. Next step:");
console.log("  npx tsx scripts/merge-messages.ts");
console.log(
  "  Then verify nl.json and en.json are semantically identical to the originals."
);
