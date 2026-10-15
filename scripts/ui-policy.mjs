// Dependency-free source boundary checks, not a JavaScript parser or sanitizer.
// Runtime instance, focus, safety and geometry contracts are tested in Chromium.
const member = name => `(?:\\.\\s*${name}\\b|\\[\\s*['\"]${name}['\"]\\s*\\])`;
const rawHTML = new RegExp(`${member('createElement')}\\s*\\(|${member('(?:innerHTML|outerHTML)')}\\s*(?:\\+?=)|${member('(?:insertAdjacentHTML|createContextualFragment)')}\\s*\\(|new\\s+(?:window\\s*\\.\\s*)?Option\\s*\\(`);
const nativeMotion = new RegExp(`${member('animate')}\\s*\\(|\\.\\s*style\\s*${member('(?:animation(?:Name|Duration)?|transition(?:Property|Duration)?)')}\\s*=|\\.\\s*style\\s*${member('setProperty')}\\s*\\(\\s*['\"](?:animation|transition)(?:-[\\w-]+)?['\"]`);
const deepUI = /(?:from\s*|import\s*\(?\s*)['"][^'"]*\/ui\/(?!index\.js['"])[^'"]+['"]/;

export function uiOwnership(path) {
  const normalized=path.replaceAll('\\','/');
  return {component:normalized.startsWith('public/ui/'),motion:normalized==='public/ui/motion.js',stylesheet:normalized==='public/ui/components.css'};
}

export function javascriptViolations(source, {component = false, motion = false} = {}) {
  const issues = [];
  if (!component && rawHTML.test(source)) issues.push('ui-factory: HTML 必须由共享组件创建');
  if (!component && deepUI.test(source)) issues.push('ui-entry: 页面只能导入 ui/index.js');
  if (!motion && nativeMotion.test(source)) issues.push('ui-motion: 原生动画与动态样式只能由 ui/motion.js 管理');
  return issues;
}

export function cssViolations(source, {component = false} = {}) {
  if (component) return [];
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, ''), issues = new Set();
  if (/@(?:-webkit-)?keyframes\b/i.test(clean)) issues.add('ui-motion: 关键帧必须归属组件样式');
  for (const [, selector, body] of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const [, property, raw] of body.matchAll(/(?:^|;)\s*([\w-]+)\s*:\s*([^;]+)/g)) {
      const value = raw.trim().replace(/\s*!important\s*$/i, '').trim();
      if (/^(?:-webkit-)?(?:animation|transition)(?:-[\w-]+)?$/i.test(property) && !/^(?:none|0s|0ms)$/i.test(value))
        issues.add('ui-motion: 页面不能自行定义动画或过渡');
      if (property.startsWith('--ui-motion-')) issues.add('ui-token: 动效令牌只能在组件样式定义');
      if (/\[\s*data-ui\b/.test(selector) && /^(?:color|background(?:-[\w-]+)?|border(?:-[\w-]+)?|font(?:-[\w-]+)?|box-shadow|outline(?:-[\w-]+)?|appearance|accent-color)$/i.test(property))
        issues.add('ui-style: 公共组件外观与焦点只能在组件样式维护');
    }
  }
  return [...issues];
}

export function catalogueViolations(groups, guides, sitePages = []) {
  const issues = [], pages = groups.flatMap(group => group.items).filter(([id]) => !id.includes('/'));
  if (new Set(pages.map(([id]) => id)).size !== pages.length) issues.push('ui-route: 工具页面 ID 重复');
  const routeIds=[...pages.map(([id])=>id),...sitePages.map(page=>page.route)];
  if(new Set(routeIds).size!==routeIds.length)issues.push('ui-route: 网站与工具页面 ID 重复');
  if(sitePages.some(page=>typeof page.route!=='string'||!page.route||typeof page.title!=='string'||!page.title.trim()))issues.push('ui-route: 网站页面必须有 ID 和名称');
  for (const [id] of pages) {
    const guide = guides[id];
    if (!guide || !Array.isArray(guide.steps) || !guide.steps.length || guide.steps.some(step => typeof step !== 'string' || !step.trim()))
      issues.push(`ui-help: ${id} 必须提供可用的使用说明`);
  }
  return issues;
}
