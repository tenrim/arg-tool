// Resource/protocol boundary around the byte-for-byte official CyberChef worker.
// Shared operation corrections are installed after each lazy module import,
// before the original engine instantiates it for a task or complete recipe.
const loadScripts = self.importScripts.bind(self);
const fetchResource = self.fetch.bind(self);
let resourceBase;
let failureReported = false;
function resourceFailure(url) {
  const file = new URL(url).pathname.split('/').pop();
  const error = new Error(`CyberChef 运算组件 ${file} 载入失败，请刷新页面后重试。`);
  // A module import can fail inside an upstream async bake. Report explicitly
  // rather than leaving the client waiting for a Worker error event/timeout.
  failureReported = true;
  self.postMessage({action: 'resourceError', data: {message: error.message}});
  return error;
}
// Keep docURL as a path for Jimp's path.join, then make its requests absolute
// at the browser boundary. Request objects and explicit remote URLs retain
// their native options/semantics; no additional requests are introduced.
self.fetch = async (input, options) => {
  const request = typeof input === 'string' ? new URL(input, resourceBase).href : input;
  const url = new URL(request instanceof Request ? request.url : request);
  const localAsset = url.origin === resourceBase.origin && url.pathname.startsWith(new URL('vendor/cyberchef/', resourceBase).pathname);
  let response;
  try { response = await fetchResource(request, options); }
  catch (error) { throw localAsset ? resourceFailure(url) : error; }
  if (localAsset && !response.ok) throw resourceFailure(url);
  return response;
};
self.importScripts = (...urls) => {
  // Upstream also requests modules using docURL's root-relative paths. Resolve
  // both forms explicitly, including when this Worker has a blob: location.
  const scripts = urls.map(url => new URL(url, resourceBase).href);
  try {
    const encodings = new URL('./vendor/cyberchef/modules/Encodings.js', resourceBase).href;
    if (self.CyberChefOperationCorrections && scripts.includes(encodings)) {
      self.CyberChefOperationCorrections.importEncodings(() => loadScripts(...scripts));
    } else loadScripts(...scripts);
  }
  catch { throw resourceFailure(scripts[0]); }
  self.CyberChefOperationCorrections?.apply(self.OpModules);
};
function initialize({data: message}) {
  if (message?.action !== 'initialize') return;
  self.removeEventListener('message', initialize);
  try {
    const base = new URL(message.data.resourceBase);
    if (!['https:', 'http:'].includes(base.protocol) || base.origin !== self.location.origin || base.username || base.password) throw new Error('CyberChef 组件资源地址无效，请刷新页面后重试。');
    resourceBase = base;
    self.importScripts('./cyberchef-operation-corrections.js');
    self.importScripts('./vendor/cyberchef/ChefWorker.js');
  } catch (error) {
    if (!failureReported) self.postMessage({action: 'bootstrapError', data: {message: error.message}});
  }
}
self.addEventListener('message', initialize);
