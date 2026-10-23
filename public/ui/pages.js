import {ToolPanel, Box} from './layout.js';
import {Link} from './controls.js';
import {render} from './template.js';

// Page composition only; controls, fields and surfaces instantiate shared factories.
export function CyberchefPage() {
  const panel = ToolPanel({id: "panel-cyberchef", className: 'panel', hidden: true});
  render(panel, `
        <div class="page-heading" data-index="01"><div><p class="eyebrow">// 01. 密码 / 编码与处理链</p><h1>CyberChef 完整处理链</h1></div><span class="page-tag">密码 · 编码 · 组合处理链</span></div>
        <div class="chef-intro"><p>选择操作并调整参数，构建处理链。输入和结果直接显示在本站，点击「执行处理链」开始转换。</p></div>
        <div id="cyberchef-stage" class="chef-stage">
          <div class="chef-toolbar"><span class="chef-version">CyberChef v11.5.0 <span class="chef-local">/ 本地运算</span></span><div><button id="chef-run" class="primary-button" disabled>执行处理链 ▶</button><button id="chef-cancel" class="secondary-button" hidden>停止执行</button></div></div>
          <div id="chef-tabs" class="chef-tabs" role="tablist" aria-label="CyberChef 完整处理链"><button role="tab" data-pane="operations" aria-controls="chef-pane-operations">操作</button><button role="tab" data-pane="recipe" aria-controls="chef-pane-recipe">处理链</button><button role="tab" data-pane="input" aria-controls="chef-pane-input">输入</button><button role="tab" data-pane="output" aria-controls="chef-pane-output">结果</button></div>
          <div class="chef-workspace">
            <section id="chef-pane-operations" class="chef-pane chef-library" aria-label="操作目录"><div class="chef-pane-heading"><h2>操作目录</h2></div><label class="search-field"><span aria-hidden="true">⌕</span><input id="chef-search" type="search" placeholder="搜索操作，例如解码、Base64" aria-label="搜索操作"></label><select id="chef-category" aria-label="操作分类"><option value="all">全部操作</option></select><p id="chef-operation-count" class="help">正在加载操作…</p><div id="chef-operations" class="chef-operation-list"></div></section>
            <section id="chef-pane-recipe" class="chef-pane" aria-label="处理链"><div class="chef-pane-heading"><h2>处理链 <small id="chef-step-count">0 步</small></h2><button id="chef-clear-recipe" class="quiet-button">清空</button></div><ol id="chef-recipe" class="chef-recipe"></ol><details class="chef-saved-tools"><summary>保存与导入配方</summary><label>配方名称<input id="chef-save-name" maxlength="100" placeholder="例如：线索解码"></label><button id="chef-save" class="secondary-button">保存到本机</button><select id="chef-saved" aria-label="已保存的配方"><option value="">选择已保存配方…</option></select><button id="chef-load" class="secondary-button">载入配方</button><div class="button-row wrap"><button id="chef-export-recipe" class="quiet-button">导出 JSON</button><label class="chef-file-button">导入 JSON<input id="chef-import-recipe" type="file" accept=".json,application/json"></label></div></details></section>
            <div class="chef-io">
              <section id="chef-pane-input" class="chef-pane" aria-label="输入"><div class="chef-pane-heading"><h2>输入</h2><div class="button-row"><label class="chef-file-button">载入文件<input id="chef-file" type="file"></label><button id="chef-clear-input" class="quiet-button">清空</button></div></div><textarea id="chef-input" spellcheck="false" aria-label="CyberChef 完整处理链输入" placeholder="粘贴需要转换的内容…"></textarea><p id="chef-input-info" class="help">0 字节 · UTF-8</p></section>
              <section id="chef-pane-output" class="chef-pane" aria-label="结果"><div class="chef-pane-heading"><h2>结果</h2><span id="chef-output-info" class="help">等待执行</span></div><textarea id="chef-output" readonly spellcheck="false" aria-label="CyberChef 完整处理链结果" placeholder="执行后的结果会显示在这里"></textarea><div class="button-row wrap"><button id="chef-copy" class="quiet-button" disabled>复制结果</button><button id="chef-download" class="quiet-button" disabled>下载原始字节</button><button id="chef-to-input" class="quiet-button" disabled>结果作为输入</button></div></section>
            </div>
          </div>
          <div class="chef-status-row"><p id="cyberchef-status" class="status" role="status" aria-live="polite">正在准备 CyberChef…</p><button id="cyberchef-retry" class="secondary-button" hidden>重试</button></div>
        </div>

        <footer class="tool-provenance" aria-label="使用的具体项目"><p class="micro-label">// 所用项目与来源</p><ul><li><a href="https://github.com/gchq/CyberChef" target="_blank" rel="noopener noreferrer">CyberChef v11.5.0 ↗</a><span>密码、编码及处理链运算引擎</span></li></ul></footer>
      `);
  return panel;
}

