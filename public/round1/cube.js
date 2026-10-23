import {mount,script} from './common.js';
import {mountCubing} from './cubing-view.js';
import {setProjectSources} from '../project-sources.js';
export function parseCubeMoves(text){const clean=text.trim();if(!clean)return[];const items=clean.split(/\s+/);if(items.length>500||items.some(x=>! /^[URFDLB](?:2|')?$/.test(x)))throw Error('使用空格分隔 U R F D L B，可加 2 或单引号；最多 500 步。');return items;}
export function initCube(){
 const panel=mount('cube','魔方观察','',[['cubing.js','https://github.com/cubing/cubing.js','多种形状的状态、公式与三维／展开图 · MPL-2.0（双许可中选择）'],['cubejs','https://github.com/ldez/cubejs','三阶普通面转动的兼容面色记录 · MIT'],['Three.js','https://github.com/mrdoob/three.js','cubing.js 的三维渲染依赖 · MIT'],['random-uint-below','https://github.com/lgarron/random-uint-below.js','cubing.js 随包依赖 · Unlicense']]);
 const facelets=async algorithm=>{try{const moves=parseCubeMoves(algorithm);await script('./vendor/round1/cubejs/lib/cube.js');const cube=new window.Cube();cube.move(moves.join(' '));return cube.asString();}catch{return null;}};
 const selectSources=withFacelets=>setProjectSources(panel,[
  'https://github.com/cubing/cubing.js',...(withFacelets?['https://github.com/ldez/cubejs']:[]),'https://github.com/mrdoob/three.js','https://github.com/lgarron/random-uint-below.js'
 ],{roles:{'https://github.com/cubing/cubing.js':'当前形状的真实状态、转动公式与观察视图。','https://github.com/ldez/cubejs':'普通三阶面转动的兼容面色记录；不加载求解器。','https://github.com/mrdoob/three.js':'cubing.js 的三维渲染依赖。','https://github.com/lgarron/random-uint-below.js':'固定 cubing.js 包的随包依赖，不提供玩家竞速打乱。'}});
 return mountCubing(panel,{facelets,selectSources});
}
