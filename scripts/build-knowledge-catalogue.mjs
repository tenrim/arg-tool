import { writeFile } from 'node:fs/promises';
import { knowledgeCatalogueSource } from './knowledge-catalogue-source.mjs';
await writeFile(
  new URL('../public/knowledge/catalogue.js', import.meta.url),
  knowledgeCatalogueSource(),
);
console.log('Knowledge catalogue generated from complete validated articles.');
