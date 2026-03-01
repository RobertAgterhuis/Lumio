import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      '@': path.join(dirname, 'src'),
    },
  },
  test: {
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Enforce minimum coverage thresholds (logic layer: lib + stores only)
      thresholds: {
        statements: 60,
        branches: 58,
        functions: 55,
        lines: 60,
      },
      // Scope coverage to pure-logic layers — UI components excluded
      include: ['src/lib/**/*.{ts,tsx}', 'src/stores/**/*.{ts,tsx}'],
      // Exclude test files, stories, type definitions AND non-logic files
      // (static data, storybook tooling, thin reactive stores without testable logic)
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/**/types/**',
        // Static data / example files — no logic, no branches to cover
        'src/lib/animeer-instructies.ts',
        'src/lib/voorbeeld-data.ts',
        // Storybook test utilities (not part of production logic)
        'src/lib/test-utils/**',
        // Thin reactive stores tested via integration / Storybook — no unit path
        'src/stores/toastStore.ts',
      ],
    },
    projects: [
      // ── Unit tests (Node, fast) ──────────────────────────────────
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          environment: 'node',
        },
      },
      // ── Storybook browser tests ──────────────────────────────────
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