export function ImagePage() {
  const panel = ToolPanel({id: "panel-image", className: 'panel', hidden: true});
  render(panel, `
        <div class="page-heading" data-index="02"><div><p class="eyebrow">// 02. 图片观察与线索提取</p><h1>图片分析</h1></div><span class="page-tag">图像调整 · 隐写 · 文字与信息</span></div>
        <div class="surface">
          <label class="upload-zone" for="image-input"><span class="upload-symbol" aria-hidden="true">▧</span><strong>选择或拖入图片</strong><span>PNG、JPEG、GIF、WebP · 最多 32 MB / 8 百万像素</span><input id="image-input" type="file" accept="image/png,image/jpeg,image/gif,image/webp"></label>
          <p id="image-info" class="file-info">尚未选择图片</p>
          <div class="image-engine-tabs" role="tablist" aria-label="图片分析功能">
            <button id="image-tab-basic" data-image-engine="basic" role="tab" aria-controls="basic-controls" aria-selected="true">图像调整</button>
            <button id="image-tab-aperi" data-image-engine="aperi" role="tab" aria-controls="aperi-controls" aria-selected="false">AperiSolve 图层</button>
            <button id="image-tab-steg" data-image-engine="steg" role="tab" aria-controls="steg-controls" aria-selected="false">StegOnline 提取</button>
            <button id="image-tab-inspect" data-image-engine="inspect" role="tab" aria-controls="inspect-controls" aria-selected="false">二维码与信息</button>
          </div>
          <div class="media-layout">
            <div class="canvas-area"><canvas id="image-canvas" width="720" height="460" aria-label="图片分析预览"></canvas><span id="image-empty" class="canvas-empty">选择图片后观察图像、提取隐写或读取信息</span></div>
            <div class="inspector">
              <div id="image-view-controls">
                <h2>图像预览</h2>
                <label>显示方式<select id="image-mode"><optgroup label="图像调整"><option value="original">原始图片</option><option value="red">红色通道</option><option value="green">绿色通道</option><option value="blue">蓝色通道</option><option value="alpha">透明度通道</option><option value="gray">灰度</option><option value="invert">反色</option><option value="contrast">增强对比度</option></optgroup><optgroup label="位平面"><option value="rgb">RGB 位平面叠加</option><option value="r">红色位平面</option><option value="g">绿色位平面</option><option value="b">蓝色位平面</option><option value="a">透明度位平面</option></optgroup></select></label>
                <label id="image-plane-field">位平面 <span id="image-bit-label">0（最低位）</span><input id="image-bit" type="range" min="0" max="7" value="0"></label>
                <label id="image-contrast-field" hidden>对比度 <span id="image-contrast-label">90</span><input id="image-contrast" type="range" min="-150" max="200" value="90"></label>
                <div class="image-view-actions"><button id="image-view" class="secondary-button" disabled>显示图像</button><button id="image-download" class="secondary-button" disabled>下载当前视图</button></div>
              </div>
              <div id="basic-controls" role="tabpanel" aria-labelledby="image-tab-basic"></div>
              <div id="aperi-controls" role="tabpanel" aria-labelledby="image-tab-aperi" hidden><div class="rule"></div><h2>AperiSolve 图层</h2><button id="image-overview" class="secondary-button" disabled>生成 40 个图层总览</button><button id="image-remap" class="secondary-button" disabled>随机重映射颜色</button></div>
              <div id="steg-controls" role="tabpanel" aria-labelledby="image-tab-steg" hidden>
                <div class="rule"></div><h2>StegOnline 隐写提取</h2>
                <div class="image-settings-grid"><label>快速选择通道<select id="lsb-preset"><option value="r">红色 R</option><option value="rgb">RGB</option><option value="g">绿色 G</option><option value="b">蓝色 B</option><option value="a">透明度 A</option><option value="rgba">RGBA</option><option value="bgr">BGR</option><option value="custom">自定义选位</option></select></label><label>快速选择位平面<select id="lsb-simple-bit"><option value="0">0（最低位）</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></label></div>
                <div id="steg-bit-table" class="steg-bit-table" aria-label="选择要提取的位平面"></div>
                <div class="image-settings-grid"><label>通道顺序<select id="lsb-channels"><option value="rgba">R → G → B → A</option><option value="bgra">B → G → R → A</option><option value="grba">G → R → B → A</option><option value="argb">A → R → G → B</option></select></label><label>像素遍历<select id="lsb-pixel-order"><option value="Row">按行</option><option value="Column">按列</option></select></label><label>同一通道内位序<select id="lsb-bit-order"><option value="MSB">高位优先</option><option value="LSB">低位优先</option></select></label><label>起始字节<input id="lsb-offset" type="number" min="0" step="1" value="0" inputmode="numeric"></label></div>
                <label class="check-inline"><input id="lsb-trim" type="checkbox">移除末尾零字节</label><button id="lsb-run" class="primary-button" disabled>提取数据</button>
              </div>
              <div id="inspect-controls" role="tabpanel" aria-labelledby="image-tab-inspect" hidden>
                <h2>二维码与文件信息</h2><label>二维码识别来源<select id="image-analysis-source"><option value="original">原始图片</option><option value="view">当前视图</option></select></label>
                <div class="image-analysis-actions"><button id="image-qr" class="secondary-button" disabled>识别二维码</button><button id="image-exif" class="secondary-button" disabled>查看 EXIF 元数据</button><button id="image-png" class="secondary-button" disabled>查看 PNG 数据块</button></div><button id="image-analysis-cancel" class="secondary-button" hidden>停止分析</button>

              </div>
            </div>
          </div>
          <div id="image-gallery" class="image-plane-gallery" hidden></div>
          <div class="image-result-heading"><label class="field-label" for="image-output">分析结果</label><span id="image-result-kind" class="help">等待分析</span></div>
          <textarea id="image-output" class="standalone-editor" readonly aria-label="图片分析结果"></textarea>
          <div class="button-row wrap"><button id="image-copy" class="quiet-button" disabled>复制结果</button><button id="image-save-text" class="quiet-button" disabled>下载文本结果</button><button id="lsb-download" class="quiet-button" disabled>下载提取字节</button></div><p id="image-status" class="status" role="status" aria-live="polite"></p>
        </div>

        <footer class="tool-provenance" aria-label="使用的具体项目"><p class="micro-label">// 所用项目与来源</p><ul>
          <li><a href="https://github.com/Zeecka/AperiSolve" target="_blank" rel="noopener noreferrer">AperiSolve</a><span>本地位平面分解、RGB 叠加和颜色重映射</span></li>
          <li><a href="https://github.com/Ge0rg3/StegOnline" target="_blank" rel="noopener noreferrer">StegOnline</a><span>位平面浏览、多位 LSB 提取与 PNG 原始像素解码（PngToy）</span></li>
          <li><a href="https://github.com/cozmo/jsQR" target="_blank" rel="noopener noreferrer">jsQR 1.4.0</a><span>二维码识别</span></li>
          <li><a href="https://github.com/MikeKovarik/exifr" target="_blank" rel="noopener noreferrer">exifr 7.1.3</a><span>EXIF / XMP / IPTC / GPS 元数据读取</span></li>
          <li><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API" target="_blank" rel="noopener noreferrer">浏览器 Canvas API</a><span>原始通道、灰度、反色、对比度和 PNG 数据块界面</span></li>
        </ul></footer>
      `);
  return panel;
}

