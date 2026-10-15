import {compareImages} from './image-engine.js';
self.onmessage=({data})=>{try{self.postMessage({result:compareImages(data.a,data.b,data.width,data.height,data.mode,data.opacity,data.threshold)});}catch(e){self.postMessage({error:e.message});}};
