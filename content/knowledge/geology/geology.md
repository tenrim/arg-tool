---
capabilityId: native:geology
title: 地质年代时间带
topicGroup: sky
summary: 以 Ma 和年代地层的层级读取时间带，核对相邻区间与界线版本。
aliases:
  - 地质年代
  - Ma
  - 纪
  - 白垩纪
  - 年代地层
sources:
  - id: ics
    title: International Chronostratigraphic Chart 2024/12
    publisher: 国际地层委员会 ICS
    url: https://stratigraphy.org/ICSchart/ChronostratChart2024-12.pdf
    language: en
    kind: standard
    locator: 显生宙层级以及各期数值界线
  - id: cn
    title: 国际年代地层表 2023/09 中文版
    publisher: 国际地层委员会 ICS
    url: https://stratigraphy.org/ICSchart/ChronostratChart2023-09Chinese.pdf
    language: zh-CN
    kind: standard
    locator: 岩层名称及时间层级
  - id: danian
    title: Danian GSSP
    publisher: 国际地层委员会 ICS
    url: https://stratigraphy.org/gssps/danian
    language: en
    kind: official-doc
    locator: El Kef 的界线剖面与地球化学标记
  - id: core
    title: 时间带数值查询
    publisher: 迷雾工具箱
    url: /reference/core.js
    language: zh-CN
    kind: implementation
    locator: queryRecords 的闭区间约定
  - id: data
    title: 本地地质时间带数据
    publisher: 迷雾工具箱
    url: /vendor/reference/geology.json
    language: zh-CN
    kind: implementation
    locator: 区间、层级和原始换算年龄
---

## 介绍
<!-- sources: ics, cn -->
国际年代地层表把地球历史划为分层的区间。Ma 表示百万年前，用来叙述界线的估计年龄，数字越大表示时间越早。表中还有许多岩层单位，与地质时间的单位相对应。

## 时间单位和岩层单位
<!-- sources: ics, cn, data -->
宙、代、纪、世、期表示层层嵌套的时间区间，对应的年代地层单位称宇、界、系、统、阶。某年龄可以同时落在多个层级，如显生宙内的中生代和白垩纪。

:::example 一亿年前的层级
[输入]
年龄 100 Ma
[结果]
显生宙、中生代、白垩纪、晚白垩世、塞诺曼期
[说明]
100 在塞诺曼期的 100.5 至 93.9 Ma 之间，同时属于所有上级区间。
:::

## 年龄单位与跨度
<!-- sources: ics, cn, data -->
把 Ma 数值乘一百万可换成以年为单位的近似年龄。若某地质单位开始于年代 O，结束于 Y，时间跨度是 O−Y，年龄从老到新逐渐减小。

:::example 侏罗纪的跨度
[输入]
按固定时间带读取侏罗纪的 201.4 Ma 与 143.1 Ma
[结果]
跨度约 58.3 Ma，约 5830 万年
[说明]
201.4−143.1＝58.3。区间中 200 Ma 可定位到早侏罗世赫塘期。
:::

## 实地界线与数值的关系
<!-- sources: ics, danian -->
不少界线定义在全球界线层型剖面和点位（GSSP）。例如古近纪底部的丹尼期界线位于突尼斯 El Kef 附近的岩剖面，边界黏土附近有铱异常。表中年龄随测年和校准研究更新，不能把任一数值视为所有证据本身。

## 相邻记录共用界线
<!-- sources: ics, core, data -->
相邻区间的开始和结束可采用同一个年龄。固定时间带的年龄筛选使用闭区间，命中共用界线时会列出两侧。如果用于判断界线归属，须回看定义和具体使用的版次。

:::example 查询共用边界
[输入]
年龄 66 Ma
[结果]
可同时找到白垩纪、古近纪，以及中生代和新生代
[说明]
两组记录在 66 Ma 相接。精确命中该值时，闭区间检索将两侧都列出。
:::

## 常见误区

- 66 Ma 约为 6600 万年前，不能按公历年份读取。
- 同一年龄可属于意义不同的多个层级。
- 时间带色块和数值刻度是图表信息，不能代替正式岩层界线定义。
- 比对年龄应记录所用版次和误差，必要时查 GSSP 原始资料。
