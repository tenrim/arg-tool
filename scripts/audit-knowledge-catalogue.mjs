import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { knowledgeCatalogueSource } from './knowledge-catalogue-source.mjs';
assert.equal(
  await readFile(new URL('../public/knowledge/catalogue.js', import.meta.url), 'utf8'),
  knowledgeCatalogueSource(),
  '科普目录过期，请运行 npm run build:knowledge；不能手改生成目录。',
);
console.log('PASS: knowledge catalogue matches complete validated source articles.');
