// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';

import preact from '@astrojs/preact';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// Local D1/R2 emulation state is redirected outside OneDrive's sync scope
// (into %LOCALAPPDATA%) to avoid file-lock errors from sync touching the
// SQLite files that wrangler rewrites continuously during dev.
const wranglerPersistPath = path.join(process.env.LOCALAPPDATA ?? '.', 'pets-by-cherry', 'wrangler-state');

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [preact()],
  adapter: cloudflare({
    persistState: { path: wranglerPersistPath }
  }),
  vite: {
    plugins: [tailwindcss()]
  }
});