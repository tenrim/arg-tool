import {CAPABILITY_TOPICS} from '../capabilities/topics.js';
import {CHAIN_ONLY_OPERATIONS} from '../capabilities/operation-policy.js';
import {CHEF_OPERATION_PAIRS} from '../capabilities/operation-pairs.js';

const unique = values => [...new Set(values)];
const operationAnchor = id => /^(?:op|pair):/.test(id) ? decodeURIComponent(id.slice(id.indexOf(':') + 1)) : null;

// A topic changes discovery granularity, not the explanations of its operations.
// This projection deliberately uses static declarations, never the registry
// (which consumes ARTICLES), so content and discovery cannot form a cycle.
export function projectKnowledgeTopics(items, topics = CAPABILITY_TOPICS, chainOnly = CHAIN_ONLY_OPERATIONS, pairs = CHEF_OPERATION_PAIRS) {
  const recipeOnly = new Set(chainOnly);
  const pairByAnchor = new Map(pairs.map(pair => [pair[0], pair]));
  const sourceOperations = article => {
    const id = article.capabilityIds[0], anchor = operationAnchor(id);
    // Native articles explain their own controller contract, even when that
    // controller delegates some work to Chef. Do not infer its source-operation
    // inventory here: the registry validates that inventory and owns routing.
    // In a mixed topic these exact native IDs and the explicit Chef operation
    // members therefore remain distinct, with one original article per member.
    if (id.startsWith('pair:')) {
      const pair = pairByAnchor.get(anchor);
      if (!pair) throw Error('Knowledge pair has no canonical directions: ' + id);
      return [...pair];
    }
    return anchor ? [anchor] : [];
  };
  const topicByCapability = new Map(), topicByOperation = new Map(), topicById = new Map();
  const activeTopics = topics.map(topic => ({...topic, operations: (topic.operations || []).filter(op => !recipeOnly.has(op))}));
  for (const topic of activeTopics) {
    if (!topic.id || topicById.has(topic.id)) throw Error('Duplicate or missing knowledge topic: ' + topic.id);
    topicById.set(topic.id, topic);
    for (const id of topic.nativeIds || []) {
      if (!id.startsWith('native:')) throw Error('Knowledge native member must name an exact native capability: ' + id);
      if (topicByCapability.has(id)) throw Error('A knowledge member has multiple topics: ' + id);
      topicByCapability.set(id, topic);
    }
    for (const op of topic.operations || []) {
      if (topicByOperation.has(op)) throw Error('A knowledge operation has conflicting discovery owners: ' + op);
      topicByOperation.set(op, topic);
    }
  }
  const members = new Map(activeTopics.map(topic => [topic.id, []]));
  const articles = [], aliases = {}, mergedIds = {};
  for (const article of items) {
    const id = article.capabilityIds[0], operations = sourceOperations(article);
    const retired = operations.filter(op => recipeOnly.has(op));
    if (retired.length && retired.length !== operations.length) throw Error('Recipe-only policy cannot split knowledge pair: ' + id);
    if (retired.length) continue;
    const nativeTopic = topicByCapability.get(id);
    const candidates = unique([nativeTopic, ...operations.map(op => topicByOperation.get(op))].filter(Boolean));
    if (candidates.length > 1) throw Error('A precise function article spans multiple knowledge topics: ' + id);
    const topic = candidates[0];
    if (topic) {
      // A mixed declaration is the union of exact native members and complete
      // Chef functions. A native member needs no invented Chef operation list;
      // a canonical pair still needs both of its real directions explicitly.
      if (!nativeTopic && operations.some(op => !topic.operations.includes(op))) throw Error('Knowledge topic cannot split canonical directions: ' + topic.id + ' / ' + id);
      members.get(topic.id).push(article);
    } else articles.push(article);
  }
  for (const topic of activeTopics) {
    const originals = members.get(topic.id);
    const operationSet = new Set(topic.operations || []);
    const descriptions = originals.map(article => {
      const capabilityId = article.capabilityIds[0];
      const operationIds = sourceOperations(article).filter(op => operationSet.has(op));
      return {article, capabilityId, title: article.title, operationIds};
    });
    for (const op of operationSet) if (!descriptions.some(member => member.operationIds.includes(op))) {
      throw Error('Knowledge topic operation lacks its precise mechanism and example: ' + topic.id + ' / ' + op);
    }
    for (const id of topic.nativeIds || []) if (!descriptions.some(member => member.capabilityId === id)) {
      throw Error('Knowledge topic native member lacks its precise mechanism and example: ' + topic.id + ' / ' + id);
    }
    // A single original pair already has the right discovery granularity. Do
    // not wrap it in another topic, or manufacture a new route/lesson for it.
    if (originals.length < 2) {articles.push(...originals);continue;}
    const sources = [], sections = [], memberRecords = [], misconceptions = [];
    for (const member of descriptions) {
      const {article, capabilityId, title, operationIds} = member;
      const sourceId = id => encodeURIComponent(capabilityId) + '__' + id;
      const sourceIds = article.sources.map(source => sourceId(source.id));
      sources.push(...article.sources.map(source => ({...source, id: sourceId(source.id)})));
      sections.push(...article.sections.map(section => ({
        ...section, title: title + ' · ' + section.title, memberId: capabilityId,
        operationIds: [...operationIds], paragraphs: [...section.paragraphs],
        examples: (section.examples || []).map(example => ({...example})),
        sourceIds: section.sourceIds.map(sourceId),
      })));
      misconceptions.push(...(article.misconceptions || []).map(text => title + '：' + text));
      memberRecords.push({capabilityId, title, operationIds, sourceIds});
    }
    const capabilityId = 'topic:' + topic.id;
    mergedIds[capabilityId] = memberRecords.map(member => member.capabilityId);
    for (const article of originals) aliases[article.id] = 'function-' + capabilityId;
    articles.push({
      id: 'function-' + capabilityId, capabilityIds: [capabilityId], relatedIds: [capabilityId],
      title: topic.title, topicGroup: topic.group,
      summary: originals.map(article => article.summary).join(' '),
      aliases: unique([...(topic.aliases || []), ...originals.flatMap(article => [article.title, ...article.aliases])]),
      sources, sections, misconceptions, members: memberRecords,
      operationIds: [...operationSet], mergedIds: memberRecords.map(member => member.capabilityId),
    });
  }
  return {articles, aliases, members: mergedIds};
}
