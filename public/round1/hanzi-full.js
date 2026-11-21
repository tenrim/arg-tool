import {
  Box,
  Button,
  Card,
  DataList,
  Disclosure,
  Field,
  FormGrid,
  Input,
  Option,
  Select,
  Status,
  Textarea,
  Toolbar,
  onDisconnect,
  setTextareaValue,
  updateStatus,
} from '../ui/index.js';
import { resultRecording } from '../result-recording.js';
import { loadHanziResource } from './hanzi-resources.js';
export function mountHanziFull(panel, load) {
  const mode = Select({
      id: 'hanzi-full-mode',
      children: [
        Option('字形、拆字与逐笔观察', 'record'),
        Option('笔顺演示', 'draw'),
        Option('字词释义', 'explain'),
        Option('组词查询', 'words'),
      ],
    }),
    input = Input({ id: 'hanzi-full-input', value: '永' }),
    drawMode = Select({
      id: 'hanzi-draw-mode',
      children: [
        Option('静态笔顺', 'normal'),
        Option('逐笔动画', 'animation'),
        Option('逐笔分图', 'stroke'),
      ],
    }),
    run = Button({ text: '查看汉字' }),
    stop = Button({ text: '停止' }),
    prev = Button({ text: '上一笔' }),
    next = Button({ text: '下一笔' }),
    status = Status({}),
    host = Box({ className: 'hanzi-native-drawing' }),
    summary = Box({}),
    output = Textarea({
      id: 'hanzi-full-output',
      attrs: { readonly: true, 'aria-label': '完整汉字字典与笔画记录' },
      autoSize: true,
      maxRows: 18,
    });
  const drawField = Field({ label: '笔顺显示方式', control: drawMode }),
    animation = Button({ text: '开始／继续笔顺动画' }),
    pause = Button({ text: '暂停动画' }),
    step = Button({ text: '绘制下一笔' }),
    animationBar = Toolbar({ children: [animation, pause, step] });
  const root = Card({
    id: 'hanzi-full',
    title: '字形、笔画与字词',
    children: [
      FormGrid({
        children: [
          Field({ label: '查看内容', control: mode }),
          Field({ label: '汉字或词语', control: input }),
          drawField,
        ],
      }),
      Toolbar({ children: [run, stop, prev, next] }),
      animationBar,
      status,
      host,
      summary,
      Disclosure({ children: [Box({ tag: 'summary', text: '完整原始字典与笔画数据' }), output] }),
    ],
  });
  panel.querySelector('.tool-provenance').before(root);
  let revision = 0,
    controller,
    drawController,
    graphics,
    drawings = [],
    index = 0,
    library,
    timer,
    started = false;
  const motion = matchMedia('(prefers-reduced-motion: reduce)'),
    recording = resultRecording({ id: 'hanzi-full-result', anchor: summary, panel });
  const clear = () => {
    revision++;
    clearTimeout(timer);
    updateStatus(status, '');
    if (drawController?.type === 'animation')
      try {
        drawController.pauseAnimation();
      } catch {}
    drawController = null;
    started = false;
    controller?.abort();
    controller = null;
    drawings = [];
    host.replaceChildren();
    summary.replaceChildren();
    recording.clear();
    setTextareaValue(output, '');
  };
  const controls = () => {
    drawField.hidden = mode.value !== 'draw';
    animationBar.hidden = mode.value !== 'draw' || drawMode.value !== 'animation';
    prev.hidden = next.hidden = mode.value !== 'record';
  };
  controls();
  const show = () => {
    host.replaceChildren();
    const ns = 'http://www.w3.org/2000/svg';
    for (const value of drawings) {
      if (!value.graphics) continue;
      const svg = Box({
          tag: 'svg',
          namespace: ns,
          attrs: {
            viewBox: '0 0 1024 1024',
            width: '256',
            height: '256',
            role: 'img',
            'aria-label': value.dictionary.character + ' 的前 ' + index + ' 笔',
          },
        }),
        g = Box({ tag: 'g', namespace: ns, attrs: { transform: 'translate(0,900) scale(1,-1)' } });
      value.graphics.strokes.forEach((d, i) =>
        g.append(
          Box({
            tag: 'path',
            namespace: ns,
            attrs: {
              d,
              fill: i < index ? 'currentColor' : '#a0a6b2',
              opacity: i < index ? '1' : '.2',
            },
          }),
        ),
      );
      svg.append(g);
      host.append(svg);
    }
    updateStatus(status, '当前显示前 ' + index + ' 笔；浅色为其余笔画。');
  };
  run.onclick = async () => {
    clear();
    const current = revision;
    const request = new AbortController();
    controller = request;
    let timedOut = false;
    const query = input.value.trim(),
      selectedMode = mode.value,
      selectedDrawMode = motion.matches ? 'normal' : drawMode.value;
    updateStatus(status, '正在载入汉字资料…');
    timer = setTimeout(() => {
      if (current !== revision) return;
      timedOut = true;
      request.abort();
      updateStatus(status, '汉字资料载入超时，请重试。', 'error');
    }, 30000);
    try {
      const chars = [...query];
      if (!chars.length || chars.length > 50) throw Error('请输入 1–50 个汉字。');
      library = await load();
      if (current !== revision) return;
      request.signal.throwIfAborted();
      let result,
        missing = false;
      if (selectedMode === 'draw') {
        if (chars.some((char) => !library.cc.isCnChar(char)))
          throw Error('笔顺演示请输入汉字，不含标点或拉丁字母。');
        const data = new Map(
          await Promise.all(
            [...new Set(chars)].map(async (char) => [
              char,
              await loadHanziResource('draw', char, { signal: request.signal }),
            ]),
          ),
        );
        if (current !== revision) return;
        // Normal/animation modes accept original HanziWriter loaders through
        // cnchar's flattened style options; stroke mode signals actual rendered
        // completion through the public onComplete callback.
        await new Promise((resolve, reject) => {
          let loaded = 0,
            completed = 0,
            settled = false;
          const finish = (error) => {
            if (settled) return;
            settled = true;
            request.signal.removeEventListener('abort', aborted);
            if (error) reject(error);
            else resolve();
          };
          const aborted = () => finish(request.signal.reason);
          request.signal.addEventListener('abort', aborted, { once: true });
          drawController = library.cc.draw(query, {
            el: host,
            type: selectedDrawMode,
            animation: { autoAnimate: false },
            onComplete: () => {
              if (selectedDrawMode !== 'stroke' || ++completed === chars.length) finish();
            },
            style: {
              charDataLoader: (char, accept, fail) => {
                const record = data.get(char);
                if (record) accept(record);
                else fail(Error('笔顺资料未就绪，请重试。'));
              },
              onLoadCharDataSuccess: () => {
                if (++loaded === chars.length) finish();
              },
              onLoadCharDataError: () => finish(Error('笔顺资料载入失败，请重试。')),
            },
          });
          if (!drawController) finish(Error('笔顺绘制未启动，请重试。'));
        });
        if (current !== revision) return;
        await new Promise((resolve, reject) => {
          const aborted = () => {
            cancelAnimationFrame(frame);
            reject(request.signal.reason);
          };
          const frame = requestAnimationFrame(() => {
            request.signal.removeEventListener('abort', aborted);
            resolve();
          });
          request.signal.addEventListener('abort', aborted, { once: true });
        });
        if (current !== revision) return;
        if (!host.querySelector('svg path')) throw Error('笔顺未能绘制，请重试。');
        result = { characters: query, mode: selectedDrawMode };
      } else if (selectedMode === 'explain' || selectedMode === 'words') {
        let value;
        if (selectedMode === 'explain') {
          const data = await loadHanziResource('explanation', chars[0], { signal: request.signal });
          if (current !== revision) return;
          if (Object.hasOwn(data, query) && data[query]) {
            library.cc.explain.addExplain(query, data[query]);
            value = await library.cc.explain(query);
          } else value = '';
        } else value = await library.cc.words(query);
        if (current !== revision) return;
        missing = Array.isArray(value) ? value.length === 0 : !value;
        const text = Array.isArray(value) ? value.join('、') : String(value || '未收录');
        summary.append(Box({ tag: 'p', text: missing ? '未收录匹配的字词资料。' : text }));
        result = { query, kind: selectedMode, result: value };
      } else {
        if (!graphics) {
          const response = await fetch(
            new URL('../vendor/hanzi-full/graphics.txt', import.meta.url),
            { signal: controller.signal },
          );
          if (!response.ok) throw Error('完整笔画图形未载入');
          const raw = await response.text();
          graphics = new Map(
            raw
              .trim()
              .split('\n')
              .map((line) => {
                const row = JSON.parse(line);
                return [row.character, row];
              }),
          );
        }
        if (current !== revision) return;
        drawings = chars.map((c) => ({
          dictionary: library.dict.get(c) || { character: c, missing: true },
          graphics: graphics.get(c) || null,
        }));
        index = Math.max(...drawings.map((x) => x.graphics?.strokes.length || 0));
        show();
        for (const { dictionary: d, graphics: g } of drawings)
          summary.append(
            DataList({
              items: [
                ['汉字', d.character],
                ['释义（原文字典）', d.definition || '未收录'],
                ['读音', d.pinyin?.join('、') || '未收录'],
                ['结构拆分', d.decomposition || '未收录'],
                ['部首', d.radical || '未收录'],
                ['笔画数', g ? String(g.strokes.length) : '未收录'],
              ],
            }),
          );
        result = drawings;
      }
      if (current !== revision) return;
      const text = JSON.stringify(result, null, 2);
      setTextareaValue(output, text);
      recording.publish({ text, name: '汉字完整记录.json' });
      updateStatus(
        status,
        missing
          ? '当前本地资料未收录匹配项。'
          : '已载入；未收录项会明确标出，完整原始记录可展开查看。',
        missing ? 'info' : 'success',
      );
    } catch (e) {
      request.abort();
      if (current === revision) {
        host.replaceChildren();
        summary.replaceChildren();
        recording.clear();
        setTextareaValue(output, '');
        updateStatus(status, timedOut ? '汉字资料载入超时，请重试。' : e.message, 'error');
      }
    } finally {
      if (current === revision) {
        clearTimeout(timer);
        controller = null;
      }
    }
  };
  stop.onclick = () => {
    clear();
    updateStatus(status, '已停止，输入保留。');
  };
  const animate = (name) => {
    try {
      if (motion.matches) throw Error('减少动态效果已开启，请使用静态笔顺。');
      if (drawController?.type !== 'animation') throw Error('请先载入逐笔动画。');
      drawController[name]();
    } catch (e) {
      updateStatus(status, e.message, 'error');
    }
  };
  animation.onclick = () => {
    animate(started ? 'resumeAnimation' : 'startAnimation');
    started = true;
  };
  pause.onclick = () => animate('pauseAnimation');
  step.onclick = () => animate('drawNextStroke');
  prev.onclick = () => {
    if (drawings.length) {
      index = Math.max(0, index - 1);
      show();
    }
  };
  next.onclick = () => {
    if (drawings.length) {
      index = Math.min(
        index + 1,
        Math.max(...drawings.map((x) => x.graphics?.strokes.length || 0)),
      );
      show();
    }
  };
  for (const n of [mode, input, drawMode]) {
    const changed = () => {
      clear();
      controls();
    };
    n.addEventListener('input', changed);
    n.addEventListener('change', changed);
  }
  const leave = ({ detail }) => {
      if (detail?.name !== 'hanzi') clear();
    },
    task = ({ detail }) => {
      if (detail?.panel === 'hanzi') clear();
    },
    changedMotion = () => {
      if (motion.matches) clear();
    };
  motion.addEventListener('change', changedMotion);
  document.addEventListener('arg:nativetaskchange', task);
  document.addEventListener('arg:panelchange', leave);
  onDisconnect(root, () => {
    clear();
    motion.removeEventListener('change', changedMotion);
    document.removeEventListener('arg:panelchange', leave);
    document.removeEventListener('arg:nativetaskchange', task);
  });
}
