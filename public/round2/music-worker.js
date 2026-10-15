import {detectPitch} from './music-engine.js';
self.onmessage=({data})=>{try{self.postMessage({result:detectPitch(data.samples,data.sampleRate,data.clarity)});}catch(e){self.postMessage({error:e.message});}};
