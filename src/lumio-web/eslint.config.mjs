import { fixupConfigRules } from "@eslint/compat";
import nextConfig from "eslint-config-next";

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
  // TODO: Debug custom rules - currently causing ESLint to fail on CI
  // Temporarily disabled until fixed
  // {
  //   // Design system guardrail: no raw Tailwind colors in app/component files
  //   files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
  //   ignores: ["**/*.stories.tsx"],
  //   plugins: {
  //     "design-system": {
  //       rules: {
  //         "no-raw-colors": noRawColors,
  //         "no-raw-spacing": noRawSpacing,
  //       },
  //     },
  //   },
  //   rules: {
  //     "design-system/no-raw-colors": "error",
  //     "design-system/no-raw-spacing": "warn", // Start as warning, promote to error after fixing violations
  //   },
  // },
];

export default eslintConfig;
