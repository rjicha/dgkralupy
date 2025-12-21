import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/env.d.ts'],
    },
  },
  resolve: {
    alias: {
      'astro:assets': new URL('./tests/mocks/astro-assets.ts', import.meta.url)
        .pathname,
    },
  },
});
