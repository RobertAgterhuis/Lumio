/**
 * merge-messages.ts
 *
 * Merges all domain-specific message files from messages/{locale}/
 * into the root messages/{locale}.json files.
 *
 * Run via: npx tsx scripts/merge-messages.ts
 * Or automatically via: npm run dev / npm run build (predev/prebuild hooks)
 */

import * as fs from "node:fs";
import * as path from "node:path";

const MESSAGES_DIR = path.resolve(__dirname, "../messages");
const LOCALES = ["nl", "en"];

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = result[key];
    if (
      sourceValue !== null &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else {
      result[key] = sourceValue;
    }
  }
  return result;
}

for (const locale of LOCALES) {
  const domainDir = path.join(MESSAGES_DIR, locale);
  const outputFile = path.join(MESSAGES_DIR, `${locale}.json`);

  if (!fs.existsSync(domainDir)) {
    console.warn(
      `[merge-messages] No domain directory found for locale "${locale}", skipping.`
    );
    continue;
  }

  const domainFiles = fs
    .readdirSync(domainDir)
    .filter((f) => f.endsWith(".json"))
    .sort(); // deterministic merge order — alphabetical

  let merged: Record<string, unknown> = {};
  const seenKeys = new Set<string>();

  for (const file of domainFiles) {
    const filePath = path.join(domainDir, file);
    const content = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    ) as Record<string, unknown>;

    // Detect top-level namespace collisions across domain files
    for (const key of Object.keys(content)) {
      if (seenKeys.has(key)) {
        console.error(
          `[merge-messages] ERROR: Duplicate top-level namespace "${key}" found in ${file} (locale: ${locale})`
        );
        process.exit(1);
      }
      seenKeys.add(key);
    }

    merged = deepMerge(merged, content);
  }

  fs.writeFileSync(
    outputFile,
    JSON.stringify(merged, null, 2) + "\n",
    "utf-8"
  );

  console.log(
    `[merge-messages] ${locale}.json written — ${domainFiles.length} domain files, ${Object.keys(merged).length} top-level namespaces`
  );
}
