// Only explicit result snapshots cross this boundary. No DOM or storage access.
export const MAX_HANDOFF_BYTES = 32 * 1024 * 1024;
export function snapshot(value) {
  let bytes = value?.bytes;
  if (typeof value?.text === 'string' && bytes == null) bytes = new TextEncoder().encode(value.text);
  if (bytes instanceof ArrayBuffer) bytes = new Uint8Array(bytes);
  if (!(bytes instanceof Uint8Array) || bytes.length > MAX_HANDOFF_BYTES) throw Error('当前结果无法交接，最多支持 32 MB。');
  bytes = bytes.slice();
  let text = null;
  try { text = new TextDecoder('utf-8', {fatal:true,ignoreBOM:true}).decode(bytes); } catch { /* Binary stays binary. */ }
  const starts = (...head) => head.every((n,i) => bytes[i] === n);
  let mime = 'application/octet-stream';
  if (starts(137,80,78,71,13,10,26,10)) mime = 'image/png';
  else if (starts(255,216,255)) mime = 'image/jpeg';
  else if (starts(71,73,70,56)) mime = 'image/gif';
  else if (starts(82,73,70,70) && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP') mime = 'image/webp';
  else if (starts(80,75,3,4) || starts(80,75,5,6)) mime = 'application/zip';
  else if (starts(31,139)) mime = 'application/gzip';
  else if (text !== null && !/[\x00-\x08\x0E-\x1F]/.test(text)) mime = 'text/plain;charset=utf-8';
  return {bytes,text,mime,name:typeof value.name==='string'?value.name.slice(0,180):'处理结果.bin'};
}

// Recommendation hints refer to registered tasks, never duplicate their names,
// directions or algorithm implementations. Ordering depends on the source.
export function recommendations(data, source, registry) {
  const candidates = [], seen = new Set();
  const native = (id, reason) => { const entry=registry.byId.get(id);if(entry&&entry.listed!==false&&!seen.has(id)){seen.add(id);candidates.push({entry,reason});} };
  const operation = (op,reason) => { const entry=registry.byOperation.get(op);if(entry&&entry.listed!==false&&!seen.has(entry.id)){seen.add(entry.id);candidates.push({entry,op,reason});} };
  if (data.mime.startsWith('image/')) native('native:image','结果具有图片文件头，可查看图像和通道');
  if (['application/zip','application/gzip'].includes(data.mime)) operation('Unzip','结果具有压缩包文件头，可查看目录并逐条提取');
  if (source === 'image' || source === 'archive' || data.mime==='application/octet-stream') {
    native('native:hex-editor','直接检查提取结果的原始字节');
    native('native:file','检查文件头、字节分布和可读字符串');
  }
  if (data.text !== null && data.mime.startsWith('text/')) {
    const sample=data.text.trim();
    if (sample.length>=4 && sample.length%4===0 && /^[A-Za-z0-9+/]+={0,2}$/.test(sample)) operation('From Base64','字符形式符合 Base64，可尝试解码');
    if (sample.length>=2 && /^(?:[0-9a-f]{2}[\s:]*)+$/i.test(sample)) operation('From Hex','字符形式符合十六进制字节，可尝试解码');
    if (/%[0-9a-f]{2}/i.test(sample)) operation('URL Decode','含百分号转义，可尝试 URL 解码');
    operation('Magic','尝试识别常见编码；建议需要自行核对');
    operation('From Base64','尝试常见 Base64 编码');
    operation('ROT13','尝试字母移位，保留原结果以便比较');
  }
  operation('To Hex','将完整结果按原始字节显示为十六进制');
  operation('Entropy','查看字节熵，辅助判断数据特征');
  native('native:file','保留完整字节并进行文件检查');
  return candidates.slice(0,8);
}

export function compatibleTargets(data,registry,catalogue,imageOperations=new Set()){
  const nativeIds=new Set(['native:file','native:hex-editor',...(data.mime.startsWith('image/')?['native:image']:[])]);
  const archive=['application/zip','application/gzip'].includes(data.mime)?registry.byOperation?.get('Unzip')?.id:null;
  return registry.entries.filter(entry=>entry.listed!==false).flatMap(entry=>{
    if(nativeIds.has(entry.id)||entry.id===archive)return [{entry,directions:[{label:'打开工具'}]}];
    if(entry.open.kind!=='operation')return [];
    const directions=(entry.actions||entry.directions||[{op:entry.open.operation,label:entry.title}]).filter(direction=>{
      const definition=catalogue.operations[direction.op];if(!definition)return false;
      if(imageOperations.has(direction.op)&&!data.mime.startsWith('image/'))return false;
      if(definition.inputType==='string')return data.text!==null&&data.mime.startsWith('text/');
      return ['ArrayBuffer','byteArray'].includes(definition.inputType);
    });
    return directions.length?[{entry,directions}]:[];
  });
}

// Project the same category/group order as navigation; never classify a target
// by its label or create a fallback bucket for unregistered destinations.
export function groupTargets(targets,registry){
  return registry.categories.flatMap(category=>{
    const groups=registry.groups.filter(group=>group.category===category.id).flatMap(group=>{
      const members=targets.filter(target=>target.entry.category===category.id&&target.entry.group===group.id);
      return members.length?[{id:group.id,title:group.title,targets:members}]:[];
    });
    return groups.length?[{id:category.id,title:category.title,groups,count:groups.reduce((n,g)=>n+g.targets.length,0)}]:[];
  });
}
