import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '.',
    exclude: ['smoke/**', 'node_modules/**'],
  },
});
