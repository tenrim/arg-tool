import {
  Box, Button, Card, DataList, EmptyState, Icon, Input, Result,
  ReferenceList, SearchField, Status, ToolHeader, ToolPanel, Toolbar,
  animatePresence, cancelMotion, onDisconnect, setState, updateStatus,
} from '../ui/index.js';
import {capabilityCategories, capabilityGroupDefinitions} from '../navigation.js';
import {loadRegistry, resolveCapability} from '../capabilities/registry.js';
import {capabilityRoute} from '../capabilities/routes.js';
import {ARTICLES, getArticle, searchArticles} from './content.js';

const groupById = new Map(capabilityGroupDefinitions.map(group => [group.id, group]));
const topicCategory = article => article.categoryId || groupById.get(article.topicGroup)?.category || '';
const categories = capabilityCategories.filter(category => ARTICLES.some(article => topicCategory(article) === category.id));

// This is a reader for function-specific, cited content, not a replacement for
// tool results or reference records. It retains only in-memory reader state.
export function mountKnowledge(main, {navigate = route => {location.hash = route;}, onArticleChange} = {}) {
  const query = Input({id: 'knowledge-query', type: 'search', placeholder: '搜索功能、编码名或规则',
    attrs: {maxlength: 1000, autocomplete: 'off', spellcheck: 'false'}});
  const search = SearchField({control: query, icon: Icon('search'), label: '搜索科普内容'});
  const categoryFilters = Toolbar({id: 'knowledge-categories', attrs: {role: 'group', 'aria-label': '知识领域'}});
  const topicFilters = Toolbar({id: 'knowledge-topics', hidden: true, attrs: {role: 'group', 'aria-label': '知识主题'}});
  const summary = Status({id: 'knowledge-summary'});
  const list = Result({id: 'knowledge-list', className: 'knowledge-list', layout: 'collection',
    attrs: {'aria-label': '科普主题目录', 'data-state': 'ready'}});
  const detail = Result({id: 'knowledge-detail', attrs: {'aria-label': '科普文章', 'data-variant': 'reading', 'data-state': 'empty'}});
  const status = Status({id: 'knowledge-status', hidden: true});
  const returnList = Button({id: 'knowledge-return-list', text: '返回科普目录', hidden: true});
  const catalogue = Card({className: 'surface knowledge-catalogue', children: [search, categoryFilters, topicFilters, summary, list]});
  const reader = Card({className: 'surface knowledge-reader', children: [Toolbar({children: [returnList]}), status, detail]});
  const workspace = Box({className: 'knowledge-workspace', children: [catalogue, reader]});
  const panel = ToolPanel({id: 'panel-knowledge', className: 'panel knowledge-panel', hidden: true,
    header: ToolHeader({className: 'page-heading', title: '科普'}), body: workspace});
  main.append(panel);

  let category = '', topic = '', selected = null, view = 'catalogue';
  let revision = 0, destroyed = false, currentReading = null;
  const articleButtons = new Map();

  function layout() {
    if (destroyed) return;
    const focused = panel.ownerDocument.activeElement;
    catalogue.hidden = view === 'article';
    reader.hidden = view !== 'article';
    returnList.hidden = view !== 'article';
    panel.dataset.knowledgeView = view;
    panel.dataset.knowledgeLayout = 'single';
    if (catalogue.hidden && catalogue.contains(focused)) (detail.querySelector('#knowledge-article-title') || returnList).focus({preventScroll: true});
    if (reader.hidden && reader.contains(focused)) (articleButtons.get(selected) || query).focus({preventScroll: true});
  }

  function clearDetail(text = '选择功能查看规则、实例与资料') {
    selected = null;currentReading = null;
    detail.removeAttribute('data-knowledge-selected');
    detail.replaceChildren(EmptyState({text, size: 'compact'}));
    setState(detail, {state: 'empty'});
    status.hidden = true;
    for (const button of articleButtons.values()) setState(button, {pressed: false});
  }

  function renderTopics() {
    const definitions = capabilityGroupDefinitions.filter(group => group.category === category
      && ARTICLES.some(article => article.topicGroup === group.id));
    topicFilters.hidden = !category;
    if (!category) {topicFilters.replaceChildren();return;}
    const choices = [{id: '', title: '全部主题'}, ...definitions];
    topicFilters.replaceChildren(...choices.map(choice => Button({text: choice.title, variant: 'choice',
      attrs: {'data-knowledge-topic': choice.id, 'aria-pressed': String(topic === choice.id)},
      on: {click() {
        if (destroyed) return;
        topic = choice.id;
        for (const button of topicFilters.children) setState(button, {pressed: button.dataset.knowledgeTopic === topic});
        view = 'catalogue';renderList();layout();
      }},
    })));
  }

  function renderCategories() {
    const choices = [{id: '', title: '全部知识'}, ...categories];
    categoryFilters.replaceChildren(...choices.map(choice => Button({text: choice.title, variant: 'choice',
      attrs: {'data-knowledge-category': choice.id, 'aria-pressed': String(category === choice.id)},
      on: {click() {
        if (destroyed) return;
        category = choice.id;topic = '';view = 'catalogue';
        for (const button of categoryFilters.children) setState(button, {pressed: button.dataset.knowledgeCategory === category});
        renderTopics();renderList();layout();
      }},
    })));
  }

  function renderList() {
    if (destroyed) return;
    const matches = searchArticles(query.value, {limit: ARTICLES.length}).filter(article => (!category || topicCategory(article) === category)
      && (!topic || article.topicGroup === topic));
    articleButtons.clear();
    const rows = matches.map(article => {
      const button = Button({className: 'knowledge-topic', variant: 'choice', text: article.title,
        attrs: {'data-knowledge-article': article.id, 'aria-pressed': String(selected === article.id)},
        on: {click: () => chooseArticle(article.id, {focus: true, notify: true})},
      });
      articleButtons.set(article.id, button);
      return button;
    });
    list.replaceChildren(...(rows.length ? rows : [EmptyState({text: '没有匹配的知识，请换一个词或选择全部知识', size: 'compact'})]));
    setState(list, {state: rows.length ? 'ready' : 'empty'});
    updateStatus(summary, `${matches.length} 篇知识${query.value.trim() ? ' · 搜索结果' : ''}`);
  }

  function openRelated(resolved) {
    if (destroyed) return;
    const {entry, op, direction} = resolved;
    const route = capabilityRoute(entry, op);
    const target = direction ? route + '&dir=' + encodeURIComponent(direction) : route;
    try {
      Promise.resolve(navigate(target)).catch(() => {
        if (!destroyed && !panel.hidden) {status.hidden = false;updateStatus(status, '关联工具暂时无法打开，请重试。', 'error');}
      });
    } catch {
      status.hidden = false;updateStatus(status, '关联工具暂时无法打开，请重试。', 'error');
    }
  }

  function exampleNode(example) {
    const values = [];
    if (example.input != null) values.push(['输入', example.input]);
    if (example.output != null) values.push(['结果', example.output]);
    return Card({className: 'surface knowledge-example', attrs: {'data-knowledge-example': ''}, children: [
      example.label ? Box({tag: 'h4', text: example.label}) : null,
      values.length ? DataList({items: values, valueFormat: 'literal'}) : null,
      example.explanation ? Box({tag: 'p', text: example.explanation}) : null,
    ]});
  }

  function chooseArticle(id, {focus = false, notify = false} = {}) {
    if (destroyed) return false;
    const ownRevision = ++revision;
    const article = getArticle(id);
    cancelMotion(detail);
    status.hidden = true;
    if (!article) {
      clearDetail('未找到这篇科普内容，可返回科普目录重新选择');
      view = 'article';layout();return false;
    }
    // A user's article selection updates the canonical route. Re-entering that
    // route must retain the actual reading nodes and the focused heading; only
    // a different article needs a new tree. A cancelled lookup gets a new lease.
    if (selected === article.id && currentReading?.article.id === article.id && currentReading.node.isConnected) {
      view = 'article';layout();
      if (focus) {
        currentReading.title.focus({preventScroll: true});
        reader.scrollIntoView({block: 'start', behavior: 'instant'});
      }
      if (notify) onArticleChange?.(article.id);
      refreshRelated(currentReading, ownRevision);
      return true;
    }
    selected = article.id;view = 'article';
    const title = Box({id: 'knowledge-article-title', tag: 'h2', text: article.title, attrs: {tabindex: -1}});
    const related = Toolbar({className: 'knowledge-related', attrs: {role: 'group', 'aria-label': '相关工具'}});
    const relatedSection = Box({className: 'knowledge-related-section', hidden: true,
      children: [Box({tag: 'h3', text: '相关工具'}), related]});
    const sections = [...(article.preface || []), ...article.sections].map(section => Box({tag: 'section', className: 'knowledge-section', children: [
      Box({tag: 'h3', text: section.title}),
      ...section.paragraphs.map(paragraph => Box({tag: 'p', text: paragraph})),
      ...(section.examples || []).map(exampleNode),
    ]}));
    const misconceptions = article.misconceptions?.length ? Box({tag: 'section', className: 'knowledge-section', children: [
      Box({tag: 'h3', text: '常见误区'}), Box({tag: 'ul', children: article.misconceptions.map(text => Box({tag: 'li', text}))}),
    ]}) : null;
    const node = Box({tag: 'article', className: 'knowledge-article', attrs: {'data-knowledge-detail': article.id}, children: [
      title, ...sections, misconceptions, relatedSection,
      ReferenceList({items: article.sources, label: '参考资料', className: 'knowledge-references'}),
    ]});
    detail.replaceChildren(node);
    currentReading = {article, node, title, related, relatedSection, relatedReady: false};
    detail.dataset.knowledgeSelected = article.id;
    setState(detail, {state: 'ready'});
    for (const [articleId, button] of articleButtons) setState(button, {pressed: articleId === selected});
    layout();
    animatePresence(detail, {kind: 'feedback'});
    if (focus) {
      title.focus({preventScroll: true});
      reader.scrollIntoView({block: 'start', behavior: 'instant'});
    }
    if (notify) onArticleChange?.(article.id);
    refreshRelated(currentReading, ownRevision);
    return true;
  }

  function refreshRelated(reading, ownRevision) {
    if (!reading || reading.relatedReady || destroyed || ownRevision !== revision) return;
    const {article, related, relatedSection} = reading;
    if (article.relatedIds?.length) {
      loadRegistry().then(registry => {
        if (destroyed || ownRevision !== revision || selected !== article.id || currentReading !== reading) return;
        const entries = [...new Map(article.relatedIds.map(id => resolveCapability(registry, id))
          .filter(resolved => resolved.entry && resolved.entry.listed !== false)
          .map(resolved => [resolved.entry.id + ':' + (resolved.op || resolved.direction || ''), resolved])).values()];
        related.replaceChildren(...entries.map(resolved => Button({text: relatedLabel(resolved),
          attrs: {'data-knowledge-related': resolved.entry.id}, on: {click: () => openRelated(resolved)},
        })));
        relatedSection.hidden = entries.length === 0;
        reading.relatedReady = true;
      }).catch(() => {
        if (destroyed || ownRevision !== revision || currentReading !== reading || panel.hidden) return;
        status.hidden = false;updateStatus(status, '关联工具目录载入失败，请重新打开这篇文章。', 'error');
      });
    } else reading.relatedReady = true;
  }

  function relatedLabel({entry, op, direction}) {
    const explicit = entry.directions?.find(item => (op && (item.op === op || item.operationId === op))
      || (direction && (item.id === direction || item.direction === direction)));
    return explicit?.label ? `${entry.title} · ${explicit.label}`
      : direction ? `${entry.title} · ${direction === 'decode' ? '解码' : direction === 'encode' ? '编码' : direction}` : entry.title;
  }

  function activateArticle(id) {
    if (destroyed) return false;
    if (id) return chooseArticle(id);
    revision++;view = 'catalogue';clearDetail();renderList();layout();return true;
  }

  function activateCategory(id) {
    if (destroyed || !categories.some(item => item.id === id)) return false;
    revision++;cancelMotion(detail);
    category = id;topic = '';query.value = '';view = 'catalogue';
    clearDetail();renderCategories();renderTopics();renderList();layout();
    return true;
  }

  const filter = () => {if (!destroyed) {view = 'catalogue';renderList();layout();}};
  const backToList = async () => {
    if (destroyed) return;
    const previous = selected;
    view = 'catalogue';layout();
    try {await navigate('knowledge');}
    catch {
      if (!destroyed && !panel.hidden) {
        view = 'article';layout();status.hidden = false;
        updateStatus(status, '科普目录暂时无法打开，请重试。', 'error');
      }
      return;
    }
    if (destroyed || panel.hidden || view !== 'catalogue') return;
    const target = articleButtons.get(previous) || query;
    target.focus({preventScroll: true});
    catalogue.scrollIntoView({block: 'start', behavior: 'instant'});
  };
  query.addEventListener('input', filter);
  returnList.addEventListener('click', backToList);
  const cancel = () => {if (!destroyed) {revision++;cancelMotion(detail);}};
  const destroy = () => {
    if (destroyed) return;
    cancel();destroyed = true;
    query.removeEventListener('input', filter);returnList.removeEventListener('click', backToList);
    articleButtons.clear();currentReading = null;releaseDisconnect();
  };
  const releaseDisconnect = onDisconnect(panel, destroy);
  renderCategories();renderTopics();renderList();clearDetail();layout();
  return {panel, activateArticle, activateCategory, cancel, destroy, get selected() {return selected;}};
}
