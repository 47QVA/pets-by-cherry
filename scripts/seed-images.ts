// One-time seed script: pulls real photos from the Pexels API (free tier, no
// scraping) and stores them under public/images/ so the storefront serves real
// assets instead of placehold.co placeholders. Run with:
//   node --env-file=.dev.vars scripts/seed-images.ts
//
// This is an interim stand-in for CLAUDE.md §7's "download and re-upload into
// R2" step: R2 needs a Cloudflare account (`wrangler login`), which isn't
// available yet. Swapping public/images/* for real R2 URLs later is a one-line
// change per row (photo_url is a plain TEXT column) — no schema or code change.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_API_KEY) {
  console.error('Missing PEXELS_API_KEY. Run with: node --env-file=.dev.vars scripts/seed-images.ts');
  process.exit(1);
}

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images');

interface ImageTarget {
  /** SQL table + row this image belongs to, used to build the UPDATE statement. */
  table: 'categories' | 'pets';
  slugOrName: string; // categories: slug; pets: name
  query: string;
  filename: string;
}

const CATEGORY_TARGETS: ImageTarget[] = [
  { table: 'categories', slugOrName: 'dogs', query: 'happy dog portrait', filename: 'categories/dogs.jpg' },
  { table: 'categories', slugOrName: 'cats', query: 'cat portrait', filename: 'categories/cats.jpg' },
  { table: 'categories', slugOrName: 'birds', query: 'parrot portrait', filename: 'categories/birds.jpg' }
];

const PET_TARGETS: ImageTarget[] = [
  { table: 'pets', slugOrName: 'Luna', query: 'golden retriever dog portrait', filename: 'pets/luna.jpg' },
  { table: 'pets', slugOrName: 'Max', query: 'beagle dog portrait', filename: 'pets/max.jpg' },
  { table: 'pets', slugOrName: 'Coco', query: 'persian cat portrait', filename: 'pets/coco.jpg' },
  { table: 'pets', slugOrName: 'Simba', query: 'siamese cat portrait', filename: 'pets/simba.jpg' },
  { table: 'pets', slugOrName: 'Kiki', query: 'african grey parrot portrait', filename: 'pets/kiki.jpg' },
  { table: 'pets', slugOrName: 'Sunny', query: 'cockatiel bird portrait', filename: 'pets/sunny.jpg' }
];

interface PexelsPhoto {
  src: { large: string };
}

async function fetchTopPhotoUrl(query: string): Promise<string> {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=portrait`,
    { headers: { Authorization: PEXELS_API_KEY! } }
  );

  if (!response.ok) {
    throw new Error(`Pexels search failed for "${query}": ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { photos: PexelsPhoto[] };
  if (data.photos.length === 0) {
    throw new Error(`No Pexels results for "${query}"`);
  }

  return data.photos[0].src.large;
}

async function downloadTo(url: string, destPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed for ${url}: ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  await mkdir(path.dirname(destPath), { recursive: true });
  await writeFile(destPath, bytes);
}

async function main() {
  const targets = [...CATEGORY_TARGETS, ...PET_TARGETS];
  const sqlStatements: string[] = [];

  for (const target of targets) {
    console.log(`Fetching "${target.query}" for ${target.table}/${target.slugOrName}...`);
    const photoUrl = await fetchTopPhotoUrl(target.query);
    const destPath = path.join(OUTPUT_DIR, target.filename);
    await downloadTo(photoUrl, destPath);

    const publicPath = `/images/${target.filename}`;
    const column = target.table === 'categories' ? 'slug' : 'name';
    sqlStatements.push(
      `UPDATE ${target.table} SET ${target.table === 'categories' ? 'icon_url' : 'photo_url'} = '${publicPath}' WHERE ${column} = '${target.slugOrName}';`
    );

    console.log(`  saved ${publicPath}`);
  }

  const sqlPath = path.join(process.cwd(), 'scripts', 'update-photos.sql');
  await writeFile(sqlPath, sqlStatements.join('\n') + '\n');
  console.log(`\nWrote ${sqlPath}. Apply it with: npm run db:update-photos`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
