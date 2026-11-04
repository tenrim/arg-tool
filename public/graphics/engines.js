import { element, Box } from '../ui/index.js';
import { mountMindmapControls } from './mindmap-ui.js';
import { WHITEBOARD_STATE_KEYS, validateLibrary, reconcileOutline } from './model.js';
const base = new URL('../vendor/graphics/', import.meta.url),
  styles = new Map();
async function style(path) {
  if (styles.has(path)) return styles.get(path);
  const task = new Promise((resolve, reject) => {
    const node = element('link', { attrs: { rel: 'stylesheet', href: new URL(path, base).href } });
    let timer;
    const fail = () => {
      clearTimeout(timer);
      node.remove();
      styles.delete(path);
      reject(Error('绘图样式加载失败，请重试。'));
    };
    node.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    node.onerror = fail;
    timer = setTimeout(fail, 15000);
    document.querySelector('link[href$="ui/components.css"]').before(node);
  });
  styles.set(path, task);
  return task;
}
const bytes = async (blob) => {
  if (!blob) throw Error('图片导出失败。');
  return new Uint8Array(await blob.arrayBuffer());
};
async function dimensions(dataURL) {
  const blob = await (await fetch(dataURL)).blob(),
    image = await createImageBitmap(blob);
  try {
    if (image.width * image.height > 32e6) throw Error('图片最多 3,200 万像素。');
    return { width: image.width, height: image.height };
  } finally {
    image.close();
  }
}
export async function createGraphicEngine(
  kind,
  parent,
  scene,
  { changed, onText, onImage, onError, library = [], saveLibrary, onNoteLink } = {},
) {
  const host = Box({ className: 'graphic-engine-mount' });
  parent.replaceChildren(host);
  if (kind === 'whiteboard') {
    window.EXCALIDRAW_ASSET_PATH = new URL('excalidraw/', base).href;
    await style('excalidraw/style.css');
    const lib = await import('../vendor/graphics/excalidraw/excalidraw-entry.js');
    let api,
      quiet = true,
      dead = false,
      resolveReady,
      rejectReady,
      lastScene = '';
    const ready = new Promise((resolve, reject) => {
      resolveReady = resolve;
      rejectReady = reject;
    });
    const timer = setTimeout(() => rejectReady(Error('白板加载超时，请重试。')), 15000);
    const defaults = {
      theme: 'dark',
      currentItemRoughness: 0,
      currentItemFillStyle: 'solid',
      currentItemFontFamily: 2,
      currentItemStrokeColor: '#f0f3f8',
      viewBackgroundColor: '#0b1019',
      currentItemBackgroundColor: 'transparent',
    };
    const destroy = lib.mount(host, {
      langCode: 'zh-CN',
      theme: 'dark',
      detectScroll: true,
      autoFocus: false,
      initialData: {
        elements: lib.restoreElements(scene.elements, null),
        files: scene.files,
        libraryItems: validateLibrary(library),
        appState: { ...defaults, ...scene.appState },
        scrollToContent: !Number.isFinite(scene.appState?.scrollX),
      },
      onLibraryChange: (items) => {
        if (!dead)
          Promise.resolve()
            .then(() => saveLibrary?.(validateLibrary(items)))
            .catch(onError);
      },
      excalidrawAPI: (value) => {
        api = value;
        resolveReady();
      },
      onChange: (elements, appState, files) => {
        const signature =
          elements.map((e) => e.id + ':' + e.version + ':' + e.isDeleted).join('|') +
          ';' +
          Object.keys(files).join('|') +
          ';' +
          JSON.stringify(WHITEBOARD_STATE_KEYS.map((k) => appState[k]));
        if (signature !== lastScene) {
          lastScene = signature;
          if (!quiet && !dead) changed?.();
        }
      },
      validateEmbeddable: () => false,
      UIOptions: {
        canvasActions: {
          loadScene: false,
          saveToActiveFile: false,
          export: false,
          saveAsImage: false,
          toggleTheme: false,
        },
      },
      onLinkOpen: (element, event) => {
        if (/^notebook-note:[a-z0-9-]+$/i.test(element.link || '')) {
          event.preventDefault();
          onNoteLink?.(element.link.slice(14));
        } else if (
          element.link &&
          !/^https?:\/\//i.test(element.link) &&
          !/^#[a-z]/i.test(element.link)
        )
          event.preventDefault();
      },
    });
    try {
      await ready;
    } catch (error) {
      destroy();
      host.remove();
      throw error;
    } finally {
      clearTimeout(timer);
    }
    quiet = false;
    const get = () => ({
      elements: structuredClone(api.getSceneElements()),
      files: structuredClone(api.getFiles()),
      appState: Object.fromEntries(WHITEBOARD_STATE_KEYS.map((k) => [k, api.getAppState()[k]])),
    });
    const exportData = (options) => {
      const selected = api.getAppState().selectedElementIds,
        elements = api.getSceneElements().filter((e) => !options.selectedOnly || selected[e.id]);
      if (options.selectedOnly && !elements.length) throw Error('请先选择要导出的对象。');
      return {
        elements,
        files: api.getFiles(),
        appState: {
          ...api.getAppState(),
          exportBackground: !options.transparent,
          exportWithDarkMode: false,
        },
      };
    };
    return {
      get,
      setLibrary(items) {
        return api.updateLibrary({ libraryItems: validateLibrary(items), merge: false });
      },
      async updateSource(source) {
        const old = api.getSceneElements().find((e) => e.id === source.id && e.type === 'text');
        if (!old) throw Error('关联的文字对象已删除。');
        const text = source.text || source.name,
          next = lib.convertToExcalidrawElements([
            { ...old, text, originalText: text, version: old.version + 1 },
          ])[0];
        api.updateScene({
          elements: api.getSceneElements().map((e) => (e.id === old.id ? next : e)),
          captureUpdate: lib.CaptureUpdateAction.IMMEDIATELY,
        });
      },
      async add(source) {
        const elements = api.getSceneElements(),
          x = elements.length ? Math.max(...elements.map((e) => e.x + e.width)) + 60 : 100,
          y = 100;
        const title = [source.name, source.tool ? `来源：${source.tool}` : '']
          .filter(Boolean)
          .join('\n');
        const text =
          source.text === null
            ? title
            : title +
              '\n' +
              source.text.slice(0, 3000) +
              (source.text.length > 3000 ? '\n…（完整内容保存在来源附件）' : '');
        const additions = [];
        if (/^image\/(png|jpeg|webp|gif)$/.test(source.mime)) {
          const url = `data:${source.mime};base64,${source.base64}`,
            size = await dimensions(url),
            scale = Math.min(1, 520 / size.width, 420 / size.height),
            id = crypto.randomUUID();
          api.addFiles([{ id, dataURL: url, mimeType: source.mime, created: Date.now() }]);
          additions.push({
            type: 'image',
            fileId: id,
            x,
            y,
            width: size.width * scale,
            height: size.height * scale,
            status: 'saved',
            scale: [1, 1],
          });
        }
        additions.push({
          id: source.id,
          type: 'text',
          text,
          x,
          y: y + (additions[0]?.height || 0) + 20,
          fontSize: 20,
          fontFamily: 2,
          strokeColor: '#f0f3f8',
          roughness: 0,
          ...(source.noteId ? { link: 'notebook-note:' + source.noteId } : {}),
        });
        api.updateScene({
          elements: [...elements, ...lib.convertToExcalidrawElements(additions)],
          captureUpdate: lib.CaptureUpdateAction.IMMEDIATELY,
        });
        api.scrollToContent();
      },
      async png(options = {}) {
        const data = exportData(options);
        if (!data.elements.length) return blankPNG();
        return bytes(
          await lib.exportToBlob({
            ...data,
            mimeType: 'image/png',
            maxWidthOrHeight: options.size || 2048,
          }),
        );
      },
      async svg(options = {}) {
        return (await lib.exportToSvg(exportData(options))).outerHTML;
      },
      focus() {
        host.querySelector('canvas')?.focus();
      },
      fit() {
        api.scrollToContent();
      },
      destroy() {
        dead = true;
        destroy();
        host.remove();
      },
    };
  }
  await style('mind-elixir/MindElixir.css');
  const [{ default: MindElixir }, { zh_CN }] = await Promise.all([
    import('../vendor/graphics/mind-elixir/MindElixir.js'),
    import('../vendor/graphics/mind-elixir/i18n.js'),
  ]);
  let controls;
  const closeMenu = () => {
    const menu = host.querySelector('.context-menu');
    if (menu) menu.hidden = true;
  };
  const mind = new MindElixir({
    el: host,
    direction: 2,
    toolBar: true,
    keypress: true,
    newTopicName: '新节点',
    contextMenu: {
      locale: zh_CN,
      focus: true,
      link: true,
      extend: [
        {
          name: '编辑节点',
          key: 'F2',
          onclick: () => {
            closeMenu();
            mind.beginEdit();
          },
        },
        { name: '节点属性', onclick: () => controls.openProperties() },
        {
          name: '添加本地图片',
          onclick: () => {
            closeMenu();
            onImage(mind.currentNode?.nodeObj.id);
          },
        },
        {
          name: '展开全部',
          onclick: () => {
            closeMenu();
            mind.expandNodeAll(mind.findEle(mind.nodeData.id), true);
          },
        },
        {
          name: '折叠全部',
          onclick: () => {
            closeMenu();
            mind.expandNodeAll(mind.findEle(mind.nodeData.id), false);
          },
        },
        {
          name: '切换紧凑布局',
          onclick: () => {
            closeMenu();
            mind.changeCompact(!mind.compact);
          },
        },
      ],
    },
    allowUndo: true,
    theme: {
      ...MindElixir.DARK_THEME,
      name: '迷雾',
      palette: ['#e9ab00', '#42b6cf', '#8095db'],
      cssVar: {
        ...MindElixir.DARK_THEME.cssVar,
        '--bgcolor': '#0b1019',
        '--main-bgcolor': '#171d2c',
        '--main-color': '#edf1f7',
        '--color': '#c4d2e5',
        '--selected': '#e9ab00',
        '--accent-color': '#e9ab00',
      },
    },
    imageProxy: (url) => (/^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(url) ? url : ''),
  });
  const initial = mind.init(structuredClone(scene));
  if (initial instanceof Error) {
    mind.destroy();
    host.remove();
    throw initial;
  }
  const get = () => {
    const value = JSON.parse(mind.getDataString());
    if (mind.isFocusMode && mind.tempDirection !== null) value.direction = mind.tempDirection;
    const matrix = new DOMMatrixReadOnly(getComputedStyle(mind.map).transform);
    value.viewport = { scale: mind.scaleVal, x: matrix.m41, y: matrix.m42 };
    return value;
  };
  let signature = JSON.stringify(get());
  const notify = () => {
    const next = JSON.stringify(get());
    if (next !== signature) {
      signature = next;
      changed?.();
    }
  };
  for (const event of ['operation', 'changeDirection', 'expandNode'])
    mind.bus.addListener(event, (info) => {
      if (info?.name !== 'beginEdit') notify();
    });
  // Curve handles emit every pointer move. Mark immediately but leave full
  // scene serialization to the debounced save, especially with local images.
  mind.bus.addListener('updateArrowDelta', () => changed?.());
  // Native history, compact mode and Ctrl K depth-folding refresh the scene
  // without an operation event. Observe that shared boundary; view-only focus
  // and repeated notifications do not dirty an unchanged complete document.
  const refresh = mind.refresh.bind(mind);
  mind.refresh = (...args) => {
    const result = refresh(...args);
    notify();
    return result;
  };
  const summary = mind.createSummary.bind(mind);
  mind.createSummary = (...args) => {
    try {
      return summary(...args);
    } catch (error) {
      if (/No selected node|Can not select root node|same main topic/.test(error.message)) {
        onError?.(Error('摘要需要选择同一主分支内的节点，请不要选择中心主题或跨主分支节点。'));
        return;
      }
      throw error;
    }
  };
  controls = mountMindmapControls(mind, host, { onText, onImage, onError });
  if (scene.viewport) {
    mind.scale(scene.viewport.scale);
    const matrix = new DOMMatrixReadOnly(getComputedStyle(mind.map).transform);
    mind.move(scene.viewport.x - matrix.m41, scene.viewport.y - matrix.m42);
  } else mind.scaleFit();
  // Keep the current zoom/pan while it fits; a narrower host must not strand
  // the root outside the canvas. Ignore hidden mounts and release on teardown.
  let lastWidth = host.clientWidth,
    lastHeight = host.clientHeight;
  const resize = new ResizeObserver(() => {
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height || (width === lastWidth && height === lastHeight)) return;
    lastWidth = width;
    lastHeight = height;
    const root = mind.findEle(mind.nodeData.id)?.getBoundingClientRect();
    const bounds = host.getBoundingClientRect();
    if (
      root &&
      (root.left < bounds.left ||
        root.right > bounds.right ||
        root.top < bounds.top ||
        root.bottom > bounds.bottom)
    ) {
      mind.toCenter();
      notify();
    }
  });
  resize.observe(host);
  const saveViewport = () => notify();
  mind.bus.addListener('move', saveViewport);
  mind.bus.addListener('scale', saveViewport);
  const visitNote = (e) => {
    const a = e.target.closest?.('a[href^="notebook-note:"]');
    if (a) {
      e.preventDefault();
      onNoteLink?.(a.getAttribute('href').slice(14));
    }
  };
  host.addEventListener('click', visitNote, true);
  // Focus is a temporary view. Saved previews must still cover the complete
  // document, including branches outside the focused subtree.
  const fullSvg = () => {
    if (!mind.isFocusMode) return mind.exportSvg(true);
    const mount = Box({ className: 'graphic-engine-mount' }),
      stage = Box({
        className: 'mindmap-export-stage',
        attrs: { 'aria-hidden': 'true' },
        children: [mount],
      });
    host.append(stage);
    const whole = new MindElixir({
      el: mount,
      theme: mind.theme,
      toolBar: false,
      contextMenu: false,
      keypress: false,
      allowUndo: false,
      editable: false,
      imageProxy: mind.imageProxy,
    });
    try {
      whole.init(get());
      return whole.exportSvg(true);
    } finally {
      whole.destroy();
      stage.remove();
    }
  };
  const svgBlob = async ({ transparent = false } = {}) => {
    const blob = fullSvg();
    if (!transparent) return blob;
    const doc = new DOMParser().parseFromString(await blob.text(), 'image/svg+xml');
    if (doc.documentElement.firstElementChild?.localName === 'rect')
      doc.documentElement.firstElementChild.remove();
    return new Blob([new XMLSerializer().serializeToString(doc)], { type: 'image/svg+xml' });
  };
  return {
    get,
    async updateSource(source, outline) {
      const node = mind.findEle(source.id);
      if (!node) throw Error('关联节点已删除。');
      await mind.reshapeNode(node, {
        ...reconcileOutline(node.nodeObj, outline),
        id: source.id,
        root: false,
        hyperLink: 'notebook-note:' + source.noteId,
      });
      mind.refresh();
    },
    async add(source, { nodeId, outline } = {}) {
      const node = outline
        ? { ...outline, id: source.id, root: false }
        : {
            id: source.id,
            topic: source.text === null ? source.name : source.text.slice(0, 3000),
            children: [],
          };
      if (source.tool) node.tags = [source.tool];
      if (source.noteId) node.hyperLink = 'notebook-note:' + source.noteId;
      if (/^image\/(png|jpeg|webp|gif)$/.test(source.mime)) {
        const url = `data:${source.mime};base64,${source.base64}`,
          size = await dimensions(url),
          scale = Math.min(1, 240 / size.width, 180 / size.height);
        node.image = {
          url,
          width: Math.round(size.width * scale),
          height: Math.round(size.height * scale),
        };
      }
      if (nodeId && node.image) await mind.reshapeNode(mind.findEle(nodeId), { image: node.image });
      else await mind.addChild(mind.currentNodes[0] || mind.findEle(mind.nodeData.id), node);
      mind.scaleFit();
    },
    async png(options = {}) {
      return rasterSVG(await svgBlob(options), options);
    },
    async svg(options = {}) {
      return (await svgBlob(options)).text();
    },
    focus() {
      mind.container.focus();
    },
    fit() {
      mind.scaleFit();
    },
    destroy() {
      resize.disconnect();
      mind.container.removeEventListener('scroll', saveViewport);
      host.removeEventListener('click', visitNote, true);
      controls.destroy();
      mind.destroy();
      host.remove();
    },
  };
}
async function blankPNG() {
  const canvas = Box({ tag: 'canvas' });
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0b1019';
  ctx.fillRect(0, 0, 640, 360);
  return bytes(await new Promise((r) => canvas.toBlob(r)));
}
async function rasterSVG(blob, { size = 2048, transparent = false } = {}) {
  const url = URL.createObjectURL(blob),
    img = Box({ tag: 'img' });
  try {
    img.src = url;
    await img.decode();
    const scale = size / Math.max(img.naturalWidth, img.naturalHeight),
      canvas = Box({ tag: 'canvas' });
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!transparent) {
      ctx.fillStyle = '#0b1019';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return bytes(await new Promise((r) => canvas.toBlob(r)));
  } finally {
    URL.revokeObjectURL(url);
  }
}
