import {create} from './core.js';
import {Link} from './controls.js';

function referenceHref(value) {
  const localPath = value.startsWith('/') && !value.startsWith('//');
  const href = localPath ? new URL('..' + value, import.meta.url).href : value;
  const url = new URL(href, location.href);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password
    || (url.protocol === 'http:' && url.origin !== location.origin)) throw Error('资料链接必须是安全的网页地址。');
  return href;
}

// Literature references are part of reading content. They do not register a
// browser API or a cited document as an integrated software dependency.
export function ReferenceList({items = [], label = '规则依据', ...options} = {}) {
  const node = create('reference-list', 'aside', {...options, attrs: {'aria-label': label, ...options.attrs}});
  node.append(create('reference-heading', 'span', {text: label}));
  for (const source of items) {
    // Bundled references resolve from the application asset root, including
    // /toolbox/ deployments; a leading slash in content is a logical path.
    const href = referenceHref(source.url);
    const url = new URL(href, location.href);
    const local = url.origin === location.origin;
    const language = source.kind === 'implementation' ? '实现资料 · ' + (source.language.startsWith('zh') ? '中文' : '英文原文')
      : source.language.startsWith('zh') ? '中文资料' : source.language.startsWith('en') ? '英文原文' : '原始资料 · ' + source.language;
    node.append(create('reference-item', 'p', {children: [
      Link({text: source.title, attrs: {href, target: '_blank', rel: 'noopener noreferrer',
        'data-reference-id': source.id, 'data-reference-local': String(local)}}),
      create('reference-context', 'span', {text: [source.publisher, source.locator, language].filter(Boolean).join(' · ')}),
      source.upstreamUrl || source.licenseUrl ? create('reference-actions', 'span', {children: [
        source.upstreamUrl ? Link({text: '上游原文', attrs: {href: referenceHref(source.upstreamUrl), target: '_blank', rel: 'noopener noreferrer'}}) : null,
        source.licenseUrl ? Link({text: source.license, attrs: {href: referenceHref(source.licenseUrl), target: '_blank', rel: 'noopener noreferrer'}}) : null,
      ]}) : null,
    ]}));
  }
  return node;
}
