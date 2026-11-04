import { Box, Link, ToolHeader, ToolPanel, Toolbar, onDisconnect } from '../ui/index.js';

export const DESMOS_URL = 'https://www.desmos.com/calculator?lang=zh-CN';

export function mountFunctionPlot(main) {
  const external = (text, href) =>
    Link({ text, attrs: { href, target: '_blank', rel: 'noopener noreferrer' } });
  const host = Box({ className: 'online-graph-host' });
  const panel = ToolPanel({
    id: 'panel-function-plot',
    className: 'panel',
    hidden: true,
    header: ToolHeader({ className: 'page-heading', title: 'Desmos 函数绘图（在线）' }),
    body: Box({
      className: 'online-graph',
      children: [
        Toolbar({
          children: [
            Box({
              tag: 'p',
              text: '在线网页 · 由 Desmos 提供，需要联网。输入由 Desmos 页面处理。',
            }),
            external('在新标签页打开 Desmos', DESMOS_URL),
          ],
        }),
        host,
        Box({
          tag: 'p',
          text: '网页无法加载或登录时，请在新标签页打开。切换工具会保留当前网页；刷新工具箱前，请通过 Desmos 保存或分享图表。新标签页不会自动带入这里的未保存内容。',
        }),
        Box({
          tag: 'p',
          children: [
            '来源：',
            external('Desmos 图形计算器', DESMOS_URL),
            ' · ',
            external(
              '官方使用指南（英文）',
              'https://help.desmos.com/hc/en-us/articles/202529279-Desmos-Graphing-Calculator-User-Guide',
            ),
          ],
        }),
      ],
    }),
  });
  main.append(panel);
  let frame = null;
  function activate() {
    if (panel.hidden || frame) return;
    // First entry loads the external site; re-entry preserves its browsing context.
    frame = Box({
      tag: 'iframe',
      id: 'desmos-frame',
      className: 'online-graph-frame',
      attrs: {
        src: DESMOS_URL,
        title: 'Desmos 在线图形计算器',
        referrerpolicy: 'no-referrer',
        sandbox:
          'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads',
      },
    });
    host.append(frame);
  }
  const observer = new MutationObserver(activate);
  observer.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  onDisconnect(panel, () => {
    observer.disconnect();
    frame?.remove();
    frame = null;
  });
  activate();
  return { panel, destroy: () => panel.remove() };
}
