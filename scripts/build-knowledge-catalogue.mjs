import { randomUUID } from 'node:crypto';
import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildMarkdownOverridesSource } from './knowledge-markdown.mjs';

const root = new URL('../', import.meta.url);
const changed = [];
async function replaceFile(path, data) {
  const temporary = path + '.' + randomUUID() + '.tmp';
  try {
    await writeFile(temporary, data);
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}
async function generate(name, text) {
  const path = fileURLToPath(new URL(name, root));
  const previous = await readFile(path).catch((err) => {
    if (err.code !== 'ENOENT') throw err;
    return null;
  });
  const next = Buffer.from(text);
  if (previous?.equals(next)) return;
  await replaceFile(path, next);
  changed.push({ path, previous, next });
}
try {
  const overrides = await buildMarkdownOverridesSource(
    fileURLToPath(new URL('content/knowledge/', root)),
  );
  await generate('public/knowledge/articles/markdown-overrides.js', overrides);
  const { knowledgeCatalogueSource } = await import('./knowledge-catalogue-source.mjs');
  await generate('public/knowledge/catalogue.js', knowledgeCatalogueSource());
  const { createRegistry } = await import('../public/capabilities/registry.js');
  createRegistry(
    JSON.parse(await readFile(new URL('public/vendor/cyberchef/catalogue.json', root), 'utf8')),
  );
} catch (error) {
  for (const { path, previous, next } of changed.reverse()) {
    if (!(await readFile(path)).equals(next)) continue;
    if (previous) await replaceFile(path, previous);
    else await rm(path);
  }
  throw error;
}
console.log('Knowledge articles and catalogue generated and validated.');