export function AudioPage() {
  const panel = ToolPanel({id: "panel-audio", className: 'panel', hidden: true});
  render(panel, `
        <div class="page-heading" data-index="03"><div><p class="eyebrow">// 03. AUDIO & SIGNALS</p><h1>音频分析</h1></div><span class="page-tag">波形 · 频谱 · 倒放</span></div>
        <div class="surface"><label class="upload-zone" for="audio-input"><span class="upload-symbol" aria-hidden="true">∿</span><strong>选择或拖入音频</strong><span>浏览器支持的音频格式 · 最多 32 MB / 5 分钟</span><input id="audio-input" type="file" accept="audio/*"></label><p id="audio-info" class="file-info">尚未选择音频</p><audio id="audio-player" controls preload="metadata"></audio><div class="control-bar wrap"><label class="compact-label">速度<select id="audio-speed"><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><label class="compact-label">分析声道<select id="audio-channel" disabled><option value="mix">合并声道</option><option value="left">左 / 第一个声道</option><option value="right">右 / 第二个声道</option></select></label><button id="audio-reverse" class="secondary-button" disabled>倒放预览</button><button id="audio-dtmf" class="secondary-button" disabled>识别电话按键音</button></div><canvas id="waveform-canvas" class="waveform" width="1000" height="140" aria-label="音频波形，点击可跳转播放时间" tabindex="0"></canvas>
          <div class="spectrogram-controls"><label>FFT 大小<select id="fft-size"><option>512</option><option>1024</option><option selected>2048</option><option>4096</option><option>8192</option></select></label><label>最低频率 / Hz<input id="min-hz" type="number" min="0" value="0"></label><label>最高频率 / Hz<input id="max-hz" type="number" min="1" value="12000"></label><button id="audio-spectrum" class="primary-button" disabled>生成频谱图</button><button id="spectrum-download" class="secondary-button" disabled>下载频谱图</button></div><div class="spectrum-frame"><canvas id="spectrogram-canvas" width="900" height="256" aria-label="音频频谱图"></canvas></div><p id="spectrum-axis" class="help" hidden></p><div class="rule"></div><h2>导出音频片段</h2><div class="button-row wrap"><label class="compact-label">起点 / 秒<input id="audio-start" type="number" min="0" step="0.1" value="0"></label><label class="compact-label">终点 / 秒<input id="audio-end" type="number" min="0" step="0.1" value="0"></label><button id="audio-export" class="secondary-button" disabled>导出 WAV</button></div><div class="rule"></div><h2>生成摩斯音频</h2><div class="button-row wrap"><label class="compact-label grow">英文文本<input id="morse-audio-text" type="text" value="ARG TOOLS" maxlength="200"></label><label class="compact-label">速度 / WPM<input id="morse-wpm" type="number" min="5" max="50" value="18"></label><button id="morse-audio-save" class="secondary-button">生成并下载 WAV</button></div><label class="field-label" for="audio-output">信号识别结果</label><textarea id="audio-output" class="standalone-editor" readonly></textarea><p id="audio-status" class="status" role="status"></p>
        </div>
        <footer class="tool-provenance" aria-label="使用的具体项目"><p class="micro-label">// 所用项目与来源</p><ul><li><a href="https://github.com/indutny/fft.js" target="_blank" rel="noopener noreferrer">fft.js 4.0.4 ↗</a><span>频谱与 DTMF 分析中的 FFT 运算</span></li></ul></footer>
      `);
  return panel;
}

