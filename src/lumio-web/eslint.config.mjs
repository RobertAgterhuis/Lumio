import nextConfig from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
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
