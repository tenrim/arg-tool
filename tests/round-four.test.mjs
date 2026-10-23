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

// Former sample-browser regressions now belong to local CIF file processing.
// Fixtures stay in upstream; no crystal catalogue is published to the site.
import {readFile} from 'node:fs/promises';
import {parseCIF,expandCrystal,parseSymmetry} from '../public/round4/cif.js';
const cifFixture = name => readFile(new URL('../upstream/reference/sources/crystals/'+name,import.meta.url),'utf8');
test('Local CIF: actual diamond symmetry, nearest distance and repeated cells',async()=>{
 const crystal=parseCIF(await cifFixture('9008564-diamond.cif')),model=expandCrystal(crystal,1);
 assert.equal(model.atoms.length,8);assert.equal(expandCrystal(crystal,2).atoms.length,64);
 const first=model.atoms[0].position,distances=model.atoms.slice(1).map(atom=>Math.hypot(...atom.position.map((x,i)=>x-first[i])));
 assert.ok(Math.abs(Math.min(...distances)-3.56679*Math.sqrt(3)/4)<1e-8);
});
test('Local CIF: all formerly supported raw fixtures retain finite expanded positions',async()=>{
 const fixtures=['9008564-diamond.cif','9011575-diamond.cif','9000019.cif','9000020.cif','9000025.cif','9000079.cif','9000195.cif','9000251.cif','9000305.cif','9000307.cif','9000612.cif','9007550.cif','9008434.cif','9008098.cif'];
 for(const file of fixtures){const model=expandCrystal(parseCIF(await cifFixture(file)),1);assert.ok(model.atoms.length,file);assert.ok(model.atoms.every(atom=>atom.position.every(Number.isFinite)),file);}
});
test('Local CIF: invalid expressions, data blocks and file sizes are rejected',async()=>{
 const text=await cifFixture('9008564-diamond.cif');
 assert.throws(()=>parseSymmetry('alert(1),y,z'));
 assert.throws(()=>parseSymmetry('x,y,1/0'));
 assert.throws(()=>parseCIF(text+'\ndata_second\n'));
 assert.throws(()=>parseCIF('x'.repeat(1024*1024+1)),/1 MB/);
 assert.throws(()=>parseCIF('data_bad\n_cell_length_a 1\n'));
});
test('Local CIF: invalid lattice and atom/repeat limits remain enforced',async()=>{
 const crystal=parseCIF(await cifFixture('9008564-diamond.cif'));
 assert.throws(()=>expandCrystal({...crystal,angles:[10,10,170]}),/晶胞角度/);
 assert.throws(()=>expandCrystal(crystal,4),/重复/);
 const dense=parseCIF(await cifFixture('9000251.cif'));assert.throws(()=>expandCrystal(dense,3),/2,000/);
});
