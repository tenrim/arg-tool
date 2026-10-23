import {capabilityGroupDefinitions} from '../navigation.js';
import {articles as encodings} from './articles/encodings.js';
import {articles as crypto} from './articles/crypto.js';
import {articles as textFormats} from './articles/text-formats.js';
import {articles as files} from './articles/files.js';
import {articles as mediaTechnical} from './articles/media-technical.js';
import {articles as referenceSim} from './articles/reference-sim.js';
import {articles as expansion} from './articles/expansion.js';
import {articles as atlasCelestial} from './articles/atlas-celestial.js';
import {articles as atlasLifeCulture} from './articles/atlas-life-culture.js';
import {articles as timezones} from './articles/timezones.js';
import {articles as onlineQuery} from './articles/online-query.js';
import {articles as onlineServices} from './articles/online-services.js';
import {articles as animation} from './articles/animation.js';
import {articles as practical} from './articles/practical.js';
import {articles as qalculate} from './articles/qalculate.js';
import {articles as upstreamCompletion,extendExistingArticles} from './articles/upstream-completion.js';
import {articles as completion} from './articles/completion.js';
import {projectKnowledgeTopics} from './topics.js';
import {addKnowledgeChapters, editKnowledgePresentation} from './chapters/index.js';

const groupById = new Map(capabilityGroupDefinitions.map(group => [group.id, group]));
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

