// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import clerk from '@clerk/astro';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://churchprompt.directory',
  trailingSlash: 'never',
  output: 'server',
  compressHTML: true,
  server: {
    port: parseInt(process.env.PORT) || 4321,
    host: true, // ensures 0.0.0.0
  },
  adapter: node({ 
    mode: 'standalone',
  }),
  integrations: [
    react(),
    clerk({
      appearance: {},
      clerkJSUrl: 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js',
    }),
  ],
});
