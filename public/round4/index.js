import {FilePicker} from '../ui/index.js';
import {collectToolHelpContent} from '../tool-help.js';
import { $, mount, source, status, button } from "./common.js";
const tools = [
  [
    "fragments",
    "碎片拼接台",
    "konvajs/konva",
    "Konva",
    "图片变换、叠放与拼接导出",
  ],
  [
    "chess",
    "棋谱复盘",
    "jhlywa/chess.js",
    "chess.js",
    "国际象棋规则、PGN 与 FEN",
  ],
  ["life", "生命游戏", "copy/life", "copy/life", "Hashlife 元胞演化引擎"],
  [
    "model",
    "三维模型观察",
    "mrdoob/three.js",
    "Three.js",
    "本地模型解析与三维渲染",
  ],
];
export function initRoundFour() {
  const states = new Map();
  for (const [id, title, repo, name, role] of tools) {
    const p = mount(
      id,
      title,
      `<div id="r4-${id}" class="r4-root"><p>正在准备本地工具…</p></div>${status(id + "-status")}${button(id + "-retry", "重新加载")}`,
      [source(name, repo, role)],
    );
    p.classList.add("r4-panel");
    $(id + "-retry").hidden = true;
    $(id + "-retry").onclick = () => load(id);
  }
  async function load(id) {
    if (!tools.some((t) => t[0] === id) || states.has(id)) return;
    states.set(id, "loading");
    $(id + "-retry").hidden = true;
    try {
      const mod = await import(`./${id}.js`);
      await mod.init($("r4-" + id));
      collectToolHelpContent(id);
      for (const file of $("r4-" + id).querySelectorAll("input[type=file]")) {
        const anchor = file.ownerDocument.createTextNode('');
        file.before(anchor);
        const wrap = FilePicker({tag:'div',className:'r4-upload',input:file,
          triggerLabel:file.multiple?'选择文件（可多选）':'选择文件'});
        // The component receives the original input, keeping files and listeners.
        anchor.replaceWith(wrap);
        file.classList.add("r4-file-hidden");
      }
      states.set(id, "ready");
    } catch (e) {
      states.delete(id);
      $(id + "-status").textContent =
        "工具加载失败，请重试。" + (e.message || "");
      $(id + "-retry").hidden = false;
    }
  }
  document.addEventListener("arg:panelchange", (e) => load(e.detail.name));
}
