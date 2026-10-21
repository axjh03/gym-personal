import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const root = new URL('../', import.meta.url).pathname;
const dataDir = join(root, 'src/data');
const publicDir = join(root, 'public');
const catalogUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const imageBase = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const fields = ['id', 'name', 'force', 'level', 'mechanic', 'equipment', 'primaryMuscles', 'secondaryMuscles', 'instructions', 'category', 'images'];

// These .ts files intentionally contain plain JS so this Node script can read the same data as the app.
async function source(name) {
  const code = await readFile(join(dataDir, name), 'utf8');
  return import(`data:text/javascript,${encodeURIComponent(code)}`);
}

const [{ planIds, planOptionIds }, { beginnerIds }, { cardio, stretches }, { coach }] = await Promise.all([
  source('plan.ts'), source('beginner.ts'), source('routines.ts'), source('coach.ts')
]);
const requiredIds = [...new Set([...planIds, ...planOptionIds, ...beginnerIds, ...cardio.map(x => x.id), ...stretches.flatMap(x => x.items.map(([id]) => id))])];
const exists = path => access(path).then(() => true, () => false);

if (process.argv.includes('--check')) {
  const catalog = JSON.parse(await readFile(join(dataDir, 'exercises.json'), 'utf8'));
  const media = JSON.parse(await readFile(join(dataDir, 'media.json'), 'utf8'));
  const byId = new Map(catalog.map(x => [x.id, x]));
  for (const id of requiredIds) {
    if (!byId.has(id)) throw new Error(`Missing catalog ID: ${id}`);
    if (!media[id]) throw new Error(`Missing media manifest ID: ${id}`);
    for (const frame of [0, 1]) {
      if (!await exists(join(publicDir, 'exercises', id, `${frame}.jpg`))) throw new Error(`Missing local image: ${id}/${frame}.jpg`);
    }
  }
  for (const id of planIds) if (!coach[id]) throw new Error(`Missing coach cues: ${id}`);
  console.log(`Validated ${catalog.length} records and ${requiredIds.length} locally illustrated exercises.`);
  process.exit(0);
}

const response = await fetch(catalogUrl);
if (!response.ok) throw new Error(`Catalog download failed: ${response.status} ${catalogUrl}`);
const full = await response.json();
const catalog = full.map(x => Object.fromEntries(fields.map(field => [field, x[field] ?? null])));
const byId = new Map(catalog.map(x => [x.id, x]));
for (const id of requiredIds) {
  const exercise = byId.get(id);
  if (!exercise) throw new Error(`Listed ID missing from Free Exercise DB: ${id}`);
  if (!exercise.images?.[0] || !exercise.images?.[1]) throw new Error(`Two images required for ${id}`);
}
for (const id of planIds) if (!coach[id]) throw new Error(`Missing coach cues: ${id}`);

let sharp;
try { sharp = createRequire(import.meta.url)('sharp'); } catch { /* optional */ }
const jobs = requiredIds.flatMap(id => [0, 1].map(frame => ({ id, frame, source: byId.get(id).images[frame] })));
let cursor = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (cursor < jobs.length) {
    const { id, frame, source } = jobs[cursor++];
    const dir = join(publicDir, 'exercises', id);
    const file = join(dir, `${frame}.jpg`);
    if (await exists(file)) continue;
    const imageResponse = await fetch(imageBase + source);
    if (!imageResponse.ok) throw new Error(`Image download failed: ${id}/${frame}: ${imageResponse.status}`);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    await mkdir(dir, { recursive: true });
    await writeFile(file, sharp ? await sharp(buffer).resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer() : buffer);
  }
}));

const custom = await readdir(join(publicDir, 'media')).catch(() => []);
const media = {};
for (const exercise of catalog) {
  const gif = custom.find(file => file === `${exercise.id}.gif` || file === `${exercise.id}.webp`);
  const frames = requiredIds.includes(exercise.id)
    ? [`/exercises/${exercise.id}/0.jpg`, `/exercises/${exercise.id}/1.jpg`]
    : exercise.images?.slice(0, 2).map(path => `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${path}`) || [];
  media[exercise.id] = { ...(gif ? { animated: `/media/${gif}` } : {}), frames };
}
await writeFile(join(dataDir, 'exercises.json'), JSON.stringify(catalog));
await writeFile(join(dataDir, 'media.json'), JSON.stringify(media));
await writeFile(join(publicDir, 'precache.json'), JSON.stringify(requiredIds.flatMap(id => [0, 1].map(frame => `/exercises/${id}/${frame}.jpg`))));
console.log(`Saved ${catalog.length} records and ${jobs.length} local photos${sharp ? ' (resized)' : ''}.`);
