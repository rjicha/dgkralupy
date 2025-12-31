import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    reporters: process.env.GITHUB_ACTIONS
      ? ['default', 'github-actions', 'junit']
      : ['default'],
    outputFile: process.env.GITHUB_ACTIONS
      ? { junit: 'test-results.xml' }
      : undefined,
    include: [
      'src/**/*.test.ts',
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      include: [
        'src/**/*.ts',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/env.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      'astro:assets': new URL('./tests/mocks/astro-assets.ts', import.meta.url)
        .pathname,
    },
  },
});