// Validate the content boundary before registration or DOM rendering. Citations
// must be bound to actual sections, not appended as a decorative source dump.
export function validateKnowledgeArticles(items) {
  const ids = new Set(), owners = new Set();
  return items.map(item => {
    const fail = reason => {throw Error('Invalid knowledge article ' + item.id + ': ' + reason);};
    if (!nonempty(item.id) || ids.has(item.id)) fail('duplicate or missing ID');
    ids.add(item.id);
    const group = groupById.get(item.topicGroup);
    if (!group || group.category === 'knowledge') fail('unknown tool group');
    if (item.capabilityIds?.length !== 1 || item.id !== 'function-' + item.capabilityIds[0]) fail('one function per article');
    for (const owner of item.capabilityIds) {
      if (owners.has(owner)) fail('duplicate function coverage');
      owners.add(owner);
    }
    if (!nonempty(item.title) || !nonempty(item.summary) || !Array.isArray(item.aliases) || item.aliases.some(alias => !nonempty(alias))) fail('missing discovery text');
    if (/[：:？?⇄]/u.test(item.title)) fail('function name only; no explanatory title suffix');
    if (!Array.isArray(item.relatedIds) || !item.relatedIds.includes(item.capabilityIds[0])) fail('missing exact tool link');
    if (!Array.isArray(item.sources) || !item.sources.length) fail('missing primary references');
    const sourceIds = new Set();
    for (const source of item.sources) {
      if (!nonempty(source.id) || sourceIds.has(source.id)) fail('duplicate reference ID');
      sourceIds.add(source.id);
      for (const field of ['title', 'publisher', 'url', 'language', 'kind']) if (!nonempty(source[field])) fail('missing reference ' + field);
      if (!['standard', 'official-doc', 'author-spec', 'implementation'].includes(source.kind)) fail('unknown reference kind');
      const local = source.url.startsWith('/') && !source.url.startsWith('//');
      const url = new URL(source.url, 'https://knowledge.invalid');
      if ((!local && !/^https:\/\//.test(source.url)) || url.protocol !== 'https:' || url.username || url.password) fail('unsafe reference URL');
      for (const field of ['upstreamUrl', 'licenseUrl']) if (source[field]) {
        const value = source[field], local = value.startsWith('/') && !value.startsWith('//');
        const extra = new URL(value, 'https://knowledge.invalid');
        if ((!local && !/^https:\/\//.test(value)) || extra.protocol !== 'https:' || extra.username || extra.password) fail('unsafe ' + field);
      }
      if (source.licenseUrl && !nonempty(source.license)) fail('missing precise source license');
      if (!local && (/(?:wikipedia|csdn|cnblogs|baike\.baidu)/i.test(url.hostname) || /\/developer\/article\//.test(url.pathname))) fail('non-primary reference');
    }
    if (!Array.isArray(item.sections) || !item.sections.length) fail('missing mechanism');
    let examples = 0, paragraphs = 0;
    const usedSources = new Set();
    const sections = item.sections.map(section => {
      if (!nonempty(section.title) || !section.paragraphs?.length || section.paragraphs.some(text => !nonempty(text))) fail('empty mechanism section');
      paragraphs += section.paragraphs.length;
      if (!section.sourceIds?.length || section.sourceIds.some(id => !sourceIds.has(id))) fail('section lacks valid citations');
      if (new Set(section.sourceIds).size !== section.sourceIds.length) fail('duplicate section citations');
      section.sourceIds.forEach(id => usedSources.add(id));
      for (const example of section.examples || []) {
        examples++;
        for (const field of ['label', 'input', 'output', 'explanation']) if (!nonempty(example[field])) fail('incomplete worked example');
      }
      return {...section, examples: section.examples || []};
    });
    if (paragraphs < 2 || !examples) fail('mechanism and worked example required');
    if (item.sources.some(source => !usedSources.has(source.id))) fail('unbound decorative reference');
    // A cited preface supplements the workspace's exact member explanations.
    // It never counts toward their required mechanisms or worked examples.
    if (item.preface !== undefined) {
      if (!Array.isArray(item.preface) || !item.preface.length) fail('empty article preface');
      for (const section of item.preface) {
        if (!nonempty(section.title) || !section.paragraphs?.length || section.paragraphs.some(text => !nonempty(text))) fail('empty preface section');
        if (!section.sourceIds?.length || new Set(section.sourceIds).size !== section.sourceIds.length
          || section.sourceIds.some(id => !sourceIds.has(id))) fail('preface lacks valid citations');
        if (section.memberId || section.operationIds || section.examples) fail('preface cannot replace member content');
      }
    }
    if (item.capabilityIds[0].startsWith('topic:')) {
      if (!Array.isArray(item.members) || !item.members.length) fail('topic requires precise operation members');
      const memberIds = new Set(), operations = new Set();
      for (const member of item.members) {
        if (!nonempty(member.capabilityId) || memberIds.has(member.capabilityId) || !nonempty(member.title)) fail('duplicate or missing topic member');
        memberIds.add(member.capabilityId);
        if (!Array.isArray(member.operationIds) || new Set(member.operationIds).size !== member.operationIds.length
          || member.operationIds.some(op => !nonempty(op) || operations.has(op))) fail('invalid topic operation coverage');
        member.operationIds.forEach(op => operations.add(op));
        if (!member.sourceIds?.length || member.sourceIds.some(id => !sourceIds.has(id))) fail('topic member lacks its own references');
        const owned = sections.filter(section => section.memberId === member.capabilityId);
        if (!owned.length || owned.reduce((total, section) => total + section.paragraphs.length, 0) < 2
          || !owned.some(section => section.examples.length)) fail('topic member requires its own mechanism and worked example');
        for (const section of owned) {
          if (section.sourceIds.some(id => !member.sourceIds.includes(id))) fail('topic section uses another member references');
          if (!Array.isArray(section.operationIds) || section.operationIds.length !== member.operationIds.length
            || section.operationIds.some(op => !member.operationIds.includes(op))) fail('topic section lost precise operation coverage');
        }
      }
      if (sections.some(section => !memberIds.has(section.memberId))) fail('topic has an unowned generic section');
      if (!Array.isArray(item.operationIds) || new Set(item.operationIds).size !== item.operationIds.length
        || item.operationIds.length !== operations.size || item.operationIds.some(op => !operations.has(op))) fail('topic operation coverage is incomplete');
      if (!Array.isArray(item.mergedIds) || item.mergedIds.length !== memberIds.size
        || item.mergedIds.some(id => !memberIds.has(id))) fail('topic member coverage is incomplete');
    } else if (item.members) fail('only a registered topic may combine function articles');
    return {...item, categoryId: group.category, sections, misconceptions: item.misconceptions || []};
  });
}

function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
export const RAW_ARTICLES = freeze(validateKnowledgeArticles(editKnowledgePresentation(extendExistingArticles([
  ...encodings, ...crypto, ...textFormats, ...files, ...mediaTechnical, ...referenceSim, ...expansion, ...atlasCelestial, ...atlasLifeCulture, ...timezones, ...onlineQuery, ...onlineServices, ...completion, ...animation, ...qalculate, ...practical, ...upstreamCompletion,
]))));
const projection = projectKnowledgeTopics(RAW_ARTICLES);
export const ARTICLES = freeze(validateKnowledgeArticles(addKnowledgeChapters(projection.articles)));
export const ARTICLE_ALIASES = freeze(projection.aliases);
export const PROJECTED_TOPIC_MEMBERS = freeze(projection.members);
const byId = new Map(ARTICLES.map(item => [item.id, item]));
const normalize = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase('en').replace(/\s+/gu, ' ').trim();
const searchIndex = new Map(ARTICLES.map(item => [item.id, {
  title: normalize([item.title, ...item.aliases].join(' ')),
  body: normalize([item.summary, ...[...(item.preface || []), ...item.sections].flatMap(part => [part.title, ...part.paragraphs,
    ...(part.examples || []).flatMap(worked => [worked.label, worked.input, worked.output, worked.explanation])]),
    ...item.misconceptions, ...item.sources.flatMap(source => [source.title, source.publisher, source.locator])].join(' '))
}]));

export function getArticle(id) { return byId.get(ARTICLE_ALIASES[id] || id); }
export function articlesForGroup(groupId) { return ARTICLES.filter(item => item.topicGroup === groupId); }
export function searchArticles(query = '', {group = '', category = '', limit = Infinity} = {}) {
  // Player phrases often join an English acronym directly to Chinese, such
  // as “AES加密”. Tokenize that script boundary without rewriting content.
  const tokenized = normalize(query)
    .replace(/([a-z0-9])(\p{Script=Han})/gu, '$1 $2')
    .replace(/(\p{Script=Han})([a-z0-9])/gu, '$1 $2');
  const terms = [...new Set(tokenized.split(' ').filter(Boolean))];
  const maximum = limit === Infinity ? Infinity : Math.max(0, Math.floor(Number.isFinite(limit) ? limit : 0));
  const results = [];
  for (const item of ARTICLES) {
    if (group && item.topicGroup !== group) continue;
    if (category && item.categoryId !== category) continue;
    const index = searchIndex.get(item.id);
    if (!terms.every(term => index.title.includes(term) || index.body.includes(term))) continue;
    const score = terms.reduce((total, term) => total + (index.title.includes(term) ? 5 : 1), 0);
    results.push({item, score});
  }
  results.sort((left, right) => right.score - left.score);
  return results.slice(0, maximum).map(result => result.item);
}
