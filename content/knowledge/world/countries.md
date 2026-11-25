---
capabilityId: native:countries
title: 国家地区与国旗
topicGroup: world
summary: 以 ISO 3166 地区代码联查名称、旗帜及独立来源的配套字段。
aliases:
  - ISO 3166
  - 国旗
  - 国家代码
  - CN
  - CHN
sources:
  - id: iso
    title: ISO 3166 — Country Codes
    publisher: ISO
    url: https://www.iso.org/iso-3166-country-codes.html
    language: en
    kind: standard
    locator: 第 1 部分的二字母、三字母和三位数字
  - id: gb
    title: GB/T 2659.1-2022 世界各国和地区及其行政区划名称代码
    publisher: 国家市场监督管理总局
    url: https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=FBCE39BE204B54F6F944092C209121F2
    language: zh-CN
    kind: official-doc
    locator: 第 1 部分：国家和地区代码
  - id: lookup
    title: 地区和运输参考表读取
    publisher: 迷雾工具箱
    url: /reference/core.js
    language: zh-CN
    kind: implementation
    locator: queryRecords、国家标识与运输字段
  - id: data
    title: 国家和地区参考记录
    publisher: 迷雾工具箱
    url: /vendor/reference/countries.json
    language: zh-CN
    kind: implementation
    locator: ISO 二字母索引、国旗键及货币代码
---

## 介绍
<!-- sources: iso, gb -->

ISO 3166 用代码标识国家和地区。第 1 部分分别有二字母、三字母和三位数字三种表示，行政区划见第 2 部分。资料表可以用二字母代码把国旗、地区名称和其他独立数据并列展示。

## 三套表示与独立字段
<!-- sources: iso, gb, data -->

同一地区的二字母和三字母代码通常相关，但要查表才能得到准确值。代码本身不表示旗帜、国际电话区号或货币。后面这些由各自的资料表维护。

:::example 二字母查询
[输入]
CN
[结果]
中国，电话区号 +86，币种字段 CNY
[说明]
CN 属于地区编码，+86 与 CNY 分别来自电讯和货币领域。
:::

## 旗帜与语言区分
<!-- sources: iso, lookup, data -->

国旗可作为视觉识别线索，与地区代码一起核对。图案、颜色、比例和徽记各有意义。语言栏列语言代码时，也不表示全体居民都使用该语言。

:::example 日本地区记录
[输入]
JP
[结果]
日本，电话区号 +81，旗帜记录 jp，货币字段 JPY
[说明]
旗帜匹配地区，货币使用另一套代码，两个 JP 不能交换。
:::

## 代码在资料中的复用
<!-- sources: iso, lookup -->

域名、护照、运输文件和数据库常借用地区代码，但可以有不同的用途或额外约定。遇见两字母片段应结合所在字段判断，不宜一律按地区解释。

## 大小写和候选命中
<!-- sources: lookup, data -->

宽泛关键字可能命中名称、别名或其它列。需要精确识别时核对结果本身的代码字段，不能把候选第一条当作代码匹配。

:::example 从地区记录区分货币
[输入]
检索瑞士并查代码栏
[结果]
CH；货币列表含 CHF、CHE、CHW
[说明]
CH 是地区代码，列表可以收录同地区登记的多项货币或记账单位。
:::

## 常见误区

- 三位数字代码不是国际电话区号。
- 旗帜相似不说明两个记录属于同一地区。
- 用地区代码定位后，语言、货币和区号仍须各自解释。

