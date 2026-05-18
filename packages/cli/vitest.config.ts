// Cupel CLI — vitest config
// Author: Aïssa BELKOUSSA

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/commands/**'],
    },
    testTimeout: 10_000,
  },
});
