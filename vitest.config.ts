import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // Changed to jsdom for browser API testing
    include: [
      'src/**/*.test.ts',
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'public/admin/**/*.test.js', // Add admin JavaScript tests
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.ts',
        'public/admin/scripts/**/*.js', // Include admin scripts
        'public/admin/widgets/**/*.js',
        'public/admin/author-widget.js',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/env.d.ts',
        'public/admin/**/*.test.js', // Exclude test files
        'public/admin/scripts/polyfills/**', // Exclude polyfills
        'public/admin/scripts/components/**', // Exclude component files (DOM-heavy)
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
