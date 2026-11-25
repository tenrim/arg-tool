import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildMarkdownOverridesSource } from './knowledge-markdown.mjs';

async function check(path, source) {
  const url = new URL('../' + path, import.meta.url);
  const actual = await readFile(url).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (!actual?.equals(Buffer.from(source)))
    throw Error(path + ' 缺失或过期，请运行 npm run build:knowledge');
}
const markdownDir = fileURLToPath(new URL('../content/knowledge/', import.meta.url));
await check(
  'public/knowledge/articles/markdown-overrides.js',
  await buildMarkdownOverridesSource(markdownDir),
);
const { knowledgeCatalogueSource } = await import('./knowledge-catalogue-source.mjs');
await check('public/knowledge/catalogue.js', knowledgeCatalogueSource());
console.log('PASS: Markdown articles and catalogue match their sources.');
