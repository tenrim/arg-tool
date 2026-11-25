---
capabilityId: native:placenames
title: 国家地名查询
topicGroup: world
summary: 结合地名、行政区划、类别、记录标识和坐标系查阅公开地名信息。
aliases:
  - 国家地名信息库
  - 地名
  - CGCS2000
sources:
  - id: about
    title: 国家地名信息库接口总览
    publisher: 中华人民共和国民政部
    url: https://dmfw.mca.gov.cn/baseHtmls/docfile/_1.htm
    language: zh-CN
    kind: official-doc
    locator: 公开资料及访问语义
  - id: search
    title: 地名搜索接口
    publisher: 中华人民共和国民政部
    url: https://dmfw.mca.gov.cn/baseHtmls/docfile/_2.htm
    language: zh-CN
    kind: official-doc
    locator: 名称、区划、类别、分页与搜索模式
  - id: detail
    title: 地名详情接口
    publisher: 中华人民共和国民政部
    url: https://dmfw.mca.gov.cn/baseHtmls/docfile/_3.htm
    language: zh-CN
    kind: official-doc
    locator: 记录 ID、原始字段及坐标
  - id: stats
    title: 同名与同音统计
    publisher: 中华人民共和国民政部
    url: https://dmfw.mca.gov.cn/interface.html
    language: zh-CN
    kind: official-doc
    locator: 公开接口列表及区划、统计方法
  - id: core
    title: 地名资料字段阅读
    publisher: 迷雾工具箱
    url: /online-query/reading-reference.js
    language: zh-CN
    kind: implementation
    locator: 地名详情、行政区和统计
---

## 介绍
<!-- sources: about, search -->

国家地名信息库收录有地理对象的标准名称及其行政归属。名称相同的对象可能分属不同地区或类别，还可能各有旧名和语言写法。准确引用应保留是哪一记录。

## 名称匹配和记录 ID
<!-- sources: search, detail -->

模糊检索可找到含有同一词的很多对象。行政区划和类别有助于缩小候选。进入详情时使用搜索返回的记录 ID，不能把名字或地名代码拿来猜接口 ID。

:::example 把对象与名称区分
[输入]
在北京市查询“故宫站”
[结果]
标准名故宫站；类别为公共交通车站；所属西城区
[说明]
同为“故宫”字样，站点与博物院是不同对象。
:::

## 地名与来历字段
<!-- sources: detail, core -->

详情可能给出拼写、旧名、含义、来历、行政区及位置几何。不同对象的字段不一定齐全。应保留当次原始值，不能根据名字自行补写沿革。

:::example 定位详情对应字段
[输入]
查看故宫站的罗马字母拼写与地点代码
[结果]
Gùgōng Zhàn；11010201223530950016
[说明]
拼写用于记录声音和语言形式，地点代码用于对应当次地理记录。
:::

## 同名统计与相关范围
<!-- sources: search, stats, core -->

同名统计按名称比较，同音统计以相应拼写字段比较，可按区划或类别汇总。行政区树可查询不同深度，统计应连同资料年版、范围和类别保留。

## 坐标记录与原始资料
<!-- sources: about, detail, core -->

公开坐标为 CGCS2000，几何可能为点、线或多个点。复核位置时明确坐标顺序和坐标系。查询只在提交后访问公开服务，原始多媒体引用不等于允许另行加载或转载。

:::example 解析返回的一个点
[输入]
故宫站位置的原始 coordinate：[116.3900916,39.9218817]
[结果]
第一项东经约 116.39009°，第二项北纬约 39.92188°；CGCS2000
[说明]
按接口坐标次序解释，两项不是随意交换的名称字段。
:::

## 常见误区

- 多个地点同名时应由记录 ID 和辖区确认。
- 按类别查同名结果不等于查询全国所有同拼写记录。
- CGCS2000 的数值和坐标标签应一起保存。

