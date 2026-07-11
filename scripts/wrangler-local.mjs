import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Keeps wrangler's local D1/R2/KV emulation files out of the OneDrive-synced
// project folder, since sync can lock the SQLite files wrangler rewrites
// continuously during dev.
const persistPath = path.join(process.env.LOCALAPPDATA ?? '.', 'pets-by-cherry', 'wrangler-state');

const projectRoot = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const wranglerBin = path.join(projectRoot, 'node_modules', 'wrangler', 'bin', 'wrangler.js');

// Invoke wrangler's JS entry directly with node (no shell, no npx) so the
// persist-to path is passed as a single argv entry regardless of spaces.
const result = spawnSync(process.execPath, [wranglerBin, ...process.argv.slice(2), '--persist-to', persistPath], {
  stdio: 'inherit'
});

process.exit(result.status ?? 1);
