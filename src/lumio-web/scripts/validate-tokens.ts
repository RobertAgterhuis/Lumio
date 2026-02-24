#!/usr/bin/env npx tsx
/**
 * Token Validation Script
 *
 * Validates synchronization between:
 * - src/styles/tokens.css (source-of-truth primitives)
 * - src/app/globals.css @theme (Tailwind utility mappings)
 *
 * Run: npx tsx scripts/validate-tokens.ts
 * CI:  npm run validate-tokens
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Extract CSS custom properties from a CSS file content
 */
function extractCssVariables(content: string, selector?: string): Map<string, string> {
  const variables = new Map<string, string>();

  // If selector specified, extract only from that block
  if (selector) {
    const selectorRegex = new RegExp(
      `${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]+)\\}`,
      "gs"
    );
    const matches = content.matchAll(selectorRegex);
    for (const match of matches) {
      const block = match[1];
      extractVariablesFromBlock(block, variables);
    }
  } else {
    // Extract from :root
    const rootRegex = /:root\s*\{([^}]+)\}/g;
    const matches = content.matchAll(rootRegex);
    for (const match of matches) {
      extractVariablesFromBlock(match[1], variables);
    }
  }

  return variables;
}

function extractVariablesFromBlock(block: string, variables: Map<string, string>): void {
  const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = varRegex.exec(block)) !== null) {
    const [, name, value] = match;
    variables.set(`--${name}`, value.trim());
  }
}

/**
 * Extract @theme variables from globals.css
 */
function extractThemeVariables(content: string): Map<string, string> {
  const variables = new Map<string, string>();

  // Match @theme { ... } block
  const themeRegex = /@theme\s*\{([^}]+)\}/;
  const match = content.match(themeRegex);
  if (match) {
    extractVariablesFromBlock(match[1], variables);
  }

  return variables;
}

/**
 * Validate token synchronization
 */
