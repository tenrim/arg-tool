---
capabilityId: native:sky
title: 深空天体目录
topicGroup: sky
summary: 通过 NGC、IC 和梅西耶等别名定位天体，阅读其坐标、分类及视星等。
aliases:
  - 深空
  - Messier
  - NGC
  - 赤经
  - 赤纬
  - 星等
sources:
  - id: ngc
    title: OpenNGC
    publisher: Mattia Verga
    url: https://github.com/mattiaverga/OpenNGC
    language: en
    kind: author-spec
    locator: 字段、同名编号和来源
  - id: nasa
    title: Messier 31 and Messier 42
    publisher: NASA / Hubble
    url: https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/
    language: en
    kind: official-doc
    locator: M31 和 M42 的天体身份
  - id: hko
    title: 太阳视赤经与视赤纬
    publisher: 香港天文台
    url: https://www.hko.gov.hk/sc/gts/astronomy/sun_ra_dec.htm
    language: zh-CN
    kind: official-doc
    locator: 赤经和赤纬单位
  - id: mag
    title: Apparent magnitude
    publisher: IAU Office of Astronomy for Education
    url: https://www.astro4edu.org/zh-hans/resources/glossary/term/15/
    language: zh-CN
    kind: official-doc
    locator: 视星等对数尺度
  - id: data
    title: 固定星表的检索和字段
    publisher: 迷雾工具箱
    url: /discovery/reference-core.js
    language: zh-CN
    kind: implementation
    locator: identifier、filterSky、skyRows
---

## 介绍
<!-- sources: ngc, nasa -->
深空目录给星系、星云、星团等天体登记名称、类别、坐标和观测数据。不同编目者可能给同一天体编号，读取结果时，可将编号与位置、分类和名称相互印证。

## 身份、编号与别名
<!-- sources: ngc, nasa, data -->
编号由目录前缀和序号组成。NGC0224 和 NGC 224 是编号的一种规整写法差别，M31 是另一目录里的标识。比对时先看是否指向同一星表记录。

:::example 仙女座星系的别名
[输入]
查询 M31 或 NGC 224
[结果]
仙女座星系，记录 NGC0224，赤经 J2000 约 0.712319 小时，赤纬约 +41.269056°
[说明]
两种输入指向同一条记录，并没有找到两个星系。
:::

## 赤经、赤纬和历元
<!-- sources: hko, ngc, data -->
赤经沿天赤道量取，一整圈 24 小时等于 360°。赤纬从天赤道向北为正、向南为负。目录使用 J2000 坐标时，要保留历元信息；当地高度角与方位角另需结合观察地点和时刻。

:::example 猎户座大星云的坐标
[输入]
查询 M42
[结果]
NGC1976，赤经 J2000 约 5.587911 小时，赤纬约 −5.389667°
[说明]
赤经乘 15 得约 83.8187°，负赤纬表示在天赤道以南。
:::

## 视星等及空值
<!-- sources: mag, ngc, data -->
视星等采用对数标度，数值越小代表同一测量约定下观测通量越大。相差 5 等对应 100 倍通量。V 星等标明使用的光度波段，面状天体的可见性还受光在面积内的分布与背景亮度影响。

:::example 未提供视星等的索引条目
[输入]
查询 IC434
[结果]
记录 IC0434，V 星等显示未提供
[说明]
固定索引中的该字段为空，筛选带有星等上限的记录时不能把空值当作 0。
:::

## 目录位置与当地天空
<!-- sources: ngc, hko, data -->
显示目录位置也可用于进一步计算观测方向。重复记录、标为不存在的对象，或缺少坐标的条目不适合用于计算。星系和星云的目录坐标通常用代表点，不能同时描述整个对象的角范围。

## 常见误区

- 一个天体可有多个编目编号。
- 5 小时赤经应乘以每小时 15° 才是角度数。
- 星等数值大小与亮度方向相反。
- 未提供字段应保留空缺，不等于物理量为零。
