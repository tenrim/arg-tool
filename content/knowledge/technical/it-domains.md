---
capabilityId: native:it-domains
title: 域名与公共后缀资料
topicGroup: technical
summary: 按公共后缀名单拆分主机名，识别可注册域的通常边界。
aliases:
  - PSL
  - eTLD+1
  - 公共后缀
  - 域名
sources:
  - id: psl
    title: Public Suffix List Format
    publisher: Public Suffix List 项目
    url: https://github.com/publicsuffix/list/wiki/Format
    language: en
    kind: author-spec
    locator: 通配符、例外和匹配算法
  - id: list
    title: 固定公共后缀规则
    publisher: Public Suffix List 项目
    url: /vendor/it-reference/public_suffix_list.dat
    language: en
    kind: implementation
    locator: ICANN 与 PRIVATE 段的实际规则
  - id: root
    title: Top-Level Domains
    publisher: IANA
    url: https://www.iana.org/domains/root/db
    language: en
    kind: official-doc
    locator: 根区顶级域与委派
  - id: model
    title: IT 静态资料查询
    publisher: 迷雾工具箱
    url: /it-reference/model.js
    language: zh-CN
    kind: implementation
    locator: searchITRecords、normalizeDomainInput 和 matchPublicSuffix
---

## 介绍
<!-- sources: psl, root -->
域名由点分隔的标签组成，靠右的标签层次较高。公共后缀是个人注册者通常无法自行控制的域名部分。在后缀左边加一个标签，就能定位通常的注册层级。

## 多段后缀与可注册域
<!-- sources: psl, list -->
顶级域在最右边，占一个标签。公共后缀可有多段，例如 co.uk。可注册域由公共后缀和紧邻的左侧标签组成，其余左侧标签构成子域名称。

:::example 多段后缀
[输入]
clue.example.co.uk
[结果]
公共后缀 co.uk，可注册域 example.co.uk，子域 clue
[说明]
规则以 co.uk 整体匹配，之后向左加 example。
:::

## 通配符和规则例外
<!-- sources: psl, list, model -->
通配规则中的星号匹配一个标签。多个普通规则命中时取最长。有例外时优先采用例外，并从例外的左侧删去一个标签来取得公共后缀。

:::example 通配和例外对照
[输入]
a.b.ck 与 a.www.ck
[结果]
前者后缀 b.ck，后者后缀 ck
[说明]
第一条匹配 *.ck，第二条命中 !www.ck。
:::

## 平台私有规则
<!-- sources: psl, list, model -->
公共后缀名单分 ICANN 和 PRIVATE 等规则段。部分托管平台在私有规则中声明隔开各用户站点的边界。使用不同的规则段，拆出的可注册域可能改变。

:::example 托管平台
[输入]
clue.user.github.io，包含 PRIVATE 规则
[结果]
公共后缀 github.io，可注册域 user.github.io，子域 clue
[说明]
匹配 github.io。关闭 PRIVATE 时，改由 io 作为后缀。
:::

## 主机规范化和查询边界
<!-- sources: psl, root, model -->
输入网址时先分割主机、端口和路径。国际化域名可转为 ASCII 标签参与匹配。拆分是基于固定规则的字符串计算，不会查询 DNS，也不会验证实际拥有者。

## 常见误区

- 最右两个标签未必就是可注册域。
- 通配后缀仍应检查例外。
- 私有后缀的纳入策略会影响平台站点的结果。
- 拆出一个可注册域不说明它当前可买或正在解析。
