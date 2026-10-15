importScripts('../vendor/round1/cubejs/lib/cube.js','../vendor/round1/cubejs/lib/solve.js');
self.onmessage=({data})=>{try{Cube.initSolver();self.postMessage({solution:Cube.fromString(data.state).solve()});}catch{self.postMessage({error:true});}};
