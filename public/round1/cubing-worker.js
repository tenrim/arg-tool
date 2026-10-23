import {Alg} from '../vendor/round1/cubing/lib/cubing/alg/index.js';
import {puzzles} from '../vendor/round1/cubing/lib/cubing/puzzles/index.js';
import {KPuzzle} from '../vendor/round1/cubing/lib/cubing/kpuzzle/index.js';
export async function inspectPuzzle({puzzle,input='',setup='',position,action='inspect',definition,geometry}){
 if(!['inspect','inverse','expand','simplify'].includes(action))throw Error('此工作区仅提供观察与公式整理，不提供求解或竞速打乱。');
 if(!Object.hasOwn(puzzles,puzzle)&&!['custom','geometry'].includes(puzzle))throw Error('未知谜题');
 if(input.length+setup.length>100000)throw Error('公式过长');
 const alg=new Alg(input),start=new Alg(setup),leaves=[],startLeaves=[];
 for(const leaf of alg.experimentalLeafMoves()){if(leaves.length>=10000)throw Error('展开超过 10000 步，请缩短公式');leaves.push(leaf.toString());}
 for(const leaf of start.experimentalLeafMoves()){if(startLeaves.length>=10000)throw Error('初始状态公式超过 10000 步');startLeaves.push(leaf.toString());}
 let kpuzzle;if(puzzle==='custom')kpuzzle=new KPuzzle(JSON.parse(definition));else if(puzzle==='geometry'){const pg=await import('../vendor/round1/cubing/lib/cubing/puzzle-geometry/index.js');kpuzzle=new KPuzzle(pg.getPuzzleGeometryByDesc(geometry).getKPuzzleDefinition(true));}else kpuzzle=await puzzles[puzzle].kpuzzle();
 // Validate the complete formula even when displaying the first step.
 kpuzzle.algToTransformation(alg);kpuzzle.algToTransformation(start);
 const step=position===undefined?leaves.length:Math.min(leaves.length,Math.max(0,Number(position)||0)),effective=[setup,...leaves.slice(0,step)].join(' ').trim(),current=new Alg(effective),pattern=kpuzzle.defaultPattern().applyAlg(current),transformation=kpuzzle.algToTransformation(current);
 const output=action==='inverse'?alg.invert().toString():action==='expand'?alg.expand().toString():action==='simplify'?alg.simplify().toString():undefined;
 return {puzzle,setup,algorithm:input,effective,leaves,position:step,expandedCount:leaves.length,pattern:pattern.toJSON(),transformation:transformation.toJSON(),solved:transformation.isIdentityTransformation(),output};
}
if(typeof self!=='undefined')self.onmessage=async({data})=>{try{self.postMessage({result:await inspectPuzzle(data)});}catch(e){self.postMessage({error:e.message||String(e)});}};
