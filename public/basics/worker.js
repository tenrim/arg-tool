// Resource origin survives hosts which wrap worker entry scripts in blob URLs.
self.onmessage = async ({data}) => {
  try {const {convert} = await import(new URL('basics/core.js', data.resourceBase).href);self.postMessage({result:await convert(data.kind,data.text,data.options)});}
  catch(error) {self.postMessage({error:error.message || '转换失败，请重试。'});}
};
