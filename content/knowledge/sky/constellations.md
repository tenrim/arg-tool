---
capabilityId: native:constellations
title: 星座资料
topicGroup: sky
summary: 以国际天文学联合会的 88 个区域、拉丁名称与星图辨识星座。
aliases:
  - IAU
  - Constellations
  - 星座缩写
  - 星座属格
  - Serpens
sources:
  - id: iau
    title: The Constellations
    publisher: International Astronomical Union
    url: https://www.iau.org/IAU/Astronomy-FAQs/Constellations.aspx
    language: en
    kind: standard
    locator: 命名表、IAU 边界历史及 J2000 图谱
  - id: manual
    title: IAU Style Manual
    publisher: International Astronomical Union
    url: https://iauarchive.eso.org/static/publications/stylemanual1989.pdf
    language: en
    kind: standard
    locator: 表 11 Names and standard abbreviations of constellations
  - id: index
    title: 星座目录的检索与输出
    publisher: 迷雾工具箱
    url: /atlas-celestial/core.js
    language: zh-CN
    kind: implementation
    locator: queryConstellations：缩写、主格、属格、图谱与边界
---

## 介绍
<!-- sources: iau, manual -->
国际天文学联合会将天球划为 88 个星座区域。区域有正式边界，可用来给天体位置归类。常见图中的点连成星群形状，属于辨认时使用的图示。

## 正式边界的坐标与历史
<!-- sources: iau, manual -->
IAU 于 1928 年批准 Delporte 编制的边界，官方图与目录于 1930 年发表。原始边界沿 1875.0 参考下的赤经和赤纬线。现代 J2000 图谱用另一历元的赤道坐标表示同一分区，不能把两历元读数直接当作相同坐标。

## 主格、属格与缩写
<!-- sources: iau, manual, index -->
拉丁主格称呼星座本身，属格常置于恒星的拜耳标识后面表示归属。IAU 三字缩写是另行约定的标识，有些表面上和主格的前三个字符不同。

:::example 白羊座的三个名称
[输入]
Arietis
[结果]
星座主格 Aries，中文名白羊座，缩写 Ari
[说明]
Arietis 是属格，例如 Alpha Arietis 指归属白羊座的一颗星。
:::

:::example 缩写的大小写
[输入]
CMa
[结果]
大犬座 Canis Major，属格 Canis Majoris
[说明]
缩写以两个名称词的首字母与约定字母组合。
:::

## 同一星座中的非连通区域
<!-- sources: iau, manual, index -->
巨蛇座由两块不相连的区域组成，分别称为蛇头和蛇尾，蛇夫座位于两者之间。图谱与边界文本按两块区域分别提供，命名表仍用一个星座记录。

:::example 由蛇尾名称查回星座
[输入]
Serpens Cauda
[结果]
同一星座记录 Serpens，缩写 Ser，属格 Serpentis，有蛇头和蛇尾两份边界
[说明]
Cauda 只指出巨蛇座的一部分。完整资料以一项名称连接两幅图。
:::

## 图例与观测条件
<!-- sources: iau, index -->
固定目录保留 88 个名称、89 幅图和 89 份边界文本。图中的亮度标记、双星与深空天体的记号要按图例阅读；J2000 位置给出天球坐标。观察者当时能否看到目标，还取决于地点、时间和地平线。

## 常见误区

- 星群连线与正式区域边界应分开阅读。
- 巨蛇座的两部分只占一个星座名额。
- 三字缩写与拉丁属格需按登记表核对。
- 图谱上的 J2000 坐标不能当作当前观测地点的高度角和方位角。
