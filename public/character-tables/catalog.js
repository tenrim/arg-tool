import { EXTRA_REPERTOIRES } from './repertoires.js';
export const CHARACTER_TABLE_TOOL = Object.freeze({
  id: 'character-tables',
  title: '语言文字字符表',
  group: 'characters-reference',
  aliases: [
    '日文',
    '日语',
    '平假名',
    '片假名',
    '五十音',
    '韩文',
    '韩语',
    '谚文',
    'Hangul',
    '希腊字母',
    '西里尔字母',
    '俄语字母',
    '希伯来字母',
    '阿拉伯字母',
    '泰文',
    '天城文',
    '印地文',
    '字符表',
    '字母表',
    'kana',
    'alphabet',
    '数字符号',
    '罗马数字',
    '玛雅数字',
    '算筹',
    '分数符号',
    '带圈数字',
    '上下标数字',
    ...EXTRA_REPERTOIRES.flatMap(([, title, script]) => [title, script]),
  ],
});
export const LANGUAGES = Object.freeze(
  [
    {
      id: 'ja',
      title: '日文',
      defaultView: 'kana',
      note: '假名按 Unicode 收录；汉字限于 CLDR 日语字符集。',
      views: [
        ['kana', '常用假名'],
        ['hiragana', '平假名与相关符号'],
        ['katakana', '片假名与相关符号'],
        ['han', '日语汉字（CLDR）'],
      ],
    },
    {
      id: 'ko',
      title: '韩文',
      defaultView: 'compat',
      note: '字母、组合字母与音节分别展示；现代合成音节共 11,172 个。',
      views: [
        ['compat', '兼容字母'],
        ['jamo', '组合字母（含古字母）'],
        ['syllables', '现代合成音节'],
      ],
    },
    {
      id: 'el',
      title: '希腊文',
      defaultView: 'common',
      note: '常用字符包含现代希腊文及大小写；扩展收录古希腊文与多调符号。',
    },
    {
      id: 'ru',
      title: '西里尔文字',
      defaultView: 'common',
      note: '常用字符按俄语列出；完整文字系统还包含其他使用西里尔文字的语言。',
    },
    {
      id: 'he',
      title: '希伯来文',
      defaultView: 'common',
      note: '包含词末字形及附加标记；字符按单独字形展示。',
    },
    {
      id: 'ar',
      title: '阿拉伯文',
      defaultView: 'common',
      note: '包含阿拉伯语常用字符；完整文字系统还包含其他语言的字母及表现形式。',
    },
    { id: 'th', title: '泰文', defaultView: 'common', note: '元音、声调和附加标记单独列出。' },
    {
      id: 'hi',
      title: '天城文',
      defaultView: 'common',
      note: '常用字符按印地语列出；完整文字系统包含其他使用天城文的语言。',
    },
    ...EXTRA_REPERTOIRES.map(([id, title, script]) => ({
      id,
      title,
      script,
      source: 'ucd',
      defaultView: 'script',
      note: '按 Unicode 完整收录该文字系统及共用符号，包含历史与扩展字符。',
    })),
    {
      id: 'numbers',
      title: '数字与数值符号',
      source: 'numeric',
      defaultView: 'decimal',
      note: '收录 Unicode 17.0.0 全部具有标准数值的字符，含汉字数值。数值是字符属性，不是对整段数字的换算。',
      views: [
        ['decimal', '各文字十进制数字'],
        ['roman', '罗马数字'],
        ['fractions', '分数符号'],
        ['han', '汉字数值字符'],
        ['circled', '带圈／括号等围合数字'],
        ['super-sub', '上标与下标数字'],
        ['rods', '算筹数字'],
        ['mayan', '玛雅数字'],
        ['cuneiform', '楔形数字'],
        ['aegean', '爱琴数字'],
        ['all', '全部数值字符'],
      ],
    },
  ].map(Object.freeze),
);
export const COMMON_VIEWS = Object.freeze([
  ['common', '常用字符（CLDR）'],
  ['auxiliary', '辅助字符（CLDR）'],
  ['index', '索引字母（CLDR）'],
  ['script', '完整文字系统（Unicode）'],
  ['numbers', '本组数值字符'],
  ['all', '全部收录字符'],
]);
export const viewsFor = (language) =>
  language.source === 'numeric'
    ? language.views
    : language.source === 'ucd'
      ? COMMON_VIEWS.slice(3)
      : [...(language.views || []), ...COMMON_VIEWS];
