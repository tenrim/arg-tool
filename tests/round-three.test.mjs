import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import createEngine from '../public/vendor/round3/grid-engine.js';
import {blankBoard,validateBoard,parseText,textOf,encodedBoard,resultText} from '../public/round3/board-model.js';

const engine=await createEngine({wasmBinary:await readFile(new URL('../public/vendor/round3/grid-engine.wasm',import.meta.url)),print:()=>{},printErr:()=>{}});
function solve(board){const input=encodedBoard(board),pointer=engine._malloc(input.byteLength);try{engine.HEAPU8.set(new Uint8Array(input.buffer),pointer);const output=engine._arg_solve_board(pointer,input.length),size=new DataView(engine.HEAPU8.buffer).getUint32(output,true);return JSON.parse(new TextDecoder().decode(engine.HEAPU8.slice(output+4,output+4+size)));}finally{engine._free(pointer);}}
const make=(type,cells)=>({...blankBoard(type,cells.length,cells[0].length),cells});
test('direct grid input validates dimensions, symbols and preserves original clues',()=>{
 const original=blankBoard('sudoku',4,4),parsed=parseText('1204\n0410\n2043\n4321',original);
 assert.equal(original.cells[0][0],null);assert.deepEqual(parsed.cells[0],[1,2,null,4]);assert.deepEqual(parseText(textOf(parsed),original),parsed);
 const akari=make('akari',[[null,-1],[0,2]]);assert.deepEqual(parseText(textOf(akari),akari),akari);assert.deepEqual([...encodedBoard(akari)],[3,2,2,-2,-1,0,2]);
 for(const value of [0,1,16,1e9,NaN,Infinity])assert.throws(()=>blankBoard('nurikabe',value,value));
 assert.throws(()=>blankBoard('sudoku',5,5));assert.throws(()=>validateBoard({...original,type:'toString'}));assert.throws(()=>validateBoard({...original,cells:[[1]]}));assert.throws(()=>parseText('1 2 3 4\n1 2 3 4\n1 2 3 4\n1 2 3 5',original));
 assert.throws(()=>parseText('# #\n# #',blankBoard('slitherlink',2,2)));assert.throws(()=>parseText('https://example.com/puzzle',original));
});
test('actual WASM solves standard Sudoku, separates contradiction from multiple solutions',()=>{
 const board=make('sudoku',[[1,2,null,4],[null,4,1,null],[2,null,4,3],[4,3,2,1]]),result=solve(board);
 assert.deepEqual(result,{status:'complete',cells:[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]]});assert.equal(board.cells[0][2],null);
 assert.equal(resultText(board,result),'1 2 3 4\n3 4 1 2\n2 1 4 3\n4 3 2 1');
 board.cells[0][1]=1;assert.equal(solve(board).status,'unsatisfiable');const partial=solve(blankBoard('sudoku',4,4));assert.equal(partial.status,'partial');assert.ok(partial.cells.flat().every(v=>v===null));
 for(const n of [6,9]){const bh=n===6?2:3,bw=n/bh;const cells=Array.from({length:n},(_,y)=>Array.from({length:n},(_,x)=>(x+(y%bh)*bw+Math.floor(y/bh))%n+1));assert.deepEqual(solve(make('sudoku',cells)),{status:'complete',cells});}
});
test('actual WASM enforces loop, island and light rules and returns irrefutable facts',()=>{
 const loop=solve(make('slitherlink',[[2,2],[2,2]]));assert.deepEqual(loop,{status:'complete',horizontal:[[true,true],[false,false],[true,true]],vertical:[[true,false,true],[true,false,true]]});assert.equal(solve(make('slitherlink',[[0,0],[0,0]])).status,'unsatisfiable');
 assert.deepEqual(solve(make('nurikabe',[[1,null],[null,null]])),{status:'complete',cells:[[false,true],[true,true]]});assert.equal(solve(make('nurikabe',[[1,1],[null,null]])).status,'unsatisfiable');
 assert.deepEqual(solve(make('akari',[[null,-1],[-1,null]])),{status:'complete',cells:[[true,false],[false,true]]});assert.equal(solve(make('akari',[[null,1],[0,null]])).status,'unsatisfiable');assert.equal(solve(blankBoard('akari',2,2)).status,'partial');
});