export function FilePage() {
  const panel = ToolPanel({id: "panel-file", className: 'panel', hidden: true});
  render(panel, `
        <div class="page-heading" data-index="04"><div><p class="eyebrow">// 04. FILE INSPECTION</p><h1>文件检查</h1></div><span class="page-tag">文件头 · 字符串 · 摘要</span></div>
        <div class="surface"><label class="upload-zone" for="file-input"><span class="upload-symbol" aria-hidden="true">01</span><strong>选择或拖入文件</strong><span>最多 32 MB · 仅分析字节，不执行文件</span><input id="file-input" type="file"></label><div id="file-stats" class="stats-grid"></div><div class="button-row wrap"><button id="file-hash" class="secondary-button" disabled>计算 SHA-256</button><button id="file-strings" class="secondary-button" disabled>提取可打印字符串</button><label class="compact-label">十六进制起始偏移<input id="hex-offset" type="number" min="0" step="16" value="0"></label><button id="file-hex" class="secondary-button" disabled>查看字节</button></div><label class="field-label" for="file-output">检查结果</label><textarea id="file-output" class="standalone-editor hex-editor" readonly></textarea><button id="file-copy" class="quiet-button">复制结果</button><p id="file-status" class="status" role="status"></p></div>
        <footer class="tool-provenance" aria-label="使用的具体项目"><p class="micro-label">// 所用项目与来源</p><ul><li><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Crypto_API" target="_blank" rel="noopener noreferrer">浏览器 Web API</a><span>文件、字节分析与 Web Crypto 哈希</span></li></ul></footer>
      `);
  return panel;
}

export function SymbolsPage() {
  const panel = ToolPanel({id: "panel-symbols", className: 'panel', hidden: true});
  render(panel, `
        <div class="page-heading" data-index="05"><div><p class="eyebrow">// 05. SYMBOL REFERENCE</p><h1>符号对照</h1></div><span class="page-tag">摩斯与英文盲文</span></div>
        <div class="surface"><h2>六点盲文</h2><div class="symbol-compose"><div id="braille-dots" class="braille-dots" role="group" aria-label="六点盲文输入"></div><div class="symbol-result" role="status" aria-live="polite" aria-atomic="true"><span class="symbol-result-label">识读结果</span><span id="braille-symbol" aria-hidden="true">⠀</span><strong id="braille-letter">空白</strong></div></div><div class="rule"></div><h2>常用符号表</h2><div id="symbol-table" class="symbol-table"></div></div>
        <footer class="tool-provenance" aria-label="使用的具体项目"><p class="micro-label">// 所用项目与来源</p><ul><li><a href="https://github.com/kfarnung/puzzle-lib" target="_blank" rel="noopener noreferrer">puzzle-lib 1.7.0 ↗</a><span>摩斯与英文六点盲文映射</span></li></ul></footer>
      `);
  return panel;
}

export function mountInitialLayout() {
  const skip = Link({className: 'skip', text: '跳到工具内容', attrs: {href: '#main'}});
  const header = Box({tag: 'header', className: 'site-header'});
  const sidebar = Box({tag: 'aside', id: 'sidebar', className: 'sidebar'});
  const main = Box({tag: 'main', id: 'main', attrs: {tabindex: '-1'}});
  main.append(CyberchefPage(), ImagePage(), AudioPage(), FilePage(), SymbolsPage());
  const layout = Box({className: 'layout', children: [sidebar, main]});
  document.body.replaceChildren(skip, header, layout);
}
