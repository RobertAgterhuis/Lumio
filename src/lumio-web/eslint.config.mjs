import nextConfig from "eslint-config-next";
import noRawColors from "./eslint-rules/no-raw-colors.mjs";
import noRawSpacing from "./eslint-rules/no-raw-spacing.mjs";

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
          "no-raw-spacing": noRawSpacing,
        },
      },
    },
    rules: {
      "design-system/no-raw-colors": "error",
      "design-system/no-raw-spacing": "warn", // Start as warning, promote to error after fixing violations
    },
  },
];

export default eslintConfig;
