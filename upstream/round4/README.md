# Local spatial and simulation engines

Runtime: `public/vendor/round4/`. Native Chinese adapters: `public/round4/`.

Current engines: Konva 10.7.1 (MIT), chess.js 1.4.0 (BSD-2-Clause), Three.js 0.170.0 (MIT), and copy/life at `924c90afb529ad5d417f11d795bc1b400fff8d18` (BSD-2-Clause). Graph, geometry and circuit tools and their dedicated dependencies were removed at the user's request before release.

Maintenance only:

```
npm ci --ignore-scripts --prefix upstream/round4
node scripts/import-round-four.mjs
```

The importer bundles browser modules, retains input sources and notices, and writes SHA-256 records. It appends only an ESM export to the unchanged life core. Model assets are local; external glTF URIs are rejected before parsing. esbuild 0.25.12 (MIT) is a build dependency only.

Normal tests and builds use committed assets offline. Run `npm run audit:integrity` before refreshing generated hashes. `sources/` is not shipped wholesale; runtime license notices accompany every release.
