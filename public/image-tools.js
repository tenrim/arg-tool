import {captureFailure} from './feedback/model.js';
import {element as uiElement, tabsController, onDisconnect} from './ui/index.js';
import {hexDump} from './media.js';
import {ImageInspector} from './image-inspect.js';
import {pngImageBytes} from './image-png.js';
import {continueButton} from './handoff/button.js';
const $ = id => document.getElementById(id);
const channels = {rgb: 'RGB 叠加', r: '红色', g: '绿色', b: '蓝色', a: '透明度'};
function download(data, name, type) {
  const url = URL.createObjectURL(new Blob([data], {type})), link = uiElement('a');
  link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
let decoder;
function pngDecoder() {
  return decoder ??= new Promise((resolve, reject) => {
    const script = uiElement('script'); script.src = new URL('./vendor/stegonline/pngtoy.min.js', import.meta.url).href;
    const fail = () => { clearTimeout(timer); script.remove(); decoder = null; reject(Error('PNG 解码组件加载失败，请重试')); };
    const timer = setTimeout(fail, 45000); script.onload = () => { clearTimeout(timer); resolve(); }; script.onerror = fail; document.head.append(script);
  });
}
export function initImageTools() {
  let image = null, bytes = null, worker = null, rejectTask = null, generation = 0, task = 0, engine = 'basic', activeTimer;
  let resultKind = null, analysisRevision = 0, analysisBusy = false, analysisTimer, viewRevision = 0, renderEngine = true;
  const inspector = new ImageInspector(), canvas = $('image-canvas');
  let handoffResult=null,handedResult;
  const next=continueButton({id:'image-continue',source:'image',read:()=>handedResult=handoffResult,isCurrent:()=>!!handedResult&&handedResult===handoffResult});$('image-copy').before(next);
  let handedImage,handedView;
  const imageNext=continueButton({id:'image-view-continue',source:'image',read:async()=>{handedImage=image;handedView=viewRevision;if(!image)throw Error('请先载入图片。');const original=image.file;const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('无法导出当前视图。');return {files:[original,new File([blob],'当前处理视图.png',{type:'image/png'})]};},isCurrent:()=>!!handedImage&&handedImage===image&&handedView===viewRevision});imageNext.textContent='用其他工具处理图片';$('image-download').after(imageNext);
  const viewChanged = () => viewRevision++;
  document.addEventListener('arg:imageviewchange',viewChanged);
  onDisconnect(canvas,()=>{stop();analysisRevision++;clearTimeout(analysisTimer);inspector.cancel();analysisBusy=false;document.removeEventListener('arg:imageviewchange',viewChanged);});
  const analysisButtons = ['image-qr', 'image-exif', 'image-png'];
  function status(text, error = false) { $('image-status').textContent = text; $('image-status').classList.toggle('error', error); }
  function ready(value) {
    imageNext.disabled=!value;
    for (const id of ['image-download', 'image-view', 'image-remap', 'image-overview', 'lsb-run']) $(id).disabled = !value;
    for (const id of analysisButtons) $(id).disabled = !value || analysisBusy;
    $('image-analysis-cancel').hidden = !analysisBusy;
  }
  function stop() { clearTimeout(activeTimer); worker?.terminate(); worker = null; rejectTask?.(new Error('任务已取消')); rejectTask = null; task++; }
  function cancelAnalysis() { analysisRevision++; clearTimeout(analysisTimer); inspector.cancel(); analysisBusy = false; ready(!!image); }
  function result(text = '', kind = null, label = '等待分析', binary = null) {
    resultKind = kind; bytes = binary; $('image-output').value = text; $('image-result-kind').textContent = label;
    handoffResult=binary?{bytes:binary}:kind==='qr'&&text?{text}:null;next.disabled=!handoffResult;
    $('lsb-download').disabled = !binary?.length; $('image-copy').disabled = !text; $('image-save-text').disabled = !text;
  }
  function clearExtraction() { if (resultKind === 'extract') result(); }
  function draw(pixels, width, height) {
    document.dispatchEvent(new Event('arg:imageviewchange'));
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(pixels), width, height), 0, 0);
  }
  function request(action, options = {}, source = image) {
    stop(); const current = task;
    return new Promise((resolve, reject) => {
      rejectTask = reject; worker = new Worker(new URL('./image-worker.js', import.meta.url), {type: 'module'});
      const timer = activeTimer = setTimeout(() => { if (current === task) { stop(); status('图片处理超时，请使用较小图片', true); } }, 45000);
      worker.onmessage = ({data}) => { clearTimeout(timer); if (current !== task) return; worker.terminate(); worker = null; rejectTask = null; data.error ? reject(Error(data.error)) : resolve(data.result); };
      worker.onerror = event => { event.preventDefault(); clearTimeout(timer); if (current !== task) return; rejectTask = null; stop(); reject(Error('图片分析线程出错，请重试')); };
      worker.postMessage({action, pixels: source.pixels, width: source.width, height: source.height, ...options});
    });
  }
  function viewFields() {
    const mode = $('image-mode').value;
    $('image-plane-field').hidden = !['r', 'g', 'b', 'a', 'rgb'].includes(mode);
    $('image-contrast-field').hidden = mode !== 'contrast';
    $('image-bit-label').textContent = $('image-bit').value === '0' ? '0（最低位）' : $('image-bit').value;
    $('image-contrast-label').textContent = $('image-contrast').value;
  }
  async function view() {
    viewFields(); if (!image) return; cancelAnalysis(); const captured = generation;
    try {
      const channel = $('image-mode').value, bit = +$('image-bit').value; status('正在生成图像…');
      if (channel === 'original') { stop(); draw(image.pixels, image.width, image.height); status('显示原始图片'); return; }
      const plane = ['r', 'g', 'b', 'a', 'rgb'].includes(channel);
      const pixels = await request(plane ? (engine === 'steg' ? 'steg-plane' : 'aperi-plane') : 'adjust', {channel, bit, mode: channel, contrast: +$('image-contrast').value});
      if (captured !== generation) return; draw(pixels, image.width, image.height);
      status(plane ? `${engine === 'steg' ? 'StegOnline' : 'AperiSolve'} · ${channels[channel]}通道，第 ${bit} 位` : '图像调整 · ' + $('image-mode').selectedOptions[0].textContent);
    } catch (error) { captureFailure(error);if (captured === generation && error.message !== '任务已取消') status(error.message, true); }
  }
  function applyEngine(name) {
    engine = name; stop(); cancelAnalysis();
    $('image-view-controls').hidden = name === 'inspect'; $('image-gallery').hidden = name !== 'aperi';
    $('image-mode').querySelector('[value=rgb]').hidden = name === 'steg';
    if (name === 'steg' && $('image-mode').value === 'rgb') $('image-mode').value = 'r';
    if (renderEngine && name !== 'inspect' && image) view(); else viewFields();
  }
  const engineBar = document.querySelector('.image-engine-tabs');
  const engineTabs = tabsController(engineBar, [...engineBar.querySelectorAll('[data-image-engine]')].map(button =>
    [button.dataset.imageEngine, button.textContent, $(button.getAttribute('aria-controls')), button]), {initial:'basic',onSelect:applyEngine});
  function selectEngine(name, {render = true} = {}) {
    renderEngine = render;
    try { return engineTabs.select(name); }
    finally { renderEngine = true; }
  }
  const table = $('steg-bit-table');
  for (const channel of 'rgba') {
    const row = uiElement('div'); row.className = 'steg-bit-row'; const label = uiElement('span'); label.textContent = channels[channel]; row.append(label);
    for (let bit = 7; bit >= 0; bit--) {
      const cell = uiElement('label'), input = uiElement('input'); input.type = 'checkbox'; input.dataset.channel = channel; input.dataset.bit = bit;
      input.checked = channel === 'r' && bit === 0; input.setAttribute('aria-label', `${channels[channel]}第 ${bit} 位`); cell.append(input, document.createTextNode(String(bit))); row.append(cell);
    }
    table.append(row);
  }
  function extractionChanged() { stop(); clearExtraction(); if (image) status('提取参数已更改，请重新提取'); }
  function preset() {
    const choice = $('lsb-preset').value, bit = +$('lsb-simple-bit').value;
    if (choice !== 'custom') {
      for (const box of table.querySelectorAll('input')) box.checked = choice.includes(box.dataset.channel) && +box.dataset.bit === bit;
      $('lsb-channels').value = choice === 'bgr' ? 'bgra' : choice === 'a' ? 'argb' : 'rgba';
    }
    extractionChanged();
  }
  $('lsb-preset').onchange = preset; $('lsb-simple-bit').onchange = preset;
  table.onchange = () => { $('lsb-preset').value = 'custom'; extractionChanged(); };
  for (const id of ['lsb-channels', 'lsb-pixel-order', 'lsb-bit-order', 'lsb-trim']) $(id).onchange = extractionChanged;
  $('lsb-offset').oninput = extractionChanged;
  async function load(file, {isCurrent=()=>true}={}) {
    if(!isCurrent())return false;
    document.dispatchEvent(new Event('arg:imagechange'));
    const current = ++generation; stop(); cancelAnalysis(); image = null; result(); ready(false); $('image-gallery').replaceChildren(); $('image-empty').hidden = false;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); $('image-info').textContent = '正在读取：' + file.name; status('正在读取图片…');
    try {
      if (file.size > 32 * 1024 * 1024) throw Error('图片文件超过 32 MB');
      const buffer = await file.arrayBuffer(); if (current !== generation || !isCurrent()) return false; const raw = new Uint8Array(buffer);
      let pixels, width, height, method;
      if (raw[0] === 137 && raw[1] === 80 && raw[2] === 78 && raw[3] === 71) {
        const pngBytes = pngImageBytes(raw);
        await pngDecoder(); if (current !== generation || !isCurrent()) return false;
        const png = new window.PngToy({doCRC: true}), url = URL.createObjectURL(new Blob([pngBytes], {type: 'image/png'}));
        try { await png.fetch(url); const decoded = await png.decode(), rgba = await png.convertToRGBA(decoded, {useGamma: false, ignoreAspectRatio: true}); pixels = new Uint8ClampedArray(rgba.bitmap); width = rgba.width; height = rgba.height; method = 'PNG 原始像素（PngToy）'; }
        finally { URL.revokeObjectURL(url); }
      } else {
        let bitmap; try { bitmap = await createImageBitmap(file, {imageOrientation: 'none', premultiplyAlpha: 'none', colorSpaceConversion: 'none'}); }
        catch { throw Error('无法读取图片，请选择有效的 PNG、JPEG、GIF 或 WebP'); }
        try {
          width = bitmap.width; height = bitmap.height; if (width * height > 8_000_000) throw Error('图片超过 8 百万像素');
          const source = uiElement('canvas'); source.width = width; source.height = height; source.getContext('2d').drawImage(bitmap, 0, 0);
          pixels = source.getContext('2d').getImageData(0, 0, width, height).data; method = '浏览器解码像素';
        } finally { bitmap.close(); }
      }
      if (current !== generation || !isCurrent()) return false; image = {pixels, width, height, file}; $('image-info').textContent = `${file.name} · ${width} × ${height} · ${(file.size / 1024).toFixed(1)} KB · ${method}`;
      $('image-empty').hidden = true; $('image-mode').value = 'original'; viewFields(); draw(pixels, width, height); ready(true); status('图片已载入'); document.dispatchEvent(new Event('arg:imageready'));return true;
    } catch (error) { captureFailure(error);if (current === generation && isCurrent()) { $('image-info').textContent = '未载入：' + file.name; status(typeof error === 'string' ? 'PNG 解码失败：' + error : error.message, true); } return false; }
  }
  const zone = $('image-input').closest('.upload-zone');
  $('image-input').onchange = event => { const file = event.target.files[0]; event.target.value = ''; if (file) load(file); };
  zone.ondragover = event => { event.preventDefault(); zone.classList.add('dragover'); }; zone.ondragleave = () => zone.classList.remove('dragover');
  zone.ondrop = event => { event.preventDefault(); zone.classList.remove('dragover'); const file = event.dataTransfer.files[0]; if (file) load(file); };
  $('image-view').onclick = view; $('image-mode').onchange = view; $('image-bit').oninput = view; $('image-contrast').oninput = view;
  $('image-remap').onclick = async () => {
    if (!image) return; cancelAnalysis(); const current = generation;
    try { status('正在重映射颜色…'); const map = crypto.getRandomValues(new Uint8Array(256)), pixels = await request('remap', {map}); if (current === generation) { draw(pixels, image.width, image.height); status('AperiSolve · 随机颜色重映射，透明度已保留'); } }
    catch (error) { captureFailure(error);if (current === generation && error.message !== '任务已取消') status(error.message, true); }
  };
  $('image-overview').onclick = async () => {
    if (!image) return; cancelAnalysis(); const current = generation, source = image, gallery = $('image-gallery'); gallery.replaceChildren(); gallery.hidden = false; $('image-overview').disabled = true;
    const ratio = Math.min(1, 160 / Math.max(source.width, source.height)), width = Math.max(1, Math.round(source.width * ratio)), height = Math.max(1, Math.round(source.height * ratio)), pixels = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const offset = (Math.min(source.height - 1, Math.floor(y / ratio)) * source.width + Math.min(source.width - 1, Math.floor(x / ratio))) * 4; pixels.set(source.pixels.subarray(offset, offset + 4), (y * width + x) * 4); }
    try {
      for (const channel of ['rgb', 'r', 'g', 'b', 'a']) for (let bit = 0; bit < 8; bit++) {
        status(`正在生成图层总览 · ${gallery.children.length + 1} / 40`); const plane = await request('aperi-plane', {channel, bit}, {pixels, width, height}); if (current !== generation || engine !== 'aperi') return;
        const button = uiElement('button'); button.className = 'image-plane-card'; const thumbnail = uiElement('canvas'); thumbnail.width = width; thumbnail.height = height;
        thumbnail.getContext('2d').putImageData(new ImageData(plane, width, height), 0, 0); button.append(thumbnail, document.createTextNode(`${channels[channel]} · 第 ${bit} 位`));
        button.onclick = () => { $('image-mode').value = channel; $('image-bit').value = bit; view(); canvas.scrollIntoView({block: 'center', behavior: 'smooth'}); }; gallery.append(button);
      }
      status('已生成 40 个图层 · 点击图层查看原尺寸');
    } catch (error) { captureFailure(error);if (current === generation && error.message !== '任务已取消') status(error.message, true); }
    finally { if (current === generation) $('image-overview').disabled = !image; }
  };
  $('lsb-run').onclick = async () => {
    if (!image) return; cancelAnalysis(); result(); const current = generation;
    try {
      const selectedBits = {r: [], g: [], b: [], a: []}; for (const box of table.querySelectorAll('input:checked')) selectedBits[box.dataset.channel].push(+box.dataset.bit);
      status('正在使用 StegOnline 提取数据…'); const data = await request('extract', {selectedBits, pixelOrder: $('lsb-pixel-order').value, bitOrder: $('lsb-bit-order').value, channelOrder: $('lsb-channels').value, trim: $('lsb-trim').checked, offset: Number($('lsb-offset').value)});
      if (current !== generation) return;
      result(`提取 ${data.length} 个完整字节\n\nUTF-8 预览：\n${new TextDecoder().decode(data.slice(0, 2048))}\n\n十六进制预览：\n${hexDump(data.slice(0, 2048))}`, 'extract', 'StegOnline 隐写提取', data);
      status('提取完成 · 无隐藏数据时也可能出现随机字节');
    } catch (error) { captureFailure(error);if (current === generation && error.message !== '任务已取消') status(error.message, true); }
  };
  async function analyze(kind) {
    if (!image || analysisBusy) return; stop(); cancelAnalysis(); result(); analysisBusy = true; ready(true);
    const revision = analysisRevision, captured = generation;
    try {
      const timeout = new Promise((_, reject) => { analysisTimer = setTimeout(() => { inspector.cancel(); reject(Error('图片分析超时，请使用较小图片并重试')); }, 60000); });
      const output = await Promise.race([inspector.run(kind, image, {source: $('image-analysis-source').value, canvas, progress: text => { if (revision === analysisRevision && captured === generation) status(text); }}), timeout]);
      if (revision !== analysisRevision || captured !== generation) return;
      result(output.text, kind, output.label);
      if(kind==='qr'&&!output.found){handoffResult=null;next.disabled=true;}
      status(kind === 'png' ? '数据块读取完成' : kind === 'exif' ? '元数据读取完成' : (output.found ? '二维码识别完成' : '未找到二维码'));
    } catch (error) { captureFailure(error);if (revision === analysisRevision && captured === generation) status(error.message, true); }
    finally { if (revision === analysisRevision) { clearTimeout(analysisTimer); analysisBusy = false; ready(!!image); } }
  }
  for (const kind of ['qr', 'exif', 'png']) $('image-' + kind).onclick = () => analyze(kind);
  $('image-analysis-cancel').onclick = () => { cancelAnalysis(); result(); status('已停止图片分析'); };
  for (const id of ['image-analysis-source']) $(id).onchange = () => { cancelAnalysis(); if (resultKind === 'qr') result(); if (image) status('识别设置已更改，请重新分析'); };
  $('lsb-download').onclick = () => bytes && download(bytes, 'stegonline-extracted.bin', 'application/octet-stream');
  $('image-save-text').onclick = () => download($('image-output').value, 'image-analysis.txt', 'text/plain;charset=utf-8');
  $('image-download').onclick = () => canvas.toBlob(blob => { if (blob) download(blob, 'image-analysis.png', 'image/png'); });
  $('image-copy').onclick = async () => { try { await navigator.clipboard.writeText($('image-output').value); status('结果已复制'); } catch { status('复制失败，请选中结果手动复制', true); } };
  window.addEventListener('pagehide', () => { stop(); cancelAnalysis(); });
  ready(false); selectEngine('basic');
  return {
    getImage: () => image, load, selectEngine,
    getRevision: () => ({generation,viewRevision}),
    getCurrentView: () => image ? {pixels:canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,width:canvas.width,height:canvas.height,generation,viewRevision} : null,
    cancelTask() { stop(); cancelAnalysis(); result(); status(image ? '图片已载入' : ''); },
  };
}
