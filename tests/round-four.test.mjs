import test from "node:test";
import assert from "node:assert/strict";
import { parseRLE } from "../public/round4/life.js";
import { validateGLTF, validateMesh } from "../public/round4/model.js";
import { LifeUniverse } from "../public/vendor/round4/life.js";
import { Chess } from "../public/vendor/round4/chess.js";
test("RLE bounds, count and supported rule are enforced", () => {
  assert.deepEqual(parseRLE("x = 3, y = 1, rule = B3/S23\n3o!").cells, [
    [0, 0],
    [1, 0],
    [2, 0],
  ]);
  for (const text of [
    "x = 3, y = 1\n4o!",
    "x = 3, y = 1\n0o!",
    "x = 3, y = 1\n3o",
    "x = 3, y = 1, rule = B36/S23\n3o!",
    "x = 3, y = 1\n3o!o",
  ])
    assert.throws(() => parseRLE(text));
});
test("Actual Hashlife preserves a blinker and translates a glider after four generations", () => {
  const b = new LifeUniverse();
  [-1, 0, 1].forEach((x) => b.set_bit(x, 0, true));
  b.next_generation(true);
  assert.deepEqual(
    [-1, 0, 1].map((y) => b.get_bit(0, y)),
    [true, true, true],
  );
  b.next_generation(true);
  assert.deepEqual(
    [-1, 0, 1].map((x) => b.get_bit(x, 0)),
    [true, true, true],
  );
  const u = new LifeUniverse(),
    cells = [
      [1, 0],
      [2, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ];
  cells.forEach(([x, y]) => u.set_bit(x, y, true));
  for (let i = 0; i < 4; i++) u.next_generation(true);
  assert.equal(u.root.population, 5);
  cells.forEach(([x, y]) => assert.equal(u.get_bit(x + 1, y + 1), true));
});
test("Model preflight rejects remote, relative, encoded URL and unsupported compression", () => {
  const encode = (x) => new TextEncoder().encode(JSON.stringify(x)).buffer;
  for (const uri of [
    "https://example.com/a",
    "file:///a",
    "a.bin",
    "data:text/html;base64,SGk=",
  ])
    assert.throws(() =>
      validateGLTF(
        encode({ asset: { version: "2.0" }, buffers: [{ uri }] }),
        false,
      ),
    );
  assert.doesNotThrow(() =>
    validateGLTF(
      encode({
        asset: { version: "2.0" },
        buffers: [{ uri: "data:application/octet-stream;base64,AAAA", byteLength:3 }],
      }),
      false,
    ),
  );
  assert.throws(() =>
    validateGLTF(
      encode({
        asset: { version: "2.0" },
        extensionsRequired: ["KHR_draco_mesh_compression"],
      }),
      false,
    ),
  );
  assert.throws(() => validateGLTF(new ArrayBuffer(5), true));
});
test("Chess rules retain FEN state, reject illegal moves, recognize checkmate and underpromotion", () => {
  const g = new Chess();
  g.loadPgn("1. f3 e5 2. g4 Qh4#");
  assert.equal(g.isCheckmate(), true);
  const start = new Chess();
  assert.throws(() => start.move({ from: "e2", to: "e5" }));
  const p = new Chess("7k/P7/8/8/8/8/8/7K w - - 0 1");
  p.move({ from: "a7", to: "a8", promotion: "n" });
  assert.equal(p.get("a8").type, "n");
});

test("Malformed binary STL is rejected before its declared huge allocation", () => {
  const buffer = new ArrayBuffer(84);
  new DataView(buffer).setUint32(80, 0x7fffffff, true);
  assert.throws(() => validateMesh(buffer, "stl"), /计数/);
  const text = new TextEncoder().encode(
    JSON.stringify({
      asset: { version: "2.0" },
      buffers: [{ byteLength: 1e12 }],
    }),
  );
  assert.throws(() => validateGLTF(text.buffer, false), /超限/);
});

import {zoomAt,pinchView} from '../public/round4/fragment-geometry.js';
test('Fragment zoom preserves the point under the finger and pinch translates with its center',()=>{const v={x:10,y:20,scale:2},p={x:110,y:120},z=zoomAt(v,p,4);assert.deepEqual(z,{x:-90,y:-80,scale:4});const pinch=pinchView(v,[{x:60,y:120},{x:160,y:120}],[{x:30,y:130},{x:230,y:130}],.1,20);assert.deepEqual(pinch,{x:-70,y:-70,scale:4});assert.equal(pinchView(v,[{x:0,y:0},{x:10,y:0}],[{x:0,y:0},{x:1000,y:0}],1,5).scale,5);});
