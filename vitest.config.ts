import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['dist', 'tests/helpers.ts'],
    },
    include: ['tests/**/*.test.ts'],
  },
}); 