// Append precise mechanisms to existing owners; retain every original member section.
const details = {
  'native:chemistry-molecule': {
    url: '/vendor/science/native-interfaces.json',
    title: '固定 RDKit MinimalLib 原始接口声明',
    section: '分子图与结构标识',
    paragraphs: [
      'SMILES 将原子和键编码成分子图，二维图由 RDKit 根据该图绘制。规范 SMILES 和 InChI 是结构标识，并非原图文字的简单替换。',
      '常用结果展示显式原子数、键数和相对分子质量。SMILES 可省略氢，显式原子数不能当作完整分子式的原子总数。专业描述符、指纹、反应和分子库不作为玩家界面。',
    ],
    input: 'CCO',
    output: '乙醇结构，3 个显式原子、2 条键，相对分子质量约 46.07。',
    explanation:
      '两个碳和一个氧显式写出，氢按结构规则补足；完整分子式 C2H6O 可在分子式工具中计数。',
  },
  'native:cube': {
    url: '/vendor/round1/cubing/lib/cubing/alg/index.js',
    title: '固定 cubing.js 原始 Alg 模块',
    section: '公式结构与谜题状态',
    paragraphs: [
      '公式按结构解析：交换子 [A,B] 展开为 A B A逆 B逆，共轭 [A:B] 展开为 A B A逆；括号可带重复次数。逆公式倒转顺序并逐步求逆。',
      '每种固定谜题使用自己的轨道、置换和方向定义。先执行起始状态公式，再执行当前步数之前的过程；三维旋转仅改变视角，二维展开不改变状态。记录保留形状、公式和步数，恢复时重算真实状态。不提供自动求解和竞速打乱。',
    ],
    input: '[R,U]',
    output: "R U R' U'；它的逆公式为 U R U' R'。",
    explanation: '先展开再按反序逐步求逆，可复核与原公式组合回到同一谜题的单位变换。',
  },
  'native:hanzi': {
    url: '/vendor/hanzi-full/README.md',
    title: 'cnchar-all 3.2.6 原始完整插件说明',
    extra: '/vendor/round1/makemeahanzi/README.md',
    section: '完整字形与逐笔观察',
    paragraphs: [
      '字典保留释义、拼音、结构、词源等原字段；graphics 给出逐笔 SVG 路径和中线。路径是轮廓、中线是行笔点列，不能混为结构拆分。',
      '具体表单提供逐笔观察、静态笔顺、动画、分图、释义与组词。不提供姓名生成、随机字词、语音识别和描红练字。减少动态效果时使用静态显示；资源本地读取，未收录内容明确提示。',
    ],
    input: '完整记录查询“永”，从第 0 笔依次向后查看。',
    output: '保留原字典行、原 strokes 和 medians 数组；逐笔显示对应路径。',
    explanation:
      '第 i 条 strokes 与第 i 条 medians 描述同一笔，但显示轮廓与行笔中线有不同用途，不将预览截图当作完整原始数据。',
  },
};
export function extendExistingArticles(items) {
  return items.map((item) => {
    const d = details[item.capabilityIds[0]];
    if (!d) return item;
    const source = 'upstream-completion-detail';
    return {
      ...item,
      sources: [
        ...item.sources,
        ...(d.extra
          ? [
              {
                id: source + '-glyph',
                title: 'Make Me a Hanzi 原始字典与图形格式',
                publisher: 'Make Me a Hanzi 作者',
                url: d.extra,
                language: '英文',
                kind: 'author-spec',
              },
            ]
          : []),
        {
          id: source,
          title: d.title,
          publisher: '固定上游作者随包原始资料',
          url: d.url,
          language: '原文',
          kind: 'implementation',
        },
      ],
      sections: [
        ...item.sections,
        {
          title: d.section,
          sourceIds: [source, ...(d.extra ? [source + '-glyph'] : [])],
          paragraphs: d.paragraphs,
          examples: [
            {
              label: d.section + '实例',
              input: d.input,
              output: d.output,
              explanation: d.explanation,
            },
          ],
        },
      ],
    };
  });
}
