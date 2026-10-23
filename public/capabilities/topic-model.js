// A topic is an explicit set of real tasks, not a second renderer or an
// inferred inverse relationship. Controllers and upstream operation IDs stay
// owned by their original adapters.
export function consolidateTopics(source, definitions, recipeOnly = []) {
  const excluded = new Set(recipeOnly), claimed = new Set(), aliases = new Map();
  const byId = new Map(source.map(entry => [entry.id, entry]));
  const byOperation = new Map(source.flatMap(entry => entry.sourceOperationIds.map(op => [op, entry])));
  const replaced = new Set(), topics = [];
  for (const definition of definitions) {
    const nativeIds = definition.nativeIds || [], operations = definition.operations || [];
    if (!definition.id || !definition.title || !definition.group || !nativeIds.length&&!operations.length)
      throw Error('专题必须精确声明真实任务：' + definition.id);
    const activeOperations = operations.filter(op => !excluded.has(op));
    const members = [...new Set([...nativeIds.map(id => byId.get(id)),
      ...activeOperations.map(op => byOperation.get(op))])];
    if (members.some(member => !member)) throw Error('专题成员未登记：' + definition.id);
    for (const member of members) {
      if (member.listed === false) throw Error('专题不能恢复配方专用操作：' + member.id);
      if (!nativeIds.includes(member.id) && member.sourceOperationIds.some(op => !activeOperations.includes(op)))
        throw Error('专题不能拆开已有的真实双向功能：' + member.id);
      if (claimed.has(member.id)) throw Error('同一功能被重复并入专题：' + member.id);
      claimed.add(member.id);
    }
    // A policy may retire all but one member. Do not manufacture an empty or
    // redundant topic just to keep a catalogue heading alive.
    if (members.length < 2) continue;
    const first = members[0], id = 'topic:' + definition.id;
    const sourceOperationIds = [...new Set(members.flatMap(member => member.sourceOperationIds))];
    const actions = activeOperations.map(op => ({op, operationId: op,
      label: byOperation.get(op).directions?.find(direction => direction.op === op)?.label
        || byOperation.get(op).title}));
    const nativeMembers=nativeIds.map(id=>byId.get(id));
    for(const member of nativeMembers)if(member.open.kind!=='native')throw Error('原生专题成员缺少原生接口：'+member.id);
    for(const op of activeOperations)if(byOperation.get(op).open.kind!=='operation')throw Error('专题操作缺少实际引擎接口：'+op);
    const mixed=!!nativeIds.length&&!!activeOperations.length;
    const variants = nativeMembers.map(member => ({...member}));
    if(mixed)for(const action of actions){
      const member=byOperation.get(action.op),open={...member.open,operation:action.op};
      variants.push({...member,id:'op:'+encodeURIComponent(action.op),title:action.label,
        sourceMemberId:member.id,sourceOperationIds:[action.op],open,engineName:action.op,op:action.op,
        aliases:[action.op,action.label]});
    }
    const topic = {...first, id, title: definition.title, group: definition.group, topic: true,
      topicKind: mixed?'mixed':nativeIds.length ? 'native' : 'operation', mode: 'topic', reversible: false,
      sourceToolIds: [...new Set(members.flatMap(member => member.sourceToolIds))], sourceOperationIds,
      sourceModes: sourceOperationIds.map(op => byOperation.get(op).sourceModes?.[
        byOperation.get(op).sourceOperationIds.indexOf(op)] || byOperation.get(op).mode),
      aliases: [...new Set(members.flatMap(member => [member.title, ...member.aliases]))],
      memberIds: members.map(member => member.id), variants, actions,
      engineName: nativeIds.length?undefined:actions[0]?.op, op: nativeIds.length?undefined:actions[0]?.op, tip: definition.tip || ''};
    delete topic.directions;
    if (nativeIds.length) {
      topic.variantId = first.id; topic.taskId = first.id;
    }
    for (const member of members) {
      replaced.add(member.id);
      aliases.set(member.id, {id, ...(nativeIds.includes(member.id) ? {variant: member.id}
        : {op: member.engineName || member.sourceOperationIds[0]})});
    }
    topics.push(topic);
  }
  return {entries: [...source.filter(entry => !replaced.has(entry.id)), ...topics], aliases};
}
