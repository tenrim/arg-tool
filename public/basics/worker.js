// Resource origin survives hosts which wrap worker entry scripts in blob URLs.
self.onmessage = async ({data}) => {
  try {if(data.kind==='radix64'){const {radix}=await import(new URL('completion/codes.js',data.resourceBase).href);if(new TextEncoder().encode(data.text).length>65536)throw Error('输入最多 64 KB。');const {base,target,direction}=data.options;if(!/^[^\s]+$/.test(data.text.trim()))throw Error('请输入当前进制的一个有符号整数。');self.postMessage({result:{output:radix(data.text,Number(direction==='decode'?target:base),Number(direction==='decode'?base:target))}});return;}const {convert} = await import(new URL('basics/core.js', data.resourceBase).href);self.postMessage({result:await convert(data.kind,data.text,data.options)});}
  catch(error) {self.postMessage({error:error.message || '转换失败，请重试。'});}
};
