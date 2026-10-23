// Explicit maintenance download only; the build and browser never contact MDN/GitHub.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source=new URL('../upstream/reference-mdn-zh/',import.meta.url),pin=JSON.parse(await readFile(new URL('SOURCE.json',source),'utf8'));
for(const file of pin.files){
 const response=await fetch(`https://api.github.com/repos/mdn/translated-content/contents/${file.path}?ref=${pin.commit}`,{headers:{'User-Agent':'MistToolbox-Reference-Maintenance/1.0','Accept':'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('MDN snapshot HTTP '+response.status);
 const item=await response.json(),bytes=Buffer.from(item.content,'base64');
 if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('MDN pinned bytes changed: '+file.path);
 await writeFile(new URL(file.name,source),bytes);
}
