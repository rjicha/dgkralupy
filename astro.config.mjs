import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import decapCmsOauth from 'astro-decap-cms-oauth';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'static', // Static pages with serverless OAuth endpoints
  adapter: vercel(),
  site: process.env.SITE_URL || 'http://localhost:4321',
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
