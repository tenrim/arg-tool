import { PRACTICAL_TASKS } from '../../practical/catalog.js';
import { EVERYDAY_DETAILS } from '../../practical/everyday-data.js';
export const articles = PRACTICAL_TASKS.filter((t) => EVERYDAY_DETAILS[t.id]).map((t) => {
  const d = EVERYDAY_DETAILS[t.id],
    sourceIds = d.sources.map((s) => s.id);
  return {
    id: 'function-native:' + t.id,
    capabilityIds: ['native:' + t.id],
    relatedIds: ['native:' + t.id],
    topicGroup: t.group,
    title: t.title,
    summary: d.explanation,
    aliases: t.aliases,
    sources: d.sources,
    sections: [
      {
        title: '计算关系',
        sourceIds,
        paragraphs: [d.explanation, d.formula, d.symbols],
        examples: [{ label: '代入计算', ...d.example }],
      },
      { title: '模型与边界', sourceIds, paragraphs: [d.limits] },
    ],
  };
});
