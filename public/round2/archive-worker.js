import {listArchive,extractArchive,createArchive} from './archive-engine.js';
self.onmessage=({data})=>{try{self.postMessage({result:data.op==='list'?listArchive(data.bytes):data.op==='extract'?extractArchive(data.bytes,data.index):createArchive(data.files)});}catch(e){self.postMessage({error:e.message});}};
