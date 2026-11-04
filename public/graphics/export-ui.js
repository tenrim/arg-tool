import {
  Box,
  Button,
  Dialog,
  dialogController,
  Toolbar,
  Field,
  Select,
  Option,
  Status,
  updateStatus,
} from '../ui/index.js';
import { exportOutline, exportXmind } from './interchange.js';

// The caller owns scene state and serialized operations. This module owns only export controls.
export function mountGraphicExport({ run, capture, download }) {
  let exportState;
  const exportClose = Button({ text: '关闭' }),
    exportFormat = Select({ id: 'graphic-export-format' }),
    exportSize = Select({
      id: 'graphic-export-size',
      children: [
        Option('长边 1024 像素', '1024'),
        Option('长边 2048 像素', '2048'),
        Option('长边 4096 像素', '4096'),
      ],
    }),
    exportBackground = Select({
      id: 'graphic-export-background',
      children: [Option('保留画布背景', 'background'), Option('透明背景', 'transparent')],
    }),
    exportScope = Select({
      id: 'graphic-export-scope',
      children: [Option('完整图稿', 'all'), Option('仅选中对象（白板）', 'selected')],
    }),
    exportInfo = Box({ tag: 'p' }),
    exportStatus = Status();
  const exportDialog = Dialog({
    id: 'graphic-export',
    className: 'ui-flow-dialog',
    attrs: { 'aria-labelledby': 'graphic-export-title' },
    children: [
      Box({ tag: 'h2', id: 'graphic-export-title', text: '导出设置' }),
      Field({ label: '文件格式', control: exportFormat }),
      Field({ label: 'PNG 尺寸', control: exportSize }),
      Field({ label: '图片背景', control: exportBackground }),
      Field({ label: '图片范围', control: exportScope }),
      exportInfo,
      exportStatus,
      Toolbar({
        children: [
          Button({
            text: '下载',
            variant: 'primary',
            on: {
              click: () =>
                run(async () => {
                  try {
                    const s = exportState;
                    if (!s?.engine) throw Error('图稿已关闭。');
                    capture(s);
                    const format = exportFormat.value,
                      options = {
                        size: Number(exportSize.value),
                        transparent: exportBackground.value === 'transparent',
                        selectedOnly: exportScope.value === 'selected',
                      };
                    if (format === 'png' || format === 'svg')
                      download(
                        await s.engine[format](options),
                        s.doc.title + '.' + format,
                        'image/' + (format === 'svg' ? 'svg+xml' : 'png'),
                      );
                    else if (format === 'native')
                      download(
                        JSON.stringify(
                          s.kind === 'whiteboard'
                            ? {
                                type: 'excalidraw',
                                version: 2,
                                source: location.origin,
                                elements: s.doc.scene.elements,
                                files: s.doc.scene.files,
                                appState: s.doc.scene.appState,
                              }
                            : s.doc.scene,
                        ),
                        s.doc.title +
                          (s.kind === 'whiteboard' ? '.excalidraw' : '.mind-elixir.json'),
                        'application/json',
                      );
                    else if (format === 'xmind')
                      download(exportXmind(s.doc), s.doc.title + '.xmind', 'application/zip');
                    else
                      download(
                        exportOutline(s.doc, format),
                        s.doc.title + '.' + format,
                        format === 'opml' ? 'text/x-opml' : 'text/markdown',
                      );
                    updateStatus(exportStatus, '已下载。', 'success');
                  } catch (e) {
                    updateStatus(exportStatus, e.message, 'error');
                  }
                }),
            },
          }),
          exportClose,
        ],
      }),
    ],
  });
  document.body.append(exportDialog);
  const exportModal = dialogController(exportDialog, {
    closeButton: exportClose,
    initialFocus: exportFormat,
  });
  function exportOptions() {
    const picture = ['png', 'svg'].includes(exportFormat.value);
    exportSize.disabled = exportFormat.value !== 'png';
    exportBackground.disabled = !picture;
    exportScope.disabled = !picture || exportState?.kind !== 'whiteboard';
    exportInfo.textContent = ['opml', 'md', 'xmind'].includes(exportFormat.value)
      ? '交换格式保留大纲文字、层级和备注；各软件的样式、图片、关系线等支持不同。本站图稿格式可完整保存全部内容，XMind 导出包同时附带本站图稿原件。'
      : '';
  }
  exportFormat.addEventListener('change', exportOptions);
  function openExport(s) {
    exportState = s;
    exportFormat.replaceChildren(
      Option('PNG 图片', 'png'),
      Option('SVG 矢量图', 'svg'),
      Option(s.kind === 'whiteboard' ? 'Excalidraw 原生文件' : 'Mind Elixir 原生 JSON', 'native'),
      ...(s.kind === 'mindmap'
        ? [
            Option('OPML 大纲', 'opml'),
            Option('Markdown 大纲', 'md'),
            Option('XMind 文件', 'xmind'),
          ]
        : []),
    );
    exportScope.value = 'all';
    exportSize.value = '2048';
    updateStatus(exportStatus, '');
    exportOptions();
    exportModal.open();
  }
  return {
    open: openExport,
    destroy() {
      exportFormat.removeEventListener('change', exportOptions);
      exportState = null;
      exportModal.destroy();
      exportDialog.remove();
    },
  };
}
