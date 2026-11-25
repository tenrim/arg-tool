---
capabilityId: native:file-versions
title: 文件版本比较
topicGroup: files
summary: 按相对路径配对文件组，以完整内容识别改动并核对改名候选。
aliases:
  - 文件夹比较
  - 改名检测
sources:
  - id: core
    title: 文件工作区的配对及批处理
    publisher: 迷雾工具箱
    url: /file-workbench/model.js
    language: zh-CN
    kind: implementation
    locator: compareSets、readSet、transformFile
  - id: sha
    title: FIPS 180-4：Secure Hash Standard
    publisher: NIST
    url: https://csrc.nist.gov/pubs/fips/180-4/upd1/final
    language: en
    kind: standard
    locator: SHA-256 及摘要长度
  - id: zip
    title: APPNOTE.TXT — ZIP File Format Specification
    publisher: PKWARE
    url: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
    language: en
    kind: standard
    locator: 第 4 节的本地头、中央目录、结束记录与校验
---

## 介绍
<!-- sources: core, zip -->

比较两份文件集可发现相同、修改、删除和新增。文件版本比较首先按相对路径配对，再核对完整字节；文件名不相同而内容相同的情况作为独立候选处理。

## 路径配对与偏移
<!-- sources: core -->

根目录名可以不同，内部的路径层级应保留。对同一相对路径的内容，以从零开始的相同偏移逐个检查，长度多出的字节也计作差异。

:::example 一个字节变化
[输入]
旧 a.txt 为 ABC，新 a.txt 为 ADC
[结果]
修改，1 个字节不同，首次偏移 1
[说明]
偏移 1 对应两个文件的第二个字节。
:::

## 长度变化的意义
<!-- sources: core -->

比较的是位置对应的字节差异，不会把文本按词或行自动对齐。在一段中间插入一字节后，如果其余内容移位，连续多个偏移都可能不同。

:::example 共同前缀之后多两字节
[输入]
旧 c 为 aaa，新 c 为 a
[结果]
修改；差异字节 2；首次差异偏移 1
[说明]
开头相同，多余的两个末尾字节计入差异。
:::

## 摘要与疑似改名
<!-- sources: sha, core -->

对新增和删除项可用 SHA-256 找相同内容候选，再进行完整字节复核。当相同内容只在各一条新旧路径出现，报告可提出疑似改名。重复备份使改名的对应关系不唯一。

:::example 一对候选
[输入]
旧目录只有 old=rename，新目录只有 new=rename
[结果]
疑似改名：old → new
[说明]
路径变化，内容不变；不能断言执行过系统重命名。
:::

## 归档和可读性
<!-- sources: core, zip -->

比较可使用本地目录或在用户选定后读 ZIP 条目。每个归档成员保留内部路径，嵌套容器作为原字节处理。报告显示的文字片段适合复核，比较本身使用允许范围内的完整文件。

## 常见误区

- 报告的差异量不是文本编辑距离。
- 修改时间相同不保证字节相同。
- 疑似改名是关联推断，不是历史审计记录。

