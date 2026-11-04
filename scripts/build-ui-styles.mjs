import { writeFile } from 'node:fs/promises';
import { uiStyleSource } from './ui-style-source.mjs';
await writeFile(new URL('../public/ui/components.css', import.meta.url), await uiStyleSource());
console.log('Shared UI stylesheet generated.');
