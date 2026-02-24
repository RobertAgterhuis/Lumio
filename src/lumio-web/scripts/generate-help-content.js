/**
 * Generates src/content/help-content.ts from public/help/{locale}/*.md files.
 * Run: node scripts/generate-help-content.js
 */
const fs = require("fs");
const path = require("path");

const helpDir = path.join(__dirname, "..", "public", "help");
const outFile = path.join(__dirname, "..", "src", "content", "help-content.ts");

const locales = ["nl", "en"];
const content = {};

for (const locale of locales) {
  const dir = path.join(helpDir, locale);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort();

  content[locale] = {};
  for (const file of files) {
    content[locale][file] = fs.readFileSync(path.join(dir, file), "utf-8");
  }
}

// Build TypeScript source
let ts = `/**
 * Auto-generated help content embedded at build time.
 * Source: public/help/{locale}/*.md
 *
 * Regenerate: node scripts/generate-help-content.js
 */

export type HelpLocale = "nl" | "en";

const helpContent: Record<HelpLocale, Record<string, string>> = {
`;

for (const locale of locales) {
  ts += `  ${locale}: {\n`;
  for (const [file, md] of Object.entries(content[locale])) {
    // Escape for template literal: backticks, backslashes, ${
    const escaped = md
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\$\{/g, "\\${");
    ts += `    "${file}": \`${escaped}\`,\n`;
  }
  ts += `  },\n`;
}

ts += `};

/**
 * Get embedded help markdown content for a chapter file and locale.
 * Returns undefined if not found.
 */
export function getHelpContent(
  filename: string,
  locale: string,
): string | undefined {
  const loc = (locale === "en" ? "en" : "nl") as HelpLocale;
  return helpContent[loc]?.[filename];
}
`;

fs.writeFileSync(outFile, ts, "utf-8");
console.log(`Generated ${path.relative(process.cwd(), outFile)}`);
console.log(
  `  ${locales.length} locales, ${Object.keys(content.nl).length} files each`,
);
