import nextConfig from "eslint-config-next";
import noRawColors from "./eslint-rules/no-raw-colors.mjs";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
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
      "design-system/no-raw-colors": "warn",
    },
  },
];

export default eslintConfig;
