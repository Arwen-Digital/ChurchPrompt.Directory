// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import clerk from '@clerk/astro';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    clerk({
      appearance: {},
      clerkJSUrl: 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js',
    }),
  ],
});
