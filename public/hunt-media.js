import { takeWorker } from './prepared-worker.js';
import { insert as uiInsert, element as uiElement, onDisconnect } from './ui/index.js';
import { mountVideo } from './video/index.js';
import { download } from './hunt-tools.js';
import { resultRecording, canvasRecord } from './result-recording.js';
const $ = (id) => document.getElementById(id);
export function initHuntMedia(ui, getImage, getAudio, { beginBarcode } = {}) {
  const { button, status, action } = ui;
  uiInsert(
    document.querySelector('#inspect-controls'),
    'beforeend',
    '<div class="rule"></div><h2>条码识别</h2><button id="barcode-read" class="secondary-button">识别二维码与条形码</button>',
  );
  uiInsert(
    document.querySelector('#basic-controls'),
    'beforeend',
    '<div class="rule"></div><h2>立体图隐藏轮廓</h2><label class="hunt-field">水平位移 / 像素<input id="stereo-shift" type="number" min="1" value="80"></label><div class="button-row wrap"><button id="stereo-auto" class="secondary-button">自动检测位移</button><button id="stereo-view" class="secondary-button">显示隐藏轮廓</button></div>',
  );
  uiInsert(
    document.querySelector('#panel-image .tool-provenance ul'),
    'beforeend',
    '<li><a href="https://github.com/piellardj/stereogram-solver" target="_blank" rel="noopener noreferrer">stereogram-solver</a><span>立体图周期检测与位移差分 · MIT</span></li><li><a href="https://github.com/Sec-ant/zxing-wasm" target="_blank" rel="noopener noreferrer">zxing-wasm</a> · <a href="https://github.com/zxing-cpp/zxing-cpp" target="_blank" rel="noopener noreferrer">ZXing-C++</a><span>多制式条码读取 · MIT / Apache-2.0</span></li>',
  );
  let barcode,
    barcodeRevision = 0,
    barcodeLease = null,
    barcodeDisposed = false;
  const invalidateBarcode = () => {
    barcodeRevision++;
    barcodeLease?.clear();
    barcodeLease = null;
  };
  for (const event of ['arg:imagechange', 'arg:imageviewchange'])
    document.addEventListener(event, invalidateBarcode);
  $('image-analysis-source').addEventListener('change', invalidateBarcode);
  const barcodeTaskChanged = ({ detail }) => {
    if (detail?.panel === 'image') invalidateBarcode();
  };
  document.addEventListener('arg:nativetaskchange', barcodeTaskChanged);
  const barcodeButton = $('barcode-read'),
    barcodeSource = $('image-analysis-source');
  barcodeButton.disabled = !getImage();
  action('barcode-read', 'image-status', async () => {
    const image = getImage();
    if (!image) throw Error('请先选择图片。');
    if (typeof beginBarcode !== 'function') throw Error('条码结果接口尚未就绪，请重新进入工具。');
    invalidateBarcode();
    const revision = barcodeRevision,
      lease = (barcodeLease = beginBarcode()),
      current = () =>
        !barcodeDisposed &&
        revision === barcodeRevision &&
        getImage() === image &&
        lease.isCurrent();
    try {
      $('image-status').textContent = '正在载入条码引擎…';
      barcode ||= import('./vendor/hunt/zxing/index.js');
      const z = await barcode;
      if (!current()) return;
      z.prepareZXingModule({
        overrides: {
          locateFile: (path) => new URL('./vendor/hunt/zxing/' + path, import.meta.url).href,
        },
      });
      const input =
        $('image-analysis-source').value === 'view'
          ? $('image-canvas')
              .getContext('2d')
              .getImageData(0, 0, $('image-canvas').width, $('image-canvas').height)
          : new ImageData(new Uint8ClampedArray(image.pixels), image.width, image.height);
      const rows = await z.readBarcodes(input, { tryHarder: true });
      if (!current()) return;
      if (
        lease.publish(
          rows.length ? rows.map((x) => `${x.format}\n${x.text}`).join('\n\n') : '',
          '多制式条码',
        )
      )
        $('image-status').textContent = rows.length
          ? `识别完成：${rows.length} 个条码。`
          : '未识别到条码。';
    } catch (error) {
      barcode = null;
      if (current()) {
        lease.clear();
        throw error;
      }
    } finally {
      if (barcodeLease === lease) barcodeLease = null;
    }
  });
  onDisconnect(barcodeButton, () => {
    barcodeDisposed = true;
    invalidateBarcode();
    for (const event of ['arg:imagechange', 'arg:imageviewchange'])
      document.removeEventListener(event, invalidateBarcode);
    barcodeSource.removeEventListener('change', invalidateBarcode);
    document.removeEventListener('arg:nativetaskchange', barcodeTaskChanged);
  });
  let stereoWorker;
  async function stereo(auto) {
    const image = getImage();
    if (!image) throw Error('请先选择图片。');
    const shift = +$('stereo-shift').value;
    if (!auto && (!Number.isInteger(shift) || shift < 1 || shift >= image.width))
      throw Error('位移必须小于图片宽度。');
    stereoWorker?.terminate();
    const w = (stereoWorker = takeWorker(new URL('./stereo-worker.js', import.meta.url), {
      type: 'module',
    }));
    $('image-status').textContent = '正在分析立体图…';
    w.onmessage = ({ data }) => {
      w.terminate();
      if (getImage() !== image || stereoWorker !== w) return;
      if (data.error) {
        $('image-status').textContent = data.error;
        return;
      }
      $('stereo-shift').value = data.shift;
      document.dispatchEvent(new Event('arg:imageviewchange'));
      const canvas = $('image-canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      canvas
        .getContext('2d')
        .putImageData(new ImageData(data.pixels, image.width, image.height), 0, 0);
      $('image-status').textContent = `立体图差分 · 水平位移 ${data.shift} 像素`;
    };
    w.onerror = () => {
      if (stereoWorker === w) $('image-status').textContent = '立体图分析失败。';
      w.terminate();
    };
    w.postMessage({ image, shift, auto });
  }
  action('stereo-auto', 'image-status', () => stereo(true));
  action('stereo-view', 'image-status', () => stereo(false));
  uiInsert(
    document.querySelector('#panel-audio .tool-provenance'),
    'beforebegin',
    `<div class="hunt-extraction"><h2>SSTV 声音还原图片</h2><div class="button-row wrap">${button('sstv-run', '解码 SSTV')}<button id="sstv-stop">停止</button><button id="sstv-download" disabled>下载图片</button></div>${status('sstv-status')}<canvas id="sstv-canvas" width="320" height="240" hidden aria-label="SSTV 解码图片"></canvas></div>`,
  );
  uiInsert(
    document.querySelector('#panel-audio .tool-provenance ul'),
    'beforeend',
    '<li><a href="https://github.com/Equinoxis/sstv-decoder" target="_blank" rel="noopener noreferrer">SSTV Decoder</a><span>浏览器音频解码为图片；README 声明 MIT</span></li>',
  );
  const sstvRecording = resultRecording({
    id: 'sstv-result',
    anchor: $('sstv-canvas'),
    source: 'image',
    onLeave: () => stopSstv(),
  });
  let sstv, stimer;
  function stopSstv() {
    sstvRecording.clear();
    clearTimeout(stimer);
    sstv?.terminate();
    sstv = null;
    $('sstv-download').disabled = true;
    $('sstv-canvas').hidden = true;
  }
  action('sstv-run', 'sstv-status', () => {
    stopSstv();
    const audio = getAudio();
    if (!audio) throw Error('请先在上方载入音频。');
    const w = (sstv = takeWorker(new URL('./vendor/hunt/sstv/worker/decoder.js', import.meta.url), {
      type: 'module',
    }));
    $('sstv-status').textContent = '正在寻找 SSTV 信号…';
    stimer = setTimeout(() => {
      if (sstv === w) {
        stopSstv();
        $('sstv-status').textContent = '解码超过 2 分钟，已停止；请截取信号片段重试。';
      }
    }, 120000);
    w.onmessage = ({ data }) => {
      if (sstv !== w || getAudio(false)?.generation !== audio.generation) {
        w.terminate();
        return;
      }
      if (data.error) {
        stopSstv();
        $('sstv-status').textContent = '未能解码 SSTV，请检查信号模式、音量或截取范围。';
        return;
      }
      if (data.progress !== undefined) {
        $('sstv-status').textContent = `解码中 · ${Math.round(data.progress)}%`;
        return;
      }
      clearTimeout(stimer);
      w.terminate();
      const c = $('sstv-canvas');
      c.width = data.width;
      c.height = data.height;
      c.getContext('2d').putImageData(
        new ImageData(new Uint8ClampedArray(data.imageData), data.width, data.height),
        0,
        0,
      );
      c.hidden = false;
      sstvRecording.publish(() => canvasRecord(c, 'SSTV.png'));
      $('sstv-download').disabled = false;
      $('sstv-status').textContent = `解码完成 · ${data.width} × ${data.height}`;
    };
    w.onerror = () => {
      stopSstv();
      $('sstv-status').textContent = 'SSTV 解码失败，请尝试较短的 WAV 文件。';
    };
    w.postMessage({ samples: audio.samples, sampleRate: audio.sampleRate, fftSize: null });
  });
  $('sstv-stop').onclick = () => {
    stopSstv();
    $('sstv-status').textContent = '已停止。';
  };
  $('sstv-download').onclick = () => $('sstv-canvas').toBlob((b) => b && download(b, 'SSTV.png'));
  document.addEventListener('arg:audiochange', () => {
    stopSstv();
    $('sstv-status').textContent = '';
  });
  document.addEventListener('arg:imagechange', () => stereoWorker?.terminate());
  document.addEventListener('arg:nativetaskchange', ({ detail }) => {
    if (detail.panel === 'image') {
      stereoWorker?.terminate();
      stereoWorker = null;
    }
    if (detail.panel === 'audio') {
      stopSstv();
      $('sstv-status').textContent = '';
    }
  });
  mountVideo({ ...ui, insertVideo: (html) => uiInsert($('main'), 'beforeend', html) });
}
