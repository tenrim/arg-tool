// Maintenance only: npm ci --ignore-scripts --prefix upstream/round4, then run this script.
import { createRequire } from "node:module";
import { readFile, writeFile, readdir, mkdir, cp, rm } from "node:fs/promises";
import { resolve, join, relative } from "node:path";
import { createHash } from "node:crypto";
const base = resolve("upstream/round4"),
  require = createRequire(join(base, "package.json")),
  { build } = require("esbuild");
const entries = {
  konva: 'export {default} from "konva";',
  chess: 'export {Chess} from "chess.js";',
  model:
    'export * from "three"; export {OrbitControls} from "three/addons/controls/OrbitControls.js"; export {OBJLoader} from "three/addons/loaders/OBJLoader.js"; export {STLLoader} from "three/addons/loaders/STLLoader.js"; export {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";',
};
const inputs = new Set(),
  hash = (b) => createHash("sha256").update(b).digest("hex");
for (const [name, contents] of Object.entries(entries)) {
  const result = await build({
    stdin: { contents, resolveDir: base, sourcefile: name + ".js" },
    outfile: `public/vendor/round4/${name}.js`,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    minify: true,
    legalComments: "linked",
    metafile: true,
  });
  for (const p of Object.keys(result.metafile.inputs))
    if (p.includes("node_modules")) inputs.add(resolve(p));
}
const dirs = new Map();
for (const path of inputs) {
  const tail = path.split("/node_modules/").pop().split("/"),
    name = tail[0].startsWith("@") ? tail.slice(0, 2).join("/") : tail[0];
  dirs.set(path.slice(0, path.lastIndexOf("/node_modules/") + 14) + name, name);
}
const records = [];
await rm("upstream/round4/sources", { recursive: true, force: true });
let notices = "";
for (const [dir, name] of [...dirs].sort()) {
  const pkg = JSON.parse(await readFile(join(dir, "package.json"), "utf8")),
    dest = join("upstream/round4/sources", name + "-" + pkg.version);
  await mkdir(dest, { recursive: true });
  const files = new Set(
    [...inputs]
      .filter((p) => p.startsWith(dir + "/"))
      .map((p) => relative(dir, p)),
  );
  for (const f of await readdir(dir))
    if (
      /^(license|licence|copying|notice|readme)/i.test(f) ||
      f === "package.json"
    )
      files.add(f);

  for (const f of files) {
    await mkdir(join(dest, f, ".."), { recursive: true });
    await cp(join(dir, f), join(dest, f), { recursive: true });
    if (/(?:^|\/)(license|licence|copying|notice)/i.test(f))
      notices +=
        `\n===== ${name} ${pkg.version} / ${f} =====\n` +
        (await readFile(join(dest, f), "utf8")) +
        "\n";
  }
  if (![...files].some((f) => /(?:^|\/)(license|licence|copying)/i.test(f)))
    throw Error("Missing license " + name);
  records.push({
    name,
    version: pkg.version,
    license: pkg.license,
    repository: pkg.repository,
    source_directory: dest,
    files: await Promise.all(
      [...files]
        .sort()
        .map(async (path) => ({
          path,
          sha256: hash(await readFile(join(dest, path))),
        })),
    ),
  });
}
const life = await readFile("upstream/round4/life/life.js", "utf8");
await writeFile(
  "public/vendor/round4/life.js",
  life + "\nexport {LifeUniverse};\n",
);
const lifeLicense = await readFile("upstream/round4/life/LICENSE", "utf8");
notices += "\n===== copy/life BSD-2-Clause =====\n" + lifeLicense;
records.push({
  name: "copy/life",
  version: "924c90afb529ad5d417f11d795bc1b400fff8d18",
  license: "BSD-2-Clause",
  repository: "https://github.com/copy/life",
  source_directory: "upstream/round4/life",
  files: await Promise.all(
    ["life.js", "LICENSE"].map(async (path) => ({
      path,
      sha256: hash(await readFile("upstream/round4/life/" + path)),
    })),
  ),
});
await writeFile("public/vendor/round4/LICENSES.txt", notices);
await writeFile(
  "public/vendor/round4/UPSTREAM.json",
  JSON.stringify(
    {
      description:
        "Pinned npm packages and copy/life. Sources unchanged; life adds an ESM export. No external editor UI.",
      packages: records,
      bundles: await Promise.all(
        (await readdir("public/vendor/round4"))
          .filter((f) => f !== "UPSTREAM.json")
          .sort()
          .map(async (path) => ({
            path,
            sha256: hash(await readFile("public/vendor/round4/" + path)),
          })),
      ),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Bundled four engines; retained " +
    records.length +
    " source packages and notices.",
);
