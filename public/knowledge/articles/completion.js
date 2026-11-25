const source = (id, title, url, publisher = '原项目作者', kind = 'author-spec') => ({
  id,
  title,
  url,
  publisher,
  kind,
  language: 'en',
  locator: title,
});
const own = source(
  'implementation',
  '本站输入单位、校验与参数实现',
  '/completion/codes.js',
  '迷雾工具箱',
  'implementation',
);
const section = (title, paragraphs, sourceIds, input, output, explanation) => ({
  title,
  paragraphs,
  sourceIds,
  examples: [{ label: '可复核例子', input, output, explanation }],
});
const article = (id, title, group, sources, sections) => ({
  id: 'function-native:' + id,
  capabilityIds: ['native:' + id],
  relatedIds: ['native:' + id],
  title,
  topicGroup: group,
  summary: sections[0].paragraphs[0],
  aliases: [title],
  sources,
  sections,
  misconceptions: [],
});
export const articles = [
  article(
    't9',
    'T9 词库查询',
    'text-language',
    [own, source('dict', '完整英文词库', 'https://github.com/philippica/cipher_machine')],
    [
      section(
        '按键签名匹配',
        [
          '将候选英文单词的 a–c、d–f、g–i、j–l、m–o、p–s、t–v、w–z 分别映射到 2–9，再与完整数字串相等比较。',
          '每次扫描选定词表全部记录，不预先删掉冷僻词，也不只返回首个匹配。结果是否存在取决于所选词库，不表示该数字有唯一原文。',
        ],
        ['implementation', 'dict'],
        '228',
        '可对应 cat、bat 等',
        '字母 C/B 同属 2，A 属于 2，T 属于 8；保留所有词库匹配。',
      ),
    ],
  ),
];
