// Individually authored explanations for the complete fixed IAU/NASA catalogues.
const source = (id, title, publisher, url, locator, kind = 'official-doc') => ({id, title, publisher, url, locator, kind, language: 'en'});
const section = (title, paragraphs, sourceIds, examples = []) => ({title, paragraphs, sourceIds, examples});
const example = (input, output, explanation) => ({label: '资料复核', input, output, explanation});
const iau = source('iau', 'The Constellations', 'IAU 国际天文学联合会', 'https://iauarchive.eso.org/public/themes/constellations/', 'IAU Constellation Names；Charts and tables；Charts Text Legend', 'standard');
const solar = source('solar', 'Key to Catalog of Solar Eclipses', 'NASA GSFC / Fred Espenak and Jean Meeus', 'https://eclipse.gsfc.nasa.gov/SEcat5/SEcatkey.html', 'Key to Catalog；Eclipse Predictions');
const lunar = source('lunar', 'Key to Catalog of Lunar Eclipses', 'NASA GSFC / Fred Espenak and Jean Meeus', 'https://eclipse.gsfc.nasa.gov/LEcat5/LEcatkey.html', 'Column definitions；Eclipse Predictions');
const calendar = source('calendar', 'Calendar Dates', 'NASA GSFC / Fred Espenak', 'https://eclipse.gsfc.nasa.gov/SEhelp/calendar.html', '儒略历／格里高利历切换与天文年份');
const deltat = source('deltat', 'Delta T (ΔT)', 'NASA GSFC / Fred Espenak', 'https://eclipse.gsfc.nasa.gov/SEcat5/deltat.html', 'TD − UT；历史测量及未来外推误差');
export const articles = [
  {
    id: 'function-native:constellations', capabilityIds: ['native:constellations'], relatedIds: ['native:constellations'], title: '星座资料', topicGroup: 'sky',
    summary: '按完整 88 星座表对应拉丁主格、属格、三字缩写和 J2000 图谱边界。', aliases: ['IAU', 'Constellations', '星座缩写', '星座属格', 'Serpens'], sources: [iau],
    sections: [
      section('星座是天空区域，星群连线是图谱约定', ['现代 IAU 星座把整个天球划为 88 个有边界的区域。常见的星座连线是帮助辨认星群的图形，不能代替正式边界，也不代表同一星座内的恒星在空间中彼此相邻。', '本站保留官方全部名称表、89 幅原始图和 89 份原始边界坐标文本。数量多于 88 的原因是巨蛇座分为不相连的蛇头与蛇尾，两部分仍属于同一个星座；详情中两张图都要查看。'], ['iau'], [example('查找 Ser 或 Serpens', '巨蛇座：Serpens；属格 Serpentis；蛇头 Serpens Caput 与蛇尾 Serpens Cauda', '在完整表中找到缩写 Ser 后，对照属格列；其下载栏明确列出 Caput 与 Cauda 两幅图和两份边界，不应把它计作两个星座或漏掉其中一部分。')]),
      section('主格、属格与恒星标识', ['拉丁主格用于称呼星座本身，属格用于描述某星“属于哪个星座”。例如 Aries 为白羊座主格，Arietis 为属格，Alpha Arietis 表示白羊座的 Alpha 星。三字缩写 Ari 是独立登记的标识，不是简单截取主格前三个字符。', '检索先把大小写和音调符号规范化，再对中文名、主格、属格、英文名及缩写作文本匹配；翻页只改变显示范围，不截断目录。原表读音是英文注音，不能冒充汉语拼音或唯一标准发音。'], ['iau'], [example('输入 Arietis', '白羊座 · Aries；缩写 Ari；英文名 the Ram', '查询命中属格 Arietis 后，沿同一行查回 Aries 和 Ari。不能按 Arietis 的字符串外观另造一个星座。')]),
      section('坐标历元与图谱读法', ['官方图谱按 J2000 历元制作，星点大小、双星和深空天体符号要结合随包图例阅读。TXT 边界保留原始坐标和文件头，不能把坐标文本当作观测时刻的方位角或高度角。', '星座名称目录不提供黄道占星的生日区间。实际可见性还取决于玩家的位置、时间、地平遮挡和天气；在星座图中看到某天体不等于此刻一定能在当地看到。'], ['iau']),
    ], misconceptions: ['星座连线不是正式边界。', '巨蛇座的两部分属于同一个星座。', '属格与三字缩写不能靠截字或机械词尾替换生成。'],
  },
  {
    id: 'function-native:eclipses', capabilityIds: ['native:eclipses'], relatedIds: ['native:eclipses'], title: '日月食目录', topicGroup: 'sky',
    summary: '查询完整五千年日食与月食表，保留目录时标、历法、沙罗序列和食甚字段。', aliases: ['Solar eclipses', 'Lunar eclipses', 'Saros', '沙罗周期', '食甚', 'NASA'], sources: [solar, lunar, calendar, deltat,
      source('solar-example', 'Catalog of Solar Eclipses: 2001 to 2100', 'NASA GSFC / Fred Espenak and Jean Meeus', 'https://eclipse.gsfc.nasa.gov/SEcat5/SE2001-2100.html', '09561：2024 Apr 08'),
      source('lunar-example', 'Catalog of Lunar Eclipses: 2001 to 2100', 'NASA GSFC / Fred Espenak and Jean Meeus', 'https://eclipse.gsfc.nasa.gov/LEcat5/LE2001-2100.html', '09701：2022 Nov 08'),
    ],
    sections: [
      section('目录对象与筛选步骤', ['固定目录覆盖天文年份 -1999 至 3000，共 11,898 次日食和 12,064 次月食。先选择日食或月食，按年份范围、日期、类别或沙罗序列缩小范围，再读取对应食甚、食分和持续时间。', '日食的 P、A、T、H 分别表示偏食、环食、全食、全环食；月食的 N、P、T 表示半影、偏食、全食。类型后附加字母或符号与 QLE／QSE 参数是原目录的进一步分类，不应在本地简化时删去。日食和月食的食分、地点及持续时间定义不同，不能只因表格相近就互换列名。'], ['solar', 'lunar', 'lunar-example'], [example('月食；日期 2022-11-08', '目录 09701；T+；沙罗序列 136；半影食分 2.4143，本影食分 1.3589，全食持续 85.0 分钟', 'T 表示月全食，附加 + 标记仍保留；分别对照 Pen. Mag.、Um. Mag.、Total 三列，不能把 353.9 分钟的半影过程当作全食时长。')]),
      section('食甚 TD 与当地钟表时间的区别', ['目录的食甚时刻使用地球动力学时 TD。ΔT 的定义为 TD−UT，单位为秒；因此从表值估算 UT 时应从 TD 减去 ΔT，而不是直接给 TD 加一个时区。UT 与现代 UTC 也不能在全部历史和未来范围内无条件等同。', '历史 ΔT 依赖观测记录拟合，未来采用外推，长期范围存在不确定性。本站保留这份固定目录的原始预测值，不把当前浏览器的时区规则混进古代食甚时刻，也不冒称这些旧预测具有实时精度。'], ['solar', 'deltat', 'solar-example'], [example('日食 2024-04-08：TD 18:18:29；ΔT 74 秒', '按原目录估计 UT 为 18:17:15；目录编号 09561，沙罗序列 139', '18:18:29 减 1 分 14 秒得到 18:17:15。这是对原始表值的核算，不是将食甚 TD 直接当成 UTC 或播放器所在时区的时间。')]),
      section('天文年份与历法边界', ['目录采用包含 0 年的天文纪年：0 年对应公元前 1 年，-1 年对应公元前 2 年，-1999 年对应公元前 2000 年。按天文年份检索时不应把公元前年份直接加负号。', '1582 年 10 月 4 日及以前使用儒略历，之后使用格里高利历；历法改革中次日为 1582 年 10 月 15 日。目录的古代日期不是向前延伸的现代格里高利历日期，本地搜索保留其原历法，不使用 JavaScript Date 悄悄改写。'], ['calendar'], [example('历史描述“公元前 1 年”', '起止年份都填 0', '天文纪年在 -1、0、1 之间连续递增；历史 BCE／CE 系统没有 0 年，二者在公元前段相差 1。')]),
      section('沙罗序列、食甚点与可见性', ['沙罗序列把相隔约 18 年 11.3 天的相关食归为一组。序列编号适合对照线索，但不代表两次食在相同经度或相同钟表时间发生；每次记录仍应按其日期、Gamma、食分和地点逐项核对。', '日食表地点是食甚点附近的地理位置，月食表地点是月亮在天顶处的位置，不能当作全世界可见范围或玩家当前位置。官方食图提供进一步的分布资料；本站的本地目录不擅自推导观察地点的接触时刻。'], ['solar', 'lunar']),
    ], misconceptions: ['目录中的 TD 不是当地钟表时间。', '古代目录日期与向前延伸的现代格里高利历不同。', '一次日食存在不代表任意地点都能看见。'],
  },
];
