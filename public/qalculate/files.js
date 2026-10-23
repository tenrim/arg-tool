// Only the WASM instance's memory filesystem is visible here. Devices and
// procfs are excluded; no host filesystem is mounted in this build.
export function snapshotVirtualFiles(fs){
 const files=new Map();let bytes=0;
 function walk(path,depth){
  if(depth>24)throw Error('内存文件目录超过 24 层，未返回删减结果。');
  for(const name of fs.readdir(path)){
   if(name==='.'||name==='..')continue;
   const full=(path==='/'?'':path)+'/'+name;if(full==='/dev'||full==='/proc')continue;
   const stat=fs.lstat(full);
   if(fs.isDir(stat.mode))walk(full,depth+1);
   else if(fs.isFile(stat.mode)){
    bytes+=stat.size;if(bytes>128*1024*1024||files.size>=1000)throw Error('内存文件超过 128 MB 或 1,000 个，未返回删减结果。');
    files.set(full,fs.readFile(full));
   }
  }
 }
 walk('/',0);return files;
}
export function changedVirtualFiles(before,after){
 let size=0;const files=[];
 for(const [path,bytes] of after){
  const previous=before.get(path);if(previous?.length===bytes.length&&previous.every((b,i)=>b===bytes[i]))continue;
  size+=bytes.length;if(size>32*1024*1024)throw Error('本次生成的文件超过 32 MB，未返回删减结果。');
  const relative=path.startsWith('/tmp/')?path.slice(5):path.slice(1);
  files.push({path,name:relative.replaceAll('/','_'),bytes});
 }
 return files;
}
