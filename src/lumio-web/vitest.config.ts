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
      // SP-6-007: ratcheted to measured actuals (2026-03-01): stmts 66%, branches 69%, funcs 61%, lines 66%
      // SP-7-003: raised to 70% after adding toastStore.test.ts + afsluit-instructies.test.ts (2026-03-01)
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
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
        // NOTE: toastStore.ts now has unit tests (SP-7-003) and is included in coverage.
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
