const sources = [
  {
    id: 'desmos-guide',
    title: 'Desmos Graphing Calculator User Guide',
    url: 'https://help.desmos.com/hc/en-us/articles/202529279-Desmos-Graphing-Calculator-User-Guide',
    publisher: 'Desmos',
    kind: 'official-doc',
    language: 'en',
    locator: 'Get Started Graphing; Animate With Variables and Sliders',
  },
  {
    id: 'desmos-regions',
    title: 'Inequalities and Restrictions',
    url: 'https://help.desmos.com/hc/en-us/articles/4407885334285-Inequalities-and-Restrictions',
    publisher: 'Desmos',
    kind: 'official-doc',
    language: 'en',
    locator: 'Inequalities; Domain and Range Restrictions',
  },
];
export const articles = [
  {
    id: 'function-native:function-plot',
    capabilityIds: ['native:function-plot'],
    relatedIds: ['native:function-plot'],
    topicGroup: 'maths',
    title: '函数绘图',
    summary: '函数、方程与不等式在坐标平面上的表示。',
    aliases: ['Desmos', '函数图像', '图形计算器'],
    sources,
    sections: [
      {
        title: '函数与坐标',
        sourceIds: ['desmos-guide'],
        paragraphs: [
          '函数图像由满足 y=f(x) 的点组成。表达式列表可以同时表示多条曲线、坐标点和数据表，坐标视窗决定显示范围。',
        ],
        examples: [
          {
            label: '直线',
            input: 'y=2x−1',
            output: '经过 (0,−1)、(1,1)、(2,3)',
            explanation: '将横坐标乘以 2 再减去 1，得到对应纵坐标。',
          },
        ],
      },
      {
        title: '参数与滑块',
        sourceIds: ['desmos-guide'],
        paragraphs: [
          '用参数替代固定数值，可以观察图形随参数变化的过程。y=mx+b 中，m 决定斜率，b 决定纵轴截距。滑块改变参数值，坐标视窗保持独立。',
        ],
        examples: [
          {
            label: '改变截距',
            input: 'y=mx+b；m=2，b 从 −1 改为 1',
            output: '纵轴交点从 (0,−1) 移至 (0,1)',
            explanation: '斜率不变，每个横坐标对应的纵坐标增加 2。',
          },
        ],
      },
      {
        title: '不等式与范围限制',
        sourceIds: ['desmos-regions'],
        paragraphs: [
          '不等式表示满足条件的一片区域。严格不等式不包含边界，以虚线表示；包含等号的不等式以实线表示边界。表达式末尾的花括号用于限制横坐标或纵坐标范围。',
        ],
        examples: [
          {
            label: '圆内区域',
            input: 'x²+y²<4',
            output: '圆心为原点、半径为 2 的圆内部，不包含圆周',
            explanation: '到原点距离的平方小于 4；(0,0) 满足条件，(2,0) 不满足严格不等式。',
          },
          {
            label: '限制定义域',
            input: 'y=x²{−2≤x≤2}',
            output: '只显示横坐标 −2 到 2 的抛物线段',
            explanation: '花括号保留满足横坐标条件的点，两个端点为 (−2,4) 与 (2,4)。',
          },
        ],
      },
    ],
  },
];
