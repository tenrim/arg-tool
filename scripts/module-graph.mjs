import {readdir, readFile} from 'node:fs/promises';
import {posix, resolve} from 'node:path';

export const normalize = path => path.replaceAll('\\', '/').replace(/^\.\//, '');
export async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, {withFileTypes:true})) {
    if (['vendor', 'node_modules', '.git', 'dist'].includes(entry.name)) continue;
    const path = normalize(directory + '/' + entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(path));
    else if (/\.(?:js|mjs)$/.test(path)) files.push(path);
  }
  return files.sort();
}

// Deliberately bounded source inventory, not a JS parser/security proof. Import
// literals are checked; computed Worker/vendor URLs remain documented adapters.
export function importsOf(source, file) {
  const imports = new Set();
  for (const [, specifier] of source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)['"]([^'"\n]+)['"]/g)) {
    if (specifier.startsWith('.')) imports.add(posix.normalize(posix.join(posix.dirname(file), specifier)));
  }
  return [...imports].sort();
}
export async function moduleGraph(files) {
  files ||= await sourceFiles('public');
  const nodes = new Map();
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    nodes.set(file, {imports:importsOf(source, file), source});
  }
  return nodes;
}
export function closure(graph, start) {
  const seen = new Set();
  function visit(file) {if (seen.has(file)) return;seen.add(file);for (const next of graph.get(file)?.imports || []) visit(next);}
  visit(start);return seen;
}
export function cyclesOf(graph) {
  const done = new Set(), stack = [], cycles = [];
  function visit(file) {
    if (stack.includes(file)) {cycles.push([...stack.slice(stack.indexOf(file)), file]);return;}
    if (done.has(file)) return;
    stack.push(file);for (const next of graph.get(file)?.imports || []) visit(next);
    stack.pop();done.add(file);
  }
  for (const file of graph.keys()) visit(file);
  return cycles;
}
export function localPath(file, root = process.cwd()) {
  const path = normalize(file), absolute = normalize(resolve(root, path)), base = normalize(resolve(root));
  if (!absolute.startsWith(base + '/')) throw Error('Path must stay inside the repository: ' + file);
  return absolute.slice(base.length + 1);
}
