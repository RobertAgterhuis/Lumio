import { fixupConfigRules } from "@eslint/compat";
import nextConfig from "eslint-config-next";
import noRawColors from "./eslint-rules/no-raw-colors.mjs";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...fixupConfigRules(nextConfig),
  // TODO(SP-5): Fix react-hooks/set-state-in-effect, react-hooks/refs,
  // react-hooks/immutability violations introduced by eslint-config-next@16.
  // These are new strict rules that break on existing code patterns.
  // Downgraded to warn to keep CI green until a dedicated cleanup sprint.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  {
    // Design system guardrail: no raw Tailwind colors in app/component files
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    ignores: ["**/*.stories.tsx"],
    plugins: {
      "design-system": {
        rules: {
          "no-raw-colors": noRawColors,
        },
      },
    },
    rules: {
      "design-system/no-raw-colors": "error",
    },
  },
];

export default eslintConfig;
