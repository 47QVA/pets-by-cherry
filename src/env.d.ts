/// <reference path="../.astro/types.d.ts" />
/// <reference path="../worker-configuration.d.ts" />

// ADMIN_PASSWORD / ADMIN_SESSION_SECRET live in .dev.vars locally and as
// `wrangler secret put` values in production, so `wrangler types` doesn't
// know about them from wrangler.jsonc alone. Merged onto the generated Env.
interface Env {
  ADMIN_PASSWORD: string;
  ADMIN_SESSION_SECRET: string;
}

declare namespace App {
  interface Locals extends import('@astrojs/cloudflare').Runtime {}
}
