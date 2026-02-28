/**
 * validate-messages.ts
 *
 * Verifies that the committed nl.json / en.json matches the output
 * of merging all domain files in messages/{locale}/.
 *
 * Strategy:
 *   1. Run merge-messages.ts (overwrites nl.json / en.json)
 *   2. Check if git reports any changes to those files
 *   3. If changed → the committed files were stale; fail with exit 1
 *
 * Usage: npx tsx scripts/validate-messages.ts
 * CI:    add as a step after `npm ci`
 */

import * as child_process from "node:child_process";
import * as path from "node:path";

const ROOT = path.resolve(__dirname, "..");

function run(cmd: string): string {
  return child_process
    .execSync(cmd, { cwd: ROOT, encoding: "utf-8" })
    .trim();
}

// Step 1: merge domain files into nl.json / en.json
console.log("[validate-messages] Running merge-messages...");
child_process.execSync("npx tsx scripts/merge-messages.ts", {
  cwd: ROOT,
  stdio: "inherit",
});

// Step 2: ask git if nl.json / en.json now differ from the index
const LOCALES = ["nl", "en"];
let hasStale = false;

for (const locale of LOCALES) {
  const relativePath = `messages/${locale}.json`;
  // `git diff --name-only` on working tree vs HEAD
  const diff = run(`git diff --name-only HEAD -- ${relativePath}`);
  if (diff.includes(relativePath)) {
    console.error(
      `[validate-messages] STALE: ${relativePath} does not match the merged output of messages/${locale}/*.json`
    );
    console.error(
      `[validate-messages] Fix: run "npm run merge-messages" and commit the updated ${locale}.json`
    );
    hasStale = true;
  } else {
    console.log(`[validate-messages] ${locale}.json — OK`);
  }
}

if (hasStale) {
  process.exit(1);
}

console.log("[validate-messages] All message files are up to date.");