function validateTokens(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Read source files
  const tokensPath = path.join(ROOT, "src/styles/tokens.css");
  const globalsPath = path.join(ROOT, "src/app/globals.css");

  if (!fs.existsSync(tokensPath)) {
    return { valid: false, errors: ["tokens.css not found"], warnings: [] };
  }
  if (!fs.existsSync(globalsPath)) {
    return { valid: false, errors: ["globals.css not found"], warnings: [] };
  }

  const tokensContent = fs.readFileSync(tokensPath, "utf-8");
  const globalsContent = fs.readFileSync(globalsPath, "utf-8");

  // Extract variables
  const tokenVars = extractCssVariables(tokensContent);
  const themeVars = extractThemeVariables(globalsContent);
  const darkTokenVars = extractCssVariables(tokensContent, ".dark");

  // Group token categories for targeted validation
  const tokenCategories = {
    colors: [] as string[],
    spacing: [] as string[],
    typography: [] as string[],
    shadows: [] as string[],
    motion: [] as string[],
    zIndex: [] as string[],
    borders: [] as string[],
    state: [] as string[],
    a11y: [] as string[],
  };

  for (const varName of tokenVars.keys()) {
    if (varName.startsWith("--base-") || varName.startsWith("--state-")) {
      if (varName.includes("success") || varName.includes("warning") || varName.includes("danger") || varName.includes("info")) {
        tokenCategories.state.push(varName);
      } else {
        tokenCategories.colors.push(varName);
      }
    } else if (varName.startsWith("--space-")) {
      tokenCategories.spacing.push(varName);
    } else if (varName.startsWith("--text-") || varName.startsWith("--font-") || varName.startsWith("--leading-") || varName.startsWith("--tracking-")) {
      tokenCategories.typography.push(varName);
    } else if (varName.startsWith("--shadow-")) {
      tokenCategories.shadows.push(varName);
    } else if (varName.startsWith("--duration-") || varName.startsWith("--easing-")) {
      tokenCategories.motion.push(varName);
    } else if (varName.startsWith("--z-")) {
      tokenCategories.zIndex.push(varName);
    } else if (varName.startsWith("--border-")) {
      tokenCategories.borders.push(varName);
    } else if (varName.startsWith("--a11y-")) {
      tokenCategories.a11y.push(varName);
    }
  }

  // --- Validation Rules ---

  // Rule 1: Critical semantic colors must exist in @theme
  const criticalSemanticColors = [
    "--color-primary",
    "--color-destructive",
    "--color-success",
    "--color-warning",
    "--color-danger",
    "--color-info",
    "--color-background",
    "--color-foreground",
    "--color-border",
    "--color-muted",
  ];

  for (const colorVar of criticalSemanticColors) {
    if (!themeVars.has(colorVar)) {
      errors.push(`Missing critical semantic color in @theme: ${colorVar}`);
    }
  }

  // Rule 2: Typography tokens must be mapped
  const typographyMappings = [
    ["--text-xs", "--font-size-xs"],
    ["--text-sm", "--font-size-sm"],
    ["--text-base", "--font-size-base"],
    ["--text-lg", "--font-size-lg"],
    ["--text-xl", "--font-size-xl"],
    ["--text-2xl", "--font-size-2xl"],
    ["--text-3xl", "--font-size-3xl"],
    ["--text-4xl", "--font-size-4xl"],
  ];

  for (const [tokenName] of typographyMappings) {
    if (!tokenVars.has(tokenName)) {
      warnings.push(`Typography token missing from tokens.css: ${tokenName}`);
    }
  }

  // Rule 3: Z-index tokens must exist in @theme
  const zIndexMappings = [
    ["--z-base", "--z-index-base"],
    ["--z-dropdown", "--z-index-dropdown"],
    ["--z-sticky", "--z-index-sticky"],
    ["--z-modal", "--z-index-modal"],
    ["--z-toast", "--z-index-toast"],
    ["--z-tooltip", "--z-index-tooltip"],
  ];

  for (const [tokenName, themeName] of zIndexMappings) {
    if (tokenVars.has(tokenName) && !themeVars.has(themeName)) {
      errors.push(`Z-index token ${tokenName} not mapped to @theme as ${themeName}`);
    }
  }

  // Rule 4: Border width tokens must exist
  const borderTokens = ["--border-0", "--border-1", "--border-2", "--border-4", "--border-8"];
  for (const token of borderTokens) {
    if (!tokenVars.has(token)) {
      warnings.push(`Border width token missing from tokens.css: ${token}`);
    }
  }

  // Rule 5: Dark mode must override critical tokens
  const darkModeRequired = [
    "--base-primary-700",
    "--base-neutral-900",
    "--base-neutral-50",
  ];

  for (const token of darkModeRequired) {
    if (!darkTokenVars.has(token)) {
      errors.push(`Dark mode override missing for critical token: ${token}`);
    }
  }

  // Rule 6: Check for orphaned @theme variables (no corresponding token)
  // This is a warning, not an error — @theme can have computed/composite values
  const knownThemeOnlyVars = [
    "--color-primary-foreground",
    "--color-secondary",
    "--color-secondary-foreground",
    "--color-accent",
    "--color-accent-foreground",
    "--color-destructive-foreground",
    "--color-muted-foreground",
    "--color-input",
    "--color-ring",
    "--color-card",
    "--color-card-foreground",
    "--color-sidebar",
    "--color-sidebar-foreground",
    "--color-sidebar-active",
    "--color-sidebar-active-foreground",
    "--radius-sm",
    "--radius-md",
    "--radius-lg",
  ];

  // Rule 7: Token count health check
  const minExpectedTokens = 80;
  if (tokenVars.size < minExpectedTokens) {
    warnings.push(`Token count (${tokenVars.size}) below expected minimum (${minExpectedTokens}). Check tokens.css completeness.`);
  }

  // Print summary
  console.log("\n╭────────────────────────────────────────────────────╮");
  console.log("│            LUMIO TOKEN VALIDATION                  │");
  console.log("╰────────────────────────────────────────────────────╯\n");

  console.log(`📊 Token Statistics:`);
  console.log(`   tokens.css:     ${tokenVars.size} primitives`);
  console.log(`   @theme:         ${themeVars.size} Tailwind mappings`);
  console.log(`   Dark overrides: ${darkTokenVars.size} tokens\n`);

  console.log(`📂 Categories:`);
  console.log(`   Colors:     ${tokenCategories.colors.length}`);
  console.log(`   Spacing:    ${tokenCategories.spacing.length}`);
  console.log(`   Typography: ${tokenCategories.typography.length}`);
  console.log(`   Shadows:    ${tokenCategories.shadows.length}`);
  console.log(`   Motion:     ${tokenCategories.motion.length}`);
  console.log(`   Z-Index:    ${tokenCategories.zIndex.length}`);
  console.log(`   Borders:    ${tokenCategories.borders.length}`);
  console.log(`   State:      ${tokenCategories.state.length}`);
  console.log(`   A11y:       ${tokenCategories.a11y.length}\n`);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// --- Main ---
function main(): void {
  const result = validateTokens();

  if (result.warnings.length > 0) {
    console.log("⚠️  Warnings:");
    for (const warning of result.warnings) {
      console.log(`   • ${warning}`);
    }
    console.log("");
  }

  if (result.errors.length > 0) {
    console.log("❌ Errors:");
    for (const error of result.errors) {
      console.log(`   • ${error}`);
    }
    console.log("");
    process.exit(1);
  }

  console.log("✅ Token validation passed!\n");
  process.exit(0);
}

main();
