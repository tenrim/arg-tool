import {appPages} from './browser-host.mjs';
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import assert from "node:assert/strict";
const { chromium } = createRequire(import.meta.url)("playwright");
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
try {
  const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    }),
    errors = [],
    external = [],
    missing = [];
  await context.route("**/*", async (r) => {
    const u = new URL(r.request().url());
    if (u.hostname !== "arg.test") {
      external.push(u.href);
      return r.abort();
    }
    const path = resolve(
      "public",
      "." + (u.pathname === "/" ? "/index.html" : u.pathname),
    );
    try {
      await r.fulfill({
        body: await readFile(path),
        contentType:
          {
            ".html": "text/html",
            ".js": "text/javascript",
            ".mjs": "text/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".woff2": "font/woff2",
            ".wasm": "application/wasm",
          }[extname(path)] || "application/octet-stream",
      });
    } catch {
      missing.push(u.pathname);
      await r.abort();
    }
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  const click = (id) => page.locator("#" + id).click(),
    fill = (id, v) => page.locator("#" + id).fill(v),
    select = (id, v) => page.locator("#" + id).selectOption(v),
    value = (id) => page.locator("#" + id).inputValue();
  async function status(id, text) {
    await page
      .waitForFunction(
        ({ id, text }) =>
          document.getElementById(id)?.textContent.includes(text),
        { id, text },
        { timeout: 20000 },
      )
      .catch(async (e) => {
        console.error("STATUS", id, await page.locator("#" + id).textContent());
        await page.screenshot({ path: "/tmp/r4-failure.png", fullPage: true });
        throw e;
      });
  }
  async function go(id) {
    await page.evaluate((id) => (location.hash = id), id);
    await page.waitForSelector("#panel-" + id + ":not([hidden])");
    await page.waitForFunction(
      (id) => document.querySelector("#r4-" + id + " .r4-box, #r4-" + id + " .frag-card"),
      id,
    );
  }
  await page.goto("https://arg.test/#chess");
  await page.waitForSelector("#chess-load");
  assert.match(await page.locator("[data-square=e2]").textContent(),/♙\uFE0E/);
  assert.match(await page.locator("[data-square=e7]").textContent(),/♟\uFE0E/);
  await fill("chess-input", "1. e4 e5 2. Nf3 Nc6");
  await click("chess-load");
  await status("chess-status", "4 半回合");
  await click("chess-next");
  assert.match(await value("chess-fen"), /4P3/);
  await click("chess-last");
  assert.match(await value("chess-fen"), /^r1bqkbnr/);
  await click("chess-first");
  await page.locator("[data-square=e2]").tap();
  await page.locator("[data-square=e4]").tap();
  assert.equal(await page.locator("#chess-moves button").count(), 1);
  const fen = await value("chess-fen");
  await fill("chess-input", "invalid");
  await click("chess-load");
  await status("chess-status", "棋谱无效");
  assert.equal(await value("chess-fen"), fen);
  await go("life");
  await fill("life-rle", "x = 3, y = 1, rule = B3/S23\n3o!");
  await click("life-load");
  await click("life-step");
  assert.match(
    await page.locator("#life-info").textContent(),
    /第 1 代 · 总存活 3/,
  );
  const life = await page.evaluate(async () => {
    const { LifeUniverse } = await import("./vendor/round4/life.js");
    const u = new LifeUniverse();
    [-1, 0, 1].forEach((x) => u.set_bit(x, 0, true));
    u.next_generation(true);
    return [-1, 0, 1].map((y) => u.get_bit(0, y));
  });
  assert.deepEqual(life, [true, true, true]);
  await fill("life-rle", "x = 3, y = 1, rule = B36/S23\n3o!");
  await click("life-load");
  await status("life-status", "仅支持");
  await click("life-play");
  await page.waitForFunction(() =>
    document.querySelector("#life-info").textContent.includes("第 2 代"),
  );
  await go("model");
  await page
    .locator("#model-file")
    .setInputFiles({
      name: "triangle.obj",
      mimeType: "text/plain",
      buffer: Buffer.from("v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n"),
    });
  await status("model-status", "模型已载入");
  assert.match(
    await page.locator("#model-info").textContent(),
    /顶点 3 · 三角面 1/,
  );
  const gltfJSON={asset:{version:"2.0"},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],buffers:[{byteLength:36}],bufferViews:[{buffer:0,byteOffset:0,byteLength:36}],accessors:[{bufferView:0,componentType:5126,count:3,type:"VEC3",min:[0,0,0],max:[1,1,0]}]};
  const jsonRaw=Buffer.from(JSON.stringify(gltfJSON)),jsonChunk=Buffer.alloc(Math.ceil(jsonRaw.length/4)*4,32);jsonRaw.copy(jsonChunk);const bin=Buffer.from(new Float32Array([0,0,0,1,0,0,0,1,0]).buffer),glb=Buffer.alloc(12+8+jsonChunk.length+8+bin.length);glb.writeUInt32LE(0x46546c67,0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);glb.writeUInt32LE(jsonChunk.length,12);glb.writeUInt32LE(0x4e4f534a,16);jsonChunk.copy(glb,20);glb.writeUInt32LE(bin.length,20+jsonChunk.length);glb.writeUInt32LE(0x004e4942,24+jsonChunk.length);bin.copy(glb,28+jsonChunk.length);
  await page.locator("#model-file").setInputFiles({name:"triangle.glb",mimeType:"model/gltf-binary",buffer:glb});await page.waitForFunction(()=>document.querySelector("#model-info").textContent.includes("triangle.glb"));
  const stl=Buffer.alloc(134);stl.writeUInt32LE(1,80);[0,0,1,0,0,0,1,0,0,0,1,0].forEach((n,i)=>stl.writeFloatLE(n,84+i*4));await page.locator("#model-file").setInputFiles({name:"triangle.stl",mimeType:"application/octet-stream",buffer:stl});await page.waitForFunction(()=>document.querySelector("#model-info").textContent.includes("triangle.stl"));
  await select("model-style", "wire");
  await select("model-clip", "x");
  await fill("model-offset", "0.2");
  const modelDownload = page.waitForEvent("download");
  await click("model-save");
  assert.equal(
    (await readFile(await (await modelDownload).path()))
      .subarray(1, 4)
      .toString(),
    "PNG",
  );
  await page
    .locator("#model-file")
    .setInputFiles({
      name: "remote.gltf",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          asset: { version: "2.0" },
          buffers: [{ uri: "https://example.com/secret.bin", byteLength: 3 }],
        }),
      ),
    });
  await status("model-status", "外部资源");
  await go("fragments");
  const pngs = await page.evaluate(() =>
    ["#ff0000", "#0000ff"].map((color) => {
      const c = document.createElement("canvas");
      c.width = c.height = 24;
      const ctx = c.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 24, 24);
      return c.toDataURL().split(",")[1];
    }),
  );
  await page
    .locator("#frag-files")
    .setInputFiles(
      pngs.map((p, i) => ({
        name: i + ".png",
        mimeType: "image/png",
        buffer: Buffer.from(p, "base64"),
      })),
    );
  await status("fragments-status", "共 2 张");
  await page.locator(".frag-adjust").filter({hasText:"精确变换"}).locator("summary").click();
  await fill("frag-x", "0");
  await fill("frag-y", "0");
  await click("frag-apply");
  await click("frag-flip");
  assert.equal(await value("frag-scale"), "1");
  await click("frag-flip");
  const output = page.waitForEvent("download");
  await click("frag-export");
  const bytes = await readFile(await (await output).path());
  assert.equal(bytes.subarray(1, 4).toString(), "PNG");
  const pixel = await page.evaluate(async (base64) => {
    const b = await (await fetch("data:image/png;base64," + base64)).blob(),
      img = await createImageBitmap(b),
      c = document.createElement("canvas");
    c.width = c.height = 1;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return [...ctx.getImageData(0, 0, 1, 1).data];
  }, bytes.toString("base64"));
  assert.deepEqual(pixel, [0, 0, 255, 255]);
  await click("frag-remove");
  await status("fragments-status", "共 1 张");
  assert.equal(await page.locator("#frag-select option").count(), 1);
  const ids = [
    "fragments",
    "chess",
    "life",
    "model",
  ];
  for (const width of [320, 390, 768, 1365]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of ids) {
      await go(id);
      const p = page.locator("#panel-" + id);
      await p.locator(".tool-help-button").click();
      assert.equal(
        await p
          .locator(".tool-provenance")
          .evaluate((e) => e === e.parentElement.lastElementChild),
        true,
      );
      assert.equal(await p.locator("[data-license=missing]").count(), 0);
      const bounds = await p.evaluate(
        (root, w) => ({
          scroll: document.documentElement.scrollWidth,
          clipped: [...root.querySelectorAll("button,input,textarea,select")]
            .filter((e) => {
              const r = e.getBoundingClientRect();
              return r.width && r.height && (r.left < -0.5 || r.right > w + 1);
            })
            .map((e) => e.id || e.textContent.slice(0, 20)),
        }),
        width,
      );
      assert.ok(
        bounds.scroll <= width + 1,
        `${id}@${width}: ${JSON.stringify(bounds)}`,
      );
      assert.deepEqual(bounds.clipped, [], `${id}@${width}`);
      await p.locator(".tool-help-button").click();
      if (width === 390 || width === 1365)
        await page.screenshot({
          path: `/tmp/arg-r4-${id}-${width}.png`,
          fullPage: true,
        });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  for (const id of ids) {
    await go(id);
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= 391),
      "200% " + id,
    );
  }
  assert.equal(appPages(context).length, 1);
  assert.equal(await page.locator("iframe").count(), 0);
  assert.deepEqual(
    { errors, external, missing },
    { errors: [], external: [], missing: [] },
  );
  console.log(
    "PASS: four real engines; chess PGN/legal moves, Life blinker, local model/render and external URI rejection, fragment pixel export; Chinese help/licenses, mobile 320/390/768/1365 and 200%; no external requests or popups.",
  );
} finally {
  await browser.close();
}
