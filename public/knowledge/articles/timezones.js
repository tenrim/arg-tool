export const articles=[{
 id:'function-native:timezones',capabilityIds:['native:timezones'],relatedIds:['native:timezones'],title:'历史时区资料',topicGroup:'calendar',
 summary:'依固定 IANA 时区记录，把当地日期时间与 UTC 对照，区分历史偏移、重复时间及不存在的时间。',
 aliases:['IANA','TZDB','TZif','夏令时','时差','DST','fold','gap','历史时间'],
 sources:[
  {id:'theory',title:'Theory and pragmatics of the tz code and data',publisher:'IANA Time Zone Database',url:'https://data.iana.org/time-zones/theory.html',kind:'author-spec',locator:'Scope of the tz database / Accuracy of the tz database',language:'en'},
  {id:'tzif',title:'The Time Zone Information Format (TZif)',publisher:'IETF',url:'https://www.rfc-editor.org/rfc/rfc9636.html',kind:'standard',locator:'Sections 3.2–3.3: Time Zone Data Blocks / TZif Footer',language:'en'},
  {id:'rules',title:'IANA 2026e 北美时区原始规则',publisher:'IANA Time Zone Database',url:'https://data.iana.org/time-zones/tzdb-2026e/northamerica',kind:'author-spec',locator:'Rule US 2007 max / Zone America/New_York',language:'en'},
  {id:'posix',title:'TZ environment variable',publisher:'The Open Group / POSIX',url:'https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap08.html',kind:'standard',locator:'8.3 Other Environment Variables / TZ',language:'en'},
 ],
 sections:[
  {title:'UTC 偏移属于某个时刻',paragraphs:['IANA 时区标识描述一段共同的钟表规则历史，例如 America/New_York。偏移量不是城市永远固定的属性；政治决定、夏令时、标准时区和早期当地平太阳时都会使它变化。时区别名沿 Link 记录指向实际规则，不代表另一套独立计算。','TZif 保存按 UTC 排列的转换时刻、偏移秒数、缩写和 DST 标志。先找到输入 UTC 所在的转换区间，再用“当地时间 = UTC + 偏移秒数”计算。本站读取固定本地 TZif，不把浏览器系统自带时区版本当成资料来源。'],sourceIds:['theory','tzif'],examples:[{label:'偏移核算',input:'Asia/Shanghai；2024-01-01 00:00:00 UTC',output:'2024-01-01 08:00:00 当地时间；UTC+08:00',explanation:'偏移为 +28,800 秒。UTC 的零点加八小时得到当地上午八点；反向输入当地八点时应减去这八小时。'}]},
  {title:'重复时间与不存在的时间',paragraphs:['当地时间转 UTC 不能一律减去“现在的时差”。本站枚举此时区实际出现过的候选偏移，再把每一个候选 UTC 转回当地时间；只有日期、时分秒和偏移全部吻合的候选才保留。','时钟回拨会让一段当地时间重复，两个 UTC 候选都必须展示；时钟前跳会让一段当地时间从未发生，不能擅自改成一小时之后。变化也可能只有半小时，或跳过整整一天，不能固定假设所有 DST 跳变均为一小时。'],sourceIds:['tzif','rules'],examples:[{label:'回拨时的两个答案',input:'America/New_York；2024-11-03 01:30:00 当地时间',output:'2024-11-03 05:30:00Z（UTC−04:00，EDT）或 06:30:00Z（UTC−05:00，EST）',explanation:'两种偏移都能转回同一当地 01:30。只有额外线索指出回拨前或后，才能选定一个时刻。'},{label:'前跳时没有答案',input:'America/New_York；2024-03-10 02:30:00 当地时间',output:'不存在；当天 02:00:00 ≤ 当地时间 < 03:00:00 被跳过',explanation:'时钟从 01:59:59 直接前进到 03:00:00，因此不存在对应此地 02:30 的 UTC。'}]},
  {title:'尾规则、缩写与 DST 标志',paragraphs:['TZif v2 及以上可以附带 POSIX 尾规则。历史转换表用尽后，按本版尾规则的月份、周次、星期、转换时间和时间基准推算；南半球跨年的 DST、非整小时偏移和负 DST 均须按真实规则处理。','缩写可能在不同地区重复；CST 不能单独决定国家或偏移。TZDB 的 DST 标志是规则标记，并非“当地季节是夏天”的通俗判断，例如某些规则以冬季负一小时表示。未来的输出是按固定版本推算，政府日后修改法律后需要更新资料。'],sourceIds:['tzif','posix'],examples:[{label:'POSIX 符号方向',input:'固定尾规则 UTC0；UTC 输入 2500-01-01 00:00:00',output:'当地 2500-01-01 00:00:00；偏移 0 秒',explanation:'UTC0 的 POSIX 数值表示从当地加到 UTC 的量；本站展示的 UTC 偏移使用相反方向。该规则为零，不产生 DST 转换。'}]},
  {title:'完整快照的范围与历史边界',paragraphs:['本站固定 IANA 2026e / PSF tzdata 2026.5 的完整默认编译名称与原始来源，不筛掉年份或时区。官方默认口径包含 backward 别名，不启用可选 backzone 的补充历史；后者以原文展示，不能误当成已用于换算。','IANA 主要保证 1970 年以来的民用时区资料；更早的地方时间、边界及史料覆盖不完整。本站输入采用公历延拓、1–9999 年及 POSIX 秒，不接受 23:59:60 闰秒，也不能把输出当作历史地点已经属于现代行政区域的证据。'],sourceIds:['theory','tzif'],examples:[]},
 ],
 misconceptions:['时区名称相同不表示所有历史年份都使用今天的偏移。','当地时间可能对应两个 UTC，也可能一个也没有。','完整发布快照不等于完整覆盖世界每一个地点的全部历史。'],
}];
