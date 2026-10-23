import {toBase64} from './model.js';

// One portable document: no executable scripts, remote images, runtime CDN or
// temporary blob addresses survive export. Original attachments remain intact.
const base=new URL('../vendor/notebook/vditor/dist/',import.meta.url);
let cssPending;
async function stylesheet(){
 if(!cssPending)cssPending=(async()=>{
  const response=await fetch(new URL('js/katex/katex.min.css',base));if(!response.ok)throw Error('导出公式字体加载失败，请重试。');
  let css=await response.text();const paths=[...new Set([...css.matchAll(/url\(([^)]+)\)/g)].map(m=>m[1]))];
  for(const path of paths){const font=await fetch(new URL('js/katex/'+path,base));if(!font.ok)throw Error('导出字体加载失败。');const bytes=new Uint8Array(await font.arrayBuffer());css=css.replaceAll('url('+path+')','url(data:font/woff2;base64,'+toBase64(bytes)+')');}
  return css;
 })().catch(error=>{cssPending=null;throw error;});return cssPending;
}
export async function exportHTML(note,markup){
 // The editor adapter embeds attachments through DOM attributes before serialization.
 // Never replace text inside the serialized document: code and clues are literal.
 const css=await stylesheet();
 return '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:; font-src data:; media-src data:"><title>迷雾工具箱 · 笔记</title><style>'+css+'\nbody{max-width:960px;margin:32px auto;padding:0 24px;font:16px/1.8 system-ui,sans-serif;color:#18202b}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f4f6f8;padding:16px}code{font-family:monospace;font-variant-ligatures:none}img,svg{max-width:100%;height:auto}table{border-collapse:collapse}td,th{border:1px solid #bbb;padding:6px 12px}a{color:#007a96}.notebook-export-staging{position:static}button{display:none}@media print{body{margin:0;max-width:none}pre,table{break-inside:avoid}}</style><body>'+markup+'</body></html>';
}
