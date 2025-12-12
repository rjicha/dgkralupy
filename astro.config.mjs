import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // Site URL will be set by Netlify automatically, or use env var
  site: process.env.SITE_URL || process.env.URL || 'http://localhost:4321',
  // No base path needed for Netlify (hosts at root domain)
  integrations: [
    tailwind({
      applyBaseStyles: false, // We'll use custom base styles
    }),
  ],
  build: {
    assets: '_assets',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
