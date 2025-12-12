import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import decapCmsOauth from 'astro-decap-cms-oauth';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '',
  integrations: [
    tailwind({
      applyBaseStyles: false, // We'll use custom base styles
    }),
    decapCmsOauth(),
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
