import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://dgkralupy.rjicha.online', // Staging site URL
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
